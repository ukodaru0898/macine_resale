# 🚀 Easy Deployment with Docker - For Business Clients

## Why Docker?

Docker allows your client to run the entire application **without installing Python, Node.js, or any dependencies**. Just install Docker once, run one command, and the application is ready to use!

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Docker

**Windows:**
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Run the installer
3. Restart your computer
4. Open Docker Desktop (it will run in the background)

**Mac (Intel or Apple Silicon):**
1. Download Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop/
2. Open the downloaded `.dmg` file
3. Drag Docker to Applications folder
4. Open Docker from Applications
5. Grant permissions when prompted
6. Wait for Docker to start (you'll see a whale icon in menu bar)

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Step 2: Get the Application Files

**Option A: Download from GitHub**
1. Download the ZIP file from your repository
2. Extract to a folder (e.g., `C:\machine-resale-calculations` on Windows)

**Option B: Clone with Git**
```bash
git clone https://github.com/yourusername/machine-resale-calculations.git
cd machine-resale-calculations/frontend
```

### Step 3: Run the Application

Open Terminal/PowerShell in the `frontend` folder and run:

```bash
docker-compose up -d
```

**That's it!** The application is now running.

**Access the application at:** `http://localhost`

---

## 📋 Common Commands

### Start the Application
```bash
docker-compose up -d
```

### Stop the Application
```bash
docker-compose down
```

### Restart the Application
```bash
docker-compose restart
```

### View Application Logs
```bash
# View all logs
docker-compose logs

# View backend logs only
docker-compose logs backend

# View frontend logs only
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Update Application (After Code Changes)
```bash
# Stop containers
docker-compose down

# Rebuild with new code
docker-compose up -d --build
```

### Check if Application is Running
```bash
docker-compose ps
```

---

## 🌐 Accessing the Application

### On the Same Computer (Local)
- **URL:** `http://localhost`
- Just open your web browser and go to localhost

### From Other Computers on Same Network
1. Find the IP address of the computer running Docker:
   - **Windows:** Open PowerShell and run `ipconfig` (look for IPv4 Address)
   - **Mac:** System Preferences → Network (look for IP Address)
   - **Linux:** Run `ip addr show`

2. Other users access via: `http://YOUR_IP_ADDRESS`
   - Example: `http://192.168.1.100`

### From Internet (Public Access)
If you want to share with people outside your network:

**Option 1: Port Forwarding (Home/Office Router)**
1. Login to your router admin panel
2. Forward port 80 to your computer's local IP
3. Get your public IP from https://whatismyip.com
4. Share: `http://YOUR_PUBLIC_IP`

**Option 2: Deploy on Cloud VM**
- Follow the VM deployment steps in `Deployment.md`
- Docker works the same way on cloud VMs

---

## 🔧 Troubleshooting

### Port Already in Use
If you see "port is already allocated":

**Change the port in `docker-compose.yml`:**
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 80 to 8080 or any available port
```

Then access via `http://localhost:8080`

### Docker Not Starting
- **Windows/Mac:** Make sure Docker Desktop is running (check system tray)
- **Linux:** Run `sudo systemctl start docker`

### Cannot Access from Other Computers
- Check firewall allows incoming connections on port 80
- **Windows:** Run as Administrator: `netsh advfirewall firewall add rule name="Allow Port 80" dir=in action=allow protocol=TCP localport=80`
- **Mac:** System Preferences → Security & Privacy → Firewall → Firewall Options → Allow incoming connections

### Application Not Loading
```bash
# Check container status
docker-compose ps

# Restart containers
docker-compose restart

# View logs for errors
docker-compose logs
```

### Excel File Issues
Make sure `public/sample_data/Base.xlsx` exists in your project folder before running docker-compose.

---

## 📦 What's Inside the Containers?

Docker creates two containers:

1. **Backend Container** (`machine-resale-backend`)
   - Python 3.11 with Flask
   - All Python dependencies installed
   - Runs optimization engine
   - Accessible at `http://localhost:5001`

2. **Frontend Container** (`machine-resale-frontend`)
   - Nginx web server
   - Compiled React application
   - Proxy to backend API
   - Accessible at `http://localhost`

Both containers talk to each other automatically through Docker's internal network.

---

## 🔄 Updating to New Version

When you receive updated code:

1. **Stop current version:**
   ```bash
   docker-compose down
   ```

2. **Replace files with new version:**
   - Copy new files over old ones
   - Or pull latest code: `git pull`

3. **Rebuild and start:**
   ```bash
   docker-compose up -d --build
   ```

---

## 💾 Data Persistence

Your Excel files are stored in:
- `frontend/public/sample_data/Base.xlsx`
- `frontend/backend/MasterDB.xlsx`

These files are **preserved** even when you stop/restart Docker containers because they're mounted as volumes.

---

## 🛡️ Security Notes

For production use:

1. **Use HTTPS:** Setup SSL certificate (Let's Encrypt)
2. **Add Authentication:** Protect with login if data is sensitive
3. **Backup Data:** Regular backups of Excel files
4. **Update Docker:** Keep Docker Desktop updated
5. **Limit Access:** Use firewall rules to restrict who can access

---

## 📊 System Requirements

**Minimum:**
- 4 GB RAM
- 10 GB free disk space
- Any modern Windows, Mac, or Linux OS

**Recommended:**
- 8 GB RAM
- 20 GB free disk space
- SSD for faster performance

---

## ❓ FAQ

**Q: Do I need to install Python or Node.js?**
A: No! Docker includes everything needed.

**Q: Will this work on Windows, Mac, and Linux?**
A: Yes! Docker containers run identically on all platforms.

**Q: Can multiple people use it at the same time?**
A: Yes! Multiple users can access the web interface simultaneously.

**Q: How do I stop the application?**
A: Run `docker-compose down` in the frontend folder.

**Q: Does it use a lot of computer resources?**
A: It uses about 500MB-1GB of RAM when running, similar to a web browser.

**Q: Can I run this on a server without a screen?**
A: Yes! Perfect for headless servers. Access from any computer via browser.

**Q: What if I want to use a different port?**
A: Edit `docker-compose.yml` and change the port number under `frontend` → `ports`.

---

## 📞 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Restart: `docker-compose restart`
3. Rebuild: `docker-compose down && docker-compose up -d --build`
4. Check Docker is running: Docker Desktop should show green status

---

## 🎉 Success!

Once running, your users can:
1. Open `http://localhost` (or your IP)
2. Upload their Base.xlsx file
3. Configure settings
4. Click "Optimize Bundle"
5. Download optimized results

**No technical knowledge required!**
