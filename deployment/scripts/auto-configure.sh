#!/bin/bash
# Auto-Configuration Script for Fleetguard VPS Deployment
# This script automatically generates the .env file with all settings
# No manual configuration needed!

set -e

echo "================================================"
echo "Fleetguard Auto-Configuration"
echo "VPS IP: 72.61.238.154"
echo "Ports: 8888 (HTTP), 8443 (HTTPS)"
echo "================================================"

# Generate strong secret key
echo "[1/2] Generating Django secret key..."
SECRET_KEY=$(openssl rand -base64 50 | tr -d '\n')

# Create .env file
echo "[2/2] Creating .env configuration file..."
cat > Fleetguard-NewAPI-2025-main/.env << EOF
# Production Environment Configuration for VPS: 72.61.238.154
# Auto-generated on $(date)
# No manual changes needed!

# Django Configuration
DJANGO_SECRET_KEY=${SECRET_KEY}
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=72.61.238.154,localhost,127.0.0.1

# Database Configuration (MySQL)
DB_ENGINE=django.db.backends.mysql
DB_NAME=fleetguard_db
DB_USER=fleetguard_user
DB_PASSWORD=FleetGuard@VPS2024!Secure#MySQL
DB_ROOT_PASSWORD=RootFleetGuard@2024!Strong#Pass
DB_HOST=db
DB_PORT=3306

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1

# Celery Configuration
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=chordzconnect@gmail.com
EMAIL_HOST_PASSWORD=fzar auze vpuk vkhn

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://72.61.238.154:8888,http://72.61.238.154,http://localhost:8888

# Gunicorn Configuration
GUNICORN_WORKERS=2
GUNICORN_THREADS=2
LOG_LEVEL=info

# Timezone
TZ=Asia/Kolkata
EOF

echo ""
echo "✓ Configuration file created successfully!"
echo ""
echo "Access URLs:"
echo "  - Main Application: http://72.61.238.154:8888"
echo "  - HTTPS: https://72.61.238.154:8443"
echo "  - Backend API: http://72.61.238.154:8081"
echo "  - Admin Panel: http://72.61.238.154:8888/admin/"
echo ""
