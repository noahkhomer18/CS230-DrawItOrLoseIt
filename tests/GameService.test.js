const GameService = require('../src/core/GameService');
const Game = require('../src/entities/Game');
const Team = require('../src/entities/Team');
const Player = require('../src/entities/Player');

/**
 * Test suite for GameService Singleton pattern
 * Demonstrates CS 230 testing principles and Singleton validation
 */
describe('GameService Singleton Pattern Tests', () => {
    let gameService;

    beforeEach(() => {
        // Reset singleton for each test
        GameService._instance = null;
        gameService = GameService.getInstance();
        gameService.initialize();
    });

    afterEach(() => {
        // Clean up after each test
        if (gameService) {
            gameService._reset();
        }
    });

    describe('Singleton Pattern Validation', () => {
        test('should return the same instance when called multiple times', () => {
            const instance1 = GameService.getInstance();
            const instance2 = GameService.getInstance();
            
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(GameService);
        });

        test('should throw error when trying to create new instance with constructor', () => {
            expect(() => {
                new GameService();
            }).toThrow('GameService is a singleton. Use GameService.getInstance()');
        });

        test('should validate singleton pattern is working correctly', () => {
            expect(gameService.validateSingleton()).toBe(true);
        });
    });

    describe('Game Creation and Management', () => {
        test('should create a new game with valid name', () => {
            const game = gameService.createGame('Test Game');
            
            expect(game).toBeInstanceOf(Game);
            expect(game.name).toBe('Test Game');
            expect(gameService.getCurrentGame()).toBe(game);
        });

        test('should throw error when trying to create second game', () => {
            gameService.createGame('First Game');
            
            expect(() => {
                gameService.createGame('Second Game');
            }).toThrow('A game is already in progress. Only one game instance allowed.');
        });

        test('should validate unique game names', () => {
            gameService.createGame('Unique Game');
            gameService.endCurrentGame();
            
            // Should be able to create new game with different name
            const newGame = gameService.createGame('Another Game');
            expect(newGame.name).toBe('Another Game');
        });

        test('should throw error for duplicate game names', () => {
            gameService.createGame('Duplicate Test');
            gameService.endCurrentGame();
            
            expect(() => {
                gameService.createGame('Duplicate Test');
            }).toThrow('Game name must be unique');
        });

        test('should throw error for invalid game names', () => {
            expect(() => {
                gameService.createGame('');
            }).toThrow('Valid game name is required');
            
            expect(() => {
                gameService.createGame(null);
            }).toThrow('Valid game name is required');
        });
    });

    describe('Name Validation and Uniqueness', () => {
        test('should register and validate unique names', () => {
            expect(gameService.isNameUnique('Unique Name')).toBe(true);
            
            gameService.registerUniqueName('Unique Name');
            expect(gameService.isNameUnique('Unique Name')).toBe(false);
        });

        test('should unregister names when entities are deleted', () => {
            gameService.registerUniqueName('Test Name');
            expect(gameService.isNameUnique('Test Name')).toBe(false);
            
            gameService.unregisterUniqueName('Test Name');
            expect(gameService.isNameUnique('Test Name')).toBe(true);
        });

        test('should handle case-insensitive name checking', () => {
            gameService.registerUniqueName('Test Name');
            expect(gameService.isNameUnique('test name')).toBe(false);
            expect(gameService.isNameUnique('TEST NAME')).toBe(false);
        });
    });

    describe('Game Lifecycle Management', () => {
        test('should end current game and archive it', () => {
            const game = gameService.createGame('Lifecycle Test');
            const endedGame = gameService.endCurrentGame();
            
            expect(endedGame).toBe(game);
            expect(gameService.getCurrentGame()).toBeNull();
            expect(gameService.getGameHistory()).toHaveLength(1);
        });

        test('should return null when ending non-existent game', () => {
            const result = gameService.endCurrentGame();
            expect(result).toBeNull();
        });

        test('should track game history correctly', () => {
            gameService.createGame('Game 1');
            gameService.endCurrentGame();
            
            gameService.createGame('Game 2');
            gameService.endCurrentGame();
            
            const history = gameService.getGameHistory();
            expect(history).toHaveLength(2);
            expect(history[0].game.name).toBe('Game 1');
            expect(history[1].game.name).toBe('Game 2');
        });
    });

    describe('Statistics and Monitoring', () => {
        test('should provide accurate statistics', () => {
            const stats = gameService.getStatistics();
            
            expect(stats.isInitialized).toBe(true);
            expect(stats.hasActiveGame).toBe(false);
            expect(stats.totalGamesPlayed).toBe(0);
            expect(stats.uniqueNamesCount).toBe(0);
            expect(stats.currentGameInfo).toBeNull();
        });

        test('should update statistics when game is created', () => {
            gameService.createGame('Stats Test');
            const stats = gameService.getStatistics();
            
            expect(stats.hasActiveGame).toBe(true);
            expect(stats.uniqueNamesCount).toBe(1);
            expect(stats.currentGameInfo).toBeDefined();
            expect(stats.currentGameInfo.name).toBe('Stats Test');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle initialization errors', () => {
            const newService = GameService.getInstance();
            expect(() => {
                newService.initialize();
            }).toThrow('GameService is already initialized');
        });

        test('should handle operations before initialization', () => {
            GameService._instance = null;
            const uninitializedService = GameService.getInstance();
            
            expect(() => {
                uninitializedService.createGame('Test');
            }).toThrow('GameService must be initialized first');
        });

        test('should handle invalid name registration', () => {
            expect(() => {
                gameService.registerUniqueName('');
            }).toThrow('Valid name is required');
            
            expect(() => {
                gameService.registerUniqueName(null);
            }).toThrow('Valid name is required');
        });
    });
});

