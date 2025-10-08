# Draw It Or Lose It - API Documentation

## Overview

This document describes the REST API and WebSocket endpoints for the Draw It Or Lose It game, demonstrating CS 230 backend integration with the Singleton pattern.

## Base URL
```
http://localhost:3000/api
```

## REST API Endpoints

### Health Check
```http
GET /api/health
```
**Description**: Check server health and game service status

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "gameService": "initialized"
}
```

### Game Statistics
```http
GET /api/stats
```
**Description**: Get game service statistics

**Response**:
```json
{
  "isInitialized": true,
  "hasActiveGame": true,
  "totalGamesPlayed": 5,
  "uniqueNamesCount": 12,
  "currentGameInfo": {
    "id": "game_123",
    "name": "My Game",
    "gameState": "playing",
    "teamCount": 2,
    "playerCount": 4,
    "currentRound": 3,
    "maxRounds": 10,
    "currentDrawer": "Alice"
  }
}
```

### Create Game
```http
POST /api/games
```
**Description**: Create a new game (Singleton pattern ensures only one active game)

**Request Body**:
```json
{
  "name": "My Awesome Game",
  "options": {
    "maxTeams": 4,
    "maxPlayersPerTeam": 6
  }
}
```

**Response**:
```json
{
  "success": true,
  "game": {
    "id": "game_123",
    "name": "My Awesome Game",
    "teams": [],
    "players": [],
    "gameState": "waiting",
    "currentRound": 0,
    "maxRounds": 10,
    "currentWord": null,
    "currentDrawer": null,
    "gameSettings": {
      "allowSpectators": true,
      "enableChat": true,
      "showScores": true
    }
  }
}
```

**Error Response**:
```json
{
  "error": "Game name must be unique"
}
```

### Get Current Game
```http
GET /api/games/current
```
**Description**: Get the current active game

**Response**:
```json
{
  "id": "game_123",
  "name": "My Awesome Game",
  "teams": [
    {
      "id": "team_1",
      "name": "Team Alpha",
      "playerCount": 2,
      "players": [...],
      "score": 150,
      "color": "#4ECDC4",
      "isActive": true,
      "isReady": true
    }
  ],
  "players": [...],
  "gameState": "playing",
  "currentRound": 3,
  "maxRounds": 10,
  "currentWord": "cat",
  "currentDrawer": {
    "id": "player_1",
    "name": "Alice",
    "teamId": "team_1",
    "score": 50,
    "isDrawing": true,
    "isReady": true
  },
  "gameSettings": {...}
}
```

**Error Response**:
```json
{
  "error": "No active game"
}
```

### End Current Game
```http
DELETE /api/games/current
```
**Description**: End the current game and archive it

**Response**:
```json
{
  "success": true,
  "game": {
    "id": "game_123",
    "name": "My Awesome Game",
    "gameState": "finished",
    ...
  }
}
```

### Validate Name Uniqueness
```http
POST /api/validate/name
```
**Description**: Check if a name is unique across all entities

**Request Body**:
```json
{
  "name": "My Team Name"
}
```

**Response**:
```json
{
  "isUnique": true
}
```

### Get Game History
```http
GET /api/games/history
```
**Description**: Get history of completed games

**Response**:
```json
[
  {
    "game": {
      "id": "game_122",
      "name": "Previous Game",
      "gameState": "finished",
      ...
    },
    "endedAt": "2024-01-01T11:30:00.000Z"
  },
  {
    "game": {
      "id": "game_121",
      "name": "Another Game",
      "gameState": "finished",
      ...
    },
    "endedAt": "2024-01-01T10:15:00.000Z"
  }
]
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3000');
```

### Client → Server Events

#### Create Game
```javascript
socket.emit('createGame', {
  name: 'My Game',
  options: {
    maxTeams: 4,
    maxPlayersPerTeam: 6
  }
});
```

#### Join Game
```javascript
socket.emit('joinGame', {
  playerId: 'player_123',
  playerName: 'Alice',
  teamId: 'team_1'
});
```

#### Drawing Data
```javascript
socket.emit('drawingData', {
  x: 100,
  y: 150,
  color: '#FF0000',
  brushSize: 5,
  action: 'draw' // 'draw', 'start', 'end'
});
```

#### Game Actions
```javascript
// Start game
socket.emit('startGame');

// Pause game
socket.emit('pauseGame');

// End game
socket.emit('endGame');
```

### Server → Client Events

#### Game Created
```javascript
socket.on('gameCreated', (data) => {
  if (data.success) {
    console.log('Game created:', data.game);
  }
});
```

#### Game Updated
```javascript
socket.on('gameUpdated', (data) => {
  console.log('Game state updated:', data.game);
  // Update UI with new game state
});
```

#### Player Joined
```javascript
socket.on('playerJoined', (data) => {
  if (data.success) {
    console.log('Player joined:', data.player);
  }
});
```

#### Drawing Update
```javascript
socket.on('drawingUpdate', (data) => {
  // Update canvas with drawing data from other players
  updateCanvas(data.drawingData);
});
```

#### Game Ended
```javascript
socket.on('gameEnded', (data) => {
  console.log('Game ended:', data.game);
  // Handle game end
});
```

#### Error Handling
```javascript
socket.on('gameError', (data) => {
  console.error('Game error:', data.error);
  // Show error to user
});
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |

## Common Error Messages

- `"Game name is required"` - Missing game name
- `"Game name must be unique"` - Name already exists
- `"A game is already in progress. Only one game instance allowed."` - Singleton pattern enforcement
- `"No active game"` - No game currently active
- `"Valid name is required"` - Invalid name format
- `"GameService must be initialized first"` - Service not ready

## CS 230 Integration

### Singleton Pattern
- **Enforcement**: Only one game can exist at a time
- **API Impact**: `POST /api/games` fails if game already exists
- **WebSocket**: `createGame` event respects singleton constraint

### Unique Name Validation
- **Scope**: Games, teams, and players
- **API**: `POST /api/validate/name` endpoint
- **Real-time**: Validation on all entity creation

### Real-time Communication
- **WebSocket**: Live updates for all game state changes
- **Drawing**: Real-time canvas synchronization
- **Game State**: Automatic UI updates across all clients

## Usage Examples

### Complete Game Flow

1. **Create Game**
```javascript
const response = await fetch('/api/games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Game',
    options: { maxTeams: 4, maxPlayersPerTeam: 6 }
  })
});
const { game } = await response.json();
```

2. **Connect WebSocket**
```javascript
const socket = io('http://localhost:3000');
socket.emit('createGame', { name: 'My Game', options: {} });
```

3. **Handle Real-time Updates**
```javascript
socket.on('gameUpdated', (data) => {
  updateGameUI(data.game);
});
```

4. **End Game**
```javascript
const response = await fetch('/api/games/current', {
  method: 'DELETE'
});
```

## Testing

### Unit Tests
```bash
npm test
```

### API Testing with curl
```bash
# Health check
curl http://localhost:3000/api/health

# Create game
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Game","options":{}}'

# Get current game
curl http://localhost:3000/api/games/current
```

## Security Considerations

- **Input Validation**: All inputs validated on server
- **CORS**: Configured for development (adjust for production)
- **Rate Limiting**: Consider implementing for production
- **Authentication**: Add for production deployment

## Performance Notes

- **Singleton Pattern**: Prevents memory leaks from multiple game instances
- **WebSocket**: Efficient real-time communication
- **Connection Management**: Automatic cleanup on disconnect
- **Memory Usage**: Drawing history limited to prevent memory issues
