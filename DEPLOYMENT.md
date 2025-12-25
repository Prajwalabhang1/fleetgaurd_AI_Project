# Fleetguard VPS Deployment Guide

Complete guide for deploying the Fleetguard application (Django backend + Angular frontend) on **Hostinger KVM 2 VPS** (2 vCPU, 8GB RAM, 100GB SSD).

## Table of Contents
- [Prerequisites](#prerequisites)
- [VPS Initial Setup](#vps-initial-setup)
- [Application Deployment](#application-deployment)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Local Requirements
- Git installed
- SSH client
- Text editor

### VPS Access
- SSH credentials (IP, username, password/key)
- Root or sudo access
- Domain name (optional, can use IP initially)

---

## VPS Initial Setup

### 1. Connect to VPS

```bash
ssh root@your-vps-ip
```

### 2. Run Initial Setup Script

Upload the setup script to your VPS, then run:

```bash
# Make script executable
chmod +x deployment/scripts/setup-vps.sh

# Run setup (requires sudo/root)
sudo bash deployment/scripts/setup-vps.sh
```

This script will:
- ✅ Update system packages
- ✅ Install Docker & Docker Compose
- ✅ Configure firewall (UFW)
- ✅ Create application directories
- ✅ Setup 4GB swap space
- ✅ Optimize system for ML workloads
- ✅ Create systemd service

### 3. Clone Repository

```bash
cd /var/www/fleetguard
git clone https://github.com/your-repo/fleetguard.git .
```

Or upload via SCP/SFTP:

```bash
# From your local machine
scp -r Fleetguard-WebApplication-main root@your-vps-ip:/var/www/fleetguard/
```

---

## Application Deployment

### 1. Configure Environment Variables

```bash
cd /var/www/fleetguard
cp Fleetguard-NewAPI-2025-main/.env.example Fleetguard-NewAPI-2025-main/.env
vim Fleetguard-NewAPI-2025-main/.env
```

**Important settings to update:**

```bash
# Django Configuration
DJANGO_SECRET_KEY=your-random-secret-key-here  # Generate with: openssl rand -base64 32
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-vps-ip,your-domain.com,www.your-domain.com

# Database (use strong passwords!)
DB_NAME=fleetguard_db
DB_USER=fleetguard_user
DB_PASSWORD=your-strong-db-password
DB_ROOT_PASSWORD=your-strong-root-password

# Email (for notifications)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password

# CORS (add your domain)
CORS_ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com
```

### 2. Run Deployment Script

```bash
chmod +x deployment/scripts/deploy.sh
bash deployment/scripts/deploy.sh
```

This will:
- ✅ Build Docker images
- ✅ Start database and Redis
- ✅ Run database migrations
- ✅ Collect static files
- ✅ Start all services
- ✅ Run health checks

### 3. Create Admin User

```bash
docker-compose exec backend python manage.py createsuperuser
```

Follow prompts to create an admin account.

### 4. Enable Auto-Start

```bash
# Copy systemd service file
sudo cp deployment/systemd/fleetguard.service /etc/systemd/system/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable fleetguard.service
sudo systemctl start fleetguard.service

# Check status
sudo systemctl status fleetguard.service
```

### 5. Access Application

- **Frontend**: `http://your-vps-ip`
- **API**: `http://your-vps-ip/api/`
- **Admin**: `http://your-vps-ip/admin/`

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free SSL)

**Prerequisites**: Domain must point to your VPS IP

```bash
# Install Certbot (already done in setup script)
sudo apt-get install certbot python3-certbot-nginx

# Stop nginx container temporarily
docker-compose stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos

# Update Nginx configuration
# Edit deployment/nginx-main.conf and uncomment HTTPS server block
# Update domain names in the configuration

# Restart nginx
docker-compose up -d nginx
```

### Auto-Renewal Setup

Certbot creates a cron job automatically. Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Monitoring & Logs

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f celery-worker
docker-compose logs -f nginx

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Check Resource Usage

```bash
# System resources
htop

# Docker container resources
docker stats

# Disk usage
df -h

# Network usage
nethogs
```

### Check Service Status

```bash
# All containers
docker-compose ps

# System service
sudo systemctl status fleetguard

# Individual health checks
curl http://localhost/health
curl http://localhost:8000/admin/
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Rebuild container
docker-compose build --no-cache [service-name]
docker-compose up -d [service-name]
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Connect to database manually
docker-compose exec db mysql -u fleetguard_user -p fleetguard_db

# Verify .env database settings match
cat Fleetguard-NewAPI-2025-main/.env | grep DB_
```

### Out of Memory

```bash
# Check memory usage
free -h

# Check swap
swapon --show

# Restart services to free memory
docker-compose restart

# Reduce workers if persistent
# Edit .env: GUNICORN_WORKERS=1
```

### Static Files Not Loading

```bash
# Collect static files again
docker-compose exec backend python manage.py collectstatic --noinput

# Check volume permissions
docker-compose exec backend ls -la /app/static/

# Restart nginx
docker-compose restart nginx
```

### ML Inference Slow

This is expected on CPU-only VPS. Typical inference times:
- YOLO detection: 2-5 seconds per image
- PaddleOCR: 1-3 seconds per image

To improve:
- Reduce image size before processing
- Use async processing with Celery
- Consider GPU VPS for production

### Port Already in Use

```bash
# Check what's using port 80/443
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Stop conflicting service
sudo systemctl stop apache2  # or nginx, if installed

# Or change ports in docker-compose.yml
# Edit ports section: "8080:80" instead of "80:80"
```

---

## Quick Reference Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a service
docker-compose restart [service-name]

# View logs
docker-compose logs -f [service-name]

# Run Django commands
docker-compose exec backend python manage.py [command]

# Database migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Backup database
bash deployment/scripts/backup.sh

# Update application
git pull
bash deployment/scripts/deploy.sh
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

For maintenance procedures, see [MAINTENANCE.md](MAINTENANCE.md).
