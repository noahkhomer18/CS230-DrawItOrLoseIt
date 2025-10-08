# 🎨 Draw It Or Lose It
*From CS 230 Assignment to Portfolio Showcase*

> **The Journey:** What started as a software design template for SNHU's CS 230 course has evolved into a full-featured, real-time multiplayer drawing game that showcases modern web development and solid software architecture principles.

## 🌟 The Story Behind This Project

This project began as a software design assignment for CS 230 at Southern New Hampshire University, where I was tasked with designing a multi-platform version of "Draw or Lose It" - a drawing and guessing game. But here's the thing: I didn't want to just *design* the software - I wanted to *build* it.

**The Challenge:** The Gaming Room needed to expand their Android game to work across multiple platforms, with strict requirements for unique game/team names and single game instances. But I saw an opportunity to create something more - a real-time, web-based multiplayer experience that would demonstrate not just good software design, but actual working code.

**The Vision:** Transform a classroom assignment into a portfolio piece that shows both solid software engineering principles and modern web development skills.

## 🎯 What Makes This Special

### **Real-World Problem Solving**
- **Unique Identity Management:** Implemented robust duplicate checking for games, teams, and players
- **Single Instance Control:** Used Singleton pattern to ensure only one game exists at a time
- **Cross-Platform Compatibility:** Built for web with mobile-responsive design

### **Software Architecture Excellence**
- **Object-Oriented Design:** Clean class hierarchy with Entity, Game, Team, and Player classes
- **Design Patterns:** Singleton for game management, Iterator for data traversal
- **Scalability Focus:** Designed to handle multiple users across different platforms
- **Resource Management:** Efficient memory usage and proper encapsulation

### **Modern Web Development**
- **Real-Time Multiplayer:** Live drawing and guessing with WebSocket connections
- **Interactive Canvas:** HTML5 Canvas with smooth drawing experience
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile
- **Turn-Based Gameplay:** Structured rounds with timer and scoring

## 🚀 Technical Implementation

### **Core Architecture**
The foundation of this project follows the original CS 230 design principles:

- **Singleton Pattern:** Game service ensures single game instance
- **Inheritance:** Eliminates code duplication across entity types
- **Encapsulation:** Private methods and proper data hiding
- **Unique Validation:** Comprehensive duplicate checking system

### **Technology Stack**
- **Frontend:** HTML5 Canvas, JavaScript ES6+, Modern CSS3
- **Backend:** Node.js with Socket.io for real-time communication
- **Architecture:** Clean separation of concerns with MVC pattern
- **Testing:** Comprehensive unit and integration tests

## 🎮 Game Features

- **Multi-Team Support:** Multiple teams can compete simultaneously
- **Real-Time Drawing:** Live canvas updates for all players
- **Smart Guessing:** Turn-based guessing with instant feedback
- **Score Tracking:** Automated point calculation and leaderboards
- **Timer System:** Configurable round timing for fair play
- **Mobile Optimized:** Touch-friendly drawing on all devices

## 🏗️ Project Structure

```
CS230-DrawItOrLoseIt/
├── src/
│   ├── core/           # Game logic and Singleton pattern
│   ├── entities/       # Game, Team, Player classes
│   ├── services/       # Business logic and validation
│   └── utils/          # Helper functions and utilities
├── public/
│   ├── js/             # Frontend game logic
│   ├── css/            # Styling and responsive design
│   └── assets/          # Images and game resources
├── tests/              # Comprehensive test suite
└── docs/               # Technical documentation
```

## 🎓 CS 230 Learning Outcomes Demonstrated

This project showcases mastery of key CS 230 concepts:

- **Software Design Patterns:** Singleton, Iterator, and Observer patterns
- **Object-Oriented Principles:** Inheritance, Encapsulation, Polymorphism
- **System Architecture:** Scalable, maintainable code structure
- **Requirements Analysis:** From client needs to technical implementation
- **Documentation:** UML diagrams, technical specifications, and user guides

## 🚀 Getting Started

*Ready to see the game in action? Here's how to get started:*

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Start the server:** `npm run dev`
4. **Open your browser:** Navigate to `http://localhost:3000`
5. **Start playing:** Create a game, invite friends, and start drawing!

## 🔮 Future Vision

This project represents just the beginning. Future enhancements include:
- **AI-Powered Drawing Recognition:** Machine learning for better guess validation
- **Advanced Game Modes:** Custom word lists, themed rounds, tournament brackets
- **Social Features:** Player profiles, friend systems, achievement tracking
- **Mobile App:** Native iOS/Android versions with offline play

## 💡 The Learning Journey

What started as a classroom exercise became a passion project that demonstrates:
- **Problem-Solving Skills:** From requirements to working solution
- **Technical Growth:** From design theory to implementation reality
- **Portfolio Development:** Showcasing both academic excellence and practical skills
- **Continuous Learning:** Each commit represents a step forward in understanding

---

*This project represents the intersection of academic learning and real-world application - proving that great software design isn't just about meeting requirements, but about creating something people actually want to use.*

**Built with ❤️ for CS 230 at SNHU**
