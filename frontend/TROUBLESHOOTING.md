# Troubleshooting Guide

## Common Issues and Solutions

### 1. "An unexpected error occurred" when registering/logging in

**Possible Causes:**
- Backend server not running
- CORS issues
- Database connection issues
- Invalid request format

**Solutions:**

1. **Check if backend is running:**
   ```bash
   # In project root
   npm start
   ```
   You should see: `🚀 SAMS Backend Server running on port 3000`

2. **Test backend directly:**
   Open browser: `http://localhost:3000/api/health`
   Should return: `{"success":true,"message":"SAMS API is running"}`

3. **Check browser console (F12):**
   - Look for red error messages
   - Check Network tab to see API requests
   - Verify requests are going to `http://localhost:3000/api/auth/register` or `/login`

4. **Check CORS:**
   - Backend should have CORS enabled (it does by default)
   - Make sure frontend is accessed via `http://localhost:8080` (not `file://`)

5. **Check database:**
   - Make sure MySQL is running
   - Verify database connection in `.env` file
   - Check backend terminal for database errors

### 2. Multiple error toasts appearing

**Solution:**
- This has been fixed in the latest version
- Toasts now auto-remove and limit to 3 maximum
- Refresh the page to clear old toasts

### 3. "Cannot connect to server" error

**Solutions:**
1. Verify backend is running on port 3000
2. Check firewall settings
3. Verify API base URL in `frontend/assets/js/config.js`:
   ```javascript
   BASE_URL: 'http://localhost:3000/api'
   ```

### 4. Registration fails with validation errors

**Check:**
- Email format is valid
- Password is at least 6 characters
- All required fields are filled
- Role is selected

**Backend validation errors will now show in the toast message.**

### 5. Login fails

**Check:**
- User exists in database
- Password is correct
- Email is correct (case-insensitive)

### 6. Pages not loading

**Solutions:**
1. Make sure you're using a web server (not opening HTML files directly)
2. Check browser console for errors
3. Verify all page files exist in `frontend/pages/` directory

## Debugging Steps

1. **Open Browser Console (F12)**
   - Check for JavaScript errors
   - Look at Network tab for failed requests
   - Check Console tab for error messages

2. **Check Backend Terminal**
   - Look for error messages
   - Check database connection logs
   - Verify request logs

3. **Test API Directly**
   ```bash
   # Using PowerShell (Windows)
   Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
   ```

4. **Verify Environment**
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:8080`
   - Database: MySQL running and connected

## Getting Help

If issues persist:
1. Check browser console (F12) for specific errors
2. Check backend terminal for server errors
3. Verify all services are running
4. Check network connectivity


