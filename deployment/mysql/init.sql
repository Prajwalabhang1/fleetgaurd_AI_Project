-- Initial database setup for Fleetguard
-- This script runs automatically when the MySQL container starts for the first time

-- Create database if not exists (should be created by environment variables)
CREATE DATABASE IF NOT EXISTS fleetguard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges
GRANT ALL PRIVILEGES ON fleetguard_db.* TO 'fleetguard_user'@'%';
FLUSH PRIVILEGES;

-- Set MySQL settings optimized for application
SET GLOBAL max_connections = 150;
SET GLOBAL max_allowed_packet = 104857600; -- 100MB for large image uploads