/**
 * Integration tests demonstrating CS 230 principles in action
 */
describe('CS 230 Integration Tests', () => {
    let gameService;
    let game;

    beforeEach(() => {
        GameService._instance = null;
        gameService = GameService.getInstance();
        gameService.initialize();
        game = gameService.createGame('Integration Test Game');
    });

    afterEach(() => {
        if (gameService) {
            gameService._reset();
        }
    });

    test('should demonstrate Singleton pattern with multiple entities', () => {
        // Create teams and players within the single game instance
        const team1 = game.createTeam('team1', 'Team Alpha');
        const team2 = game.createTeam('team2', 'Team Beta');
        
        const player1 = game.addPlayer('player1', 'Alice', 'team1');
        const player2 = game.addPlayer('player2', 'Bob', 'team1');
        const player3 = game.addPlayer('player3', 'Charlie', 'team2');
        
        // Verify all entities are part of the same game instance
        expect(game.getTeam('team1')).toBe(team1);
        expect(game.getTeam('team2')).toBe(team2);
        expect(game.getPlayer('player1')).toBe(player1);
        expect(game.getPlayer('player2')).toBe(player2);
        expect(game.getPlayer('player3')).toBe(player3);
        
        // Verify team assignments
        expect(player1.teamId).toBe('team1');
        expect(player2.teamId).toBe('team1');
        expect(player3.teamId).toBe('team2');
        
        // Verify only one game instance exists
        expect(gameService.getCurrentGame()).toBe(game);
    });

    test('should demonstrate unique name validation across all entities', () => {
        // Game name is already registered
        expect(gameService.isNameUnique('Integration Test Game')).toBe(false);
        
        // Team names should be unique
        game.createTeam('team1', 'Unique Team');
        expect(gameService.isNameUnique('Unique Team')).toBe(false);
        
        // Player names should be unique
        game.addPlayer('player1', 'Unique Player');
        expect(gameService.isNameUnique('Unique Player')).toBe(false);
    });
});
