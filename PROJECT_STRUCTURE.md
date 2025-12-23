# Project Structure

Complete directory structure of the SAMS backend project.

```
sofff/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection (Singleton Pattern)
│   │   └── constants.js         # Application constants
│   │
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── EventController.js
│   │   ├── RegistrationController.js
│   │   ├── NotificationController.js
│   │   ├── AnalyticsController.js
│   │   └── BackupController.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   ├── authorizationMiddleware.js  # RBAC
│   │   ├── validationMiddleware.js     # Input validation
│   │   └── errorMiddleware.js    # Error handling
│   │
│   ├── models/
│   │   ├── BaseModel.js          # Abstract base model (OOP)
│   │   ├── UserModel.js
│   │   ├── EventModel.js
│   │   ├── RegistrationModel.js
│   │   ├── NotificationModel.js
│   │   └── LogModel.js
│   │
│   ├── notifications/
│   │   └── NotificationObserver.js  # Observer Pattern implementation
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── backupRoutes.js
│   │   └── index.js
│   │
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── EventService.js
│   │   ├── RegistrationService.js
│   │   ├── AnalyticsService.js
│   │   └── LoggingService.js
│   │
│   ├── utils/
│   │   ├── validators.js         # Input validation & sanitization
│   │   ├── errors.js             # Custom error classes
│   │   └── backupScheduler.js    # Backup scheduling
│   │
│   └── server.js                 # Application entry point
│
├── tests/
│   ├── models/
│   │   └── BaseModel.test.js
│   ├── services/
│   │   └── AuthService.test.js
│   ├── utils/
│   │   └── validators.test.js
│   ├── notifications/
│   │   └── NotificationObserver.test.js
│   └── setup.js
│
├── backups/                      # Backup storage directory
│
├── .env.example                  # Environment variables template
├── .gitignore
├── jest.config.js                # Jest configuration
├── package.json
├── README.md
├── API_DOCUMENTATION.md          # Complete API reference
├── MONGODB_SCHEMA.md            # Database schema documentation
├── DESIGN_PATTERNS.md           # Design patterns explanation
└── PROJECT_STRUCTURE.md         # This file
```

## Directory Descriptions

### `/src/config`
Configuration files including database connection (Singleton pattern) and application constants.

### `/src/controllers`
HTTP request handlers. Controllers receive requests, call services, and return responses.

### `/src/middlewares`
Express middleware for authentication, authorization, validation, and error handling.

### `/src/models`
Data access layer. All models extend `BaseModel` (OOP inheritance). Uses MongoDB native driver.

### `/src/notifications`
Observer pattern implementation for event-driven notifications.

### `/src/routes`
Express route definitions with middleware chains.

### `/src/services`
Business logic layer. Services contain the core application logic and call models.

### `/src/utils`
Utility functions for validation, error handling, and backup scheduling.

### `/tests`
Unit tests using Jest. Organized by module type.

## Architecture Flow

```
Request → Routes → Middleware → Controllers → Services → Models → Database
                                                      ↓
                                              Notifications (Observer)
```

## Key Design Decisions

1. **MVC Architecture:** Clear separation of concerns
2. **Service Layer:** Business logic separated from controllers
3. **Model Layer:** Data access abstracted through BaseModel
4. **Middleware Chain:** Reusable authentication and validation
5. **Observer Pattern:** Decoupled notification system
6. **Singleton Pattern:** Single database connection instance

