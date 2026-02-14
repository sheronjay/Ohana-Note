#!/bin/bash

# Deployment Script for Lilo & Stitch Message App
# This script automates the deployment process on EC2

set -e  # Exit on error

echo "================================================"
echo "Lilo & Stitch Message App - Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Error: Please do not run this script as root${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Warning: .env.production not found${NC}"
    echo "Creating from .env.production.example..."
    cp .env.production.example .env.production
    echo -e "${YELLOW}Please edit .env.production with your actual values before continuing${NC}"
    echo "Press Enter to continue after editing, or Ctrl+C to cancel..."
    read
fi

# Pull latest changes
echo -e "${GREEN}[1/5] Pulling latest changes from repository...${NC}"
git pull origin main || {
    echo -e "${YELLOW}Warning: Could not pull from git. Continuing with local files...${NC}"
}

# Stop existing containers
echo -e "${GREEN}[2/5] Stopping existing containers...${NC}"
docker-compose down || true

# Build new images
echo -e "${GREEN}[3/5] Building Docker images...${NC}"
docker-compose --env-file .env.production build --no-cache

# Start containers
echo -e "${GREEN}[4/5] Starting containers...${NC}"
docker-compose --env-file .env.production up -d

# Wait for services to be healthy
echo -e "${GREEN}[5/5] Waiting for services to start...${NC}"
sleep 10

# Check container status
echo ""
echo "Container Status:"
docker-compose ps

# Test services
echo ""
echo "Testing services..."

# Test backend
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is running${NC}"
else
    echo -e "${RED}✗ Backend API is not responding${NC}"
fi

# Test landing page
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Landing page is running${NC}"
else
    echo -e "${RED}✗ Landing page is not responding${NC}"
fi

# Test game
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Game is running${NC}"
else
    echo -e "${RED}✗ Game is not responding${NC}"
fi

# Clean up old images
echo ""
echo "Cleaning up old Docker images..."
docker image prune -f

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "View logs with: docker-compose logs -f"
echo "Stop services with: docker-compose down"
echo ""
