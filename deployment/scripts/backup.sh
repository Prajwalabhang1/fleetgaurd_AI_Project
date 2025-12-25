#!/bin/bash
# Database Backup Script for Fleetguard
# Run this script to backup database and media files
# Usage: bash backup.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/fleetguard"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================"
echo "Fleetguard Backup Script"
echo "================================================"

# Create backup directory
mkdir -p $BACKUP_DIR

# Load environment variables
if [ -f "Fleetguard-NewAPI-2025-main/.env" ]; then
    source Fleetguard-NewAPI-2025-main/.env
else
    echo "Warning: .env file not found, using defaults"
    DB_NAME="fleetguard_db"
    DB_USER="fleetguard_user"
    DB_PASSWORD="fleetguard_pass"
fi

# Backup MySQL database
echo -e "${GREEN}[1/3] Backing up MySQL database...${NC}"
docker-compose exec -T db mysqldump -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} | gzip > "${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"
echo "Database backup saved to: ${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"

# Backup media files
echo -e "${GREEN}[2/3] Backing up media files...${NC}"
if [ -d "Fleetguard-NewAPI-2025-main/media" ]; then
    tar -czf "${BACKUP_DIR}/media_${TIMESTAMP}.tar.gz" -C Fleetguard-NewAPI-2025-main media/
    echo "Media backup saved to: ${BACKUP_DIR}/media_${TIMESTAMP}.tar.gz"
else
    echo -e "${YELLOW}No media directory found, skipping...${NC}"
fi

# Clean old backups (keep last 7 days)
echo -e "${GREEN}[3/3] Cleaning old backups (keeping last ${RETENTION_DAYS} days)...${NC}"
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "media_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# List current backups
echo ""
echo "Current backups:"
ls -lh $BACKUP_DIR

echo ""
echo -e "${GREEN}Backup Complete!${NC}"
echo ""
echo "To restore database:"
echo "  gunzip < ${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz | docker-compose exec -T db mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME}"
echo ""
echo "To restore media:"
echo "  tar -xzf ${BACKUP_DIR}/media_${TIMESTAMP}.tar.gz -C Fleetguard-NewAPI-2025-main/"
echo ""
