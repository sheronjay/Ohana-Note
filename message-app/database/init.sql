-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS messages_db;

-- Use the database
USE messages_db;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    uuid VARCHAR(255) PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert a default message for testing
INSERT INTO messages (uuid, message) VALUES 
('00000000-0000-0000-0000-000000000000', 'This is a test message. If you see this, the database is working correctly!');
