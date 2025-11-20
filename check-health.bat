@echo off
echo ========================================
echo Docker Health Check
echo ========================================
echo.

echo [1/6] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    pause
    exit /b 1
)
echo PASS: Docker is running
echo.

echo [2/6] Checking containers...
docker ps --filter "name=machine-resale" --format "table {{.Names}}\t{{.Status}}"
echo.

echo [3/6] Testing backend health endpoint...
curl -s http://localhost:5001/health
echo.
echo.

echo [4/6] Checking if Base.xlsx exists in container...
docker exec machine-resale-backend ls -la /app/sample_data/Base.xlsx 2>nul
if errorlevel 1 (
    echo WARNING: Base.xlsx not found in container!
    echo Check: frontend/public/sample_data/Base.xlsx exists on host
) else (
    echo PASS: Base.xlsx found
)
echo.

echo [5/6] Checking backend logs for errors...
echo Recent backend logs:
docker logs machine-resale-backend --tail=10
echo.

echo [6/6] Testing frontend...
curl -s -o nul -w "Frontend HTTP Status: %%{http_code}\n" http://localhost
echo.

echo ========================================
echo Health Check Complete
echo ========================================
echo.
echo If all checks passed:
echo - Frontend: http://localhost
echo - Backend: http://localhost:5001/health
echo.
echo If you see errors, run: docker logs machine-resale-backend
echo.
pause
