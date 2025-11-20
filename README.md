# ASML Buy Back Optimizer

This application provides an interactive UI for optimizing machine buy-back decisions using Excel-based data flow.

## 🚀 Quick Deploy Options

### **Recommended: Render.com** (Easiest - No Installation Needed!)
- ✅ **100% Free** for basic usage
- ✅ Client just opens a URL in browser
- ✅ No Docker, no Python, no Node.js needed
- ✅ **See: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)**

### **Docker Deployment** (One-Click Local)
- ✅ Works on Windows/Mac/Linux
- ✅ One command to start: `./start.sh` or `start.bat`
- ✅ **See: [README_DOCKER.md](README_DOCKER.md)**

### **Manual Development Setup**
- ⚠️ Requires Node.js + Python installation
- ⚠️ More complex for non-technical users
- ✅ **See: [README_SETUP.md](README_SETUP.md)**

---

## Features
- Uses MUI DataGrid to render editable grids
- Load `Base.xlsx` - each sheet maps to a table
- **Blue columns**: read-only (loaded from Excel)
- **Green columns**: user editable inputs
- **Yellow columns**: computed/optimized values
- Excel-based workflow: Python backend reads and writes to Base.xlsx

## Architecture

The application follows this workflow:
1. UI loads data from Base.xlsx sheets (CoreQInventory, OutBase, OutProfit, Systems, Modules, Parts)
2. User inputs data in green columns
3. Yellow columns auto-compute based on user inputs
4. User clicks "Optimize Bundle"
5. Data saved to CSV for debugging
6. Python backend called at http://127.0.0.1:8000/api/optimize
7. Python reads Base.xlsx, runs optimization logic
8. Python writes results to Out_BB and Out_TOT sheets in Base.xlsx
9. Frontend reads Out_BB and Out_TOT sheets
10. Frontend updates yellow columns with optimization results

## Running the Application

### 1. Start the Frontend (Dev)

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5174 (or 5173 if available)

### 2. Start the Python Backend

Option A - Using the startup script:
```bash
./scripts/start_backend.sh
```

Option B - Manual startup:
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 optimize_excel.py
```

The backend runs on http://127.0.0.1:8000

### 3. Using the Application

1. Open http://localhost:5174 in your browser
2. The app will automatically load Base.xlsx from `/public/sample_data/`
3. Edit green columns as needed (machine types, probabilities, margins, etc.)
4. Yellow columns will compute automatically
5. Click "Optimize Bundle" to run the Python optimization
6. Wait for optimization to complete (loading indicator will show)
7. Results will update in the yellow columns

## Backend Implementation Notes

The Python backend (`backend/optimize_excel.py`) currently contains a stub implementation that:
- Reads Base.xlsx from `frontend/public/sample_data/Base.xlsx`
- Creates placeholder Out_BB and Out_TOT sheets
- Writes example optimization results

**TODO**: Replace the optimization logic placeholder with actual buy-back optimization algorithm based on:
- System recommendations
- Inventory levels
- Demand forecasts (12M/24M)
- Margins and pricing
- Bundle valuations

## Base.xlsx Structure

Required sheets:
- **CoreQInventory**: System, CoreInventory
- **OutBase**: System, QTC average BB price, Recommended Buy for 12M, Core Inventory, Recommended BB Price on Bundle
- **OutProfit**: type, Metric, Margin, Valuation (filtered by type: "Buy Back" and "Profit")
- **Systems**: System, Demand_12M, Demand_24M, Qinventory_12M, Qinventory_24M
- **Modules**: Module, System, Demand_12M, Demand_24M, Qinventory_12M, Qinventory_24M
- **Parts**: Module, System, Module_1, Demand_12M, Demand_24M, Qinventory_12M, Qinventory_24M

Output sheets (created by Python backend):
- **Out_BB**: System, Recommended_From_Other_Inventory, Recommended_Buy_12M
- **Out_TOT**: Metric, Value (totals and summaries)

## Color Scheme (ASML Branding)

- **Blue**: rgb(134, 206, 244) - Light blue #86CEF4
- **Green**: rgb(52, 178, 51) - Green #34B233  
- **Yellow**: rgb(254, 209, 0) - Yellow #FED100

## Dependencies

Frontend:
- React 18 + TypeScript
- Material-UI v5
- MUI X DataGrid v6
- xlsx library
- Vite dev server

Backend:
- Flask 2.3.2
- Flask-CORS 4.0.0
- pandas 2.0.3
- openpyxl 3.1.2
