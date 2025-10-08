const Game = require('../entities/Game');
const { v4: uuidv4 } = require('uuid');

/**
 * GameService Singleton class implementing CS 230 Singleton pattern
 * Ensures only one game instance exists at a time as per requirements
 * Manages game creation, validation, and state
 */
class GameService {
    constructor() {
        if (GameService._instance) {
            throw new Error('GameService is a singleton. Use GameService.getInstance()');
        }
        
        this._currentGame = null;
        this._gameHistory = [];
        this._uniqueNames = new Set(); // Track all unique names for validation
        this._isInitialized = false;
        
        GameService._instance = this;
    }

    /**
     * Get the singleton instance of GameService
     * @returns {GameService} The singleton instance
     */
    static getInstance() {
        if (!GameService._instance) {
            GameService._instance = new GameService();
        }
        return GameService._instance;
    }

    /**
     * Initialize the game service
     */
    initialize() {
        if (this._isInitialized) {
            throw new Error('GameService is already initialized');
        }
        this._isInitialized = true;
    }

    /**
     * Create a new game with unique name validation
     * @param {string} gameName - Name for the new game
     * @param {Object} options - Game configuration options
     * @returns {Game} The created game instance
     */
    createGame(gameName, options = {}) {
        if (!this._isInitialized) {
            throw new Error('GameService must be initialized first');
        }

        if (this._currentGame) {
            throw new Error('A game is already in progress. Only one game instance allowed.');
        }

        if (!gameName || typeof gameName !== 'string') {
            throw new Error('Valid game name is required');
        }

        const normalizedName = gameName.trim().toLowerCase();
        
        if (this._uniqueNames.has(normalizedName)) {
            throw new Error('Game name must be unique');
        }

        const gameId = uuidv4();
        const game = new Game(
            gameId, 
            gameName.trim(),
            options.maxTeams || 4,
            options.maxPlayersPerTeam || 6
        );

        this._currentGame = game;
        this._uniqueNames.add(normalizedName);
        
        return game;
    }

    /**
     * Get the current active game
     * @returns {Game|null} The current game or null if none exists
     */
    getCurrentGame() {
        return this._currentGame;
    }

    /**
     * End the current game and archive it
     * @returns {Game|null} The ended game or null if none exists
     */
    endCurrentGame() {
        if (!this._currentGame) {
            return null;
        }

        const endedGame = this._currentGame;
        endedGame.endGame();
        
        // Archive the game
        this._gameHistory.push({
            game: endedGame.toJSON(),
            endedAt: new Date()
        });

        // Remove from unique names
        const normalizedName = endedGame.name.toLowerCase();
        this._uniqueNames.delete(normalizedName);

        this._currentGame = null;
        return endedGame;
    }

    /**
     * Check if a name is unique across all entities
     * @param {string} name - Name to check
     * @returns {boolean} True if name is unique
     */
    isNameUnique(name) {
        if (!name || typeof name !== 'string') {
            return false;
        }
        
        const normalizedName = name.trim().toLowerCase();
        return !this._uniqueNames.has(normalizedName);
    }

    /**
     * Register a unique name (for teams, players, etc.)
     * @param {string} name - Name to register
     * @returns {boolean} True if name was registered successfully
     */
    registerUniqueName(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Valid name is required');
        }

        const normalizedName = name.trim().toLowerCase();
        
        if (this._uniqueNames.has(normalizedName)) {
            throw new Error('Name must be unique');
        }

        this._uniqueNames.add(normalizedName);
        return true;
    }

    /**
     * Unregister a name (when entity is deleted)
     * @param {string} name - Name to unregister
     */
    unregisterUniqueName(name) {
        if (!name || typeof name !== 'string') {
            return;
        }

        const normalizedName = name.trim().toLowerCase();
        this._uniqueNames.delete(normalizedName);
    }

    /**
     * Get game statistics
     * @returns {Object} Game service statistics
     */
    getStatistics() {
        return {
            isInitialized: this._isInitialized,
            hasActiveGame: this._currentGame !== null,
            totalGamesPlayed: this._gameHistory.length,
            uniqueNamesCount: this._uniqueNames.size,
            currentGameInfo: this._currentGame ? this._currentGame.getSummary() : null
        };
    }

    /**
     * Get game history
     * @returns {Array} Array of completed games
     */
    getGameHistory() {
        return [...this._gameHistory];
    }

    /**
     * Reset the game service (for testing purposes)
     * @private
     */
    _reset() {
        this._currentGame = null;
        this._gameHistory = [];
        this._uniqueNames.clear();
        this._isInitialized = false;
    }

    /**
     * Validate that singleton pattern is working correctly
     * @returns {boolean} True if singleton is properly implemented
     */
    validateSingleton() {
        const instance1 = GameService.getInstance();
        const instance2 = GameService.getInstance();
        return instance1 === instance2;
    }
}

// Ensure singleton pattern is enforced
GameService._instance = null;

module.exports = GameService;
