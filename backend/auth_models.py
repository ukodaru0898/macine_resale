"""
User Authentication Models
SQLAlchemy models for user accounts, sessions, and authentication
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import bcrypt
import secrets

Base = declarative_base()

class User(Base):
    """User account model"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    company = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    def set_password(self, password):
        """Hash and set the user's password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Verify the user's password"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert user to dictionary (excluding sensitive data)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'company': self.company,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class Session(Base):
    """User session model for tracking active sessions"""
    __tablename__ = 'sessions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(String(45))  # IPv6 max length
    user_agent = Column(String(500))
    
    @staticmethod
    def generate_token():
        """Generate a secure random session token"""
        return secrets.token_urlsafe(32)


# Database setup helper
def get_db_engine(db_url=None):
    """
    Create and return database engine
    
    Args:
        db_url: Database URL. If None, uses DATABASE_URL env var or defaults to SQLite
    """
    import os
    
    if db_url is None:
        # Try to get from environment (Render provides DATABASE_URL for PostgreSQL)
        db_url = os.environ.get('DATABASE_URL')
        
        # Render uses postgres:// but SQLAlchemy 2.0 requires postgresql://
        if db_url and db_url.startswith('postgres://'):
            db_url = db_url.replace('postgres://', 'postgresql://', 1)
        
        # Fallback to SQLite for local development
        if not db_url:
            db_url = 'sqlite:///users.db'
    
    # Configure connection pool for PostgreSQL
    if db_url.startswith('postgresql://'):
        engine = create_engine(
            db_url,
            echo=False,
            pool_pre_ping=True,  # Verify connections before using
            pool_size=5,
            max_overflow=10
        )
    else:
        engine = create_engine(db_url, echo=False)
    
    Base.metadata.create_all(engine)
    return engine


def get_db_session(engine):
    """Create and return database session"""
    Session_maker = sessionmaker(bind=engine)
    return Session_maker()
