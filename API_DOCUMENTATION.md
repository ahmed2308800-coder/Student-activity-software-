# API Documentation

Complete API reference for Student Activities Management System (SAMS) Backend.

**Base URL:** `http://localhost:3000/api`

**Authentication:** Most endpoints require JWT authentication. Include token in header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Description:** Register a new user account
- **Authentication:** Not required
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe",
  "role": "student"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
}
```

### Login
- **POST** `/auth/login`
- **Description:** Authenticate user and get JWT token
- **Authentication:** Not required
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
- **GET** `/auth/me`
- **Description:** Get authenticated user's profile
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

## Event Endpoints

### Get All Events
- **GET** `/events`
- **Description:** Get list of events with optional filters
- **Authentication:** Optional
- **Query Parameters:**
  - `status`: Filter by status (pending, approved, rejected)
  - `category`: Filter by category
  - `search`: Search in title and description
  - `limit`: Limit results
  - `skip`: Skip results (pagination)
- **Response:**
```json
{
  "success": true,
  "data": {
    "events": [...],
    "count": 10
  }
}
```

### Get Event by ID
- **GET** `/events/:id`
- **Description:** Get single event details
- **Authentication:** Optional
- **Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "...",
      "title": "Event Title",
      "description": "...",
      "date": "2024-12-31T00:00:00.000Z",
      "location": { "name": "...", "address": "..." },
      "maxSeats": 50,
      "registrationCount": 10,
      "availableSeats": 40,
      "status": "approved"
    }
  }
}
```

### Create Event
- **POST** `/events`
- **Description:** Create a new event (Club Rep or Admin only)
- **Authentication:** Required
- **Authorization:** Club Representative or Admin
- **Request Body:**
```json
{
  "title": "Event Title",
  "description": "Event description (min 10 chars)",
  "date": "2024-12-31T00:00:00.000Z",
  "location": {
    "name": "Location Name",
    "address": "Address (optional)"
  },
  "maxSeats": 50,
  "category": "sports"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": { "event": {...} }
}
```

### Update Event
- **PUT** `/events/:id`
- **Description:** Update an event (owner or Admin only)
- **Authentication:** Required
- **Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "date": "2024-12-31T00:00:00.000Z",
  "maxSeats": 100
}
```

### Delete Event
- **DELETE** `/events/:id`
- **Description:** Delete an event (owner or Admin only)
- **Authentication:** Required

### Approve Event
- **POST** `/events/:id/approve`
- **Description:** Approve a pending event (Admin only)
- **Authentication:** Required
- **Authorization:** Admin

### Reject Event
- **POST** `/events/:id/reject`
- **Description:** Reject a pending event (Admin only)
- **Authentication:** Required
- **Authorization:** Admin
- **Request Body:**
```json
{
  "reason": "Rejection reason (optional)"
}
```

### Get Pending Events
- **GET** `/events/pending/list`
- **Description:** Get all pending events (Admin only)
- **Authentication:** Required
- **Authorization:** Admin

---

## Registration Endpoints

### Register for Event
- **POST** `/registrations`
- **Description:** Register for an approved event
- **Authentication:** Required
- **Authorization:** Student or higher
- **Request Body:**
```json
{
  "eventId": "507f1f77bcf86cd799439011"
}
```

### Cancel Registration
- **DELETE** `/registrations/:eventId`
- **Description:** Cancel event registration
- **Authentication:** Required
- **Authorization:** Student or higher

### Get My Registrations
- **GET** `/registrations/my-registrations`
- **Description:** Get current user's registrations
- **Authentication:** Required
- **Authorization:** Student or higher

### Get Event Registrations
- **GET** `/registrations/event/:eventId`
- **Description:** Get all registrations for an event (Club Rep or Admin)
- **Authentication:** Required
- **Authorization:** Club Representative or Admin

### Check Registration Status
- **GET** `/registrations/check/:eventId`
- **Description:** Check if user is registered for event
- **Authentication:** Required
- **Authorization:** Student or higher

---

## Notification Endpoints

### Get Notifications
- **GET** `/notifications`
- **Description:** Get user's notifications
- **Authentication:** Required
- **Query Parameters:**
  - `limit`: Limit results (default: 50)
  - `skip`: Skip results
- **Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 5,
    "count": 20
  }
}
```

### Mark Notification as Read
- **PUT** `/notifications/:id/read`
- **Description:** Mark a notification as read
- **Authentication:** Required

### Mark All as Read
- **PUT** `/notifications/read-all`
- **Description:** Mark all user notifications as read
- **Authentication:** Required

---

## Analytics Endpoints (Admin Only)

### Get Dashboard Statistics
- **GET** `/analytics/dashboard`
- **Description:** Get comprehensive dashboard statistics
- **Authentication:** Required
- **Authorization:** Admin
- **Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 100,
      "byRole": { "student": 80, "club_representative": 15, "admin": 5 },
      "breakdown": { ... }
    },
    "events": {
      "total": 50,
      "byStatus": { "pending": 5, "approved": 40, "rejected": 5 },
      "breakdown": { ... }
    },
    "registrations": { "total": 200 },
    "participation": {
      "totalSeats": 1000,
      "totalRegistered": 800,
      "participationRate": 80.0
    }
  }
}
```

### Get Events Statistics
- **GET** `/analytics/events`
- **Description:** Get events-specific statistics
- **Authentication:** Required
- **Authorization:** Admin

### Get Participation Statistics
- **GET** `/analytics/participation`
- **Description:** Get participation statistics
- **Authentication:** Required
- **Authorization:** Admin

---

## Backup Endpoints (Admin Only)

### Create Manual Backup
- **POST** `/backup/create`
- **Description:** Create a manual database backup
- **Authentication:** Required
- **Authorization:** Admin
- **Response:**
```json
{
  "success": true,
  "message": "Backup created successfully",
  "data": {
    "backupPath": "./backups/backup-2024-01-01T00-00-00",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### List Backups
- **GET** `/backup/list`
- **Description:** List all available backups
- **Authentication:** Required
- **Authorization:** Admin

---

## Health Check

### Health Check
- **GET** `/health`
- **Description:** Check API health status
- **Authentication:** Not required
- **Response:**
```json
{
  "success": true,
  "message": "SAMS API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error message"
  }
}
```

**Status Codes:**
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate resources)
- `500` - Internal Server Error

---

## Role-Based Permissions

### Student
- View events
- Register for events
- Cancel own registrations
- View own registrations

### Club Representative
- All student permissions
- Create events
- Edit own events
- Delete own events
- View registrations for own events

### Admin
- All permissions
- Approve/reject events
- View all registrations
- Access analytics
- Manage backups
- View logs

### Guest
- View events only

