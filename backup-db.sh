#!/bin/bash

# Database Backup Script for Lilo & Stitch Message App
# This script creates a backup of the MySQL database

set -e

# Configuration
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="lilo-stitch-db"
DB_NAME="messages_db"
DB_USER="root"
DB_PASSWORD="rootpassword"  # Update this with your actual password

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Starting database backup...${NC}"

# Create backup
BACKUP_FILE="$BACKUP_DIR/messages_db_$DATE.sql"
docker exec $CONTAINER_NAME mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

echo -e "${GREEN}Backup created: $BACKUP_FILE${NC}"

# Get file size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}Backup size: $SIZE${NC}"

# Delete backups older than 7 days
echo -e "${YELLOW}Cleaning up old backups (older than 7 days)...${NC}"
find "$BACKUP_DIR" -name "messages_db_*.sql.gz" -mtime +7 -delete

# Count remaining backups
COUNT=$(ls -1 "$BACKUP_DIR"/messages_db_*.sql.gz 2>/dev/null | wc -l)
echo -e "${GREEN}Total backups: $COUNT${NC}"

echo -e "${GREEN}Backup completed successfully!${NC}"
