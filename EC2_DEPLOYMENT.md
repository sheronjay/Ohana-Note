# EC2 Deployment Guide - Lilo & Stitch Message App

This guide provides step-by-step instructions for deploying the Lilo & Stitch message sharing application on AWS EC2 with Nginx as a reverse proxy.

## Table of Contents
- [Prerequisites](#prerequisites)
- [EC2 Instance Setup](#ec2-instance-setup)
- [Server Configuration](#server-configuration)
- [Application Deployment](#application-deployment)
- [Nginx Configuration](#nginx-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### AWS Requirements
- AWS Account with EC2 access
- Basic understanding of AWS Console
- SSH key pair for EC2 access

### Domain Setup (Optional but Recommended)
- Domain name pointing to your EC2 instance
- DNS A records configured:
  - `yourdomain.com` → EC2 IP
  - `www.yourdomain.com` → EC2 IP
  - `api.yourdomain.com` → EC2 IP (optional)
  - `game.yourdomain.com` → EC2 IP (optional)

---

## EC2 Instance Setup

### 1. Launch EC2 Instance

**Recommended Specifications:**
- **Instance Type:** `t3.medium` or `t3.large` (minimum t3.small)
- **OS:** Ubuntu 22.04 LTS (64-bit x86)
- **Storage:** 30 GB GP3 SSD (minimum 20 GB)
- **vCPUs:** 2+ cores
- **RAM:** 4 GB+ (for Docker containers)

**Steps:**

1. **Navigate to EC2 Dashboard**
   - Go to AWS Console → EC2 → Launch Instance

2. **Configure Instance**
   ```
   Name: lilo-stitch-app
   AMI: Ubuntu Server 22.04 LTS
   Instance Type: t3.medium
   Key Pair: Create or select existing key pair
   ```

3. **Configure Security Group**
   
   Create a new security group with the following inbound rules:
   
   | Type  | Protocol | Port Range | Source    | Description          |
   |-------|----------|------------|-----------|----------------------|
   | SSH   | TCP      | 22         | Your IP   | SSH access           |
   | HTTP  | TCP      | 80         | 0.0.0.0/0 | HTTP traffic         |
   | HTTPS | TCP      | 443        | 0.0.0.0/0 | HTTPS traffic        |
   | Custom| TCP      | 3000       | 0.0.0.0/0 | Landing (dev only)   |
   | Custom| TCP      | 3002       | 0.0.0.0/0 | Backend API (dev)    |
   | Custom| TCP      | 8080       | 0.0.0.0/0 | Game (dev only)      |
   | Custom| TCP      | 3307       | 0.0.0.0/0 | MySQL (dev only)     |

   > **Security Note:** For production, remove ports 3000, 3002, 8080, and 3307 from public access. Only expose ports 80 and 443.

4. **Configure Storage**
   - Root volume: 30 GB GP3
   - Enable "Delete on Termination" if needed

5. **Launch Instance**
   - Review and launch
   - Download and save your `.pem` key file securely

### 2. Connect to EC2 Instance

```bash
# Set proper permissions for your key file
chmod 400 your-key.pem

# Connect to your instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

---

## Server Configuration

### 1. Update System Packages

```bash
# Update package list
sudo apt update

# Upgrade existing packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git vim htop
```

### 2. Install Docker

```bash
# Install Docker dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Apply group changes (or logout and login again)
newgrp docker

# Verify Docker installation
docker --version
```

### 3. Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 4. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/yourusername/lilo-stitch.git

# Navigate to project directory
cd lilo-stitch
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.production

# Edit production environment file
nano .env.production
```

**Production Environment Configuration** (`.env.production`):

```bash
# MySQL Configuration
MYSQL_ROOT_PASSWORD=YOUR_SECURE_PASSWORD_HERE
MYSQL_DATABASE=messages_db

# Backend Configuration
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DB_NAME=messages_db

# Production URLs (update with your domain)
GAME_URL=https://yourdomain.com/game
LANDING_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com/api

# Alternative: If using subdomains
# GAME_URL=https://game.yourdomain.com
# LANDING_URL=https://www.yourdomain.com
# BACKEND_URL=https://api.yourdomain.com
```

> **Important:** Replace `YOUR_SECURE_PASSWORD_HERE` with a strong password and `yourdomain.com` with your actual domain.

### 3. Build and Start Containers

```bash
# Build and start all containers
docker-compose --env-file .env.production up -d --build

# Verify all containers are running
docker-compose ps

# Check logs if needed
docker-compose logs -f
```

**Expected Output:**
```
NAME                    STATUS              PORTS
lilo-stitch-backend     Up 2 minutes        0.0.0.0:3002->3002/tcp
lilo-stitch-db          Up 2 minutes        0.0.0.0:3307->3306/tcp
lilo-stitch-game        Up 2 minutes        0.0.0.0:8080->80/tcp
lilo-stitch-landing     Up 2 minutes        0.0.0.0:3000->80/tcp
```

### 4. Verify Application

Test each service locally before configuring Nginx:

```bash
# Test backend API
curl http://localhost:3002/health

# Test landing page
curl http://localhost:3000

# Test game
curl http://localhost:8080
```

---

## Nginx Configuration

### 1. Create Nginx Configuration File

```bash
# Create configuration file
sudo nano /etc/nginx/sites-available/lilo-stitch
```

Copy the Nginx configuration from `nginx.conf` (see separate file in this repository).

### 2. Enable Site Configuration

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/lilo-stitch /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow Nginx
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

## SSL/HTTPS Setup

### Option 1: Using Let's Encrypt (Free SSL - Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Verify auto-renewal
sudo certbot renew --dry-run
```

**Certbot will automatically:**
- Obtain SSL certificates
- Modify your Nginx configuration
- Set up auto-renewal (certificates renew every 90 days)

### Option 2: Using Custom SSL Certificate

If you have your own SSL certificate:

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Upload your certificate files
# - certificate.crt
# - private.key
# - ca_bundle.crt (if applicable)

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/private.key
sudo chmod 644 /etc/nginx/ssl/certificate.crt
```

Update Nginx configuration to use your certificates (see `nginx.conf` SSL section).

### 3. Test SSL Configuration

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Test HTTPS
curl https://yourdomain.com
```

**Online SSL Test:**
- Visit: https://www.ssllabs.com/ssltest/
- Enter your domain to check SSL configuration
- Aim for A+ rating

---

## Monitoring and Maintenance

### 1. View Application Logs

```bash
# View all container logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs mysql
docker-compose logs landing
docker-compose logs game

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Restart Services

```bash
# Restart all containers
docker-compose restart

# Restart specific service
docker-compose restart backend

# Restart Nginx
sudo systemctl restart nginx
```

### 3. Update Application

```bash
# Navigate to project directory
cd ~/lilo-stitch

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose --env-file .env.production up -d --build

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Database Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Backup MySQL database
docker exec lilo-stitch-db mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} messages_db > ~/backups/messages_db_$(date +%Y%m%d_%H%M%S).sql

# Create automated backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
docker exec lilo-stitch-db mysqldump -uroot -prootpassword messages_db > $BACKUP_DIR/messages_db_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup.sh") | crontab -
```

### 5. Monitor System Resources

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check Docker container stats
docker stats

# Check system processes
htop
```

---

## Troubleshooting

### Common Issues

#### 1. Containers Not Starting

```bash
# Check container status
docker-compose ps

# View logs for errors
docker-compose logs

# Restart containers
docker-compose down
docker-compose up -d
```

#### 2. Database Connection Errors

```bash
# Check MySQL container
docker-compose logs mysql

# Verify database is healthy
docker exec lilo-stitch-db mysqladmin ping -h localhost -uroot -p

# Connect to MySQL shell
docker exec -it lilo-stitch-db mysql -uroot -p
```

#### 3. Nginx 502 Bad Gateway

```bash
# Check if backend services are running
docker-compose ps

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify upstream services
curl http://localhost:3002
curl http://localhost:3000
curl http://localhost:8080

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

#### 5. Port Already in Use

```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443

# Kill process if needed
sudo kill -9 <PID>

# Or stop conflicting service
sudo systemctl stop apache2  # if Apache is running
```

### Performance Optimization

#### 1. Enable Nginx Caching

Add to your Nginx configuration:

```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 2. Enable Gzip Compression

Already included in the provided Nginx configuration.

#### 3. Optimize Docker Images

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune
```

---

## Security Best Practices

### 1. Secure SSH Access

```bash
# Disable password authentication (use SSH keys only)
sudo nano /etc/ssh/sshd_config

# Set: PasswordAuthentication no
# Set: PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

### 2. Keep System Updated

```bash
# Create update script
cat > ~/update.sh << 'EOF'
#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
EOF

chmod +x ~/update.sh

# Run weekly
(crontab -l 2>/dev/null; echo "0 3 * * 0 ~/update.sh") | crontab -
```

### 3. Monitor Failed Login Attempts

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Regular Backups

- Database backups (automated via cron)
- Application code (Git repository)
- Environment files (secure storage)
- SSL certificates (if custom)

---

## Quick Reference Commands

```bash
# Start application
docker-compose --env-file .env.production up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# Renew SSL certificates
sudo certbot renew

# Backup database
docker exec lilo-stitch-db mysqldump -uroot -p messages_db > backup.sql

# Restore database
docker exec -i lilo-stitch-db mysql -uroot -p messages_db < backup.sql
```

---

## Support and Resources

- **Docker Documentation:** https://docs.docker.com/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/
- **AWS EC2 Documentation:** https://docs.aws.amazon.com/ec2/

---

## License

This deployment guide is part of the Lilo & Stitch Message App project.
