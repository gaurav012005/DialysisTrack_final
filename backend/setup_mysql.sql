-- MySQL Database Setup for DialysisTrack
-- Run this script in MySQL to create the database

-- Create database
CREATE DATABASE IF NOT EXISTS dialysistrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional - if you want a dedicated user)
-- CREATE USER IF NOT EXISTS 'dialysis_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
-- GRANT ALL PRIVILEGES ON dialysistrack_db.* TO 'dialysis_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Use the database
USE dialysistrack_db;

-- Show confirmation
SELECT 'Database dialysistrack_db created successfully!' AS Status;
