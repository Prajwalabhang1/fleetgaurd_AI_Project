#!/bin/bash
# VPS Initial Setup Script for Fleetguard Deployment
# Run this script once on a fresh Hostinger KVM 2 VPS
# Usage: sudo bash setup-vps.sh

set -e  # Exit on any error

echo "================================================"
echo "Fleetguard VPS Setup Script"
echo "Hostinger KVM 2 (2 vCPU, 8GB RAM, 100GB SSD)"
echo "================================================"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Update system
echo -e "${GREEN}[1/10] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install essential tools
echo -e "${GREEN}[2/10] Installing essential tools...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    certbot \
    python3-certbot-nginx

# Install Docker
echo -e "${GREEN}[3/10] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "Docker installed successfully"
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo -e "${GREEN}[4/10] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="2.24.0"
    curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully"
else
    echo "Docker Compose already installed"
fi

# Create application directory
echo -e "${GREEN}[5/10] Creating application directories...${NC}"
mkdir -p /var/www/fleetguard
mkdir -p /var/www/fleetguard/logs/backend
mkdir -p /var/www/fleetguard/logs/celery
mkdir -p /var/www/fleetguard/logs/celery-beat
mkdir -p /var/www/fleetguard/logs/nginx
mkdir -p /var/www/fleetguard/deployment/certbot/www
mkdir -p /var/www/fleetguard/deployment/certbot/conf

echo "Application directories created at /var/www/fleetguard"

# Configure firewall
echo -e "${GREEN}[6/10] Configuring firewall (UFW)...${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw status

# Optimize system for ML workloads
echo -e "${GREEN}[7/10] Optimizing system settings...${NC}"

# Increase file descriptors
cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
EOF

# Optimize sysctl for Docker and networking
cat >> /etc/sysctl.conf << EOF
# Docker and network optimization
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535
vm.swappiness = 10
vm.max_map_count = 262144
EOF

sysctl -p

# Setup swap (recommended for 8GB RAM with ML workloads)
echo -e "${GREEN}[8/10] Setting up swap space...${NC}"
if ! swapon --show | grep -q '/swapfile'; then
    # Create 4GB swap
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "4GB swap created"
else
    echo "Swap already configured"
fi

# Install monitoring tools
echo -e "${GREEN}[9/10] Installing monitoring tools...${NC}"
apt-get install -y nethogs iotop

# Create systemd service
echo -e "${GREEN}[10/10] Creating systemd service...${NC}"
cat > /etc/systemd/system/fleetguard.service << 'EOF'
[Unit]
Description=Fleetguard Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/fleetguard
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

echo ""
echo "================================================"
echo -e "${GREEN}VPS Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/fleetguard"
echo "2. Copy .env.example to .env and configure it"
echo "3. Run the deployment script: bash deployment/scripts/deploy.sh"
echo ""
echo -e "${YELLOW}Optional - Setup SSL with Let's Encrypt:${NC}"
echo "  certbot --nginx -d your-domain.com -d www.your-domain.com"
echo ""
