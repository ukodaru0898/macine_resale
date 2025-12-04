#!/bin/bash
# AWS EC2 Setup Commands for Machine Resale Calculator

echo "=== AWS EC2 Deployment Setup ==="
echo ""
echo "Your EC2 Details:"
echo "Public DNS: ec2-3-17-25-31.us-east-2.compute.amazonaws.com"
echo "Username: Administrator"
echo "IP Address: 3.17.25.31"
echo ""

# Step 1: Connect to EC2
echo "Step 1: Connect to your EC2 instance"
echo "Run this command (you'll be prompted for the password):"
echo ""
echo "ssh Administrator@ec2-3-17-25-31.us-east-2.compute.amazonaws.com"
echo ""
echo "Password: iDPBPdy%Ln%D;5Qv%fXbdwWGk=V$A8hS"
echo ""
echo "Or using IP:"
echo "ssh Administrator@3.17.25.31"
echo ""

# Once connected, run these commands on the EC2 instance:
echo "============================================"
echo "After connecting, run these commands on EC2:"
echo "============================================"
echo ""

cat << 'REMOTE_COMMANDS'
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt-get install git -y

# Logout and login again for Docker group to take effect
echo "Please logout and login again: exit"
echo "Then reconnect with: ssh Administrator@3.17.25.31"

# After reconnecting, verify Docker
docker --version
docker-compose --version

# Clone your repository
git clone https://github.com/ukodaru0898/macine_resale.git
cd macine_resale

# Create .env file
cat > .env << 'ENVFILE'
# Database Configuration
DATABASE_URL=postgresql://postgres:machineresale2024@db:5432/machineresaledb

# Backend Configuration
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this-in-production

# Frontend Configuration (using EC2 public IP)
VITE_BACKEND_URL=http://3.17.25.31:8000

# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=machineresale2024
POSTGRES_DB=machineresaledb
ENVFILE

# Build and start Docker containers
docker-compose build
docker-compose up -d

# Check if containers are running
docker-compose ps

# Initialize database tables
docker-compose exec backend python3 -c "
from auth_models import Base, engine
Base.metadata.create_all(engine)
print('Database tables created successfully!')
"

# Check logs
docker-compose logs --tail=50

echo ""
echo "=== Deployment Complete! ==="
echo "Access your application at:"
echo "http://3.17.25.31:80"
echo "Backend API: http://3.17.25.31:8000"
echo ""
echo "To check logs: docker-compose logs -f"
echo "To restart: docker-compose restart"
echo "To stop: docker-compose down"

REMOTE_COMMANDS

