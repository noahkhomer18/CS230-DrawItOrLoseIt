const Entity = require('./Entity');
const Team = require('./Team');
const Player = require('./Player');

/**
 * Game class extending Entity base class
 * Implements Singleton pattern for CS 230 requirements
 * Manages single game instance with teams and players
 */
class Game extends Entity {
    constructor(id, name, maxTeams = 4, maxPlayersPerTeam = 6) {
        super(id, name);
        this._teams = new Map();
        this._players = new Map();
        this._maxTeams = maxTeams;
        this._maxPlayersPerTeam = maxPlayersPerTeam;
        this._gameState = 'waiting'; // waiting, playing, paused, finished
        this._currentRound = 0;
        this._maxRounds = 10;
        this._roundTimeLimit = 60; // seconds
        this._currentWord = null;
        this._currentDrawer = null;
        this._gameSettings = {
            allowSpectators: true,
            enableChat: true,
            showScores: true
        };
    }

    // Getters with proper encapsulation
    get teams() {
        return Array.from(this._teams.values());
    }

    get players() {
        return Array.from(this._players.values());
    }

    get gameState() {
        return this._gameState;
    }

    get currentRound() {
        return this._currentRound;
    }

    get maxRounds() {
        return this._maxRounds;
    }

    get currentWord() {
        return this._currentWord;
    }

    get currentDrawer() {
        return this._currentDrawer;
    }

    get gameSettings() {
        return { ...this._gameSettings };
    }

    // Game state management
    startGame() {
        if (this._teams.size < 2) {
            throw new Error('At least 2 teams required to start game');
        }

        if (!this._allTeamsReady()) {
            throw new Error('All teams must be ready to start game');
        }

        this._gameState = 'playing';
        this._currentRound = 1;
        this._selectNextDrawer();
        this._updateActivity();
    }

    pauseGame() {
        if (this._gameState === 'playing') {
            this._gameState = 'paused';
            this._updateActivity();
        }
    }

    resumeGame() {
        if (this._gameState === 'paused') {
            this._gameState = 'playing';
            this._updateActivity();
        }
    }

    endGame() {
        this._gameState = 'finished';
        this._currentDrawer = null;
        this._currentWord = null;
        this._updateActivity();
    }

    // Team management
    createTeam(teamId, teamName, color = null) {
        if (this._teams.has(teamId)) {
            throw new Error('Team with this ID already exists');
        }

        if (this._teams.size >= this._maxTeams) {
            throw new Error('Maximum number of teams reached');
        }

        const team = new Team(teamId, teamName, color);
        this._teams.set(teamId, team);
        this._updateActivity();
        return team;
    }

    removeTeam(teamId) {
        if (!this._teams.has(teamId)) {
            throw new Error('Team not found');
        }

        const team = this._teams.get(teamId);
        
        // Remove all players from this team
        for (const player of team.players) {
            this._players.delete(player.id);
        }

        this._teams.delete(teamId);
        this._updateActivity();
    }

    getTeam(teamId) {
        return this._teams.get(teamId);
    }

    // Player management
    addPlayer(playerId, playerName, teamId = null) {
        if (this._players.has(playerId)) {
            throw new Error('Player with this ID already exists');
        }

        const player = new Player(playerId, playerName, teamId);
        this._players.set(playerId, player);

        if (teamId && this._teams.has(teamId)) {
            const team = this._teams.get(teamId);
            team.addPlayer(player);
        }

        this._updateActivity();
        return player;
    }

    removePlayer(playerId) {
        if (!this._players.has(playerId)) {
            throw new Error('Player not found');
        }

        const player = this._players.get(playerId);
        
        // Remove from team if assigned
        if (player.teamId && this._teams.has(player.teamId)) {
            const team = this._teams.get(player.teamId);
            team.removePlayer(playerId);
        }

        this._players.delete(playerId);
        this._updateActivity();
    }

    getPlayer(playerId) {
        return this._players.get(playerId);
    }

    // Game logic methods
    nextRound() {
        if (this._gameState !== 'playing') {
            throw new Error('Game must be in playing state to advance round');
        }

        this._currentRound++;
        if (this._currentRound > this._maxRounds) {
            this.endGame();
            return;
        }

        this._selectNextDrawer();
        this._updateActivity();
    }

    setCurrentWord(word) {
        if (!word || typeof word !== 'string') {
            throw new Error('Valid word is required');
        }
        this._currentWord = word.toLowerCase().trim();
        this._updateActivity();
    }

    // Private helper methods
    _allTeamsReady() {
        for (const team of this._teams.values()) {
            if (!team.isReady()) {
                return false;
            }
        }
        return true;
    }

    _selectNextDrawer() {
        const activePlayers = this.players.filter(player => 
            player.teamId && this._teams.has(player.teamId)
        );
        
        if (activePlayers.length === 0) {
            this._currentDrawer = null;
            return;
        }

        // Simple round-robin selection
        const currentIndex = activePlayers.findIndex(p => p.id === this._currentDrawer?.id);
        const nextIndex = (currentIndex + 1) % activePlayers.length;
        this._currentDrawer = activePlayers[nextIndex];
        this._currentDrawer.setDrawing(true);
    }

    _updateActivity() {
        this._lastActivity = new Date();
    }

    // Override getType from parent class
    getType() {
        return 'Game';
    }

    // Game-specific serialization
    toJSON() {
        return {
            ...super.toJSON(),
            teams: this.teams.map(team => team.toJSON()),
            players: this.players.map(player => player.toJSON()),
            gameState: this._gameState,
            currentRound: this._currentRound,
            maxRounds: this._maxRounds,
            currentWord: this._currentWord,
            currentDrawer: this._currentDrawer ? this._currentDrawer.toJSON() : null,
            gameSettings: this._gameSettings
        };
    }

    // Get game summary for display
    getSummary() {
        return {
            id: this._id,
            name: this._name,
            gameState: this._gameState,
            teamCount: this._teams.size,
            playerCount: this._players.size,
            currentRound: this._currentRound,
            maxRounds: this._maxRounds,
            currentDrawer: this._currentDrawer ? this._currentDrawer.name : null
        };
    }

    // Iterator pattern for teams
    [Symbol.iterator]() {
        let teams = Array.from(this._teams.values());
        let index = 0;
        
        return {
            next() {
                if (index < teams.length) {
                    return { value: teams[index++], done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
}

module.exports = Game;
