# 🚀 Machine Resale Rate Calculator - Quick Start

## For Business Clients (Non-Technical Users)

This application helps optimize machine resale pricing and inventory decisions.

---

## ⚡ Super Easy Setup (2 Steps!)

### Step 1: Install Docker (One-Time Only)

**Download Docker Desktop:**
- **Windows:** https://www.docker.com/products/docker-desktop/ (Choose Windows installer)
- **Mac (Intel):** https://www.docker.com/products/docker-desktop/ (Choose Mac with Intel chip)
- **Mac (Apple Silicon/M1/M2/M3):** https://www.docker.com/products/docker-desktop/ (Choose Mac with Apple chip)

**Install:**
- **Windows:** Run the installer, restart computer
- **Mac:** Open the `.dmg` file, drag Docker to Applications, open it
- Wait for Docker to fully start (Windows: check system tray, Mac: check menu bar for whale icon)

You only need to do this once!

### Step 2: Start the Application

**Windows Users:**
1. Open the `frontend` folder in File Explorer
2. Double-click `start.bat` file
3. Wait for it to say "SUCCESS!"

**Alternative for Windows (using Command Prompt):**
1. Press `Win + R`, type `cmd`, press Enter
2. Navigate to frontend folder: `cd "C:\path\to\frontend"`
3. Run: `start.bat`

**Mac/Linux Users:**
1. Open Terminal
2. Navigate to the `frontend` folder: `cd /path/to/frontend`
3. Run: `./start.sh`

**That's it!** Open your web browser and go to: **http://localhost**

---

## 📱 Using the Application

1. **Open Browser:** Go to `http://localhost`
2. **Upload Excel File:** Click "Import" and select your `Base.xlsx` file
3. **Configure Settings:** Adjust margins and parameters as needed
4. **Run Optimization:** Click "Optimize Bundle" button
5. **View Results:** See optimized recommendations in tables
6. **Download Results:** Export optimized data back to Excel

---

## 🛑 Stop the Application

**Windows:** Double-click `stop.bat`

**Mac/Linux:** Run `./stop.sh` in Terminal

---

## 📊 View Logs (If Something Goes Wrong)

**Windows:** Double-click `logs.bat`

**Mac/Linux:** Run `./logs.sh` in Terminal

---

## 🌐 Share with Others on Your Network

1. Find your computer's IP address:
   - **Windows:** Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
   - **Mac:** System Preferences → Network, look for "IP Address"

2. Share this URL with colleagues: `http://YOUR_IP_ADDRESS`
   - Example: `http://192.168.1.100`

3. They can access the application from their own computers!

---

## ❓ Troubleshooting

### "Docker is not running" error
- Make sure Docker Desktop is open (look in system tray)
- If not running, click the Docker Desktop icon

### Can't access http://localhost
- Wait 1-2 minutes after starting (first time takes longer)
- Try refreshing the browser page
- Check logs by running `logs.bat` (Windows) or `./logs.sh` (Mac/Linux)

### Port already in use
- Stop any other web servers running on your computer
- Or edit `docker-compose.yml` and change port 80 to 8080

### Still having issues?
1. Stop the application (`stop.bat` or `./stop.sh`)
2. Start it again (`start.bat` or `./start.sh`)
3. Check Docker Desktop is running

---

## 📁 Files You Need

Make sure these files are in your `frontend` folder:
- `Base.xlsx` (in `public/sample_data/` folder)
- `docker-compose.yml`
- `Dockerfile`
- `Dockerfile.backend`
- `start.bat` / `start.sh` (for starting)
- `stop.bat` / `stop.sh` (for stopping)

---

## 🔄 Updating to New Version

When you receive updated files:

1. **Stop current version:** Run `stop.bat` or `./stop.sh`
2. **Replace old files** with new ones
3. **Start new version:** Run `start.bat` or `./start.sh`

Docker will automatically rebuild with the new code!

---

## 💡 Benefits of Docker

✅ **No Python/Node.js installation needed**
✅ **Works on Windows, Mac, and Linux**
✅ **Same experience on all computers**
✅ **Easy to update and maintain**
✅ **Can run on servers without a screen**
✅ **Multiple users can access simultaneously**

---

## 📞 Need Help?

Refer to `DOCKER_DEPLOYMENT.md` for detailed documentation.

---

**Enjoy using the Machine Resale Rate Calculator!** 🎉
