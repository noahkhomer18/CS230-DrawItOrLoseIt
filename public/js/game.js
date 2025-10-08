/**
 * Main Game Logic for Draw It Or Lose It
 * Demonstrates CS 230 principles: Singleton pattern, OOP, and real-time functionality
 */

class GameController {
    constructor() {
        this.gameService = null;
        this.currentGame = null;
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.brushSize = 3;
        this.drawingHistory = [];
        this.historyIndex = -1;
        
        this.initializeGame();
        this.bindEvents();
    }

    /**
     * Initialize the game service and UI
     */
    initializeGame() {
        try {
            // In a real implementation, this would connect to the backend
            // For now, we'll simulate the game service
            this.gameService = {
                createGame: (name, options) => this.simulateCreateGame(name, options),
                getCurrentGame: () => this.currentGame,
                endCurrentGame: () => this.simulateEndGame(),
                isNameUnique: (name) => this.simulateNameCheck(name)
            };
            
            this.updateGameState();
            console.log('Game Controller initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    /**
     * Bind event listeners for user interactions
     */
    bindEvents() {
        // Game creation form
        const createGameForm = document.getElementById('createGameForm');
        if (createGameForm) {
            createGameForm.addEventListener('submit', (e) => this.handleCreateGame(e));
        }

        // Team management
        const addTeamBtn = document.getElementById('addTeamBtn');
        if (addTeamBtn) {
            addTeamBtn.addEventListener('click', () => this.showTeamModal());
        }

        // Player management
        const addPlayerBtn = document.getElementById('addPlayerBtn');
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => this.showPlayerModal());
        }

        // Game controls
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGame());
        }

        const pauseGameBtn = document.getElementById('pauseGameBtn');
        if (pauseGameBtn) {
            pauseGameBtn.addEventListener('click', () => this.pauseGame());
        }

        const endGameBtn = document.getElementById('endGameBtn');
        if (endGameBtn) {
            endGameBtn.addEventListener('click', () => this.endGame());
        }

        const nextRoundBtn = document.getElementById('nextRoundBtn');
        if (nextRoundBtn) {
            nextRoundBtn.addEventListener('click', () => this.nextRound());
        }

