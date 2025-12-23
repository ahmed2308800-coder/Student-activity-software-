# Quick Start Guide - SAMS Frontend

## The "Failed to fetch" Error

If you're seeing a "Page Not Found" or "Failed to fetch" error, it's because the frontend needs to be served from a web server (not opened directly as a file).

## Solution: Run a Local Web Server

### Option 1: Using Python (Easiest)

```bash
# Navigate to the frontend directory
cd frontend

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open: `http://localhost:8080`

### Option 2: Using Node.js (http-server)

```bash
# Install http-server globally (one time)
npm install -g http-server

# Navigate to frontend directory
cd frontend

# Start server
http-server -p 8080
```

Then open: `http://localhost:8080`

### Option 3: Using PHP

```bash
cd frontend
php -S localhost:8080
```

Then open: `http://localhost:8080`

### Option 4: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Important Notes

1. **Backend Must Be Running**: Make sure your backend is running on `http://localhost:3000`
2. **CORS**: The backend must have CORS enabled (it should already be configured)
3. **Port**: Frontend runs on port 8080, backend on port 3000

## Testing the Setup

1. Start backend: `npm start` (in project root)
2. Start frontend server (use one of the options above)
3. Open browser: `http://localhost:8080`
4. You should see the welcome screen
5. Click "Login" or "Register" to test

## Troubleshooting

### Still seeing "Failed to fetch"?

1. **Check backend is running**: Open `http://localhost:3000/api/health` in browser
2. **Check CORS**: Backend should allow requests from `http://localhost:8080`
3. **Check browser console**: Press F12 and look for errors
4. **Try different browser**: Sometimes browser security settings block local files

### Pages not loading?

- Make sure you're accessing via `http://localhost:8080` (not `file://`)
- Check that all page files exist in `frontend/pages/` directory
- Check browser console for specific errors

### API calls failing?

- Verify backend is running on port 3000
- Check `frontend/assets/js/config.js` - API base URL should be `http://localhost:3000/api`
- Check browser Network tab to see API requests

## Default Configuration

- **Frontend**: `http://localhost:8080`
- **Backend API**: `http://localhost:3000/api`

If your backend runs on a different port, update `frontend/assets/js/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:YOUR_PORT/api',
    TIMEOUT: 10000
};
```


