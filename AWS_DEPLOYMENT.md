# AWS EC2 Deployment Guide

This guide will help you deploy your Machine Resale Rate Calculator application on AWS EC2 using Docker.

## Prerequisites

- AWS Account with access credentials
- The URL/credentials your team provided
- SSH client (Terminal on Mac)

## Step 1: Create an EC2 Instance (VM)

### 1.1 Log into AWS Console
1. Go to https://aws.amazon.com/console/
2. Sign in with the credentials your team provided
3. Select the region closest to your users (e.g., US East, EU West)

### 1.2 Launch EC2 Instance
1. Navigate to **EC2** service (search for "EC2" in the top search bar)
2. Click **"Launch Instance"**
3. Configure the instance:

   **Name**: `machine-resale-calculator`
   
   **Application and OS Images (AMI)**: 
   - Select **Ubuntu Server 22.04 LTS** (Free tier eligible)
   
   **Instance Type**: 
   - Select **t2.medium** or **t3.medium** (recommended for Docker)
   - For production: **t3.large** or higher
   
   **Key Pair**:
   - Click "Create new key pair"
   - Name: `machine-resale-key`
   - Key pair type: RSA
   - Private key format: `.pem`
   - Click "Create key pair" (it will download the .pem file)
   - **SAVE THIS FILE SECURELY** - you need it to connect to the server
   
   **Network Settings**:
   - Click "Edit"
   - Enable "Auto-assign public IP"
   - Create security group or select existing:
     - Security group name: `machine-resale-sg`
     - Add these rules:
       - **SSH** (Port 22) - Source: My IP (for security)
       - **HTTP** (Port 80) - Source: Anywhere (0.0.0.0/0)
       - **HTTPS** (Port 443) - Source: Anywhere (0.0.0.0/0)
       - **Custom TCP** (Port 8000) - Source: Anywhere (for backend API)
       - **Custom TCP** (Port 5173) - Source: Anywhere (for frontend dev - optional)
   
   **Configure Storage**:
   - Set to **30 GB** gp3 (SSD)
   
4. Click **"Launch Instance"**
5. Wait for the instance to be in "Running" state

### 1.3 Note Your Instance Details
Once running, note these details:
- **Public IPv4 address**: (e.g., 54.123.45.67)
- **Public IPv4 DNS**: (e.g., ec2-54-123-45-67.compute-1.amazonaws.com)

## Step 2: Connect to Your EC2 Instance

### 2.1 Set Permissions on Your Key File
Open Terminal and run:
```bash
chmod 400 ~/Downloads/machine-resale-key.pem
```

### 2.2 Connect via SSH
```bash
ssh -i ~/Downloads/machine-resale-key.pem ubuntu@YOUR_PUBLIC_IP
```
Replace `YOUR_PUBLIC_IP` with your instance's public IP address.

Type "yes" when prompted about authenticity.

## Step 3: Install Docker on EC2

Once connected to your EC2 instance, run these commands:

### 3.1 Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 3.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker ubuntu

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Exit and reconnect for group changes to take effect
exit
```

### 3.3 Reconnect and Verify Docker
```bash
ssh -i ~/Downloads/machine-resale-key.pem ubuntu@YOUR_PUBLIC_IP
docker --version
docker ps
```

### 3.4 Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

## Step 4: Set Up PostgreSQL Database

### Option A: Use AWS RDS (Recommended for Production)

1. **Create RDS PostgreSQL Instance**:
   - Go to AWS Console → RDS → Create database
   - Choose PostgreSQL
   - Template: Free tier (for testing) or Production
   - DB instance identifier: `machine-resale-db`
   - Master username: `postgres`
   - Master password: (create a strong password)
   - Instance type: db.t3.micro (free tier) or db.t3.small
   - Storage: 20 GB
   - VPC: Same as your EC2 instance
   - Public access: Yes (for now)
   - Security group: Create new, allow PostgreSQL (5432) from your EC2 security group
   - Create database

2. **Note your RDS endpoint**: 
   - Example: `machine-resale-db.xxxxx.us-east-1.rds.amazonaws.com`

3. **Your DATABASE_URL will be**:
   ```
   postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/machineresaledb
   ```

### Option B: Use Docker PostgreSQL (Simpler, but less scalable)

Already included in your docker-compose.yml

## Step 5: Deploy Your Application

### 5.1 Clone Your Repository
```bash
# Install Git if needed
sudo apt-get install git -y

# Clone your repository
git clone https://github.com/ukodaru0898/macine_resale.git
cd macine_resale
```

### 5.2 Create Environment File
```bash
nano .env
```

Add these variables (adjust as needed):
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@db:5432/machineresaledb

# For RDS (if using Option A above):
# DATABASE_URL=postgresql://postgres:your_password@your-rds-endpoint:5432/machineresaledb

# Backend Configuration
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this

# Frontend Configuration (your EC2 public IP or domain)
VITE_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP:8000
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 5.3 Build and Start Docker Containers
```bash
# Build the containers
docker-compose build

