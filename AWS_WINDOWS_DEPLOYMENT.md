# AWS Windows Server Deployment Guide

## Your EC2 Instance Details
- **Platform**: Windows Server 2025
- **Instance ID**: i-0ee7011f8332c4ea3
- **Public IP**: 3.17.25.31
- **Public DNS**: ec2-3-17-25-31.us-east-2.compute.amazonaws.com
- **Instance Type**: t3.micro
- **Region**: us-east-2 (Ohio)

---

## Step 1: Connect Using Remote Desktop (RDP)

### On Mac:

1. **Download Microsoft Remote Desktop** (if not installed):
   - Open **App Store**
   - Search for "**Microsoft Remote Desktop**"
   - Click **Get** (it's free)
   - Wait for installation to complete

2. **Open Microsoft Remote Desktop**

3. **Add a New PC**:
   - Click the **"+"** button
   - Select **"Add PC"**
   - Fill in the details:
     - **PC name**: `3.17.25.31` (or `ec2-3-17-25-31.us-east-2.compute.amazonaws.com`)
     - **User account**: Click "Add User Account"
       - Username: `Administrator`
       - Password: `iDPBPdy%Ln%D;5Qv%fXbdwWGk=V$A8hS`
     - **Friendly name**: `Machine Resale AWS Server` (optional)
   - Click **Add**

4. **Connect**:
   - Double-click on the connection you just created
   - If prompted about certificate, click **Continue**
   - Wait for Windows desktop to load

---

## Step 2: Check Security Group (If RDP Doesn't Connect)

If you can't connect, you need to open port 3389 (RDP):

### In AWS Console:

1. Go to **EC2** → **Instances**
2. Select your instance (i-0ee7011f8332c4ea3)
3. Click **Security** tab at the bottom
4. Click on the Security Group link
5. Click **Edit inbound rules**
6. Add these rules if missing:

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| RDP | TCP | 3389 | My IP | Remote Desktop |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web Traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure Web |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | Backend API |

7. Click **Save rules**

---

## Step 3: Install Required Software on Windows Server

Once connected to the Windows Server via RDP:

### 3.1 Install Docker Desktop for Windows

1. **Open Microsoft Edge browser** (on the Windows Server)
2. Go to: https://www.docker.com/products/docker-desktop/
3. Click **Download for Windows**
4. Run the installer
5. Follow installation wizard:
   - Accept license
   - Use default settings
   - Check "Use WSL 2 instead of Hyper-V" if prompted
6. Restart the server when prompted
7. Reconnect via RDP after restart

### 3.2 Install Git for Windows

1. **Open Microsoft Edge**
2. Go to: https://git-scm.com/download/win
3. Download and run the installer
4. Use default settings during installation

### 3.3 Verify Installations

1. **Open PowerShell** (Right-click Start → Windows PowerShell)
2. Run these commands:
```powershell
docker --version
git --version
```

---

## Step 4: Clone and Deploy Your Application

### 4.1 Open PowerShell as Administrator

Right-click **Start** → **Windows PowerShell (Admin)**

### 4.2 Create Working Directory

```powershell
# Create a working directory
cd C:\
mkdir Projects
cd Projects
```

### 4.3 Clone Your Repository

```powershell
git clone https://github.com/ukodaru0898/macine_resale.git
cd macine_resale
```

### 4.4 Create Environment File

```powershell
# Create .env file
@"
DATABASE_URL=postgresql://postgres:machineresale2024@db:5432/machineresaledb
FLASK_ENV=production
SECRET_KEY=super-secret-key-change-in-production-xyz123
VITE_BACKEND_URL=http://3.144.240.22:8000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=machineresale2024
POSTGRES_DB=machineresaledb
"@ | Out-File -FilePath .env -Encoding utf8
```

### 4.5 Build and Start Docker Containers

```powershell
# Build containers
docker-compose build

# Start containers in background
docker-compose up -d

# Check if containers are running
docker-compose ps
```
 
Tip:
- Replace `3.144.240.22` above with your current EC2 public IP if it changes.
- Ensure your Security Group allows inbound on ports 80, 443, and 8000.
- On Windows Server, make sure Docker Desktop is running before using `docker-compose`.

You should see something like:
```
NAME                    IMAGE               STATUS              PORTS
macine_resale-backend   ...                 Up                  0.0.0.0:8000->8000/tcp
macine_resale-frontend  ...                 Up                  0.0.0.0:80->80/tcp
macine_resale-db        postgres:15         Up                  5432/tcp
```

### 4.6 Initialize Database

```powershell
# Create database tables
docker-compose exec backend python -c "from auth_models import Base, engine; Base.metadata.create_all(engine); print('Database tables created successfully!')"
```

### 4.7 Check Logs

```powershell
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

---

## Step 5: Configure Windows Firewall

Open PowerShell as Administrator and run:

```powershell
# Allow inbound traffic on required ports
New-NetFirewallRule -DisplayName "Machine Resale - HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "Machine Resale - Backend" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
New-NetFirewallRule -DisplayName "Machine Resale - HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "Machine Resale - Frontend Dev" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
```

---

## Step 6: Access Your Application

### From Your Mac (or any computer):

1. **Frontend**: http://3.17.25.31
2. **Backend API**: http://3.17.25.31:8000
3. **Health Check**: http://3.17.25.31:8000/health

### From the Windows Server (test locally):

1. Open **Microsoft Edge** on the server
2. Go to: http://localhost

---

## Useful Commands

### View Container Status
```powershell
docker-compose ps
docker ps -a
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```powershell
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```powershell
docker-compose down
```

### Start Services
```powershell
docker-compose up -d
```

### Update Application (After Code Changes)
```powershell
# Pull latest code
cd C:\Projects\macine_resale
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Access Database
```powershell
docker-compose exec db psql -U postgres -d machineresaledb
```

### Check Disk Space
```powershell
# Check disk usage
Get-PSDrive C | Select-Object Used,Free

# Clean up Docker
docker system prune -a
```

---

## Troubleshooting

### Issue: Containers Won't Start

**Check Docker service:**
```powershell
Get-Service docker
# If stopped, start it:
Start-Service docker
```

**Check Docker Desktop:**
- Open Docker Desktop from Start Menu
- Wait for it to fully start (whale icon should be steady)
- Check for errors in Docker Desktop

### Issue: Port Already in Use

**Find what's using the port:**
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :80
```

**Kill the process:**
```powershell
# Replace PID with the actual process ID from netstat
Stop-Process -Id <PID> -Force
```

### Issue: Can't Access from Browser

1. **Check containers are running:**
   ```powershell
   docker-compose ps
   ```

2. **Check Windows Firewall rules:**
   ```powershell
   Get-NetFirewallRule -DisplayName "Machine Resale*"
   ```

3. **Check AWS Security Group** (see Step 2 above)

4. **Test locally on the server first:**
   - Open Edge on the Windows Server
   - Go to http://localhost

### Issue: Database Connection Errors

**Check database is running:**
```powershell
docker-compose ps db
```

**View database logs:**
```powershell
docker-compose logs db
```

**Recreate database:**
```powershell
docker-compose down -v
docker-compose up -d
# Wait for database to start, then initialize:
docker-compose exec backend python -c "from auth_models import Base, engine; Base.metadata.create_all(engine)"
```

---

## Making Application Run on Windows Startup

To make your application start automatically when Windows boots:

### Create Startup Script

1. Create a file: `C:\Projects\start-machine-resale.bat`

```batch
@echo off
cd C:\Projects\macine_resale
docker-compose up -d
```

2. **Add to Task Scheduler:**
   - Open **Task Scheduler** (search in Start Menu)
   - Click **Create Task**
   - Name: `Machine Resale Application`
   - Trigger: **At startup**
   - Action: **Start a program**
     - Program: `C:\Projects\start-machine-resale.bat`
   - Check **Run with highest privileges**
   - Click **OK**

---

## Security Recommendations

1. **Change default passwords** in `.env` file
2. **Enable HTTPS** with SSL certificate (use Let's Encrypt)
3. **Restrict RDP access** to specific IPs in Security Group
4. **Enable Windows Updates** automatically
5. **Install antivirus** software
6. **Enable CloudWatch monitoring** in AWS
7. **Set up automated backups** for database

---

## Next Steps

1. ✅ Connect via RDP
2. ✅ Install Docker and Git
3. ✅ Clone repository
4. ✅ Deploy application
5. ✅ Test access from browser
6. 🔲 Set up HTTPS (optional)
7. 🔲 Configure domain name (optional)
8. 🔲 Set up monitoring (optional)

---

## Quick Reference

**RDP Connection:**
- Host: `3.17.25.31`
- User: `Administrator`
- Pass: `iDPBPdy%Ln%D;5Qv%fXbdwWGk=V$A8hS`

**Access URLs:**
- Frontend: http://3.17.25.31
- Backend: http://3.17.25.31:8000

**Application Directory:**
- `C:\Projects\macine_resale`

**Important Commands:**
```powershell
cd C:\Projects\macine_resale
docker-compose ps           # Check status
docker-compose logs -f      # View logs
docker-compose restart      # Restart services
docker-compose down         # Stop services
docker-compose up -d        # Start services
```

---

**Need Help?** Check the Troubleshooting section or contact your team.
