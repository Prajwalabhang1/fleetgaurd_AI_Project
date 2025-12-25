# 🚀 Fleetguard - One-Command VPS Deployment

Complete production-ready deployment for **Fleetguard** on **Hostinger KVM 2 VPS** (IP: 72.61.238.154)

## ⚡ Quick Deploy (Automated)

Just **ONE command** to deploy everything:

```bash
# SSH to your VPS
ssh root@72.61.238.154

# Clone and deploy
git clone https://github.com/Prajwalabhang1/fleetgaurd_AI_Project.git
cd fleetgaurd_AI_Project
bash deployment/scripts/deploy-complete.sh
```

That's it! Everything is **fully automated**. ✅

---

## 🌐 Access Your Application

After deployment completes:

- **Frontend**: http://72.61.238.154:8888
- **API**: http://72.61.238.154:8081/api/
- **Admin Panel**: http://72.61.238.154:8888/admin/

---

## 🔐 Create Admin User

After deployment, create your admin account:

```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## 📦 What Gets Deployed

✅ **7 Docker Containers**:
- MySQL (port 3307)
- Redis (port 6380)
- Django Backend (port 8081)
- Celery Worker
- Celery Beat
- Angular Frontend (port 8082)
- Nginx Reverse Proxy (ports 8888, 8443)

✅ **Fully Configured**:
- Environment variables auto-generated
- Database auto-created
- Static files collected
- Migrations applied
- Health checks passed

---

## 🔧 Port Configuration

Custom ports to avoid conflicts with existing applications:

| Service | External Port | Internal Port |
|---------|---------------|---------------|
| **Main App (Nginx)** | **8888** | 80 |
| **HTTPS** | **8443** | 443 |
| Backend API | 8081 | 8000 |
| Frontend | 8082 | 80 |
| MySQL | 3307 | 3306 |
| Redis | 6380 | 6379 |

**Firewall**: Ports 22, 8888, and 8443 are opened automatically

---

## 📋 Manual Deployment (Step-by-Step)

If you prefer manual control:

```bash
# 1. VPS Setup (one-time)
sudo bash deployment/scripts/setup-vps.sh

# 2. Auto-configure
bash deployment/scripts/auto-configure.sh

# 3. Deploy
bash deployment/scripts/deploy.sh

# 4. Create admin user
docker-compose exec backend python manage.py createsuperuser
```

---

## 🛠️ Common Commands

```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f nginx

# Restart service
docker-compose restart backend

# Stop all
docker-compose down

# Start all
docker-compose up -d

# Backup database
bash deployment/scripts/backup.sh

# Update application
git pull
bash deployment/scripts/deploy.sh
```

---

## 📊 Performance Expectations

On Hostinger KVM 2 (2 vCPU, 8GB RAM):

- **Concurrent Users**: 20-30
- **API Response**: <500ms
- **ML Inference**: 2-5 seconds/image
- **Image Processing**: 100-200/hour

---

## 🔒 Security Features

✅ Debug mode disabled
✅ Secret key auto-generated
✅ Firewall configured
✅ HTTPS ready (port 8443)
✅ CORS configured
✅ Database password protected

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[MAINTENANCE.md](MAINTENANCE.md)** - Maintenance procedures
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide

---

## 🆘 Troubleshooting

**Services not starting?**
```bash
docker-compose logs [service-name]
```

**Port already in use?**
```bash
sudo netstat -tlnp | grep 8888
```

**Out of memory?**
```bash
free -h
docker-compose restart
```

**Need help?** Check [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)

---

## 🎯 Auto-Configured Settings

All environment variables are **pre-configured** for your VPS:

- ✅ VPS IP: 72.61.238.154
- ✅ Django SECRET_KEY: Auto-generated
- ✅ Database: MySQL with strong passwords
- ✅ Ports: 8888, 8443, 8081, 8082
- ✅ Email: Using existing Gmail config
- ✅ CORS: Configured for your IP

**No manual .env editing required!** 🎉

---

**Built for VPS 72.61.238.154** | **Optimized for ML workloads** | **Production-ready** 🚀
