#!/bin/bash

# This script sets up SSL for asmlmvp.sciata.net
# Run this script on your EC2 server

set -e

echo "=========================================="
echo "SSL Setup for asmlmvp.sciata.net"
echo "=========================================="
echo ""

# Find project directory
PROJECT_DIR=""
if [ -d "/home/ec2-user/machine-resale" ]; then
    PROJECT_DIR="/home/ec2-user/machine-resale"
elif [ -d "$HOME/machine-resale" ]; then
    PROJECT_DIR="$HOME/machine-resale"
elif [ -d "$(pwd)" ] && [ -f "$(pwd)/docker-compose.yml" ]; then
    PROJECT_DIR="$(pwd)"
else
    echo "❌ Error: Could not find project directory with docker-compose.yml"
    echo "Please cd to your project directory and run this script again"
    exit 1
fi

echo "✓ Found project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

echo ""
echo "=== Step 1: Checking if nginx config exists ==="
if [ -f "/etc/nginx/nginx.conf" ]; then
    echo "✓ Found /etc/nginx/nginx.conf - backing up"
    sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
elif [ -f "$PROJECT_DIR/nginx.conf" ]; then
    echo "✓ Found nginx.conf in project - will use this"
else
    echo "⚠ No nginx config found - will create new one"
fi

echo ""
echo "=== Step 2: Creating new nginx.conf with SSL ==="
cat > /tmp/nginx.conf <<'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name asmlmvp.sciata.net;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl;
        server_name asmlmvp.sciata.net;
        
        # SSL Certificate paths
        ssl_certificate /etc/letsencrypt/live/asmlmvp.sciata.net/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/asmlmvp.sciata.net/privkey.pem;
        
        # SSL settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        
        # Proxy frontend Docker container
        location / {
            proxy_pass http://localhost:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Proxy backend API requests
        location /api/ {
            proxy_pass http://localhost:5001/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Copy to project directory
cp /tmp/nginx.conf "$PROJECT_DIR/nginx.conf"
echo "✓ Created nginx.conf in project directory"

# If nginx is installed system-wide, update it there too
if [ -d "/etc/nginx" ]; then
    sudo cp /tmp/nginx.conf /etc/nginx/nginx.conf
    echo "✓ Updated /etc/nginx/nginx.conf"
    
    echo ""
    echo "=== Step 3: Testing nginx configuration ==="
    sudo nginx -t
    
    echo ""
    echo "=== Step 4: Reloading nginx ==="
    sudo systemctl reload nginx || sudo nginx -s reload
    echo "✓ Nginx reloaded"
fi

echo ""
echo "=== Step 5: Updating docker-compose.yml backend URL ==="
if grep -q "VITE_BACKEND_URL.*sciata.com" docker-compose.yml; then
    sed -i.bak 's|sciata.com|sciata.net|g' docker-compose.yml
    echo "✓ Updated backend URL to .net domain"
elif grep -q "VITE_BACKEND_URL.*sciata.net" docker-compose.yml; then
    echo "✓ Backend URL already set to .net domain"
else
    echo "⚠ Could not find VITE_BACKEND_URL in docker-compose.yml"
fi

echo ""
echo "=== Step 6: Stopping containers ==="
docker-compose down

echo ""
echo "=== Step 7: Rebuilding containers ==="
docker-compose build --no-cache

echo ""
echo "=== Step 8: Starting containers ==="
docker-compose up -d

echo ""
echo "=== Step 9: Waiting for containers to start ==="
sleep 15

echo ""
echo "=== Step 10: Checking container status ==="
docker-compose ps

echo ""
echo "=== Step 11: Checking container logs ==="
echo ""
echo "Frontend logs:"
docker-compose logs --tail=20 frontend
echo ""
echo "Backend logs:"
docker-compose logs --tail=20 backend

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "1. Visit: https://asmlmvp.sciata.net/"
echo "2. You should see a secure padlock with no warnings"
echo "3. Test the login functionality"
echo ""
echo "🔍 If there are any issues, check logs with:"
echo "  docker-compose logs -f frontend"
echo "  docker-compose logs -f backend"
if [ -f "/var/log/nginx/error.log" ]; then
    echo "  sudo tail -f /var/log/nginx/error.log"
fi
echo ""