# Start the services
docker-compose up -d

# Check if containers are running
docker-compose ps
```

### 5.4 Initialize Database
```bash
# Create the users table
docker-compose exec backend python3 -c "
from auth_models import Base, engine
Base.metadata.create_all(engine)
print('Database tables created successfully!')
"
```

### 5.5 Check Logs
```bash
# View all logs
docker-compose logs

# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## Step 6: Access Your Application

### 6.1 Test Backend API
```bash
curl http://YOUR_EC2_PUBLIC_IP:8000/health
```

### 6.2 Access Frontend
Open your browser and go to:
```
http://YOUR_EC2_PUBLIC_IP:80
```

Or for development:
```
http://YOUR_EC2_PUBLIC_IP:5173
```

## Step 7: Set Up Domain Name (Optional but Recommended)

### 7.1 Point Domain to EC2
1. If you have a domain (e.g., machineresale.com), go to your domain registrar
2. Add an A record pointing to your EC2 public IP:
   - Type: A
   - Name: @ (or subdomain like "app")
   - Value: YOUR_EC2_PUBLIC_IP
   - TTL: 300

### 7.2 Update Environment Variables
```bash
nano .env
```

Change:
```env
VITE_BACKEND_URL=http://your-domain.com:8000
```

Rebuild and restart:
```bash
docker-compose down
docker-compose build frontend
docker-compose up -d
```

## Step 8: Enable HTTPS with SSL (Recommended for Production)

### 8.1 Install Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx -y
```

### 8.2 Install Nginx
```bash
sudo apt-get install nginx -y
```

### 8.3 Configure Nginx as Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/machine-resale
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/machine-resale /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8.4 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

Follow the prompts. Certbot will automatically update your Nginx configuration.

## Step 9: Useful Commands

### Start/Stop Application
```bash
# Stop all containers
docker-compose down

# Start all containers
docker-compose up -d

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend

# Rebuild after code changes
docker-compose down
docker-compose build
docker-compose up -d
```

### View Logs
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Management
```bash
# Access PostgreSQL
docker-compose exec db psql -U postgres -d machineresaledb

# Backup database
docker-compose exec db pg_dump -U postgres machineresaledb > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres machineresaledb < backup.sql
```

### Check System Resources
```bash
# CPU and Memory usage
docker stats

# Disk usage
df -h
docker system df
```

## Step 10: Monitoring and Maintenance

### 10.1 Set Up Automatic Updates (Optional)
```bash
sudo apt-get install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 10.2 Set Up Log Rotation
Docker handles this automatically, but you can configure:
```bash
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### 10.3 Monitor Application Health
Create a health check script:
```bash
nano ~/health-check.sh
```

Add:
```bash
#!/bin/bash
curl -f http://localhost:8000/health || docker-compose restart backend
```

Make it executable and add to cron:
```bash
chmod +x ~/health-check.sh
crontab -e
```

Add this line (check every 5 minutes):
```
*/5 * * * * /home/ubuntu/health-check.sh
```

## Troubleshooting

### Containers Won't Start
```bash
# Check logs
docker-compose logs

# Check if ports are in use
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :5173

# Remove and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Access database directly
docker-compose exec db psql -U postgres -d machineresaledb
```

### Cannot Access Application
1. Check EC2 security group rules (ports 80, 443, 8000, 5173)
2. Check if containers are running: `docker-compose ps`
3. Check logs: `docker-compose logs`
4. Verify firewall: `sudo ufw status`

### Out of Disk Space
```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Check disk usage
df -h
```

## Security Best Practices

1. **Change Default Passwords**: Update all default passwords in `.env`
2. **Restrict SSH Access**: Limit SSH (port 22) to your IP only in security group
3. **Use RDS for Production**: Don't expose PostgreSQL port publicly
4. **Enable HTTPS**: Always use SSL in production
5. **Keep System Updated**: Run `sudo apt-get update && sudo apt-get upgrade` regularly
6. **Use Environment Variables**: Never hardcode secrets in code
7. **Set Up Backups**: Schedule regular database backups
8. **Monitor Logs**: Check logs regularly for errors or suspicious activity

## Cost Optimization

- **Use Reserved Instances**: Save up to 72% for long-term use
- **Auto-scaling**: Set up auto-scaling groups for traffic spikes
- **CloudWatch**: Monitor and set up alerts for cost thresholds
- **Stop Dev Instances**: Stop EC2 when not in use (save 50%+)

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Check AWS security group settings
4. Ensure all ports are accessible

---

**Quick Start Summary:**
1. Create EC2 instance (t2.medium, Ubuntu 22.04)
2. SSH into instance
3. Install Docker and Docker Compose
4. Clone repository
5. Create `.env` file
6. Run `docker-compose up -d`
7. Access at `http://YOUR_EC2_IP:80`

**Need help?** Contact your team or check the troubleshooting section above.