        // Modal events
        this.bindModalEvents();
    }

    /**
     * Handle game creation form submission
     */
    handleCreateGame(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const gameName = formData.get('gameName').trim();
        const maxTeams = parseInt(formData.get('maxTeams'));
        const maxPlayers = parseInt(formData.get('maxPlayers'));

        // Validate game name
        if (!this.validateGameName(gameName)) {
            this.showError('Please enter a valid game name (2-50 characters, unique)');
            return;
        }

        try {
            const game = this.gameService.createGame(gameName, {
                maxTeams,
                maxPlayersPerTeam: maxPlayers
            });

            this.currentGame = game;
            this.updateGameState();
            this.showSuccess(`Game "${gameName}" created successfully!`);
            
            // Show team management section
            this.showSection('teamManagement');
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Validate game name according to CS 230 requirements
     */
    validateGameName(name) {
        if (!name || typeof name !== 'string') return false;
        if (name.length < 2 || name.length > 50) return false;
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) return false;
        return this.gameService.isNameUnique(name);
    }

    /**
     * Start the game
     */
    startGame() {
        if (!this.currentGame) {
            this.showError('No active game to start');
            return;
        }

        try {
            this.currentGame.startGame();
            this.updateGameState();
            this.showSection('gameCanvas');
            this.showSection('gameControls');
            this.showSuccess('Game started! Begin drawing!');
            
            // Set a random word for demonstration
            const words = ['cat', 'house', 'tree', 'car', 'sun', 'mountain', 'river', 'bird'];
            const randomWord = words[Math.floor(Math.random() * words.length)];
            this.setCurrentWord(randomWord);
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Pause the game
     */
    pauseGame() {
        if (!this.currentGame) return;

        try {
            this.currentGame.pauseGame();
            this.updateGameState();
            this.showSuccess('Game paused');
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * End the current game
     */
    endGame() {
        if (!this.currentGame) return;

        if (confirm('Are you sure you want to end the current game?')) {
            try {
                this.gameService.endCurrentGame();
                this.currentGame = null;
                this.updateGameState();
                this.hideAllSections();
                this.showSuccess('Game ended successfully');
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    /**
     * Advance to next round
     */
    nextRound() {
        if (!this.currentGame) return;

        try {
            this.currentGame.nextRound();
            this.updateGameState();
            
            // Set new random word
            const words = ['cat', 'house', 'tree', 'car', 'sun', 'mountain', 'river', 'bird'];
            const randomWord = words[Math.floor(Math.random() * words.length)];
            this.setCurrentWord(randomWord);
            
            this.showSuccess('Round advanced! New word selected.');
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Set the current word to draw
     */
    setCurrentWord(word) {
        if (!this.currentGame) return;

        this.currentGame.setCurrentWord(word);
        const wordDisplay = document.getElementById('currentWord');
        const wordContainer = document.getElementById('currentWordDisplay');
        
        if (wordDisplay) wordDisplay.textContent = word;
        if (wordContainer) wordContainer.style.display = 'block';
    }

    /**
     * Update the game state display
     */
    updateGameState() {
        const gameNameEl = document.getElementById('currentGameName');
        const gameStatusEl = document.getElementById('gameStatus');
        const teamCountEl = document.getElementById('teamCount');
        const playerCountEl = document.getElementById('playerCount');
        const currentRoundEl = document.getElementById('currentRound');

        if (this.currentGame) {
            if (gameNameEl) gameNameEl.textContent = this.currentGame.name;
            if (gameStatusEl) gameStatusEl.textContent = this.getGameStatusText();
            if (teamCountEl) teamCountEl.textContent = this.currentGame.teams.length;
            if (playerCountEl) playerCountEl.textContent = this.currentGame.players.length;
            if (currentRoundEl) {
                currentRoundEl.textContent = `${this.currentGame.currentRound}/${this.currentGame.maxRounds}`;
            }
        } else {
            if (gameNameEl) gameNameEl.textContent = 'No Active Game';
            if (gameStatusEl) gameStatusEl.textContent = 'Waiting for players';
            if (teamCountEl) teamCountEl.textContent = '0';
            if (playerCountEl) playerCountEl.textContent = '0';
            if (currentRoundEl) currentRoundEl.textContent = '0/10';
        }
    }

    /**
     * Get human-readable game status
     */
    getGameStatusText() {
        if (!this.currentGame) return 'No game';
        
        const statusMap = {
            'waiting': 'Waiting for players',
            'playing': 'Game in progress',
            'paused': 'Game paused',
            'finished': 'Game finished'
        };
        
        return statusMap[this.currentGame.gameState] || 'Unknown status';
    }

    /**
     * Show a specific section
     */
    showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            section.classList.add('fade-in');
        }
    }

    /**
     * Hide all game sections
     */
    hideAllSections() {
        const sections = ['teamManagement', 'playerManagement', 'gameCanvas', 'gameControls', 'gameStats'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }

    /**
     * Show team creation modal
     */
    showTeamModal() {
        const modal = document.getElementById('teamModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    /**
     * Show player creation modal
     */
    showPlayerModal() {
        const modal = document.getElementById('playerModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    /**
     * Bind modal events
     */
    bindModalEvents() {
        // Close modals when clicking X
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Team form submission
        const teamForm = document.getElementById('teamForm');
        if (teamForm) {
            teamForm.addEventListener('submit', (e) => this.handleCreateTeam(e));
        }

        // Player form submission
        const playerForm = document.getElementById('playerForm');
        if (playerForm) {
            playerForm.addEventListener('submit', (e) => this.handleCreatePlayer(e));
        }
    }

    /**
     * Handle team creation
     */
    handleCreateTeam(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const teamName = formData.get('teamName').trim();
        const teamColor = formData.get('teamColor');

        if (!this.validateGameName(teamName)) {
            this.showError('Please enter a valid team name');
            return;
        }

        try {
            // Simulate team creation
            const team = {
                id: 'team_' + Date.now(),
                name: teamName,
                color: teamColor,
                players: []
            };

            this.currentGame.teams.push(team);
            this.updateGameState();
            this.showSuccess(`Team "${teamName}" created successfully!`);
            
            // Close modal
            document.getElementById('teamModal').style.display = 'none';
            event.target.reset();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Handle player creation
     */
    handleCreatePlayer(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const playerName = formData.get('playerName').trim();
        const teamId = formData.get('playerTeam');

        if (!this.validateGameName(playerName)) {
            this.showError('Please enter a valid player name');
            return;
        }

        try {
            // Simulate player creation
            const player = {
                id: 'player_' + Date.now(),
                name: playerName,
                teamId: teamId || null,
                score: 0,
                isDrawing: false,
                isReady: false
            };

            this.currentGame.players.push(player);
            this.updateGameState();
            this.showSuccess(`Player "${playerName}" added successfully!`);
            
            // Close modal
            document.getElementById('playerModal').style.display = 'none';
            event.target.reset();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;

        if (type === 'success') {
            notification.style.background = '#96CEB4';
        } else if (type === 'error') {
            notification.style.background = '#FF6B6B';
        } else {
            notification.style.background = '#45B7D1';
        }

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Simulate game service methods for demonstration
     */
    simulateCreateGame(name, options) {
        if (!this.gameService.isNameUnique(name)) {
            throw new Error('Game name must be unique');
        }
        
        return {
            id: 'game_' + Date.now(),
            name: name,
            teams: [],
            players: [],
            gameState: 'waiting',
            currentRound: 0,
            maxRounds: 10,
            startGame: function() { this.gameState = 'playing'; this.currentRound = 1; },
            pauseGame: function() { this.gameState = 'paused'; },
            endGame: function() { this.gameState = 'finished'; },
            nextRound: function() { this.currentRound++; },
            setCurrentWord: function(word) { this.currentWord = word; }
        };
    }

    simulateEndGame() {
        const game = this.currentGame;
        this.currentGame = null;
        return game;
    }

    simulateNameCheck(name) {
        // Simple simulation - in real app, this would check against database
        return true;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
    console.log('Draw It Or Lose It - CS 230 Portfolio Project Loaded');
});
