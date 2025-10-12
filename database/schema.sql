-- Hoppy Game Global Leaderboard Database Schema
-- Run this SQL on your MySQL database

-- Create database (optional - you might already have one)
-- CREATE DATABASE hoppy_game;
-- USE hoppy_game;

-- Users/Devices table for cross-device sync
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_id (device_id)
);

-- Global leaderboard scores
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    game_session_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_score (score DESC),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at DESC)
);

-- Daily leaderboard view (optional - for daily competitions)
CREATE OR REPLACE VIEW daily_leaderboard AS
SELECT 
    s.id,
    s.player_name,
    s.score,
    s.created_at,
    u.device_id,
    ROW_NUMBER() OVER (ORDER BY s.score DESC, s.created_at ASC) as rank_position
FROM scores s
JOIN users u ON s.user_id = u.id
WHERE DATE(s.created_at) = CURDATE()
ORDER BY s.score DESC, s.created_at ASC
LIMIT 100;

-- All-time leaderboard view
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    s.id,
    s.player_name,
    s.score,
    s.created_at,
    u.device_id,
    ROW_NUMBER() OVER (ORDER BY s.score DESC, s.created_at ASC) as rank_position
FROM scores s
JOIN users u ON s.user_id = u.id
ORDER BY s.score DESC, s.created_at ASC
LIMIT 1000;

-- User's personal best scores view
CREATE OR REPLACE VIEW user_best_scores AS
SELECT 
    u.device_id,
    s.player_name,
    MAX(s.score) as best_score,
    COUNT(s.id) as total_games,
    MIN(s.created_at) as first_game,
    MAX(s.created_at) as last_game
FROM users u
LEFT JOIN scores s ON u.id = s.user_id
GROUP BY u.id, u.device_id, s.player_name;

-- Insert some sample data (optional - remove in production)
-- INSERT INTO users (device_id) VALUES 
-- ('sample-device-1'),
-- ('sample-device-2');

-- INSERT INTO scores (user_id, player_name, score) VALUES
-- (1, 'TestPlayer1', 150),
-- (1, 'TestPlayer1', 200),
-- (2, 'TestPlayer2', 175);