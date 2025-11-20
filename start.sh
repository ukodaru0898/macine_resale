#!/bin/bash

echo "========================================"
echo "Machine Resale Rate Calculator"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    echo ""
    exit 1
fi

echo "Docker is running..."
echo ""

# Check if containers are already running
if docker-compose ps | grep -q "Up"; then
    echo "Application is already running!"
    echo "Access it at: http://localhost"
    echo ""
    echo "To stop, run: ./stop.sh"
    echo ""
    exit 0
fi

echo "Starting application..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to start application"
    echo "Check the logs with: docker-compose logs"
    echo ""
    exit 1
fi

echo ""
echo "========================================"
echo "SUCCESS! Application is now running!"
echo "========================================"
echo ""
echo "Access the application at:"
echo "  http://localhost"
echo ""
echo "To stop the application, run: ./stop.sh"
echo "To view logs, run: ./logs.sh"
echo ""
