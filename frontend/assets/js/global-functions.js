// Global Functions - Make all essential functions available globally
// This ensures functions are available even when pages load dynamically

// Wait for all core scripts to load
document.addEventListener('DOMContentLoaded', () => {
    // Make functions globally available with safety checks
    if (typeof loadPage !== 'undefined') {
        window.loadPage = loadPage;
    }
    if (typeof showToast !== 'undefined') {
        window.showToast = showToast;
    }
    if (typeof hideLoading !== 'undefined') {
        window.hideLoading = hideLoading;
    }
    if (typeof showLoading !== 'undefined') {
        window.showLoading = showLoading;
    }
    if (typeof handleLogin !== 'undefined') {
        window.handleLogin = handleLogin;
    }
    if (typeof handleRegister !== 'undefined') {
        window.handleRegister = handleRegister;
    }
    if (typeof handleLogout !== 'undefined') {
        window.handleLogout = handleLogout;
    }
    if (typeof escapeHtml !== 'undefined') {
        window.escapeHtml = escapeHtml;
    }
    if (typeof formatDate !== 'undefined') {
        window.formatDate = formatDate;
    }
    if (typeof formatDateOnly !== 'undefined') {
        window.formatDateOnly = formatDateOnly;
    }
    if (typeof formatStatus !== 'undefined') {
        window.formatStatus = formatStatus;
    }
    if (typeof formatRole !== 'undefined') {
        window.formatRole = formatRole;
    }
    if (typeof validateEmail !== 'undefined') {
        window.validateEmail = validateEmail;
    }
    if (typeof getTimeAgo !== 'undefined') {
        window.getTimeAgo = getTimeAgo;
    }
    if (typeof debounce !== 'undefined') {
        window.debounce = debounce;
    }
    
    // Make API available globally
    if (typeof api !== 'undefined') {
        window.api = api;
    }
    
    // Make AppState available globally
    if (typeof AppState !== 'undefined') {
        window.AppState = AppState;
    }
});


