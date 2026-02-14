#!/bin/bash

# Quick Setup Script for EC2 Instance
# Run this script after connecting to your EC2 instance for the first time

set -e

echo "================================================"
echo "EC2 Instance Setup for Lilo & Stitch App"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Update system
echo -e "${GREEN}[1/6] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install essential tools
echo -e "${GREEN}[2/6] Installing essential tools...${NC}"
sudo apt install -y curl wget git vim htop ufw

# Install Docker
echo -e "${GREEN}[3/6] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${YELLOW}Docker installed. You may need to logout and login again.${NC}"
else
    echo -e "${YELLOW}Docker already installed.${NC}"
fi

# Install Docker Compose
echo -e "${GREEN}[4/6] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo -e "${YELLOW}Docker Compose already installed.${NC}"
fi

# Install Nginx
echo -e "${GREEN}[5/6] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
else
    echo -e "${YELLOW}Nginx already installed.${NC}"
fi

# Configure firewall
echo -e "${GREEN}[6/6] Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable || true

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Logout and login again to apply Docker group changes"
echo "2. Clone your repository: git clone <your-repo-url>"
echo "3. Configure .env.production file"
echo "4. Run deployment script: ./deploy.sh"
echo "5. Configure Nginx with the provided nginx.conf"
echo "6. Setup SSL with: sudo certbot --nginx -d yourdomain.com"
echo ""
