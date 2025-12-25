# Quick Start Guide - VPS Deployment

This guide will help you deploy the Fleetguard application to your **Hostinger KVM 2 VPS** in minutes.

## 📋 Prerequisites

- Hostinger KVM 2 VPS (2 vCPU, 8GB RAM, 100GB SSD)
- SSH access to your VPS
- Domain name (optional, can use IP address)

## 🚀 Deployment Steps

### 1. Initial VPS Setup

Connect to your VPS and run the setup script:

```bash
# Connect to VPS
ssh root@your-vps-ip

# Clone/upload the project to /var/www/fleetguard
cd /var/www/fleetguard

# Run VPS setup script (installs Docker, configures system)
chmod +x deployment/scripts/setup-vps.sh
sudo bash deployment/scripts/setup-vps.sh
```

### 2. Configure Environment

```bash
# Copy and edit environment file
cp Fleetguard-NewAPI-2025-main/.env.example Fleetguard-NewAPI-2025-main/.env
vim Fleetguard-NewAPI-2025-main/.env

# IMPORTANT: Update these values:
# - DJANGO_SECRET_KEY (use: openssl rand -base64 32)
# - DJANGO_ALLOWED_HOSTS (add your domain/IP)
# - DB_PASSWORD (use strong password)
# - EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
```

### 3. Deploy Application

```bash
# Run deployment script
chmod +x deployment/scripts/deploy.sh
bash deployment/scripts/deploy.sh

# Create admin user
docker-compose exec backend python manage.py createsuperuser
```

### 4. Enable Auto-Start

```bash
# Install systemd service
sudo cp deployment/systemd/fleetguard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable fleetguard.service
sudo systemctl start fleetguard.service
```

### 5. Access Your Application

- **Frontend**: `http://your-vps-ip`
- **Backend API**: `http://your-vps-ip/api/`
- **Admin Panel**: `http://your-vps-ip/admin/`

## 🔒 Setup HTTPS (Optional but Recommended)

```bash
# Point your domain to VPS IP first, then:
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Update deployment/nginx-main.conf (uncomment HTTPS block)
# Restart nginx
docker-compose restart nginx
```

## 📊 Monitor Your Application

```bash
# View all service status
docker-compose ps

# View logs
docker-compose logs -f backend

# Check resource usage
htop
docker stats
```

## 🔧 Useful Commands

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Run database migrations
docker-compose exec backend python manage.py migrate

# Backup database and media
bash deployment/scripts/backup.sh

# Update application
git pull
bash deployment/scripts/deploy.sh
```

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[MAINTENANCE.md](MAINTENANCE.md)** - Ongoing maintenance procedures
- **[Implementation Plan](C:\Users\prajw\.gemini\antigravity\brain\c0f8d3c4-0066-454e-965f-42c442fcf9de\implementation_plan.md)** - Technical architecture details

## ⚡ Performance Expectations

On Hostinger KVM 2 VPS (CPU-only):
- **API Response**: <500ms (non-ML endpoints)
- **ML Inference**: 2-5 seconds per image
- **Concurrent Users**: 20-30 users comfortably
- **Image Processing**: 100-200 images/hour

## 🆘 Troubleshooting

**Services won't start?**
```bash
docker-compose logs [service-name]
```

**Out of memory?**
```bash
# Reduce workers in .env
GUNICORN_WORKERS=1
docker-compose restart
```

**Can't connect to database?**
```bash
# Check database logs
docker-compose logs db
# Verify .env settings
```

For more help, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 📞 Support

For issues or questions:
- Check [Troubleshooting section](DEPLOYMENT.md#troubleshooting) in DEPLOYMENT.md
- Review [Common Issues](MAINTENANCE.md#common-issues) in MAINTENANCE.md

---

**Built for Hostinger KVM 2 VPS** | Optimized for ML workloads | Production-ready
