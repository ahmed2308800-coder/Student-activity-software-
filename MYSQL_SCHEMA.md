# MySQL Schema Documentation

This document describes the MySQL database schema for the Student Activities Management System (SAMS), migrated from MongoDB.

## Database: sams_db

**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci

---

## Tables

### 1. users

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | User ID |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| name | VARCHAR(255) | NOT NULL, DEFAULT '' | User full name |
| role | ENUM | NOT NULL, DEFAULT 'student' | User role: 'student', 'club_representative', 'admin', 'guest' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (email)
- INDEX (role)

**Relationships:**
- Referenced by: `events.created_by`, `registrations.user_id`, `notifications.user_id`, `logs.user_id`, `guests.invited_by`, `attendances.user_id`, `feedbacks.user_id`

---

### 2. events

Stores event/activity information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Event ID |
| title | VARCHAR(255) | NOT NULL | Event title |
| description | TEXT | NULL | Event description |
| date | DATETIME | NOT NULL | Event date and time |
| location_name | VARCHAR(255) | NOT NULL | Location name |
| location_address | VARCHAR(500) | DEFAULT '' | Location address |
| max_seats | INT | NOT NULL, DEFAULT 0 | Maximum number of seats |
| status | ENUM | NOT NULL, DEFAULT 'pending' | Event status: 'pending', 'approved', 'rejected', 'cancelled' |
| category | VARCHAR(100) | DEFAULT 'general' | Event category |
| created_by | INT | NOT NULL, FOREIGN KEY → users.id | Creator user ID |
| rejection_reason | TEXT | NULL | Rejection reason (if rejected) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (title)
- INDEX (status)
- INDEX (created_by)
- INDEX (date)
- INDEX (location_name)
- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT

**Relationships:**
- References: `users.id` (created_by)
- Referenced by: `registrations.event_id`, `notifications.related_event_id`, `guests.event_id`, `attendances.event_id`, `feedbacks.event_id`

**Note:** Location is stored as separate columns (`location_name`, `location_address`) instead of embedded document.

---

### 3. registrations

Stores event registration records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Registration ID |
| user_id | INT | NOT NULL, FOREIGN KEY → users.id | Registered user ID |
| event_id | INT | NOT NULL, FOREIGN KEY → events.id | Event ID |
| registered_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (event_id)
- UNIQUE KEY (user_id, event_id) - Prevents duplicate registrations
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE

**Relationships:**
- References: `users.id` (user_id), `events.id` (event_id)

---

### 4. notifications

Stores user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Notification ID |
| user_id | INT | NULL, FOREIGN KEY → users.id | Target user ID (NULL for guests) |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| related_event_id | INT | NULL, FOREIGN KEY → events.id | Related event ID (optional) |
| read | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (created_at DESC)
- INDEX (read)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (related_event_id) REFERENCES events(id) ON DELETE SET NULL

**Relationships:**
- References: `users.id` (user_id, nullable), `events.id` (related_event_id, nullable)

**Notification Types:**
- event_submitted
- event_approved
- event_rejected
- event_updated
- new_registration
- registration_confirmed
- registration_cancelled
- guest_invited
- event_reminder

---

### 5. logs

Stores application logs and audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Log ID |
| user_id | INT | NULL, FOREIGN KEY → users.id | User ID (NULL for system actions) |
| action | VARCHAR(100) | NOT NULL | Action type |
| resource | VARCHAR(100) | NULL | Resource type |
| resource_id | INT | NULL | Resource ID |
| details | JSON | NULL | Additional details (JSON format) |
| ip_address | VARCHAR(45) | NULL | IP address |
| user_agent | VARCHAR(500) | NULL | User agent string |
| timestamp | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Log timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (action)
- INDEX (timestamp DESC)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL

**Relationships:**
- References: `users.id` (user_id, nullable)

**Note:** `details` is stored as JSON column (MySQL 5.7+). Use JSON functions for queries.

---

### 6. guests

Stores guest/event participant information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Guest ID |
| name | VARCHAR(255) | NOT NULL, DEFAULT '' | Guest name |
| email | VARCHAR(255) | NOT NULL | Guest email |
| event_id | INT | NOT NULL, FOREIGN KEY → events.id | Event ID |
| invited_by | INT | NOT NULL, FOREIGN KEY → users.id | Inviter user ID |
| status | ENUM | NOT NULL, DEFAULT 'invited' | Guest status: 'invited', 'confirmed', 'cancelled' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (event_id)
- INDEX (email)
- INDEX (status)
- UNIQUE KEY (email, event_id) - Prevents duplicate invitations
- FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
- FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE RESTRICT

