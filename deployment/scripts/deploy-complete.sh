#!/bin/bash
# ONE-COMMAND DEPLOYMENT for Fleetguard on VPS 72.61.238.154
# Just run this script - everything is automated!

set -e

echo "================================================"
echo "🚀 Fleetguard Complete Deployment"
echo "VPS: 72.61.238.154"
echo "Ports: 8888 (HTTP), 8443 (HTTPS)"
echo "================================================"
echo ""

# Step 1: Run VPS setup (if not already done)
if ! command -v docker &> /dev/null; then
    echo "[1/3] Running VPS setup (first time only)..."
    sudo bash deployment/scripts/setup-vps.sh
else
    echo "[1/3] Docker already installed, skipping VPS setup..."
fi

# Step 2: Auto-configure environment
echo "[2/3] Auto-configuring application..."
bash deployment/scripts/auto-configure.sh

# Step 3: Deploy application
echo "[3/3] Deploying application..."
bash deployment/scripts/deploy.sh

echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "🌐 Access your application:"
echo "   http://72.61.238.154:8888"
echo ""
echo "📊 Admin Panel:"
echo "   http://72.61.238.154:8888/admin/"
echo ""
echo "📝 Next step: Create admin user"
echo "   docker-compose exec backend python manage.py createsuperuser"
echo ""
