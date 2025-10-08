# Draw It Or Lose It - Software Architecture Documentation

## CS 230 Design Patterns and Principles Implementation

This document outlines the software architecture of the Draw It Or Lose It game, demonstrating the implementation of CS 230 design patterns and object-oriented principles.

## Architecture Overview

### Core Design Patterns

#### 1. Singleton Pattern
- **Implementation**: `GameService` class
- **Purpose**: Ensures only one game instance exists at a time
- **CS 230 Requirement**: Single game instance management
- **Benefits**: Resource efficiency, centralized game state control

#### 2. Iterator Pattern
- **Implementation**: `Team` and `Game` classes with `[Symbol.iterator]()` methods
- **Purpose**: Traverse collections of teams and players
- **CS 230 Requirement**: Data structure traversal
- **Benefits**: Consistent iteration interface, encapsulation of traversal logic

#### 3. Observer Pattern (Implicit)
- **Implementation**: Event-driven architecture with Socket.io
- **Purpose**: Real-time updates between clients and server
- **Benefits**: Loose coupling, scalable communication

### Object-Oriented Principles

#### 1. Inheritance
- **Base Class**: `Entity` (abstract base class)
- **Derived Classes**: `Game`, `Team`, `Player`
- **Benefits**: Code reuse, consistent interface, polymorphism

#### 2. Encapsulation
- **Private Properties**: All classes use `_` prefix for private members
- **Public Methods**: Controlled access through getters and methods
- **Benefits**: Data protection, controlled state modification

#### 3. Polymorphism
- **Method Overriding**: `getType()` method in each entity class
- **Interface Consistency**: All entities implement common methods
- **Benefits**: Flexible object handling, extensibility

## Class Hierarchy

```
Entity (Abstract Base Class)
├── Game
│   ├── Manages game state and lifecycle
│   ├── Contains teams and players
│   └── Implements Iterator pattern
├── Team
│   ├── Manages team members
│   ├── Handles team scoring
│   └── Implements Iterator pattern
└── Player
    ├── Individual player state
    ├── Drawing and guessing capabilities
    └── Score tracking
```

## Service Layer

### GameService (Singleton)
- **Responsibility**: Game instance management
- **Pattern**: Singleton
- **Key Methods**:
  - `createGame(name, options)`
  - `getCurrentGame()`
  - `endCurrentGame()`
  - `isNameUnique(name)`

### NameValidator (Utility)
- **Responsibility**: Name validation and uniqueness checking
- **Pattern**: Utility Class
- **Key Methods**:
  - `validateName(name, type)`
  - `areNamesEquivalent(name1, name2)`
  - `generateUniqueName(baseName, existingNames)`

## Frontend Architecture

### GameController
- **Responsibility**: Game logic coordination
- **Pattern**: Controller
- **Integration**: Connects UI with game service

### CanvasController
- **Responsibility**: Drawing functionality
- **Pattern**: Controller
- **Features**: Touch/mouse support, undo/redo, export

### UIController
- **Responsibility**: User interface management
- **Pattern**: Controller
- **Features**: Form validation, notifications, responsive design

## Backend Architecture

### GameServer
- **Framework**: Express.js with Socket.io
- **Pattern**: Server Controller
- **Features**: REST API, WebSocket communication, client management

## Data Flow

1. **Game Creation**: Client → GameController → GameService → Game Entity
2. **Team Management**: Client → GameController → Game Entity → Team Entity
3. **Player Management**: Client → GameController → Game Entity → Player Entity
4. **Real-time Drawing**: Client → CanvasController → Socket.io → Other Clients
5. **Game State Updates**: GameService → Socket.io → All Connected Clients

## CS 230 Requirements Fulfillment

### 1. Unique Name Validation
- **Implementation**: `NameValidator` utility class
- **Scope**: Games, teams, and players
- **Validation Rules**: Length, characters, uniqueness, reserved words

### 2. Single Game Instance
- **Implementation**: `GameService` Singleton pattern
- **Enforcement**: Constructor protection, static instance management
- **Benefits**: Memory efficiency, state consistency

### 3. Cross-Platform Support
- **Frontend**: Responsive design, touch support
- **Backend**: REST API, WebSocket communication
- **Compatibility**: Desktop, tablet, mobile browsers

### 4. Scalability Considerations
- **Real-time Communication**: Socket.io for live updates
- **Client Management**: Connection tracking and cleanup
- **Resource Management**: Singleton pattern prevents memory leaks

## Security Considerations

### Input Validation
- **Client-side**: Real-time validation with visual feedback
- **Server-side**: Comprehensive validation in API endpoints
- **Sanitization**: XSS prevention, input sanitization

### Data Protection
- **Encapsulation**: Private properties with controlled access
- **Validation**: All inputs validated before processing
- **Error Handling**: Graceful error handling and user feedback

## Performance Optimizations

### Frontend
- **Canvas Optimization**: Efficient drawing with minimal redraws
- **Event Handling**: Debounced input validation
- **Memory Management**: Drawing history limits, cleanup on disconnect

### Backend
- **Singleton Pattern**: Single game service instance
- **Connection Management**: Efficient client tracking
- **Data Serialization**: Optimized JSON responses

## Testing Strategy

### Unit Tests
- **GameService**: Singleton pattern validation
- **Entity Classes**: Inheritance and encapsulation
- **NameValidator**: Validation logic coverage

### Integration Tests
- **Game Lifecycle**: Create, start, pause, end
- **Real-time Communication**: Socket.io message handling
- **API Endpoints**: REST API functionality

### End-to-End Tests
- **User Workflows**: Complete game scenarios
- **Cross-Platform**: Different device testing
- **Performance**: Load testing with multiple clients

## Future Enhancements

### Technical Improvements
- **Database Integration**: Persistent game storage
- **Authentication**: User accounts and sessions
- **Caching**: Redis for improved performance

### Feature Additions
- **AI Integration**: Drawing recognition
- **Advanced Game Modes**: Tournament brackets
- **Social Features**: Player profiles, achievements

## Conclusion

This architecture successfully implements all CS 230 requirements while providing a scalable, maintainable foundation for a real-time multiplayer drawing game. The use of established design patterns ensures code quality and demonstrates mastery of software engineering principles.

The project showcases:
- **Solid Architecture**: Clean separation of concerns
- **Design Patterns**: Singleton, Iterator, Observer
- **OOP Principles**: Inheritance, Encapsulation, Polymorphism
- **Real-world Application**: Functional multiplayer game
- **Portfolio Quality**: Professional code and documentation
