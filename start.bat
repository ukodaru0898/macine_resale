@echo off
echo ========================================
echo Machine Resale Rate Calculator
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo Docker is running...
echo.

REM Check if containers are already running
docker-compose ps | findstr "Up" >nul 2>&1
if not errorlevel 1 (
    echo Application is already running!
    echo Access it at: http://localhost
    echo.
    echo To stop, run: stop.bat
    echo.
    pause
    exit /b 0
)

echo Starting application...
echo This may take a few minutes on first run...
echo.

docker-compose up -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start application
    echo Check the logs with: docker-compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Application is now running!
echo ========================================
echo.
echo Access the application at:
echo   http://localhost
echo.
echo To stop the application, run: stop.bat
echo To view logs, run: logs.bat
echo.
pause
