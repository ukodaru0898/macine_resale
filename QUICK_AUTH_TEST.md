# Quick Authentication Test

Your authentication system is now live! Here's how to test it:

## 1. Backend is Running ✓

The backend server is already running on port 5001 with authentication enabled.

Test it:
```bash
curl http://127.0.0.1:5001/health
```

## 2. Test User Already Created ✓

A demo user has been created:
- **Username:** `demo_user`
- **Email:** `demo@asml.com`
- **Password:** `demo123`
- **Company:** ASML

## 3. Start the Frontend

Open a new terminal and run:

```bash
npm run dev
```

Then open your browser to: http://localhost:5173

## 4. Login Flow

You'll see the **Login** screen automatically:

1. Enter username: `demo_user`
2. Enter password: `demo123`
3. Click "Sign In"

You should be logged in and see:
- Your name in the top right corner
- A user profile icon
- The main application interface

## 5. Create a New Account

1. Click "Create Account" on the login screen
2. Fill in the registration form:
   - Username: (choose your own, 3+ characters)
   - Email: your-email@example.com
   - Password: (at least 6 characters)
   - Full Name: (optional)
   - Company: (optional)
3. Click "Create Account"
4. You'll be redirected to login
5. Sign in with your new credentials

## 6. Test Logout

1. Click the user profile icon (👤) in the top right
2. Select "Logout" from the menu
3. You'll be logged out and returned to the login screen

## 7. Session Persistence

1. Login to your account
2. Refresh the page (F5 or Cmd+R)
3. You should remain logged in
4. Close the browser and reopen
5. Navigate to the app - you'll still be logged in (session lasts 7 days)

## Test via API (Optional)

### Register New User
```bash
curl -X POST http://127.0.0.1:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User",
    "company": "Test Co"
  }' | python3 -m json.tool
```

### Login
```bash
curl -X POST http://127.0.0.1:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"demo123"}' \
  -c cookies.txt | python3 -m json.tool
```

### Get Current User (with token from login)
```bash
TOKEN="<paste_session_token_here>"
curl -X GET http://127.0.0.1:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### Logout
```bash
curl -X POST http://127.0.0.1:5001/api/auth/logout \
  -b cookies.txt | python3 -m json.tool
```

## Troubleshooting

### "Network error" on login
- **Solution:** Make sure backend is running: `cd backend && PORT=5001 .venv/bin/python optimize_excel.py`

### Can't create account (username exists)
- **Solution:** Try a different username. The demo account `demo_user` is already taken.

### Session doesn't persist
- **Solution:** Check browser console (F12) for errors. Session token should be in localStorage.

## Next Steps

1. ✅ Authentication is working
2. ✅ Users can register and login
3. ✅ Sessions are managed securely
4. 📝 Customize user profile fields as needed
5. 📝 Add password reset functionality (future)
6. 📝 Enable email verification (future)

## Database Location

User accounts are stored in: `backend/users.db`

View users:
```bash
cd backend
sqlite3 users.db "SELECT id, username, email, full_name, company, created_at FROM users;"
```

---

**Everything is ready!** Your users can now create accounts and login to use the Buy Back Optimizer. 🎉
