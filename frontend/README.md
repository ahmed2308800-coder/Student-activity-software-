# SAMS Frontend - Student Activities Management System

## Overview

This is a modern, responsive frontend application for the Student Activities Management System (SAMS). It is built with vanilla HTML, CSS, and JavaScript, fully integrated with the backend REST API.

## Features

- ✅ **Modern UI/UX** - Clean, professional design with smooth animations
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✅ **Role-Based Access Control** - Dynamic menus and permissions based on user roles
- ✅ **Full Backend Integration** - All features connected to real APIs
- ✅ **Authentication** - Secure login/register with JWT tokens
- ✅ **Real-time Updates** - Dynamic content loading and updates
- ✅ **Form Validation** - Client-side and server-side validation
- ✅ **Error Handling** - Graceful error handling with user-friendly messages
- ✅ **Analytics Dashboard** - Charts and statistics using Chart.js

## Folder Structure

```
frontend/
├── assets/
│   ├── css/
│   │   ├── main.css          # Main stylesheet
│   │   └── components.css    # Component styles
│   └── js/
│       ├── config.js         # Configuration and app state
│       ├── api.js            # API service layer
│       ├── auth.js           # Authentication functions
│       ├── menu.js           # Dynamic menu system
│       ├── router.js         # Page routing
│       ├── utils.js          # Utility functions
│       └── main.js           # Application entry point
├── pages/
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── dashboard.html        # Main dashboard
│   ├── events.html           # Events listing
│   ├── event-create.html     # Create event form
│   ├── event-view.html       # Event details
│   ├── events-pending.html   # Pending events (Admin)
│   ├── my-events.html        # My events (Club Rep)
│   ├── registrations.html    # My registrations
│   ├── notifications.html    # Notifications
│   ├── analytics.html        # Analytics dashboard
│   ├── users.html            # User management (Admin)
│   └── feedbacks.html        # Feedback submission
├── index.html                # Main HTML file
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- Backend server running on `http://localhost:3000`
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Running the Frontend

1. **Using a Local Server** (Recommended):
   ```bash
   # Using Python
   cd frontend
   python -m http.server 8080
   
   # Using Node.js (http-server)
   npx http-server frontend -p 8080
   
   # Using PHP
   php -S localhost:8080 -t frontend
   ```

2. **Open in Browser**:
   - Navigate to `http://localhost:8080`
   - Or open `index.html` directly (some features may not work due to CORS)

### Configuration

The API base URL is configured in `assets/js/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000
};
```

Update this if your backend runs on a different URL or port.

## User Roles & Features

### Student
- Browse and search events
- Register for events
- View registrations
- Submit feedback
- View notifications

### Club Representative
- Create, edit, delete events (before approval)
- View event registrations
- Invite guest speakers
- Send notifications to participants
- View analytics

### Admin
- Approve/reject events
- Manage users
- View all events
- System-wide notifications
- Analytics dashboard
- Backup management

### Guest
- View events
- Accept/decline invitations

## Key Features

### Dynamic Menu System
The navigation menu automatically updates based on the logged-in user's role. Menu items are defined in `assets/js/menu.js`.

### Authentication
- JWT tokens stored in localStorage
- Automatic token refresh
- Route guards for protected pages
- Role-based access control

### API Integration
All API calls are handled through the `APIService` class in `assets/js/api.js`. It provides:
- Automatic token injection
- Error handling
- Request/response formatting

### Routing
The router (`assets/js/router.js`) handles:
- Hash-based routing
- Page loading
- Authentication checks
- Role-based access

## API Endpoints Used

The frontend integrates with all backend endpoints:

- **Auth**: `/auth/register`, `/auth/login`, `/auth/me`
- **Events**: `/events`, `/events/:id`, `/events/:id/approve`, etc.
- **Registrations**: `/registrations`, `/registrations/my-registrations`
- **Notifications**: `/notifications`, `/notifications/broadcast`
- **Analytics**: `/analytics/dashboard`
- **Users**: `/users`
- **And more...**

## Styling

The frontend uses CSS variables for theming (defined in `main.css`):
- Primary colors
- Spacing
- Shadows
- Border radius
- Transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

### Adding New Pages

1. Create HTML file in `pages/` directory
2. Add route to `router.js` pages object
3. Add menu item to `menu.js` if needed
4. Implement `initPage()` function in the page

### Adding New API Calls

1. Add method to `APIService` class in `api.js`
2. Use the method in your page scripts

### Styling Components

- Use existing component classes from `components.css`
- Follow the CSS variable system for colors and spacing
- Maintain responsive design principles

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure:
- Backend has CORS enabled
- Frontend is served from a web server (not file://)

### API Connection Issues
- Check backend is running on `http://localhost:3000`
- Verify API base URL in `config.js`
- Check browser console for errors

### Authentication Issues
- Clear localStorage and re-login
- Check token expiration
- Verify backend JWT secret

## Production Deployment

For production:

1. Update API base URL in `config.js`
2. Minify CSS and JavaScript files
3. Optimize images
4. Enable HTTPS
5. Set proper CORS headers on backend
6. Configure proper error logging

## License

This project is part of the SAMS system.


