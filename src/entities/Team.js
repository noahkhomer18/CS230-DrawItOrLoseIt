const Entity = require('./Entity');

/**
 * Team class extending Entity base class
 * Manages team members and scoring following CS 230 principles
 */
class Team extends Entity {
    constructor(id, name, color = null) {
        super(id, name);
        this._players = new Map(); // Using Map for efficient player lookup
        this._score = 0;
        this._color = color || this._generateColor();
        this._isActive = true;
    }

    // Getters with proper encapsulation
    get players() {
        return Array.from(this._players.values());
    }

    get playerCount() {
        return this._players.size;
    }

    get score() {
        return this._score;
    }

    get color() {
        return this._color;
    }

    get isActive() {
        return this._isActive;
    }

    // Team management methods
    addPlayer(player) {
        if (!player || !player.id) {
            throw new Error('Valid player object is required');
        }
        
        if (this._players.has(player.id)) {
            throw new Error('Player is already in this team');
        }

        this._players.set(player.id, player);
        player.joinTeam(this._id);
        this._updateActivity();
    }

    removePlayer(playerId) {
        if (!this._players.has(playerId)) {
            throw new Error('Player not found in team');
        }

        const player = this._players.get(playerId);
        player.leaveTeam();
        this._players.delete(playerId);
        this._updateActivity();
    }

    getPlayer(playerId) {
        return this._players.get(playerId);
    }

    hasPlayer(playerId) {
        return this._players.has(playerId);
    }

    // Scoring methods
    addScore(points) {
        if (points < 0) {
            throw new Error('Score cannot be negative');
        }
        this._score += points;
        this._updateActivity();
    }

    resetScore() {
        this._score = 0;
        this._updateActivity();
    }

    // Team status methods
    setActive(isActive) {
        this._isActive = isActive;
        this._updateActivity();
    }

    isReady() {
        // Team is ready if all players are ready
        if (this._players.size === 0) return false;
        
        for (const player of this._players.values()) {
            if (!player.isReady) {
                return false;
            }
        }
        return true;
    }

    getActivePlayers() {
        return this.players.filter(player => player.isActive());
    }

    // Private methods
    _generateColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    _updateActivity() {
        // Update team activity timestamp
        this._lastActivity = new Date();
    }

    // Override getType from parent class
    getType() {
        return 'Team';
    }

    // Team-specific serialization
    toJSON() {
        return {
            ...super.toJSON(),
            playerCount: this._players.size,
            players: this.players.map(player => player.toJSON()),
            score: this._score,
            color: this._color,
            isActive: this._isActive,
            isReady: this.isReady()
        };
    }

    // Get team summary for game display
    getSummary() {
        return {
            id: this._id,
            name: this._name,
            playerCount: this._players.size,
            score: this._score,
            color: this._color,
            isActive: this._isActive,
            isReady: this.isReady()
        };
    }

    // Iterator pattern implementation for CS 230 requirements
    [Symbol.iterator]() {
        let players = Array.from(this._players.values());
        let index = 0;
        
        return {
            next() {
                if (index < players.length) {
                    return { value: players[index++], done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
}

module.exports = Team;
