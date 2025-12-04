# AWS EC2 Connection Troubleshooting

## Issue: SSH Connection Timeout

You're getting: `ssh: connect to host 3.17.25.31 port 22: Operation timed out`

This means SSH port (22) is not accessible. Here are the solutions:

---

## Solution 1: Check if it's a Windows Server

Your EC2 instance might be running **Windows Server** (not Linux), which uses **RDP** instead of SSH.

### Connect to Windows Server:

1. **On Mac, download Microsoft Remote Desktop:**
   - Open App Store
   - Search for "Microsoft Remote Desktop"
   - Install it (it's free)

2. **Connect using RDP:**
   - Open Microsoft Remote Desktop
   - Click "Add PC"
   - **PC Name**: `3.17.25.31`
   - **User account**: 
     - Username: `Administrator`
     - Password: `iDPBPdy%Ln%D;5Qv%fXbdwWGk=V$A8hS`
   - Click "Add"
   - Double-click the connection to connect

3. **Once connected to Windows:**
   - You'll see a Windows desktop
   - Open PowerShell (right-click Start → Windows PowerShell)
   - Follow the Windows deployment steps below

---

## Solution 2: Fix Security Group (if it's Linux)

Your team needs to open SSH port in AWS Console:

### Steps to Open SSH Port:

1. **Go to AWS Console** → EC2 → Instances
2. **Click on your instance** (the one with IP 3.17.25.31)
3. **Go to "Security" tab** at the bottom
4. **Click on the Security Group** (it will be a link like "sg-xxxxx")
5. **Click "Edit inbound rules"**
6. **Add a rule**:
   - Type: **SSH**
   - Protocol: **TCP**
   - Port: **22**
   - Source: **My IP** (or 0.0.0.0/0 for testing, but less secure)
7. **Click "Save rules"**

### Required Ports for Your Application:
- **Port 22** - SSH (for connecting)
- **Port 80** - HTTP (for web access)
- **Port 443** - HTTPS (for secure web access)
- **Port 8000** - Backend API
- **Port 3389** - RDP (if Windows)

After adding these, try connecting again:
```bash
ssh Administrator@3.17.25.31
```

---

## Solution 3: Ask Your Team

**Send this message to your team:**

> Hi team,
> 
> I'm unable to connect to the EC2 instance (3.17.25.31). I'm getting a connection timeout on port 22.
> 
> Can you please:
> 1. Confirm if this is a Linux or Windows Server instance?
> 2. If Linux: Add SSH (port 22) to the security group inbound rules
> 3. If Windows: Confirm RDP (port 3389) is open so I can connect via Remote Desktop
> 4. Also open ports 80, 443, and 8000 for the web application
> 
> My IP address is: [check at https://whatismyip.com]
> 
> Thank you!

---

## Windows Server Deployment Steps

If this is a Windows Server, here's how to deploy:

### 1. Install Docker Desktop for Windows

1. Download from: https://www.docker.com/products/docker-desktop/
2. Install Docker Desktop
3. Restart the server if prompted

### 2. Install Git for Windows

1. Download from: https://git-scm.com/download/win
2. Install with default options

### 3. Clone and Deploy

Open PowerShell and run:

```powershell
# Clone repository
git clone https://github.com/ukodaru0898/macine_resale.git
cd macine_resale

# Create .env file
@"
DATABASE_URL=postgresql://postgres:machineresale2024@db:5432/machineresaledb
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this-in-production
VITE_BACKEND_URL=http://3.17.25.31:8000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=machineresale2024
POSTGRES_DB=machineresaledb
"@ | Out-File -FilePath .env -Encoding utf8

# Build and start containers
docker-compose build
docker-compose up -d

# Check status
docker-compose ps

# Initialize database
docker-compose exec backend python -c "from auth_models import Base, engine; Base.metadata.create_all(engine); print('Database tables created!')"
```

### 4. Open Windows Firewall Ports

In PowerShell (as Administrator):

```powershell
# Allow inbound traffic on required ports
New-NetFirewallRule -DisplayName "Machine Resale - HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "Machine Resale - Backend" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
New-NetFirewallRule -DisplayName "Machine Resale - HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## Quick Check: Is the Server Running?

Try to access it in your browser:
- http://3.17.25.31 (might not work yet, but worth trying)

If you see anything (even an error page), the server is accessible, and it's just SSH that's blocked.

---

## Alternative: Use AWS Session Manager (No SSH Required)

If your team has configured Session Manager, you can connect without SSH:

1. Go to AWS Console → EC2 → Instances
2. Select your instance
3. Click **"Connect"** button at the top
4. Choose **"Session Manager"** tab
5. Click **"Connect"**

This opens a terminal in your browser without needing SSH port 22.

---

## Summary

Most likely scenarios:
1. **Windows Server** - Use Microsoft Remote Desktop (RDP)
2. **Linux with blocked SSH** - Ask team to open port 22 in security group
3. **Use Session Manager** - Connect through AWS Console

**Next step:** Ask your team if it's Windows or Linux, and request the necessary ports to be opened.
