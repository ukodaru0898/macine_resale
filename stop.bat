@echo off
echo ========================================
echo Stopping Machine Resale Rate Calculator
echo ========================================
echo.

docker-compose down

if errorlevel 1 (
    echo.
    echo ERROR: Failed to stop application
    echo.
    pause
    exit /b 1
)

echo.
echo Application stopped successfully!
echo.
echo To start again, run: start.bat
echo.
pause
