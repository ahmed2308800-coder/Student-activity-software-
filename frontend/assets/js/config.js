// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000
};

// Application State
const AppState = {
    user: null,
    token: null,
    role: null
};

// Initialize from localStorage
function initAppState() {
    const storedToken = localStorage.getItem('sams_token');
    const storedUser = localStorage.getItem('sams_user');
    
    if (storedToken && storedUser) {
        AppState.token = storedToken;
        AppState.user = JSON.parse(storedUser);
        AppState.role = AppState.user.role;
    }
}

// Save state to localStorage
function saveAppState() {
    if (AppState.token) {
        localStorage.setItem('sams_token', AppState.token);
    }
    if (AppState.user) {
        localStorage.setItem('sams_user', JSON.stringify(AppState.user));
    }
}

// Clear state
function clearAppState() {
    AppState.user = null;
    AppState.token = null;
    AppState.role = null;
    localStorage.removeItem('sams_token');
    localStorage.removeItem('sams_user');
}

// Initialize on load
initAppState();


