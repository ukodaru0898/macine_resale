# ASML Buy Back Optimizer - Setup Guide for Non-Technical Users

**📌 Quick Overview**: This guide will help you install and run the ASML Buy Back Optimizer on your laptop. No prior technical experience required - just follow the steps below!

**⏱️ Estimated Time**: 20-30 minutes for first-time setup

**💡 What This Application Does**: 
- Helps optimize buy-back pricing and inventory decisions
- Analyzes system recommendations and profit calculations
- Provides interactive data tables for business analysis

---

## 📋 Table of Contents
1. [What You Need to Install](#step-1-what-you-need-to-install)
2. [Installing Python](#step-2-install-python)
3. [Installing Node.js](#step-3-install-nodejs)
4. [Getting the Project Files](#step-4-get-the-project-files)
5. [Setting Up the Project](#step-5-set-up-the-project)
6. [Running the Application](#step-6-running-the-application)
7. [Using the Application](#step-7-using-the-application)
8. [Troubleshooting Common Issues](#troubleshooting-for-non-technical-users)

---

## Step 1: What You Need to Install

Before starting, make sure your laptop meets these requirements:

### ✅ Computer Requirements
- **Operating System**: Windows 10/11, macOS 10.15 or newer, or Linux
- **Memory (RAM)**: At least 4 GB (8 GB is better)
- **Free Disk Space**: At least 2 GB
- **Internet Connection**: Required for downloading software (one-time only)

### 📦 Software You'll Install (Free Downloads)
1. **Python** - A programming language (we use version 3.13)
2. **Node.js** - JavaScript runtime (we use version 20)
3. **The Project Files** - The actual application files

**⚠️ Important**: You must install BOTH Python AND Node.js for the application to work.

---

## Step 2: Install Python

Python is a programming language that runs the backend calculations.

### For Windows Users:

1. **Download Python**:
   - Go to: https://www.python.org/downloads/windows/
   - Click on: **"Python 3.13.0 - Windows installer (64-bit)"**
   - Save the file to your Downloads folder

2. **Install Python**:
   - Find the downloaded file (usually in Downloads folder)
   - Double-click the file to start installation
   - **⚠️ IMPORTANT**: Check the box that says **"Add Python to PATH"** at the bottom of the first screen
   - Click **"Install Now"**
   - Wait for installation to complete (2-3 minutes)
   - Click **"Close"** when done

3. **Verify Python is Installed**:
   - Press `Windows Key + R` on your keyboard
   - Type `cmd` and press Enter
   - A black window (Command Prompt) will open
   - Type: `python --version` and press Enter
   - You should see: `Python 3.13.0` or similar
   - Type `exit` and press Enter to close the window

### For Mac Users:

1. **Download Python**:
   - Go to: https://www.python.org/downloads/macos/
   - Click on: **"Python 3.13.0 - macOS 64-bit universal2 installer"**
   - Save the file to your Downloads folder

2. **Install Python**:
   - Find the downloaded `.pkg` file in Downloads
   - Double-click to start installation
   - Follow the installer prompts
   - Click "Continue" → "Agree" → "Install"
   - Enter your Mac password when prompted
   - Wait for installation to complete
   - Click "Close"

3. **Verify Python is Installed**:
   - Press `Command + Space` to open Spotlight
   - Type `Terminal` and press Enter
   - In the Terminal window, type: `python3 --version` and press Enter
   - You should see: `Python 3.13.0` or similar
   - Type `exit` and press Enter to close

**✅ Python Installation Complete!**

---

## Step 3: Install Node.js

Node.js runs the web interface (frontend) of the application.

### For Windows Users:

1. **Download Node.js**:
   - Go to: https://nodejs.org/en/download/
   - Click on: **"20.10.0 LTS - Windows Installer (.msi) - 64-bit"**
   - Save the file to your Downloads folder

2. **Install Node.js**:
   - Find the downloaded `.msi` file in Downloads
   - Double-click to start installation
   - Click "Next" → "Next" → "Next" (accept all defaults)
   - Click "Install"
   - Wait for installation to complete (2-3 minutes)
   - Click "Finish"

3. **Verify Node.js is Installed**:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter
   - Type: `node --version` and press Enter
   - You should see: `v20.10.0` or similar
   - Type: `npm --version` and press Enter
   - You should see: `10.2.0` or similar
   - Type `exit` and press Enter

### For Mac Users:

1. **Download Node.js**:
   - Go to: https://nodejs.org/en/download/
   - Click on: **"20.10.0 LTS - macOS Installer (.pkg) - 64-bit"**
   - Save the file to your Downloads folder

2. **Install Node.js**:
   - Find the downloaded `.pkg` file in Downloads
   - Double-click to start installation
   - Click "Continue" → "Agree" → "Install"
   - Enter your Mac password when prompted
   - Wait for installation to complete
   - Click "Close"

3. **Verify Node.js is Installed**:
   - Open Terminal (Command + Space, type "Terminal")
   - Type: `node --version` and press Enter
   - You should see: `v20.10.0` or similar
   - Type: `npm --version` and press Enter
   - You should see: `10.2.0` or similar
   - Type `exit` and press Enter

**✅ Node.js Installation Complete!**

---

## Step 4: Get the Project Files

The project files should be provided to you (usually via email, USB drive, or cloud storage).

1. **Copy the Project Folder**:
   - You should receive a folder named: `Machine Resale rate Caluclations`
   - Copy this entire folder to your **Documents** folder
   - The full path should be: `Documents/Machine Resale rate Caluclations/frontend`

2. **Verify Files are Present**:
   - Open your Documents folder
   - Open `Machine Resale rate Caluclations`
   - Open `frontend`
   - You should see folders like: `backend`, `public`, `src`, and files like `package.json`

**✅ Project Files Ready!**

---

## Step 5: Set Up the Project

Now we'll install all the required components. Don't worry - the computer does most of the work!

### For Windows Users:

1. **Open Command Prompt**:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter

2. **Navigate to Project Folder**:
   - Type this command and press Enter:
   ```
   cd Documents\Machine Resale rate Caluclations\frontend
   ```

3. **Install Frontend Dependencies** (takes 2-5 minutes):
   - Type: `npm install` and press Enter
   - You'll see lots of text scrolling - this is normal!
   - Wait until you see a message like "added XXX packages"
   - You're back at the prompt when you can type again

4. **Create Python Virtual Environment**:
   - Type: `python -m venv .venv` and press Enter
   - Wait 30 seconds

5. **Activate Virtual Environment**:
   - Type: `.venv\Scripts\activate` and press Enter
   - You should see `(.venv)` at the beginning of your command line

6. **Install Python Dependencies** (takes 1-3 minutes):
   - Type: `pip install flask flask-cors pandas openpyxl numpy` and press Enter
   - Wait for all packages to download and install
   - You'll see "Successfully installed..." when done

### For Mac Users:

1. **Open Terminal**:
   - Press `Command + Space`
   - Type `Terminal` and press Enter

2. **Navigate to Project Folder**:
   - Type this command and press Enter:
   ```
   cd Documents/Machine\ Resale\ rate\ Caluclations/frontend
   ```

3. **Install Frontend Dependencies** (takes 2-5 minutes):
   - Type: `npm install` and press Enter
   - You'll see lots of text scrolling - this is normal!
   - Wait until you see "added XXX packages"

4. **Create Python Virtual Environment**:
   - Type: `python3 -m venv .venv` and press Enter
   - Wait 30 seconds

5. **Activate Virtual Environment**:
   - Type: `source .venv/bin/activate` and press Enter
   - You should see `(.venv)` at the beginning of your command line

6. **Install Python Dependencies** (takes 1-3 minutes):
   - Type: `pip install flask flask-cors pandas openpyxl numpy` and press Enter
   - Wait for all packages to download and install
   - You'll see "Successfully installed..." when done

**✅ Setup Complete! You only need to do this once.**

---

## Step 6: Running the Application

Every time you want to use the application, you need to start TWO programs (the backend and frontend). Think of it like turning on both your TV and cable box.

### Starting the Backend (Server)

**Windows**:

### Starting the Backend (Server)

**Windows**:
1. Open Command Prompt (`Windows Key + R`, type `cmd`, press Enter)
2. Type: `cd Documents\Machine Resale rate Caluclations\frontend\backend` and press Enter
3. Type: `..\. venv\Scripts\activate` and press Enter
4. Type: `python optimize_excel.py` and press Enter
5. **Keep this window open!** You should see text like:
   ```
   * Running on http://127.0.0.1:8000
   * Debug mode: on
   ```
6. **✅ Backend is Running!** Do not close this window.

**Mac**:
1. Open Terminal (`Command + Space`, type `Terminal`, press Enter)
2. Type: `cd Documents/Machine\ Resale\ rate\ Caluclations/frontend/backend` and press Enter
3. Type: `source ../.venv/bin/activate` and press Enter
4. Type: `python optimize_excel.py` and press Enter
5. **Keep this window open!** You should see:
   ```
   * Running on http://127.0.0.1:8000
   * Debug mode: on
   ```
6. **✅ Backend is Running!** Do not close this window.

### Starting the Frontend (Website)

**Windows**:
1. Open a **NEW** Command Prompt (leave the first one running!)
2. Type: `cd Documents\Machine Resale rate Caluclations\frontend` and press Enter
3. Type: `npm start` and press Enter
4. Wait 10-30 seconds. You should see:
   ```
   Local: http://localhost:5173/
   ```
5. **Your web browser will automatically open** showing the application
6. If browser doesn't open, manually go to: http://localhost:5173

**Mac**:
1. Open a **NEW** Terminal window (`Command + N` or File → New Window)
2. Type: `cd Documents/Machine\ Resale\ rate\ Caluclations/frontend` and press Enter
3. Type: `npm start` and press Enter
4. Wait 10-30 seconds. You should see:
   ```
   Local: http://localhost:5173/
   ```
5. **Your web browser will automatically open** showing the application
6. If browser doesn't open, manually go to: http://localhost:5173

**✅ Application is Running!**

**💡 Remember**: 
- Keep BOTH windows/terminals open while using the application
- You need to start both backend AND frontend every time you want to use the app
- To stop the application, press `Ctrl + C` in each window

---

## Step 7: Using the Application

Once the application opens in your web browser:

### Understanding the Interface

**Color Coding**:
- 🟢 **Green Columns** = You can edit these (user input)
- 🔵 **Blue Columns** = Read-only data from database
- 🟡 **Yellow Columns** = Results from optimization

### Main Tables:

1. **System Recommendation Table**
   - Enter offered bundles and expected buy back quantities
   - Set required margin percentages
   - View recommended buy quantities

2. **System/Modules/Parts Demand Tables**
   - Enter demand forecasts for 12 and 24 months
   - Enter finished inventory quantities
   - View required quantities (calculated automatically)

3. **Conversion Matrix Table**
   - Reference table showing conversion costs
   - Read-only (no editing needed)

4. **Max Buy Back Bundle Valuation Table**
   - Set required margin percentages for different categories
   - View valuation results after optimization

5. **Expected Profit on Bundle Table**
   - View profit and margin calculations
   - Updated after running optimization

### How to Use:

1. **Load Data** (Automatic):
   - Data loads automatically from Base.xlsx file
   - Wait a few seconds for tables to populate

2. **Edit Green Cells**:
   - Click any green cell to edit
   - Type new value and press Enter or click outside the cell
   - Changes save automatically

3. **Run Optimization**:
   - Scroll to top of page
   - Click the **"Optimise Bundle"** button
   - Wait 5-15 seconds for calculations to complete
   - Yellow columns will update with new results

4. **Review Results**:
   - Check Max Buy Back Bundle Valuation table
   - Review Expected Profit on Bundle table
   - View updated recommendations in System Recommendation table

### Tips:
- ✅ Save your work by clicking "Optimise Bundle" regularly
- ✅ The Total row shows sum of all values
- ✅ Empty cells default to 0
- ⚠️ Don't refresh the browser page or you'll lose unsaved changes

---

## Troubleshooting for Non-Technical Users

### Problem: "Command not found" or "is not recognized"

**Cause**: Software not installed correctly or not added to PATH

**Solution**:
1. Reinstall Python or Node.js
2. During installation, make sure to check **"Add to PATH"**
3. Restart your computer after installation
4. Try the commands again

### Problem: Backend won't start - "Port 8000 is already in use"

**Cause**: Backend is already running from a previous session

**Solution**:
1. Close all Command Prompt/Terminal windows
2. Wait 10 seconds
3. Restart the backend following Step 6

### Problem: Frontend won't start - "EADDRINUSE: address already in use"

**Cause**: Frontend is already running

**Solution**:
1. Close all browser tabs showing the app
2. Close the Terminal/Command Prompt running the frontend
3. Wait 10 seconds
4. Restart the frontend following Step 6

### Problem: Browser shows "Failed to run optimization"

**Cause**: Backend server is not running

**Solution**:
1. Check if the backend window/terminal is still open
2. Look for "Running on http://127.0.0.1:8000" message
3. If not visible, restart the backend (Step 6)

### Problem: Tables are empty or not loading

**Cause**: Base.xlsx file is missing or in wrong location

**Solution**:
1. Check that `Base.xlsx` exists in: `Documents/Machine Resale rate Caluclations/frontend/public/sample_data/`
2. Make sure the file is not open in Excel
3. Refresh the browser page (F5)

### Problem: Application is very slow

**Cause**: Computer resources

**Solution**:
1. Close other applications to free up memory
2. Close unnecessary browser tabs
3. Restart your computer
4. Start the application again

### Problem: "npm install" fails

**Cause**: Network issues or Node.js not installed properly

**Solution**:
1. Check your internet connection
2. Verify Node.js is installed: `node --version`
3. Try again: `npm install --force`
4. If still failing, reinstall Node.js

### Problem: Python packages won't install

**Cause**: Virtual environment not activated or no internet

**Solution**:
1. Make sure you see `(.venv)` at the start of your command line
2. If not, activate it again (Step 5)
3. Check internet connection
4. Try installing one package at a time:
   ```
   pip install flask
   pip install flask-cors
   pip install pandas
   pip install openpyxl
   pip install numpy
   ```

---

## Quick Reference Card - Daily Use

**💡 Save this for quick access when using the app:**

### Every Time You Use the Application:

1. **Start Backend**:
   - Open Command Prompt/Terminal
   - `cd Documents/Machine Resale rate Caluclations/frontend/backend`
   - `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (Mac)
   - `python optimize_excel.py`
   - Keep window open

2. **Start Frontend**:
   - Open NEW Command Prompt/Terminal
   - `cd Documents/Machine Resale rate Caluclations/frontend`
   - `npm start`
   - Browser opens automatically

3. **Use the Application**:
   - Edit green cells
   - Click "Optimise Bundle"
   - View results in yellow cells

4. **Stop the Application**:
   - Press `Ctrl + C` in both windows
   - Close browser tab

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the Error Message**: Copy the exact error text
2. **Check Both Windows**: Look for errors in both backend and frontend windows
3. **Try Restarting**: Close everything and start fresh
4. **Contact Support**: Provide:
   - What you were trying to do
   - The exact error message
   - Which step you're on
   - Screenshots if possible

---

## Summary Checklist - Is Everything Working?

Use this checklist to verify your setup:

- [ ] Python 3.13 installed and verified
- [ ] Node.js 20+ installed and verified
- [ ] Project files in Documents folder
- [ ] npm install completed successfully
- [ ] Python packages installed successfully
- [ ] Backend starts without errors
- [ ] Frontend starts and opens in browser
- [ ] Application loads and shows tables
- [ ] Can edit green cells
- [ ] "Optimise Bundle" button works
- [ ] Results appear in yellow cells

**If all checked ✅, you're ready to use the application!**

---

**Document Version**: 1.0  
**Last Updated**: November 18, 2025  
**For**: Non-Technical Users  
**Setup Time**: 20-30 minutes (first time only)

- **Operating System**: macOS 10.15+, Windows 10+, or Linux (Ubuntu 20.04+)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk Space**: 2 GB free space
- **Processor**: Dual-core processor or better

## Prerequisites - Required Software Installation

Before you begin, you need to install the following software on Jose's laptop. Follow the links and version requirements below:

### 1. Python 3.13 or Higher (Required)

**Minimum Version**: Python 3.13.0  
**Recommended Version**: Python 3.13.0 or latest stable

**Download Links**:
- **Windows**: https://www.python.org/downloads/windows/
  - Download: "Python 3.13.0 - Windows installer (64-bit)"
  - During installation, CHECK ✓ "Add Python to PATH"
- **macOS**: https://www.python.org/downloads/macos/
  - Download: "Python 3.13.0 - macOS 64-bit universal2 installer"
  - Or install via Homebrew: `brew install python@3.13`
- **Linux**: https://www.python.org/downloads/source/
  - Or via package manager: `sudo apt-get install python3.13` (Ubuntu/Debian)

**Verify Installation**:
```bash
python3 --version
# Should show: Python 3.13.0 or higher
```

### 2. Node.js v18.0 or Higher (Required)

**Minimum Version**: Node.js 18.0.0  
**Recommended Version**: Node.js 20.10.0 LTS (Long Term Support)

**Download Links**:
- **Windows**: https://nodejs.org/en/download/
  - Download: "20.10.0 LTS - Windows Installer (.msi) - 64-bit"
- **macOS**: https://nodejs.org/en/download/
  - Download: "20.10.0 LTS - macOS Installer (.pkg) - 64-bit"
  - Or install via Homebrew: `brew install node`
- **Linux**: https://nodejs.org/en/download/package-manager/
  - Or via package manager: `sudo apt-get install nodejs npm` (Ubuntu/Debian)

**Verify Installation**:
```bash
node --version
# Should show: v18.0.0 or higher

npm --version
# Should show: 9.0.0 or higher
```

### 3. Git (Optional but Recommended)

**Version**: Any recent version (2.30+)

**Download Links**:
- **Windows**: https://git-scm.com/download/win
- **macOS**: Included with Xcode Command Line Tools or `brew install git`
- **Linux**: `sudo apt-get install git`

**Verify Installation**:
```bash
git --version
# Should show: git version 2.30.0 or higher
```

### 4. Code Editor (Optional but Recommended)

**Visual Studio Code** (Recommended)
- **Download**: https://code.visualstudio.com/download
- **Version**: Latest stable version
- **All Platforms**: Windows, macOS, Linux installers available

**Alternative Editors**: PyCharm, Sublime Text, or any text editor

## Installation Steps

### Step 1: Clone/Copy the Project

Copy the entire project folder to your machine:
```bash
cd ~/Documents
# Your project folder should be: "Machine Resale rate Caluclations/frontend"
```

### Step 2: Navigate to the Frontend Directory

```bash
cd "Machine Resale rate Caluclations/frontend"
```

### Step 3: Install Frontend Dependencies

Install Node.js dependencies for the React frontend:
```bash
npm install
```

### Step 4: Set Up Python Virtual Environment

Create and activate a Python virtual environment:

**On macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**On Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

### Step 5: Install Python Dependencies

Install required Python packages:
```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

If `requirements.txt` doesn't exist or is incomplete, install manually:
```bash
pip install flask flask-cors pandas openpyxl numpy
```

### Step 6: Verify Excel Files

Ensure the sample data file exists:
```bash
ls -la public/sample_data/Base.xlsx
```

The `Base.xlsx` file should be present in `public/sample_data/` directory.

## Running the Application

You need to run **two servers** - the frontend (React) and the backend (Python/Flask).

### Terminal 1: Start the Backend Server

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate the virtual environment (if not already activated):
```bash
source ../.venv/bin/activate  # macOS/Linux
# or
..\.venv\Scripts\activate  # Windows
```

3. Start the Flask backend server:
```bash
./start.sh  # macOS/Linux
# or
python optimize_excel.py  # Windows
```

The backend server will start on **http://127.0.0.1:8000**

You should see:
```
INFO:__main__:Starting optimizer server
 * Running on http://127.0.0.1:8000
 * Debug mode: on
```

### Terminal 2: Start the Frontend Server

1. Open a new terminal and navigate to the frontend directory:
```bash
cd "Machine Resale rate Caluclations/frontend"
```

2. Start the React development server:
```bash
npm start
```

The frontend will start on **http://localhost:5173**

Your browser should automatically open to the application.

## Usage

1. **Load Data**: The application will automatically load `Base.xlsx` from `public/sample_data/`

2. **Edit Tables**: 
   - Green columns are editable (user input)
   - Blue columns are read-only (database data)
   - Yellow columns show optimization results

3. **Optimize Bundle**: Click the "Optimise Bundle" button to run the optimization algorithm

4. **View Results**: Results will populate in:
   - System Recommendation table
   - Max Buy Back Bundle Valuation table
   - Expected Profit on Bundle table

## Troubleshooting

### Backend Server Won't Start

**Issue**: `ModuleNotFoundError` for Python packages
```bash
# Solution: Ensure virtual environment is activated and reinstall
source .venv/bin/activate
pip install -r backend/requirements.txt
```

**Issue**: Port 8000 already in use
```bash
# Solution: Kill the process using port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
# Then restart the backend server
```

### Frontend Server Won't Start

**Issue**: `node_modules` not found
```bash
# Solution: Reinstall npm packages
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Port 5173 already in use
```bash
# Solution: The app will automatically try the next available port
# Or kill the process:
lsof -ti:5173 | xargs kill -9  # macOS/Linux
```

### Optimization Fails

**Issue**: "Failed to run optimization"
- Ensure the backend server is running on port 8000
- Check the backend terminal for error messages
- Verify `Base.xlsx` exists in `public/sample_data/`

**Issue**: "Module not found" errors in optimizer
- Check that all sheets exist in `Base.xlsx`: Systems, Modules, Parts, QTC, QTC Modules, QTC Parts, Conversion matrix, CoreQInventory
- Verify module/part names match between sheets

## Project Structure

```
frontend/
├── backend/
│   ├── main_optimizer.py      # Main optimization script
│   ├── optimize_excel.py      # Flask API server
│   ├── optimizer_asml.py      # Optimization algorithms
│   ├── toolBox.py            # Utility functions
│   ├── requirements.txt       # Python dependencies
│   ├── start.sh              # Backend startup script
│   └── MasterDB.xlsx         # Working database (generated)
├── public/
│   └── sample_data/
│       └── Base.xlsx         # Source data file
├── src/
│   ├── App.tsx               # Main React component
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── schemas/              # Table schemas
│   └── utils/                # Utility functions
├── package.json              # Node.js dependencies
└── README_SETUP.md          # This file
```

## File Descriptions

### Excel Files

- **Base.xlsx**: Original source data (read-only, never modified)
- **MasterDB.xlsx**: Working database created during optimization (auto-generated)

### Key Sheets in Base.xlsx

- **Systems**: System demand and inventory data
- **Modules**: Module demand and inventory data
- **Parts**: Parts demand and inventory data
- **QTC**: Quality test center pricing data
- **QTC Modules**: Module pricing and costs
- **QTC Parts**: Parts pricing and costs
- **Conversion matrix**: Delta cost matrix for conversions
- **CoreQInventory**: Core inventory quantities
- **OutBase**: Output base calculations
- **OutProfit**: Output profit calculations

## Environment Requirements

### Software Versions Summary

| Software | Minimum Version | Recommended Version | Download Link |
|----------|----------------|-------------------|---------------|
| Python | 3.13.0 | 3.13.0 or latest | https://www.python.org/downloads/ |
| Node.js | 18.0.0 | 20.10.0 LTS | https://nodejs.org/en/download/ |
| npm | 9.0.0 | 10.0.0 | Included with Node.js |
| Git | 2.30.0 | Latest | https://git-scm.com/downloads |

### Operating System Compatibility

- ✅ **Windows**: Windows 10 (64-bit) or Windows 11
- ✅ **macOS**: macOS 10.15 (Catalina) or later (Intel & Apple Silicon)
- ✅ **Linux**: Ubuntu 20.04+, Debian 11+, or equivalent

### Hardware Requirements

- **CPU**: 2 GHz dual-core processor or better
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 2 GB free disk space
- **Display**: 1280x720 minimum resolution

## Dependencies

### Python Packages (backend/requirements.txt)

All Python packages will be installed automatically via `pip install -r backend/requirements.txt`

| Package | Version | Purpose |
|---------|---------|---------|
| flask | >=2.3.0 | Web framework for backend API |
| flask-cors | >=4.0.0 | Cross-Origin Resource Sharing support |
| pandas | >=2.0.0 | Data manipulation and Excel reading |
| openpyxl | >=3.1.0 | Excel file operations |
| numpy | >=1.24.0 | Numerical computations |

**Installation Command**:
```bash
pip install flask>=2.3.0 flask-cors>=4.0.0 pandas>=2.0.0 openpyxl>=3.1.0 numpy>=1.24.0
```

### Node.js Packages (package.json)

All Node packages will be installed automatically via `npm install`

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | Frontend UI framework |
| react-dom | ^18.2.0 | React DOM rendering |
| vite | ^5.4.21 | Build tool and dev server |
| @mui/material | ^5.14.0 | Material-UI components |
| @mui/x-data-grid | ^6.18.0 | Data grid component |
| typescript | ^5.0.0 | TypeScript language support |

**Installation Command**:
```bash
npm install
```

## Complete Installation Checklist for Jose's Laptop

Use this checklist to ensure everything is installed correctly:

- [ ] **Python 3.13+** installed and verified (`python3 --version`)
- [ ] **Node.js 18+** installed and verified (`node --version`)
- [ ] **npm 9+** installed and verified (`npm --version`)
- [ ] **Git** installed (optional but recommended)
- [ ] Project folder copied to local machine
- [ ] Virtual environment created (`.venv` folder exists)
- [ ] Python packages installed (`pip install -r backend/requirements.txt`)
- [ ] Node packages installed (`npm install` completed)
- [ ] `Base.xlsx` file exists in `public/sample_data/`
- [ ] Backend server starts successfully on port 8000
- [ ] Frontend server starts successfully on port 5173
- [ ] Application loads in browser at http://localhost:5173

## Quick Start Summary for Jose

**Total Setup Time**: Approximately 15-30 minutes

1. **Install Python 3.13** from https://www.python.org/downloads/
2. **Install Node.js 20.10 LTS** from https://nodejs.org/en/download/
3. **Copy project folder** to your Documents directory
4. **Open Terminal/Command Prompt** and navigate to project:
   ```bash
   cd "Documents/Machine Resale rate Caluclations/frontend"
   ```
5. **Run setup commands**:
   ```bash
   # Install frontend dependencies
   npm install
   
   # Create Python virtual environment
   python3 -m venv .venv
   
   # Activate virtual environment
   source .venv/bin/activate  # macOS/Linux
   # or
   .venv\Scripts\activate  # Windows
   
   # Install Python dependencies
   pip install -r backend/requirements.txt
   ```
6. **Start the application** (requires 2 terminals):
   - Terminal 1: `cd backend && ./start.sh` (or `python optimize_excel.py`)
   - Terminal 2: `npm start`
7. **Open browser** to http://localhost:5173

---

**Note**: If Jose encounters any issues during installation, refer to the Troubleshooting section below.

## Support

For issues or questions:
1. Check the terminal output for error messages
2. Verify all installation steps were completed
3. Ensure both servers are running
4. Check that Excel files are in the correct locations

## Development Team Contact

[Add your team contact information here]

---

**Last Updated**: November 18, 2025
