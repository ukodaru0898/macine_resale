#!/bin/bash

echo "========================================"
echo "Docker Health Check"
echo "========================================"
echo ""

echo "[1/6] Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    exit 1
fi
echo "✅ PASS: Docker is running"
echo ""

echo "[2/6] Checking containers..."
docker ps --filter "name=machine-resale" --format "table {{.Names}}\t{{.Status}}"
echo ""

echo "[3/6] Testing backend health endpoint..."
curl -s http://localhost:5001/health
echo ""
echo ""

echo "[4/6] Checking if Base.xlsx exists in container..."
if docker exec machine-resale-backend ls -la /app/sample_data/Base.xlsx 2>/dev/null; then
    echo "✅ PASS: Base.xlsx found"
else
    echo "⚠️  WARNING: Base.xlsx not found in container!"
    echo "Check: frontend/public/sample_data/Base.xlsx exists on host"
fi
echo ""

echo "[5/6] Checking backend logs for errors..."
echo "Recent backend logs:"
docker logs machine-resale-backend --tail=10
echo ""

echo "[6/6] Testing frontend..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
echo "Frontend HTTP Status: $HTTP_CODE"
echo ""

echo "========================================"
echo "Health Check Complete"
echo "========================================"
echo ""
echo "If all checks passed:"
echo "- Frontend: http://localhost"
echo "- Backend: http://localhost:5001/health"
echo ""
echo "If you see errors, run: docker logs machine-resale-backend"
echo ""
