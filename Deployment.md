# Machine Resale Rate Calculations - Deployment Guide

## Deploying Python Flask + React (Vite) Application on Windows VM with Public IP

This guide provides step-by-step instructions to deploy this Machine Resale Rate Calculations application on a Windows Virtual Machine with a public IP address, making it accessible to anyone with the URL.

---

## Prerequisites

Before starting deployment, ensure you have:

- **Windows VM with Public IP** (Azure VM, AWS EC2, or other cloud provider)
- **Python 3.8+** installed
- **Node.js 18+** and npm installed
- **Git** installed for code deployment
- **Admin access** to configure firewall and services
- **GitHub repository** with your code (optional but recommended)

---

## Part 1: Server Setup

### 1.1 Connect to Your Windows VM

- Use **Remote Desktop (RDP)** to connect to your Windows VM
- Login with your admin credentials

### 1.2 Install Required Software

**Install Python:**
- Download Python 3.8+ from https://www.python.org/downloads/
- During installation, check "Add Python to PATH"
- Verify: Open PowerShell and run `python --version`

**Install Node.js:**
- Download Node.js 18+ from https://nodejs.org/
- Install with default settings
- Verify: Run `node --version` and `npm --version` in PowerShell

**Install Git:**
- Download from https://git-scm.com/download/win
- Install with default settings
- Verify: Run `git --version`

---

## Part 2: Deploy Application Code

### 2.1 Get Your Application Code

**Option A: Clone from GitHub (Recommended)**
```powershell
cd C:\
git clone https://github.com/yourusername/machine-resale-calculations.git
cd machine-resale-calculations
```

**Option B: Copy Files Directly**
- Use RDP file transfer or FTP to copy your project folder to `C:\machine-resale-calculations`

### 2.2 Setup Backend (Python Flask)

```powershell
# Navigate to backend directory
cd C:\machine-resale-calculations\frontend\backend

# Install Python dependencies
pip install -r requirements.txt

# Test backend runs correctly
python optimize_excel.py
```

The backend should start on `http://0.0.0.0:5001`

### 2.3 Setup Frontend (React + Vite)

```powershell
# Navigate to frontend directory
cd C:\machine-resale-calculations\frontend

# Install dependencies
npm install

# Build production version
npm run build
```

This creates a `dist` folder with optimized production files.

---

## Part 3: Configure for Public Access

### 3.1 Update Backend to Listen on All Interfaces

Edit `backend/optimize_excel.py` and ensure Flask runs on `0.0.0.0`:

```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
```

### 3.2 Update Frontend API URL

Edit `frontend/src/utils/backend.ts` and set your VM's public IP:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://YOUR_PUBLIC_IP:5001'
```

Replace `YOUR_PUBLIC_IP` with your actual public IP address.

Then rebuild:
```powershell
cd C:\machine-resale-calculations\frontend
npm run build
```

### 3.3 Open Firewall Ports

**Open Windows Firewall:**
1. Press `Win + R`, type `wf.msc` and press Enter
2. Click "Inbound Rules" → "New Rule"
3. Select "Port" → Next
4. Select "TCP" and enter port `5001` → Next
5. Select "Allow the connection" → Next
6. Check all profiles (Domain, Private, Public) → Next
7. Name it "Flask Backend" → Finish
8. Repeat for port `3000` (Frontend) and name it "React Frontend"

**For Cloud VMs (Azure/AWS):**
- Also open ports in your cloud provider's security group/network security group
- Allow inbound TCP traffic on ports 3000 and 5001 from 0.0.0.0/0

---

## Part 4: Run Application

### 4.1 Start Backend Server

```powershell
cd C:\machine-resale-calculations\frontend\backend
python optimize_excel.py
```

Keep this PowerShell window open. Backend runs on port 5001.

### 4.2 Start Frontend Server

Open a **new** PowerShell window:

```powershell
cd C:\machine-resale-calculations\frontend
npm run preview -- --host 0.0.0.0 --port 3000
```

Keep this window open. Frontend serves from `dist` folder on port 3000.

### 4.3 Get Your Public IP

In PowerShell:
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

Or visit https://whatismyipaddress.com/ in browser on the VM.

---

## Part 5: Access Your Application

### 5.1 Share URL with Users

**Application URL:** `http://YOUR_PUBLIC_IP:3000`

