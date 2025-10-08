/**
 * Express Server for Draw It Or Lose It Game
 * Demonstrates CS 230 backend integration with Singleton pattern
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import our CS 230 classes
const GameService = require('./src/core/GameService');
const Game = require('./src/entities/Game');
const Team = require('./src/entities/Team');
const Player = require('./src/entities/Player');
const NameValidator = require('./src/utils/NameValidator');

class GameServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.gameService = null;
        this.connectedClients = new Map();
        this.port = process.env.PORT || 3000;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.initializeGameService();
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Serve static files from public directory
        this.app.use(express.static(path.join(__dirname, 'public')));
        
        // Parse JSON bodies
        this.app.use(express.json());
        
        // CORS middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });
    }

    /**
     * Setup API routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                gameService: this.gameService ? 'initialized' : 'not initialized'
            });
        });

        // Game service statistics
        this.app.get('/api/stats', (req, res) => {
            if (!this.gameService) {
                return res.status(500).json({ error: 'Game service not initialized' });
            }
            
            const stats = this.gameService.getStatistics();
            res.json(stats);
        });

        // Create new game
        this.app.post('/api/games', (req, res) => {
            try {
                const { name, options = {} } = req.body;
                
                if (!name) {
                    return res.status(400).json({ error: 'Game name is required' });
                }

                const game = this.gameService.createGame(name, options);
                res.status(201).json({
                    success: true,
                    game: game.toJSON()
                });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Get current game
        this.app.get('/api/games/current', (req, res) => {
            const game = this.gameService.getCurrentGame();
            if (!game) {
                return res.status(404).json({ error: 'No active game' });
            }
            
            res.json(game.toJSON());
        });

        // End current game
        this.app.delete('/api/games/current', (req, res) => {
            try {
                const endedGame = this.gameService.endCurrentGame();
                res.json({
                    success: true,
                    game: endedGame ? endedGame.toJSON() : null
                });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Validate name uniqueness
        this.app.post('/api/validate/name', (req, res) => {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Name is required' });
            }

            const isUnique = this.gameService.isNameUnique(name);
            res.json({ isUnique });
        });

        // Game history
        this.app.get('/api/games/history', (req, res) => {
            const history = this.gameService.getGameHistory();
            res.json(history);
        });

        // Serve main page
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });
    }

    /**
     * Setup Socket.IO handlers for real-time communication
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);
            
            // Store client connection
            this.connectedClients.set(socket.id, {
                socket,
                gameId: null,
                playerId: null,
                connectedAt: new Date()
            });

            // Handle game creation
            socket.on('createGame', (data) => {
                try {
                    const game = this.gameService.createGame(data.name, data.options);
                    socket.emit('gameCreated', { success: true, game: game.toJSON() });
                    socket.broadcast.emit('gameUpdated', { game: game.toJSON() });
                } catch (error) {
                    socket.emit('gameError', { error: error.message });
                }
            });

            // Handle joining game
            socket.on('joinGame', (data) => {
                const game = this.gameService.getCurrentGame();
                if (!game) {
                    socket.emit('gameError', { error: 'No active game' });
                    return;
                }

                try {
                    const player = game.addPlayer(data.playerId, data.playerName, data.teamId);
                    this.connectedClients.get(socket.id).playerId = player.id;
                    this.connectedClients.get(socket.id).gameId = game.id;
                    
                    socket.emit('playerJoined', { success: true, player: player.toJSON() });
                    socket.broadcast.emit('gameUpdated', { game: game.toJSON() });
                } catch (error) {
                    socket.emit('gameError', { error: error.message });
                }
            });

            // Handle drawing data
            socket.on('drawingData', (data) => {
                const client = this.connectedClients.get(socket.id);
                if (client && client.gameId) {
                    // Broadcast drawing data to other players
                    socket.broadcast.emit('drawingUpdate', {
                        playerId: client.playerId,
                        drawingData: data
                    });
                }
            });

            // Handle game actions
            socket.on('startGame', () => {
                const game = this.gameService.getCurrentGame();
                if (game) {
                    try {
                        game.startGame();
                        this.io.emit('gameUpdated', { game: game.toJSON() });
                    } catch (error) {
                        socket.emit('gameError', { error: error.message });
                    }
                }
            });

            socket.on('pauseGame', () => {
                const game = this.gameService.getCurrentGame();
                if (game) {
                    try {
                        game.pauseGame();
                        this.io.emit('gameUpdated', { game: game.toJSON() });
                    } catch (error) {
                        socket.emit('gameError', { error: error.message });
                    }
                }
            });

            socket.on('endGame', () => {
                try {
                    const endedGame = this.gameService.endCurrentGame();
                    this.io.emit('gameEnded', { game: endedGame ? endedGame.toJSON() : null });
                } catch (error) {
                    socket.emit('gameError', { error: error.message });
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
                this.connectedClients.delete(socket.id);
            });
        });
    }

    /**
     * Initialize the game service (Singleton pattern)
     */
    initializeGameService() {
        try {
            this.gameService = GameService.getInstance();
            this.gameService.initialize();
            console.log('Game service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game service:', error);
        }
    }

    /**
     * Start the server
     */
    start() {
        this.server.listen(this.port, () => {
            console.log(`🎨 Draw It Or Lose It Server running on port ${this.port}`);
            console.log(`📱 Access the game at: http://localhost:${this.port}`);
            console.log(`🔧 API endpoints available at: http://localhost:${this.port}/api`);
            console.log(`📊 Health check: http://localhost:${this.port}/api/health`);
        });
    }

    /**
     * Graceful shutdown
     */
    shutdown() {
        console.log('Shutting down server...');
        this.server.close(() => {
            console.log('Server closed successfully');
            process.exit(0);
        });
    }
}

// Create and start server
const gameServer = new GameServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    gameServer.shutdown();
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    gameServer.shutdown();
});

// Start the server
gameServer.start();

module.exports = GameServer;
