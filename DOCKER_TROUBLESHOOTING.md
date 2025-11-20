# 🔧 Docker Troubleshooting - Backend Connection Issues

## The Problem You're Seeing

```
connect() failed (111: Connection refused) while connecting to upstream
502 Bad Gateway
```

This means the frontend (nginx) can't reach the backend Python server.

---

## ✅ Quick Fix

I've updated the code to fix this issue. Follow these steps:

### Step 1: Stop Current Containers

```powershell
docker-compose down
```

### Step 2: Pull Latest Changes

Make sure you have the updated files:
- `backend/optimize_excel.py` (updated to use 0.0.0.0:5001)
- `Dockerfile.backend` (updated with better configuration)
- `docker-compose.yml` (updated with healthcheck)

### Step 3: Rebuild and Start

```powershell
docker-compose build --no-cache
docker-compose up -d
```

### Step 4: Check Backend is Running

```powershell
# Check container status
docker ps

# Check backend logs
docker logs machine-resale-backend
```

You should see:
```
Starting optimizer server
Running on http://0.0.0.0:5001
```

### Step 5: Test Backend Health

```powershell
# Test from command line
curl http://localhost:5001/health
```

Should return: `{"status":"healthy"}`

---

## 📋 Verification Checklist

Run these commands to verify everything is working:

```powershell
# 1. Check both containers are running
docker ps
```
Should show both `machine-resale-backend` and `machine-resale-frontend` with Status "Up"

```powershell
# 2. Test backend directly
curl http://localhost:5001/health
```
Should return: `{"status":"healthy"}`

```powershell
# 3. Check backend logs for errors
docker logs machine-resale-backend --tail=20
```
Should NOT show any Python errors or connection errors

```powershell
# 4. Open browser
```
Go to `http://localhost` - Should load the application

```powershell
# 5. Try optimization
```
Upload Base.xlsx and click "Optimize Bundle" - Should work without 502 error

---

## 🔍 Common Issues and Solutions

### Issue 1: Backend Container Keeps Restarting

**Check logs:**
```powershell
docker logs machine-resale-backend -f
```

**Common causes:**
- Missing `Base.xlsx` in `public/sample_data/`
- Python syntax error
- Missing dependency

**Solution:**
- Ensure `Base.xlsx` exists in correct location
- Check logs for specific Python error
- Verify `requirements.txt` is complete

### Issue 2: Port Already in Use

**Error:** "port is already allocated"

**Solution:**
```powershell
# Find what's using port 5001
netstat -ano | findstr :5001

# Kill that process (replace PID)
taskkill /PID <PID_NUMBER> /F

# Or change port in docker-compose.yml
```

### Issue 3: Files Not Updating

**Solution:**
```powershell
# Force complete rebuild
docker-compose down
docker rmi machine-resale-backend machine-resale-frontend
docker-compose up -d --build
```

### Issue 4: Cannot Find Base.xlsx

**Error in logs:** "No such file or directory: Base.xlsx"

**Solution:**
```powershell
# Check file exists
dir public\sample_data\Base.xlsx

# If missing, copy it from your backup
# Then restart containers
docker-compose restart
```

---

## 🧪 Manual Testing (If Docker Issues Persist)

### Test Backend Without Docker:

```powershell
cd backend
pip install -r requirements.txt
python optimize_excel.py
```

Should start on `http://0.0.0.0:5001`

Then open another terminal:
```powershell
curl http://localhost:5001/health
```

### Test Frontend Without Docker:

```powershell
npm install
npm run dev
```

Should start on `http://localhost:5173`

---

## 📊 Useful Docker Commands

```powershell
# View all containers (including stopped)
docker ps -a

# View backend logs (last 50 lines)
docker logs machine-resale-backend --tail=50

# Follow backend logs in real-time
docker logs machine-resale-backend -f

# Restart just the backend
docker restart machine-resale-backend

# Execute command inside backend container
docker exec -it machine-resale-backend python --version

# Check Docker network
docker network inspect frontend_app-network

# Remove everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 🆘 Still Not Working?

### Collect Diagnostic Information:

```powershell
# 1. Docker version
docker version

# 2. Container status
docker ps -a

# 3. Backend logs
docker logs machine-resale-backend --tail=100 > backend-logs.txt

# 4. Frontend logs
docker logs machine-resale-frontend --tail=100 > frontend-logs.txt

# 5. Network info
docker network inspect frontend_app-network > network-info.txt
```

Send these log files for debugging.

---

## ✨ What Changed to Fix the Issue

1. **Backend now listens on `0.0.0.0:5001`** instead of `127.0.0.1:8000`
   - Docker containers need to listen on 0.0.0.0 to accept connections from other containers

2. **Added healthcheck to docker-compose.yml**
   - Ensures backend is ready before frontend tries to connect

3. **Fixed file paths for Docker environment**
   - Backend now checks for mounted volume paths

4. **Added `-u` flag to Python command**
   - Ensures logs appear immediately (unbuffered output)

---

## 🎯 Expected Behavior After Fix

1. **Start containers:** `docker-compose up -d`
2. **Wait 30 seconds** for backend to fully start
3. **Check logs:** `docker logs machine-resale-backend`
   - Should see "Running on http://0.0.0.0:5001"
4. **Test health:** `curl http://localhost:5001/health`
   - Should return `{"status":"healthy"}`
5. **Open browser:** `http://localhost`
   - Application loads successfully
6. **Click Optimize Bundle:**
   - No 502 errors
   - Optimization completes successfully

---

**If you still see 502 errors after following these steps, run the diagnostic commands and share the logs!**
