/**
 * UI Controller for Draw It Or Lose It
 * Manages user interface interactions and state synchronization
 */

class UIController {
    constructor() {
        this.gameController = null;
        this.canvasController = null;
        this.currentSection = 'gameCreation';
        this.notifications = [];
        
        this.initializeUI();
        this.bindUIEvents();
    }

    /**
     * Initialize UI components and state
     */
    initializeUI() {
        this.setupNotifications();
        this.setupModals();
        this.setupResponsiveHandlers();
        this.updateUI();
    }

    /**
     * Bind UI event listeners
     */
    bindUIEvents() {
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Form validation
        this.bindFormValidation();

        // Modal management
        this.bindModalEvents();

        // Section navigation
        this.bindSectionEvents();
    }

    /**
     * Setup notification system
     */
    setupNotifications() {
        // Create notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
    }

    /**
     * Setup modal system
     */
    setupModals() {
        // Add modal backdrop click handlers
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    /**
     * Setup responsive handlers
     */
    setupResponsiveHandlers() {
        // Handle mobile viewport changes
        const handleViewportChange = () => {
            const isMobile = window.innerWidth <= 768;
            document.body.classList.toggle('mobile-view', isMobile);
            
            // Resize canvas if it exists
            if (window.canvasController) {
                window.canvasController.resizeCanvas();
            }
        };

        window.addEventListener('resize', handleViewportChange);
        handleViewportChange(); // Initial call
    }

    /**
     * Bind form validation events
     */
    bindFormValidation() {
        // Real-time validation for game name
        const gameNameInput = document.getElementById('gameName');
        if (gameNameInput) {
            gameNameInput.addEventListener('input', (e) => {
                this.validateGameName(e.target.value);
            });
        }

        // Real-time validation for team name
        const teamNameInput = document.getElementById('teamName');
        if (teamNameInput) {
            teamNameInput.addEventListener('input', (e) => {
                this.validateTeamName(e.target.value);
            });
        }

        // Real-time validation for player name
        const playerNameInput = document.getElementById('playerName');
        if (playerNameInput) {
            playerNameInput.addEventListener('input', (e) => {
                this.validatePlayerName(e.target.value);
            });
        }
    }

    /**
     * Bind modal events
     */
    bindModalEvents() {
        // Close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * Bind section navigation events
     */
    bindSectionEvents() {
        // Add section transition animations
        const sections = document.querySelectorAll('[id$="Management"], [id$="Canvas"], [id$="Controls"]');
        sections.forEach(section => {
            section.style.transition = 'all 0.3s ease';
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Resize canvas if it exists
        if (window.canvasController) {
            window.canvasController.resizeCanvas();
        }

        // Update responsive classes
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        
        document.body.classList.toggle('mobile-view', isMobile);
        document.body.classList.toggle('tablet-view', isTablet);
    }

    /**
     * Handle before page unload
     */
    handleBeforeUnload(e) {
        if (window.gameController && window.gameController.currentGame) {
            const message = 'You have an active game. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Ctrl/Cmd + S to save canvas
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (window.canvasController) {
                window.canvasController.exportCanvas();
            }
        }

        // Ctrl/Cmd + Z to undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (window.canvasController) {
                window.canvasController.undoLast();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    /**
     * Validate game name in real-time
     */
    validateGameName(name) {
        const input = document.getElementById('gameName');
        if (!input) return;

        const isValid = this.isValidName(name);
        this.updateInputValidation(input, isValid);
        
        if (!isValid && name.length > 0) {
            this.showInputError(input, 'Game name must be 2-50 characters, unique, and contain only letters, numbers, spaces, hyphens, and underscores');
        }
    }

    /**
     * Validate team name in real-time
     */
    validateTeamName(name) {
        const input = document.getElementById('teamName');
        if (!input) return;

        const isValid = this.isValidName(name);
        this.updateInputValidation(input, isValid);
    }

    /**
     * Validate player name in real-time
     */
    validatePlayerName(name) {
        const input = document.getElementById('playerName');
        if (!input) return;

        const isValid = this.isValidName(name);
        this.updateInputValidation(input, isValid);
    }

    /**
     * Check if name is valid according to CS 230 requirements
     */
    isValidName(name) {
        if (!name || typeof name !== 'string') return false;
        if (name.length < 2 || name.length > 50) return false;
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) return false;
        if (/[\s\-_]{2,}/.test(name)) return false;
        if (/^[\s\-_]|[\s\-_]$/.test(name)) return false;
        return true;
    }

    /**
     * Update input validation styling
     */
    updateInputValidation(input, isValid) {
        input.classList.toggle('valid', isValid);
        input.classList.toggle('invalid', !isValid);
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }
    }

    /**
     * Show input error message
     */
    showInputError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #FF6B6B;
            font-size: 0.85rem;
            margin-top: 5px;
        `;
        
        input.parentNode.appendChild(errorDiv);
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('fade-in');
            
            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * Close modal
     */
    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('fade-in');
            
            // Reset forms
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.closeModal(modal);
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style based on type
        const colors = {
            success: '#96CEB4',
            error: '#FF6B6B',
            warning: '#FFEAA7',
            info: '#45B7D1'
        };
        
        notification.style.cssText = `
            background: ${colors[type] || colors.info};
            color: ${type === 'warning' ? '#2C3E50' : 'white'};
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.appendChild(notification);
            
            // Auto remove after duration
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'fadeOut 0.3s ease-out';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    }

    /**
     * Update UI based on current state
     */
    updateUI() {
        this.updateGameState();
        this.updateNavigation();
        this.updateButtons();
    }

    /**
     * Update game state display
     */
    updateGameState() {
        if (!window.gameController) return;

        const game = window.gameController.currentGame;
        const gameStateEl = document.getElementById('gameStatus');
        
        if (gameStateEl) {
            if (game) {
                gameStateEl.textContent = this.getGameStatusText(game.gameState);
                gameStateEl.className = `game-status status-${game.gameState}`;
            } else {
                gameStateEl.textContent = 'No active game';
                gameStateEl.className = 'game-status status-none';
            }
        }
    }

    /**
     * Get human-readable game status
     */
    getGameStatusText(status) {
        const statusMap = {
            'waiting': 'Waiting for players',
            'playing': 'Game in progress',
            'paused': 'Game paused',
            'finished': 'Game finished'
        };
        return statusMap[status] || 'Unknown status';
    }

    /**
     * Update navigation state
     */
    updateNavigation() {
        // Update active section indicators
        const sections = ['gameCreation', 'teamManagement', 'playerManagement', 'gameCanvas', 'gameControls'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const isActive = section.style.display !== 'none';
                section.classList.toggle('active', isActive);
            }
        });
    }

