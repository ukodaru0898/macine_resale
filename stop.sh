#!/bin/bash

echo "========================================"
echo "Stopping Machine Resale Rate Calculator"
echo "========================================"
echo ""

docker-compose down

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to stop application"
    echo ""
    exit 1
fi

echo ""
echo "Application stopped successfully!"
echo ""
echo "To start again, run: ./start.sh"
echo ""