**Relationships:**
- References: `users.id` (invited_by), `events.id` (event_id)

---

### 7. attendances

Stores attendance tracking records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Attendance ID |
| user_id | INT | NOT NULL, FOREIGN KEY → users.id | User ID |
| event_id | INT | NOT NULL, FOREIGN KEY → events.id | Event ID |
| status | ENUM | NOT NULL, DEFAULT 'present' | Attendance status: 'present', 'absent' |
| marked_by | INT | NOT NULL, FOREIGN KEY → users.id | User who marked attendance |
| marked_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Marking timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (event_id)
- INDEX (status)
- UNIQUE KEY (user_id, event_id) - One attendance record per user per event
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
- FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE RESTRICT

**Relationships:**
- References: `users.id` (user_id, marked_by), `events.id` (event_id)

---

### 8. feedbacks

Stores event feedback.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Feedback ID |
| user_id | INT | NOT NULL, FOREIGN KEY → users.id | User ID |
| event_id | INT | NOT NULL, FOREIGN KEY → events.id | Event ID |
| rating | TINYINT | NULL, CHECK (1-5) | Rating (1-5 stars) |
| comment | TEXT | NULL | Feedback comment |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (event_id)
- INDEX (rating)
- UNIQUE KEY (user_id, event_id) - One feedback per user per event
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE

**Relationships:**
- References: `users.id` (user_id), `events.id` (event_id)

---

## Data Integrity Rules

### Foreign Key Constraints

1. **CASCADE Deletes:**
   - Deleting a user deletes their registrations, attendances, feedbacks
   - Deleting an event deletes related registrations, attendances, feedbacks, guests

2. **RESTRICT Deletes:**
   - Cannot delete user if they created events (unless events are deleted first)
   - Cannot delete user who marked attendance (unless attendance is deleted first)
   - Cannot delete user who invited guests (unless guests are deleted first)

3. **SET NULL:**
   - Deleting user sets `notifications.user_id` to NULL
   - Deleting event sets `notifications.related_event_id` to NULL
   - Deleting user sets `logs.user_id` to NULL

### Unique Constraints

1. **Email uniqueness:** One email per user
2. **Registration uniqueness:** One registration per user per event
3. **Attendance uniqueness:** One attendance record per user per event
4. **Feedback uniqueness:** One feedback per user per event
5. **Guest invitation uniqueness:** One invitation per email per event

### Check Constraints

1. **Rating:** Must be between 1 and 5 (or NULL)

---

## Indexes Summary

All tables have appropriate indexes for:
- Primary keys (automatic)
- Foreign keys (for join performance)
- Frequently queried fields (status, date, email, role)
- Compound unique indexes for business rules

---

## Migration Notes

### Changes from MongoDB:

1. **ID Format:** ObjectId (24-char hex) → INT (auto-increment)
2. **Embedded Documents:** `location` object → separate columns
3. **Arrays:** Not used in this schema (all relationships are normalized)
4. **JSON Fields:** `logs.details` stored as JSON column
5. **Timestamps:** Automatic `created_at` and `updated_at` via MySQL triggers
6. **Case Sensitivity:** Email comparisons are case-insensitive (utf8mb4_unicode_ci)

### Performance Considerations:

- All foreign keys are indexed
- Frequently queried fields are indexed
- Composite indexes for unique constraints
- Use prepared statements for all queries
- Connection pooling for better performance

---

## Example Queries

### Get user with registrations:
```sql
SELECT u.*, COUNT(r.id) as registration_count
FROM users u
LEFT JOIN registrations r ON u.id = r.user_id
WHERE u.id = ?
GROUP BY u.id;
```

### Get event with registration count:
```sql
SELECT e.*, COUNT(r.id) as registration_count
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
WHERE e.id = ?
GROUP BY e.id;
```

### Get logs with JSON details:
```sql
SELECT l.*, JSON_EXTRACT(l.details, '$.key') as detail_value
FROM logs l
WHERE l.user_id = ?
ORDER BY l.timestamp DESC;
```

