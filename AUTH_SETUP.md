# User Authentication Setup Guide

## Overview

Your ASML Buy Back Optimizer application now includes a complete user authentication system with:

✅ **User Registration** - Create new accounts with username, email, and password  
✅ **Secure Login** - Password hashing with bcrypt  
✅ **Session Management** - 7-day session tokens  
✅ **User Profiles** - Store full name and company information  
✅ **Protected Routes** - Optional endpoint protection with `@require_auth` decorator  

## Quick Start

### 1. Install Dependencies

Backend dependencies are already installed:
```bash
cd backend
.venv/bin/pip install SQLAlchemy==2.0.23 bcrypt==4.1.2
```

### 2. Start the Backend Server

```bash
cd backend
PORT=5001 .venv/bin/python optimize_excel.py
```

The backend will automatically:
- Create a SQLite database (`users.db`) for user accounts
- Set up the necessary tables (`users` and `sessions`)
- Enable authentication endpoints

### 3. Start the Frontend

```bash
npm run dev
```

### 4. Create Your First Account

1. Open the application in your browser (usually http://localhost:5173)
2. You'll see the **Login** screen
3. Click **"Create Account"** to register
4. Fill in the registration form:
   - Username (3+ characters, letters/numbers/underscores/hyphens)
   - Email (valid email format)
   - Password (6+ characters)
   - Full Name (optional)
   - Company (optional)
5. Click **"Create Account"**
6. After successful registration, you'll be redirected to the login page
7. Sign in with your new credentials

## Architecture

### Backend Components

**`backend/auth_models.py`**
- SQLAlchemy models for `User` and `Session` tables
- Password hashing with bcrypt
- Session token generation

**`backend/auth_service.py`**
- `AuthService` class with methods:
  - `register_user()` - Create new user accounts
  - `login()` - Authenticate and create sessions
  - `validate_session()` - Check if session token is valid
  - `logout()` - Destroy user sessions
  - `cleanup_expired_sessions()` - Remove old sessions

**`backend/optimize_excel.py`** (updated)
- New endpoints:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  - `GET /api/auth/me` - Get current user info
- `@require_auth` decorator for protecting endpoints

### Frontend Components

**`src/components/Login.tsx`**
- Login form with username/email and password fields
- Session token storage in localStorage
- Error handling and loading states

**`src/components/Register.tsx`**
- Registration form with validation
- Password confirmation
- Automatic redirect to login after success

**`src/App.tsx`** (updated)
- Authentication state management
- Automatic session restoration on page reload
- User profile menu with logout option
- Conditional rendering (show auth screens or main app)

## API Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123",
  "full_name": "John Doe",
  "company": "ACME Corp"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "company": "ACME Corp",
    "is_admin": false,
    "created_at": "2025-12-03T10:30:00",
    "last_login": null
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "user": { ... },
  "session_token": "AbCd1234..."
}
```

Session token is also set as an httpOnly cookie.

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <session_token>
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <session_token>
```

## Protecting Endpoints

To require authentication for any endpoint, add the `@require_auth` decorator:

```python
@app.route('/api/optimize', methods=['POST'])
@require_auth  # Add this line
def optimize():
    # Access current user via request.user
    user_id = request.user['id']
    username = request.user['username']
    # ... rest of your code
```

**Note:** The `/api/optimize` endpoint is currently **not protected** by default. Uncomment the `@require_auth` decorator in `optimize_excel.py` if you want to require authentication for optimization.

## Database

The authentication system uses SQLite by default:

- **Location:** `backend/users.db`
- **Tables:**
  - `users` - User accounts
  - `sessions` - Active user sessions

### Tables Schema

**users:**
- `id` (Primary Key)
- `username` (Unique, Indexed)
- `email` (Unique, Indexed)
- `password_hash`
- `full_name`
- `company`
- `is_active`
- `is_admin`
- `created_at`
- `last_login`

**sessions:**
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `session_token` (Unique, Indexed)
- `created_at`
- `expires_at`
- `ip_address`
- `user_agent`

## Security Features

✅ **Password Hashing** - Passwords are hashed with bcrypt (never stored in plain text)  
✅ **Session Tokens** - Secure random tokens (32 bytes, URL-safe)  
✅ **Session Expiration** - Sessions expire after 7 days  
✅ **Input Validation** - Username, email, and password validation  
✅ **SQL Injection Protection** - SQLAlchemy ORM prevents SQL injection  
✅ **CORS Protection** - Configured for localhost development  

## Configuration

### Session Duration

Edit `backend/auth_service.py`, line ~90:
```python
expires_at=datetime.utcnow() + timedelta(days=7),  # Change days here
```

### Password Requirements

Edit `backend/auth_service.py`, line ~30:
```python
if not password or len(password) < 6:  # Change minimum length
```

### Database Path

Edit `backend/auth_service.py`, line ~12:
```python
def __init__(self, db_url='sqlite:///users.db'):  # Change database path
```

For PostgreSQL:
```python
db_url='postgresql://user:password@localhost/dbname'
```

## Troubleshooting

### "Authentication not available" error

**Cause:** Backend can't import auth modules  
**Solution:** 
```bash
cd backend
.venv/bin/pip install SQLAlchemy bcrypt
```

### "Network error" on login/register

**Cause:** Backend server not running or wrong URL  
**Solution:**
1. Start backend: `cd backend && PORT=5001 .venv/bin/python optimize_excel.py`
2. Check if URL in Login.tsx and Register.tsx matches your backend URL

### Session not persisting across page reloads

**Cause:** Session token not stored correctly  
**Solution:** Check browser console for errors. Session token should be in localStorage.

### Can't create admin users

**Solution:** Use SQL to update user directly:
```bash
cd backend
sqlite3 users.db
UPDATE users SET is_admin = 1 WHERE username = 'your_username';
```

## Testing

Test the authentication flow:

```bash
# Register a new user
curl -X POST http://127.0.0.1:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://127.0.0.1:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  -c cookies.txt

# Get current user (with session token from login response)
curl -X GET http://127.0.0.1:5001/api/auth/me \
  -H "Authorization: Bearer <session_token_from_login>"

# Logout
curl -X POST http://127.0.0.1:5001/api/auth/logout \
  -b cookies.txt
```

## Next Steps

1. **Deploy to Production:**
   - Change database to PostgreSQL
   - Enable HTTPS
   - Update CORS settings for production domain
   - Set secure cookie flags

2. **Add Features:**
   - Password reset via email
   - Email verification
   - Two-factor authentication
   - User roles and permissions
   - Audit logging

3. **Customize:**
   - Add custom user fields (department, phone, etc.)
   - Customize session duration
   - Add password complexity requirements
   - Implement account lockout after failed attempts

## Support

For issues or questions:
1. Check backend logs: `backend/logs/` or terminal output
2. Check browser console for frontend errors
3. Verify database exists: `ls -la backend/users.db`
4. Test endpoints with curl (see Testing section)

---

**Authentication is now live!** Users can create accounts and login to access your Buy Back Optimizer. 🎉
