#!/bin/bash
# Deployment Script for Fleetguard Application
# Run this script to deploy or update the application
# Usage: bash deploy.sh

set -e  # Exit on any error

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "================================================"
echo "Fleetguard Deployment Script"
echo "VPS: 72.61.238.154 | Ports: 8888, 8443"
echo "================================================"

# Auto-configure if .env doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${GREEN}[AUTO-CONFIG] Generating configuration automatically...${NC}"
    bash deployment/scripts/auto-configure.sh
fi

# Verify .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: Configuration failed!${NC}"
    echo "Please run: bash deployment/scripts/auto-configure.sh"
    exit 1
fi

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo -e "${GREEN}[1/8] Pulling latest code...${NC}"
    git pull origin main || git pull origin master || echo "No git updates"
else
    echo -e "${YELLOW}[1/8] Skipping git pull (not a git repository)${NC}"
fi

# Stop existing containers
echo -e "${GREEN}[2/8] Stopping existing containers...${NC}"
docker-compose down || true

# Build images
echo -e "${GREEN}[3/8] Building Docker images...${NC}"
docker-compose build --no-cache

# Start database and redis first
echo -e "${GREEN}[4/8] Starting database and cache services...${NC}"
docker-compose up -d db redis

# Wait for database to be ready
echo -e "${GREEN}[5/8] Waiting for database to be ready...${NC}"
sleep 15

# Run migrations
echo -e "${GREEN}[6/8] Running database migrations...${NC}"
docker-compose run --rm backend python manage.py migrate

# Collect static files
echo -e "${GREEN}[7/8] Collecting static files...${NC}"
docker-compose run --rm backend python manage.py collectstatic --noinput

# Start all services
echo -e "${GREEN}[8/8] Starting all services...${NC}"
docker-compose up -d

# Wait for services to start
sleep 10

# Check service status
echo ""
echo "================================================"
echo "Service Status:"
echo "================================================"
docker-compose ps

# Health checks
echo ""
echo "================================================"
echo "Running Health Checks:"
echo "================================================"

# Check backend
if curl -f http://localhost:8081/admin/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend check failed${NC}"
fi

# Check frontend
if curl -f http://localhost:8082/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend check failed${NC}"
fi

# Check nginx
if curl -f http://localhost:8888/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx check failed${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "Application URLs:"
echo "  - Frontend: http://72.61.238.154:8888 or http://localhost:8888"
echo "  - Backend API: http://72.61.238.154:8081/api/"
echo "  - Admin Panel: http://72.61.238.154:8888/admin/"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f [service-name]"
echo "  - Restart service: docker-compose restart [service-name]"
echo "  - Stop all: docker-compose down"
echo ""
