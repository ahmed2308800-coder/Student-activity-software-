// Main Application Entry Point

// Safe wrapper for loadPage to prevent errors
window.safeLoadPage = function(pageName) {
    if (typeof loadPage === 'function') {
        try {
            loadPage(pageName);
        } catch (error) {
            console.error('Error loading page:', error);
            if (typeof showToast === 'function') {
                showToast('error', 'Navigation Error', 'Failed to load page. Please refresh.');
            }
        }
    } else {
        console.error('loadPage function not available');
        // Fallback: try to navigate using hash
        window.location.hash = pageName;
    }
};

// Function to setup global functions
window.setupGlobalFunctions = function() {
    // Make essential functions globally available
    if (typeof loadPage !== 'undefined') {
        window.loadPage = loadPage;
        // Also create safe wrapper
        if (!window.safeLoadPage) {
            window.safeLoadPage = window.safeLoadPage || function(pageName) {
                if (typeof loadPage === 'function') {
                    loadPage(pageName);
                } else {
                    window.location.hash = pageName;
                }
            };
        }
    }
    if (typeof showToast !== 'undefined') window.showToast = showToast;
    if (typeof hideLoading !== 'undefined') window.hideLoading = hideLoading;
    if (typeof showLoading !== 'undefined') window.showLoading = showLoading;
    if (typeof handleLogin !== 'undefined') window.handleLogin = handleLogin;
    if (typeof handleRegister !== 'undefined') window.handleRegister = handleRegister;
    if (typeof handleLogout !== 'undefined') window.handleLogout = handleLogout;
    if (typeof escapeHtml !== 'undefined') window.escapeHtml = escapeHtml;
    if (typeof formatDate !== 'undefined') window.formatDate = formatDate;
    if (typeof formatDateOnly !== 'undefined') window.formatDateOnly = formatDateOnly;
    if (typeof formatStatus !== 'undefined') window.formatStatus = formatStatus;
    if (typeof formatRole !== 'undefined') window.formatRole = formatRole;
    if (typeof validateEmail !== 'undefined') window.validateEmail = validateEmail;
    if (typeof getTimeAgo !== 'undefined') window.getTimeAgo = getTimeAgo;
    if (typeof debounce !== 'undefined') window.debounce = debounce;
    if (typeof safeGetElement !== 'undefined') window.safeGetElement = safeGetElement;
    if (typeof safeSetInnerHTML !== 'undefined') window.safeSetInnerHTML = safeSetInnerHTML;
    if (typeof api !== 'undefined') window.api = api;
    if (typeof AppState !== 'undefined') window.AppState = AppState;
};

// Initialize global functions immediately
window.setupGlobalFunctions();

// Override loadPage in onclick handlers to use safe version
window.loadPage = window.loadPage || window.safeLoadPage;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication status
        if (AppState.token) {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
                clearAppState();
                loadPage('login');
            } else {
                loadMenu();
            }
        } else {
            loadMenu();
        }

        // Set up periodic token refresh (every 5 minutes)
        if (AppState.token) {
            setInterval(async () => {
                await checkAuth();
            }, 5 * 60 * 1000);
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Global error handler - only show critical errors
window.addEventListener('error', (e) => {
    // Don't show toast for every error, only log
    const error = e.error || e;
    const message = error?.message || e.message || 'Unknown error';
    
    // Suppress common non-critical errors
    const suppressErrors = [
        'ResizeObserver',
        'Non-Error promise rejection',
        'Script error',
        'Failed to fetch',
        'NetworkError',
        'ChunkLoadError'
    ];
    
    const shouldSuppress = suppressErrors.some(msg => message.includes(msg));
    
    if (!shouldSuppress) {
        console.error('Global error:', error);
    }
    
    // Only show toast for truly critical user-facing errors
    if (!shouldSuppress && error && typeof showToast === 'function') {
        // Don't spam toasts
        const lastErrorTime = window.lastErrorTime || 0;
        const now = Date.now();
        if (now - lastErrorTime > 5000) { // Only show error toast every 5 seconds
            window.lastErrorTime = now;
            // Only show if it's a meaningful error
            if (message.length > 0 && message.length < 200) {
                showToast('error', 'Error', message.substring(0, 100));
            }
        }
    }
});

// Handle unhandled promise rejections - only show important ones
window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    const message = reason?.message || (typeof reason === 'string' ? reason : 'Unknown error');
    
    // Suppress common non-critical errors
    const suppressErrors = [
        'Failed to fetch',
        'NetworkError',
        'ChunkLoadError',
        'Loading chunk',
        'ResizeObserver'
    ];
    
    const shouldSuppress = suppressErrors.some(msg => message.includes(msg));
    
    if (!shouldSuppress) {
        console.error('Unhandled promise rejection:', reason);
    }
    
    // Only show toast for user-facing errors, and not too frequently
    if (!shouldSuppress && typeof showToast === 'function') {
        const lastErrorTime = window.lastErrorTime || 0;
        const now = Date.now();
        if (now - lastErrorTime > 5000) {
            window.lastErrorTime = now;
            if (message.length > 0 && message.length < 200) {
                showToast('error', 'Error', message.substring(0, 100));
            }
        }
    }
});

