"""
Authentication Service
Handles user registration, login, session management, and authorization
"""
from datetime import datetime, timedelta
from typing import Optional, Tuple
from auth_models import User, Session, get_db_engine, get_db_session
import re


class AuthService:
    """Service for user authentication and session management"""
    
    def __init__(self, db_url=None):
        """
        Initialize AuthService
        
        Args:
            db_url: Database URL. If None, uses DATABASE_URL env var or defaults to SQLite
        """
        self.engine = get_db_engine(db_url)
        
    def _get_session(self):
        """Get a new database session"""
        return get_db_session(self.engine)
    
    def register_user(self, username: str, email: str, password: str, 
                     full_name: str = '', company: str = '') -> Tuple[bool, str, Optional[dict]]:
        """
        Register a new user
        
        Returns:
            (success, message, user_dict)
        """
        # Validate inputs
        if not username or len(username) < 3:
            return False, 'Username must be at least 3 characters long', None
        
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            return False, 'Username can only contain letters, numbers, underscores, and hyphens', None
        
        if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return False, 'Invalid email address', None
        
        if not password or len(password) < 6:
            return False, 'Password must be at least 6 characters long', None
        
        db = self._get_session()
        try:
            # Check if username already exists
            existing_user = db.query(User).filter(
                (User.username == username) | (User.email == email)
            ).first()
            
            if existing_user:
                if existing_user.username == username:
                    return False, 'Username already exists', None
                else:
                    return False, 'Email already registered', None
            
            # Create new user
            user = User(
                username=username,
                email=email,
                full_name=full_name,
                company=company
            )
            user.set_password(password)
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            return True, 'User registered successfully', user.to_dict()
            
        except Exception as e:
            db.rollback()
            return False, f'Registration failed: {str(e)}', None
        finally:
            db.close()
    
    def login(self, username_or_email: str, password: str, 
              ip_address: str = '', user_agent: str = '') -> Tuple[bool, str, Optional[dict], Optional[str]]:
        """
        Authenticate user and create session
        
        Returns:
            (success, message, user_dict, session_token)
        """
        db = self._get_session()
        try:
            # Find user by username or email
            user = db.query(User).filter(
                (User.username == username_or_email) | (User.email == username_or_email)
            ).first()
            
            if not user:
                return False, 'Invalid username or password', None, None
            
            if not user.is_active:
                return False, 'Account is disabled', None, None
            
            # Verify password
            if not user.check_password(password):
                return False, 'Invalid username or password', None, None
            
            # Update last login
            user.last_login = datetime.utcnow()
            
            # Create session
            session_token = Session.generate_token()
            session = Session(
                user_id=user.id,
                session_token=session_token,
                expires_at=datetime.utcnow() + timedelta(days=7),  # 7 day session
                ip_address=ip_address[:45] if ip_address else None,
                user_agent=user_agent[:500] if user_agent else None
            )
            
            db.add(session)
            db.commit()
            
            return True, 'Login successful', user.to_dict(), session_token
            
        except Exception as e:
            db.rollback()
            return False, f'Login failed: {str(e)}', None, None
        finally:
            db.close()
    
    def validate_session(self, session_token: str) -> Tuple[bool, Optional[dict]]:
        """
        Validate session token and return user data
        
        Returns:
            (is_valid, user_dict)
        """
        db = self._get_session()
        try:
            session = db.query(Session).filter(
                Session.session_token == session_token
            ).first()
            
            if not session:
                return False, None
            
            # Check if session expired
            if session.expires_at < datetime.utcnow():
                db.delete(session)
                db.commit()
                return False, None
            
            # Get user
            user = db.query(User).filter(User.id == session.user_id).first()
            
            if not user or not user.is_active:
                return False, None
            
            return True, user.to_dict()
            
        except Exception:
            return False, None
        finally:
            db.close()
    
    def logout(self, session_token: str) -> bool:
        """
        Logout user by deleting session
        
        Returns:
            success
        """
        db = self._get_session()
        try:
            session = db.query(Session).filter(
                Session.session_token == session_token
            ).first()
            
            if session:
                db.delete(session)
                db.commit()
                return True
            
            return False
            
        except Exception:
            db.rollback()
            return False
        finally:
            db.close()
    
    def cleanup_expired_sessions(self):
        """Remove all expired sessions"""
        db = self._get_session()
        try:
            db.query(Session).filter(
                Session.expires_at < datetime.utcnow()
            ).delete()
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()
