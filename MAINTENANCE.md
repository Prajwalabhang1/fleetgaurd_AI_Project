# Fleetguard Maintenance Guide

Ongoing maintenance procedures for the Fleetguard application on VPS.

## Table of Contents
- [Regular Maintenance Tasks](#regular-maintenance-tasks)
- [Backup & Restore](#backup--restore)
- [Updates & Upgrades](#updates--upgrades)
- [Performance Monitoring](#performance-monitoring)
- [Scaling Guidelines](#scaling-guidelines)
- [Common Issues](#common-issues)

---

## Regular Maintenance Tasks

### Daily

**Automated (via systemd)**
- Application runs automatically on boot
- Celery beat sends scheduled reminders

**Manual Checks**
```bash
# Quick health check
curl http://your-domain.com/health

# Check service status
docker-compose ps

# Check disk space
df -h
```

### Weekly

**Run Backup**
```bash
cd /var/www/fleetguard
bash deployment/scripts/backup.sh
```

**Review Logs**
```bash
# Check for errors
docker-compose logs --tail=500 backend | grep -i error
docker-compose logs --tail=500 celery-worker | grep -i error

# Check nginx access logs
docker-compose logs nginx | tail -100
```

**Monitor Resources**
```bash
# CPU and memory
htop

# Docker stats
docker stats
```

### Monthly

**System Updates**
```bash
# Update OS packages
sudo apt-get update
sudo apt-get upgrade -y

# Clean old packages
sudo apt-get autoremove -y
sudo apt-get autoclean
```

**Docker Maintenance**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (be careful!)
docker volume prune

# Clean build cache
docker builder prune
```

**SSL Certificate Renewal** (if not auto-renewed)
```bash
sudo certbot renew
docker-compose restart nginx
```

---

## Backup & Restore

### Automated Backups

Setup cron job for automatic backups:

```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /var/www/fleetguard && bash deployment/scripts/backup.sh >> /var/log/fleetguard-backup.log 2>&1
```

### Manual Backup

```bash
cd /var/www/fleetguard
bash deployment/scripts/backup.sh
```

Backups are stored in `/var/backups/fleetguard/`:
- `db_YYYYMMDD_HHMMSS.sql.gz` - Database backup
- `media_YYYYMMDD_HHMMSS.tar.gz` - Uploaded files

### Restore Database

```bash
# List available backups
ls -lh /var/backups/fleetguard/

# Restore specific backup
gunzip < /var/backups/fleetguard/db_20250125_020000.sql.gz | \
  docker-compose exec -T db mysql -u fleetguard_user -p fleetguard_db
```

### Restore Media Files

```bash
tar -xzf /var/backups/fleetguard/media_20250125_020000.tar.gz \
  -C Fleetguard-NewAPI-2025-main/
```

### Remote Backup

Copy backups to remote storage:

```bash
# Using rsync to remote server
rsync -avz /var/backups/fleetguard/ user@backup-server:/backups/fleetguard/

# Or upload to cloud storage (example with rclone)
rclone sync /var/backups/fleetguard/ remote:fleetguard-backups/
```

---

## Updates & Upgrades

### Application Updates

When you have new code changes:

```bash
cd /var/www/fleetguard

# Pull latest code
git pull origin main

# Run deployment script
bash deployment/scripts/deploy.sh
```

### Update Python Dependencies

```bash
# Edit requirements.txt with new versions

# Rebuild backend container
docker-compose build --no-cache backend

# Restart services
docker-compose up -d
```

### Update Frontend

```bash
# Edit package.json with new versions

# Rebuild frontend container
docker-compose build --no-cache frontend

# Restart
docker-compose up -d frontend
```

### Database Schema Changes

```bash
# After pulling code with new models
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Or run deployment script which includes migrations
bash deployment/scripts/deploy.sh
```

---

## Performance Monitoring

### Key Metrics to Monitor

**System Resources**
```bash
# CPU, Memory, Processes
htop

# Disk I/O
iotop

# Network
nethogs
```

**Application Metrics**
```bash
# API response times (check nginx logs)
docker-compose logs nginx | grep "POST /api"

# Database queries
docker-compose exec backend python manage.py dbshell
# Then run: SHOW PROCESSLIST;

# Cache hit rate (Redis)
docker-compose exec redis redis-cli INFO stats
```

### Performance Optimization

**If Backend is Slow:**
1. Check Gunicorn worker count in `.env`
2. Review database queries (use Django Debug Toolbar in dev)
3. Increase cache usage
4. Consider Redis for session storage

**If ML Inference is Slow:**
- Expected: 2-5 seconds per image on CPU
- Optimization: Process images async with Celery
- Long-term: Upgrade to GPU instance

**If Database is Slow:**
1. Check indexes on frequently queried fields
2. Monitor query execution time
3. Consider connection pooling
4. Increase MySQL buffer settings

**If Running Out of Memory:**
```bash
# Check current usage
free -h

# Reduce Gunicorn workers
# Edit .env: GUNICORN_WORKERS=1

# Reduce Celery concurrency
# Edit docker-compose.yml celery command: --concurrency=1

# Restart services
docker-compose restart
```

---

## Scaling Guidelines

### Current Capacity (KVM 2)
- **Users**: 20-30 concurrent users
- **Requests**: ~5-10 concurrent API requests
- **Images**: ~100-200 per hour (CPU inference)

### Vertical Scaling (Upgrade VPS)

When to upgrade:
- Consistent >80% CPU usage
- Frequent memory warnings
- Slow response times (>5 seconds)

**Next tier recommendations:**
- KVM 4 (4 vCPU, 16GB RAM) - doubles capacity
- KVM 6 (6 vCPU, 32GB RAM) - for production

### Horizontal Scaling

For higher loads, consider:

**Load Balancer Setup**
- Multiple backend containers across servers
- Shared database and Redis
- Nginx load balancing

**Separate Services**
- Database on dedicated server
- Redis on dedicated server
- ML processing on GPU instance
- Static files on CDN

---

## Common Issues

### High Memory Usage

```bash
# Identify culprit
docker stats

# Restart heavy service
docker-compose restart backend

# Permanent fix: reduce workers/concurrency
```

### Database Connection Pool Exhausted

```bash
# Check connections
docker-compose exec db mysql -u root -p
# Run: SHOW PROCESSLIST;

# Kill idle connections if needed
# Increase max_connections in deployment/mysql/init.sql
```

### Redis Out of Memory

```bash
# Check memory usage
docker-compose exec redis redis-cli INFO memory

# Clear cache if needed (only in emergency!)
docker-compose exec redis redis-cli FLUSHDB

# Increase maxmemory in docker-compose.yml
```

### SSL Certificate Expired

```bash
# Renew certificate
sudo certbot renew

# Restart nginx
docker-compose restart nginx

# Setup auto-renewal if not working
sudo systemctl status certbot.timer
```

### Docker Storage Full

```bash
# Check docker disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Move Docker data to larger partition if needed
```

---

## Emergency Procedures

### Complete Service Restart

```bash
cd /var/www/fleetguard
docker-compose down
docker-compose up -d
```

### Rollback to Previous Version

```bash
# Restore from backup
git log  # Find previous commit hash
git checkout <previous-commit-hash>
bash deployment/scripts/deploy.sh

# Restore database if schema changed
gunzip < /var/backups/fleetguard/db_backup.sql.gz | \
  docker-compose exec -T db mysql -u fleetguard_user -p fleetguard_db
```

### Emergency Contacts

Document your emergency contacts:
- VPS Provider Support: [Hostinger Support]
- Database Admin: [Your Contact]
- DevOps Team: [Your Contact]

---

## Additional Tips

### Log Rotation

Docker handles log rotation automatically, but monitor sizes:

```bash
# Check log sizes
docker-compose exec backend du -sh /app/logs/*

# Manual cleanup if needed
docker-compose exec backend find /app/logs/ -type f -mtime +30 -delete
```

### Security Updates

```bash
# Check for security updates weekly
sudo apt update
sudo apt list --upgradable

# Apply security patches
sudo unattended-upgrades
```

### Performance Baselines

Document baseline performance metrics:
- Average API response time: ____ ms
- Average ML inference time: ____ seconds
- Peak CPU usage: ____%
- Peak memory usage: ____%
- Daily active users: ____

Review monthly to identify trends.

---

For deployment procedures, see [DEPLOYMENT.md](DEPLOYMENT.md).