Example: `http://203.0.113.45:3000`

Users can now:
1. Open this URL in any browser
2. Upload Base.xlsx file
3. Run optimizations
4. Download results

---

## Part 6: Run as Windows Services (Production)

To keep servers running after closing PowerShell windows:

### 6.1 Install NSSM (Service Manager)

1. Download NSSM from https://nssm.cc/download
2. Extract to `C:\nssm`
3. Add to PATH or use full path

### 6.2 Create Backend Service

```powershell
cd C:\nssm\win64
.\nssm.exe install MachineResaleBackend "C:\Python\python.exe" "C:\machine-resale-calculations\frontend\backend\optimize_excel.py"
.\nssm.exe set MachineResaleBackend AppDirectory "C:\machine-resale-calculations\frontend\backend"
.\nssm.exe start MachineResaleBackend
```

### 6.3 Create Frontend Service

```powershell
.\nssm.exe install MachineResaleFrontend "C:\Program Files\nodejs\npm.cmd" "run preview -- --host 0.0.0.0 --port 3000"
.\nssm.exe set MachineResaleFrontend AppDirectory "C:\machine-resale-calculations\frontend"
.\nssm.exe start MachineResaleFrontend
```

Services will now auto-start on VM reboot.

---

## Part 7: Updating Your Application

When you make code changes:

### 7.1 Pull Latest Code

```powershell
cd C:\machine-resale-calculations
git pull origin main
```

### 7.2 Update Backend

```powershell
cd frontend\backend
pip install -r requirements.txt
# Restart service or PowerShell window
```

### 7.3 Update Frontend

```powershell
cd frontend
npm install
npm run build
# Restart service or PowerShell window
```

---

## Troubleshooting

### Users Can't Access URL

- Verify VM firewall ports 3000 and 5001 are open
- Check cloud provider security group allows inbound traffic
- Confirm services are running: `netstat -ano | findstr "3000 5001"`
- Test locally on VM: `http://localhost:3000`

### Backend Errors

- Check Python version: `python --version` (needs 3.8+)
- Verify all dependencies installed: `pip list`
- Check backend logs in PowerShell window
- Ensure Base.xlsx and MasterDB.xlsx exist in correct paths

### Frontend Not Loading

- Verify build succeeded: check `frontend/dist` folder exists
- Confirm backend URL is correct in `backend.ts`
- Check browser console (F12) for errors
- Clear browser cache

### Excel File Upload Issues

- Ensure `public/sample_data/` directory exists
- Check file permissions (backend needs write access)
- Verify Base.xlsx format matches expected structure

---

## Security Considerations

⚠️ **Important for Production Use:**

1. **Use HTTPS:** Setup reverse proxy (nginx/IIS) with SSL certificate
2. **Authentication:** Add login system if data is sensitive
3. **Firewall:** Restrict access to specific IP ranges if possible
4. **Backup:** Regular backups of Excel data files
5. **Updates:** Keep Python, Node.js, and dependencies updated
6. **Monitoring:** Setup logging and monitoring for errors

---

## Alternative: Using Port 80 (No Port in URL)

To access via `http://YOUR_PUBLIC_IP` without `:3000`:

### Setup Nginx Reverse Proxy

1. Install nginx for Windows
2. Configure `nginx.conf`:

```nginx
server {
    listen 80;
    location / {
        proxy_pass http://localhost:3000;
    }
    location /api/ {
        proxy_pass http://localhost:5001/;
    }
}
```

3. Open port 80 in firewall
4. Users access: `http://YOUR_PUBLIC_IP`

---

## Support & Resources

- **Python Flask:** https://flask.palletsprojects.com/
- **React + Vite:** https://vitejs.dev/
- **NSSM:** https://nssm.cc/usage
- **Windows Firewall:** https://docs.microsoft.com/en-us/windows/security/

---

**Deployment Complete!** 🎉

Share `http://YOUR_PUBLIC_IP:3000` with your users.
