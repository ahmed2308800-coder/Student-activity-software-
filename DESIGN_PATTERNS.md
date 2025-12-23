# Design Patterns Documentation

This document explains the design patterns implemented in the SAMS backend system.

## 1. Singleton Pattern

### Purpose
Ensure only one instance of the MySQL database connection pool exists throughout the application lifecycle.

### Implementation
**Location:** `src/config/database.js`

### How It Works

```javascript
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    // ... initialization
    Database.instance = this;
  }
}
```

### Key Features:
1. **Single Instance:** The constructor checks if an instance already exists and returns it if found.
2. **Lazy Initialization:** Connection is established only when `connect()` is called.
3. **Global Access:** The same instance is used across all modules.

### Benefits:
- **Resource Efficiency:** Prevents multiple database connections
- **Consistency:** Ensures all parts of the application use the same connection
- **Performance:** Reuses existing connection instead of creating new ones
- **Memory Management:** Single connection reduces memory footprint

### Usage:
```javascript
const database = require('./config/database');
await database.connect();
const pool = database.getPool();
```

### Why Singleton for Database?
- Database connections are expensive to create
- Multiple connections can cause connection pool exhaustion
- Ensures connection state is consistent across the application
- Simplifies connection management and cleanup

---

## 2. Observer Pattern

### Purpose
Implement an event-driven notification system where multiple observers are notified when events occur.

### Implementation
**Location:** `src/notifications/NotificationObserver.js`

### Architecture

```
Subject (NotificationSubject)
    ↓
    ├── Observer 1 (DatabaseNotificationObserver)
    ├── Observer 2 (EmailNotificationObserver)
    └── Observer N (Custom Observers)
```

### Components:

#### 1. Abstract Observer Class
```javascript
class NotificationObserver {
  update(notificationData) {
    throw new Error('update() method must be implemented');
  }
}
```

#### 2. Concrete Observers

**DatabaseNotificationObserver:**
- Saves notifications to MySQL
- Ensures notifications persist for later retrieval

**EmailNotificationObserver:**
- Sends email notifications (placeholder for future implementation)
- Can be extended to send SMS, push notifications, etc.

#### 3. Subject (NotificationSubject)
- Extends Node.js EventEmitter
- Manages list of observers
- Notifies all observers when events occur

### How It Works:

1. **Registration:** Observers are attached to the subject
2. **Event Occurrence:** When an event happens (e.g., event approved), `notify()` is called
3. **Notification:** All registered observers receive the notification
4. **Processing:** Each observer processes the notification independently

### Example Usage:

```javascript
const notificationSubject = require('./notifications/NotificationObserver');

// When event is approved
await notificationSubject.notifyEventApproved(event, userId);

// This automatically:
// 1. Saves notification to database (DatabaseNotificationObserver)
// 2. Sends email (EmailNotificationObserver)
// 3. Can trigger other observers
```

### Benefits:
- **Decoupling:** Event source doesn't need to know about all notification mechanisms
- **Extensibility:** Easy to add new notification types (SMS, Push, etc.)
- **Flexibility:** Observers can be added/removed at runtime
- **Separation of Concerns:** Each observer handles one type of notification

### Real-World Application:

**Event Flow:**
1. Admin approves an event
2. `EventService.approveEvent()` calls `notificationSubject.notifyEventApproved()`
3. Subject notifies all observers:
   - Database observer saves notification
   - Email observer sends confirmation email
   - (Future) SMS observer sends text message
4. Event creator receives notification in their dashboard

### Extensibility:

To add a new notification type:

```javascript
class SMSNotificationObserver extends NotificationObserver {
  async update(notificationData) {
    // Send SMS
  }
}

// Attach to subject
notificationSubject.attach(new SMSNotificationObserver());
```

---

## Additional OOP Principles

### Abstraction
- **BaseModel:** Abstract class that defines common database operations
- **NotificationObserver:** Abstract class defining observer interface
- Concrete classes extend these abstractions

### Inheritance
- All models inherit from `BaseModel`
- All observers inherit from `NotificationObserver`
- Shared functionality is defined in base classes

### Encapsulation
- Private methods and properties in classes
- Services encapsulate business logic
- Models encapsulate data access

### Polymorphism
- Different observers implement `update()` differently
- Models override base methods for specific behavior

---

## SOLID Principles

### Single Responsibility Principle (SRP)
- Each service handles one domain (AuthService, EventService, etc.)
- Each controller handles one resource
- Each model handles one collection

### Open/Closed Principle (OCP)
- Base classes are open for extension, closed for modification
- New observers can be added without changing existing code
- New models can extend BaseModel without modifying it

### Liskov Substitution Principle (LSP)
- Any observer can be substituted for another
- All models can be used interchangeably with BaseModel methods

### Interface Segregation Principle (ISP)
- Controllers only depend on services they need
- Middleware is split into focused modules

### Dependency Inversion Principle (DIP)
- High-level modules (controllers) depend on abstractions (services)
- Services depend on model abstractions
- Dependency injection through module exports

---

## Summary

The SAMS backend implements:

1. **Singleton Pattern** for database connection management
2. **Observer Pattern** for event-driven notifications
3. **OOP Principles** throughout the codebase
4. **SOLID Principles** for maintainable, scalable code

These patterns ensure:
- ✅ Efficient resource usage
- ✅ Loose coupling between components
- ✅ Easy extensibility
- ✅ Clean, maintainable code
- ✅ Testability

