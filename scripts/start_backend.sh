#!/bin/bash
# Start the Python optimization backend

echo "Starting ASML Buy Back Optimizer Backend..."
cd "$(dirname "$0")/.."

# Check if virtual environment exists, create if not
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install/update requirements
echo "Installing dependencies..."
pip install -q flask flask-cors pandas openpyxl

# Start the Flask server
cd backend
echo "Backend running on http://127.0.0.1:8000"
python optimize_excel.py