    /**
     * Update button states
     */
    updateButtons() {
        if (!window.gameController) return;

        const game = window.gameController.currentGame;
        const startBtn = document.getElementById('startGameBtn');
        const pauseBtn = document.getElementById('pauseGameBtn');
        const endBtn = document.getElementById('endGameBtn');
        const nextRoundBtn = document.getElementById('nextRoundBtn');

        if (game) {
            if (startBtn) {
                startBtn.disabled = game.gameState !== 'waiting';
                startBtn.textContent = game.gameState === 'waiting' ? 'Start Game' : 'Game Started';
            }
            
            if (pauseBtn) {
                pauseBtn.disabled = game.gameState !== 'playing';
                pauseBtn.textContent = game.gameState === 'paused' ? 'Resume Game' : 'Pause Game';
            }
            
            if (endBtn) {
                endBtn.disabled = false;
            }
            
            if (nextRoundBtn) {
                nextRoundBtn.disabled = game.gameState !== 'playing';
            }
        } else {
            [startBtn, pauseBtn, endBtn, nextRoundBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = true;
                }
            });
        }
    }

    /**
     * Show loading state
     */
    showLoading(element, message = 'Loading...') {
        if (element) {
            element.classList.add('loading');
            element.dataset.originalText = element.textContent;
            element.textContent = message;
        }
    }

    /**
     * Hide loading state
     */
    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
                delete element.dataset.originalText;
            }
        }
    }

    /**
     * Update team dropdown in player modal
     */
    updateTeamDropdown() {
        const teamSelect = document.getElementById('playerTeam');
        if (!teamSelect || !window.gameController || !window.gameController.currentGame) return;

        // Clear existing options
        teamSelect.innerHTML = '<option value="">Select a team</option>';
        
        // Add team options
        window.gameController.currentGame.teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
    }

    /**
     * Initialize UI controller
     */
    initialize() {
        // Wait for other controllers to be ready
        const checkControllers = () => {
            if (window.gameController && window.canvasController) {
                this.gameController = window.gameController;
                this.canvasController = window.canvasController;
                this.updateUI();
                console.log('UI Controller initialized successfully');
            } else {
                setTimeout(checkControllers, 100);
            }
        };
        
        checkControllers();
    }
}

// Initialize UI controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiController = new UIController();
    window.uiController.initialize();
    console.log('UI Controller loaded');
});
