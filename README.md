# 🎓 Student Activities Management System (SAMS) - Backend

Complete backend implementation for managing student activities and events.

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Native Driver)
- **Jest** - Testing framework

## Architecture

- **MVC Architecture** - Model-View-Controller pattern
- **OOP** - Object-Oriented Programming with classes, abstraction, inheritance, and encapsulation
- **Design Patterns**:
  - **Singleton Pattern** - MongoDB connection management
  - **Observer Pattern** - Event-driven notification system

## Features

- Authentication & Authorization (JWT, RBAC)
- Event Management with approval workflow
- Event Registration system
- Notification system (Observer Pattern)
- Admin Analytics Dashboard
- Logging & Auditing
- Automated Backup & Recovery

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure your environment variables.

## Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## API Documentation

See `API_DOCUMENTATION.md` for complete API reference.

## MongoDB Schema

See `MONGODB_SCHEMA.md` for database schema documentation.

## Design Patterns

See `DESIGN_PATTERNS.md` for detailed explanation of implemented patterns.

