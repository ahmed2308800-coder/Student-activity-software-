// Authentication Service

async function handleLogin(email, password) {
    try {
        showLoading();
        const response = await api.login(email, password);
        
        if (response.success && response.data) {
            AppState.token = response.data.token;
            AppState.user = response.data.user;
            AppState.role = response.data.user.role;
            saveAppState();
            
            showToast('success', 'Login successful!', 'Welcome back!');
            
            // Redirect to dashboard
            setTimeout(() => {
                loadPage('dashboard');
            }, 500);
        } else {
            throw new Error(response.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.message || 'An unexpected error occurred. Please check if the backend server is running.';
        showToast('error', 'Login failed', errorMessage);
    } finally {
        hideLoading();
    }
}

async function handleRegister(userData) {
    try {
        showLoading();
        const response = await api.register(userData);
        
        if (response.success) {
            showToast('success', 'Registration successful!', 'You can now login.');
            
            // Redirect to login
            setTimeout(() => {
                loadPage('login');
            }, 1500);
        } else {
            throw new Error(response.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.message || 'An unexpected error occurred. Please check if the backend server is running.';
        showToast('error', 'Registration failed', errorMessage);
    } finally {
        hideLoading();
    }
}

async function handleLogout() {
    // Set logout flags to prevent API calls
    window.isLoggingOut = true;

    // Clear authentication state
    clearAppState();

    // Show logout message
    showToast('info', 'Logged out', 'You have been logged out successfully.');

    // Clear the hash to prevent conflicts
    window.location.hash = '';

    // Use loadPage directly to load login - this bypasses hashchange issues
    try {
        await loadPage('login');
    } catch (error) {
        console.error('Failed to load login page:', error);
        // Fallback: force hash change
        window.location.hash = '#login';
    }

    // Clear logout flags after page load is complete
    setTimeout(() => {
        window.isLoggingOut = false;
        window.isLoggedOut = false;
    }, 1000);
}

async function checkAuth() {
    if (!AppState.token) {
        return false;
    }

    try {
        const response = await api.getCurrentUser();
        if (response.success) {
            AppState.user = response.data.user;
            AppState.role = response.data.user.role;
            saveAppState();
            return true;
        }
    } catch (error) {
        clearAppState();
        return false;
    }

    return false;
}

function requireAuth() {
    if (!AppState.token) {
        showToast('warning', 'Authentication required', 'Please login to access this page.');
        loadPage('login');
        return false;
    }
    return true;
}

function requireRole(allowedRoles) {
    if (!requireAuth()) {
        return false;
    }

    if (!allowedRoles.includes(AppState.role)) {
        showToast('error', 'Access denied', 'You do not have permission to access this page.');
        loadPage('dashboard');
        return false;
    }

    return true;
}

