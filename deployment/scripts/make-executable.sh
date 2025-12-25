#!/bin/bash
# Script to make all deployment scripts executable
# Run this once after cloning the repository

echo "Making deployment scripts executable..."

chmod +x deployment/scripts/setup-vps.sh
chmod +x deployment/scripts/deploy.sh
chmod +x deployment/scripts/backup.sh

echo "✓ All scripts are now executable"
echo ""
echo "You can now run:"
echo "  - sudo bash deployment/scripts/setup-vps.sh"
echo "  - bash deployment/scripts/deploy.sh"
echo "  - bash deployment/scripts/backup.sh"
