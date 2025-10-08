const Entity = require('./Entity');

/**
 * Player class extending Entity base class
 * Demonstrates inheritance and polymorphism from CS 230
 */
class Player extends Entity {
    constructor(id, name, teamId = null) {
        super(id, name);
        this._teamId = teamId;
        this._score = 0;
        this._isDrawing = false;
        this._isReady = false;
        this._lastActivity = new Date();
    }

    // Getters with encapsulation
    get teamId() {
        return this._teamId;
    }

    get score() {
        return this._score;
    }

    get isDrawing() {
        return this._isDrawing;
    }

    get isReady() {
        return this._isReady;
    }

    get lastActivity() {
        return this._lastActivity;
    }

    // Methods for player state management
    joinTeam(teamId) {
        if (!teamId) {
            throw new Error('Team ID is required');
        }
        this._teamId = teamId;
        this._updateActivity();
    }

    leaveTeam() {
        this._teamId = null;
        this._isDrawing = false;
        this._updateActivity();
    }

    setDrawing(isDrawing) {
        this._isDrawing = isDrawing;
        this._updateActivity();
    }

    setReady(isReady) {
        this._isReady = isReady;
        this._updateActivity();
    }

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

    // Private method for activity tracking
    _updateActivity() {
        this._lastActivity = new Date();
    }

    // Override getType from parent class
    getType() {
        return 'Player';
    }

    // Player-specific serialization
    toJSON() {
        return {
            ...super.toJSON(),
            teamId: this._teamId,
            score: this._score,
            isDrawing: this._isDrawing,
            isReady: this._isReady,
            lastActivity: this._lastActivity
        };
    }

    // Check if player is active (within last 5 minutes)
    isActive() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return this._lastActivity > fiveMinutesAgo;
    }

    // Get player status for game display
    getStatus() {
        return {
            name: this._name,
            score: this._score,
            isDrawing: this._isDrawing,
            isReady: this._isReady,
            isActive: this.isActive()
        };
    }
}

module.exports = Player;
