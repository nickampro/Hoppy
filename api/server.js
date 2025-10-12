import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database configuration from environment variables
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hoppy_game',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Strict rate limiting for score submission
const scoreSubmitLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Max 10 score submissions per minute
    message: 'Too many score submissions, please wait before submitting again.'
});

// Helper function to get or create user by device ID
async function getOrCreateUser(deviceId) {
    try {
        // Try to find existing user
        const [rows] = await pool.execute(
            'SELECT id FROM users WHERE device_id = ?',
            [deviceId]
        );

        if (rows.length > 0) {
            return rows[0].id;
        }

        // Create new user
        const [result] = await pool.execute(
            'INSERT INTO users (device_id) VALUES (?)',
            [deviceId]
        );

        return result.insertId;
    } catch (error) {
        console.error('Error getting/creating user:', error);
        throw error;
    }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get global leaderboard
app.get('/api/leaderboard', async (req, res) => {
    console.log('🔍 Leaderboard endpoint called');
    
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
        const type = req.query.type || 'global'; // 'global' or 'daily'
        
        console.log('📊 Query params:', { limit, type });
        
        let query;
        if (type === 'daily') {
            query = 'SELECT * FROM daily_leaderboard LIMIT ?';
        } else {
            query = 'SELECT * FROM global_leaderboard LIMIT ?';
        }
        
        console.log('🔍 Executing query:', query, 'with limit:', limit);
        
        const [rows] = await pool.execute(query, [limit]);
        
        console.log('✅ Query successful, rows found:', rows.length);
        console.log('📊 Data:', rows);
        
        res.json({
            success: true,
            leaderboard: rows,
            type: type,
            count: rows.length
        });
    } catch (error) {
        console.error('❌ Leaderboard error details:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard'
        });
    }
});

// Submit new score
app.post('/api/scores', scoreSubmitLimiter, async (req, res) => {
    try {
        const { deviceId, playerName, score, gameSessionId } = req.body;

        // Validation
        if (!deviceId || !playerName || typeof score !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: deviceId, playerName, score'
            });
        }

        if (score < 0 || score > 1000000) {
            return res.status(400).json({
                success: false,
                error: 'Invalid score value'
            });
        }

        if (playerName.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Player name too long (max 50 characters)'
            });
        }

        // Get or create user
        const userId = await getOrCreateUser(deviceId);

        // Insert score
        const [result] = await pool.execute(
            `INSERT INTO scores (user_id, player_name, score, game_session_id, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                playerName.trim(),
                score,
                gameSessionId || uuidv4(),
                req.ip,
                req.get('User-Agent') || null
            ]
        );

        // Get user's rank in global leaderboard
        const [rankResult] = await pool.execute(
            `SELECT rank_position FROM global_leaderboard WHERE score = ? AND player_name = ? LIMIT 1`,
            [score, playerName.trim()]
        );

        const rank = rankResult.length > 0 ? rankResult[0].rank_position : null;

        res.json({
            success: true,
            scoreId: result.insertId,
            rank: rank,
            message: 'Score submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting score:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit score'
        });
    }
});

// Get user's scores and stats
app.get('/api/user/:deviceId/scores', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);

        // Get user's recent scores
        const [scores] = await pool.execute(
            `SELECT s.score, s.player_name, s.created_at 
             FROM scores s 
             JOIN users u ON s.user_id = u.id 
             WHERE u.device_id = ? 
             ORDER BY s.created_at DESC 
             LIMIT ?`,
            [deviceId, limit]
        );

        // Get user's best score and stats
        const [stats] = await pool.execute(
            `SELECT * FROM user_best_scores WHERE device_id = ?`,
            [deviceId]
        );

        res.json({
            success: true,
            scores: scores,
            stats: stats.length > 0 ? stats[0] : null
        });

    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user scores'
        });
    }
});

// Get user's rank for a specific score
app.get('/api/rank/:score', async (req, res) => {
    try {
        const score = parseInt(req.params.score);
        
        if (isNaN(score)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid score parameter'
            });
        }

        const [result] = await pool.execute(
            `SELECT COUNT(*) + 1 as rank_position 
             FROM scores 
             WHERE score > ?`,
            [score]
        );

        res.json({
            success: true,
            score: score,
            rank: result[0].rank_position
        });

    } catch (error) {
        console.error('Error calculating rank:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate rank'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Hoppy API server running on port ${PORT}`);
    console.log(`📊 Database: ${dbConfig.host}/${dbConfig.database}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    await pool.end();
    process.exit(0);
});