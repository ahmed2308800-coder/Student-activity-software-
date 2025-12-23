// Router - Handles page navigation and loading

const pages = {
    'login': 'pages/login.html',
    'register': 'pages/register.html',
    'dashboard': 'pages/dashboard.html',
    'events': 'pages/events.html',
    'events/create': 'pages/event-create.html',
    'events/edit': 'pages/event-edit.html',
    'events/view': 'pages/event-view.html',
    'events/pending': 'pages/events-pending.html',
    'my-events': 'pages/my-events.html',
    'registrations': 'pages/registrations.html',
    'attendances': 'pages/attendances.html',
    'feedbacks': 'pages/feedbacks.html',
    'notifications': 'pages/notifications.html',
    'guests': 'pages/guests.html',
    'invitations': 'pages/invitations.html',
    'analytics': 'pages/analytics.html',
    'users': 'pages/users.html',
    'backup': 'pages/backup.html'
};

async function loadPage(pageName) {
    const [basePageName] = pageName.split('?');

    // Allow login and register pages to load even during logout
    if ((window.isLoggingOut || window.isLoggedOut) &&
        basePageName !== 'login' && basePageName !== 'register') {
        console.log(`Page load blocked during logout: ${pageName} (base: ${basePageName})`);
        return;
    }

    const [, queryString] = pageName.split('?');
    const normalizedPageName = basePageName || 'dashboard';

    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    // Hide welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    showLoading();

    try {
        // Check if page requires authentication
        if (normalizedPageName !== 'login' && normalizedPageName !== 'register') {
            console.log(`Loading protected page: ${normalizedPageName}, token: ${!!AppState.token}`);
            if (!AppState.token) {
                console.log(`No token for protected page: ${normalizedPageName}, redirecting to login`);
                loadPage('login');
                hideLoading();
                return;
            }
        }

        // Check role-based access
        if (['events/pending', 'users', 'backup', 'analytics'].includes(normalizedPageName)) {
            if (!requireRole(['admin'])) {
                hideLoading();
                mainContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-lock"></i>
                        </div>
                        <div class="empty-state-title">Access Denied</div>
                        <div class="empty-state-message">You don't have permission to access this page. Admin role required.</div>
                        <button class="btn btn-primary" onclick="loadPage('dashboard')">Go to Dashboard</button>
                    </div>
                `;
                return;
            }
        }

        if (['events/create', 'my-events', 'guests'].includes(normalizedPageName)) {
            if (!requireRole(['club_representative', 'admin'])) {
                hideLoading();
                return;
            }
        }

        // Load page content
        const pagePath = pages[normalizedPageName];
        if (!pagePath) {
            throw new Error('Page not found');
        }

        // Use absolute path from root to avoid path issues
        const absolutePath = pagePath.startsWith('/') ? pagePath : '/' + pagePath;
        
        let html;
        try {
            const response = await fetch(absolutePath);
            if (!response.ok) {
                // Try relative path as fallback
                const fallbackResponse = await fetch(pagePath);
                if (!fallbackResponse.ok) {
                    throw new Error(`Failed to load page: ${response.status} ${response.statusText}`);
                }
                html = await fallbackResponse.text();
            } else {
                html = await response.text();
            }
        } catch (fetchError) {
            // If fetch fails, it might be a CORS issue or file not found
            console.error('Fetch error:', fetchError);
            throw new Error(`Cannot load page. Make sure you're running from a web server (not file://). Error: ${fetchError.message}`);
        }

        // Parse HTML and extract scripts
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract scripts before inserting HTML
        const scripts = Array.from(doc.querySelectorAll('script'));
        scripts.forEach(script => script.remove());
        
        // Insert HTML content (without scripts)
        mainContent.innerHTML = doc.body.innerHTML;
        console.log('Router: HTML content inserted, checking for myEventsContainer:', document.getElementById('myEventsContainer') ? 'found' : 'not found');
        
        // Remove old page scripts to prevent redeclaration errors
        const oldScripts = document.querySelectorAll('script[data-page-script="true"]');
        oldScripts.forEach(script => {
            try {
                // Remove the script element from DOM
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                // Also remove from document if still attached
                if (script.parentNode) {
                    document.body.removeChild(script);
                }
            } catch (e) {
                // Ignore errors if script is already removed
                console.log('Script cleanup warning:', e.message);
            }
        });

        // Additional cleanup: remove any remaining page scripts
        const remainingScripts = document.querySelectorAll('script[data-page-script="true"]');
        remainingScripts.forEach(script => {
            try {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            } catch (e) {
                // Ignore cleanup errors
            }
        });

        // Clear any known global variables that might cause conflicts
        const variablesToClear = ['currentEvent', 'currentEventId', 'eventId'];
        variablesToClear.forEach(varName => {
            try {
                if (window[varName] !== undefined) {
                    delete window[varName];
                }
            } catch (e) {
                // Ignore variable cleanup errors
            }
        });

        // Wait a bit for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 50));

        // Execute scripts in order with error handling
        for (const script of scripts) {
            try {
                const newScript = document.createElement('script');
                // Mark as page script for cleanup
                newScript.setAttribute('data-page-script', 'true');
                // Copy all attributes
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                // Copy script content
                newScript.textContent = script.textContent;

                // Append to body with error handling
                try {
                    document.body.appendChild(newScript);
                    console.log('Script appended successfully for page:', pageName);
                } catch (appendError) {
                    console.error('Failed to append script for page', pageName, ':', appendError);
                    throw appendError;
                }
            } catch (appendError) {
                console.error('Failed to append script:', appendError);
                // Continue with other scripts
            }
        }
        
        // Small delay to ensure scripts executed and DOM is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Re-initialize global functions after scripts execute
        if (typeof window.setupGlobalFunctions === 'function') {
            window.setupGlobalFunctions();
        }
        
        // Ensure DOM is ready before calling initPage
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });

        // Additional check: wait for page-specific elements to be ready
        if (normalizedPageName === 'my-events') {
            console.log('Router: Waiting for my-events page elements...');
            for (let i = 0; i < 20; i++) {
                if (document.getElementById('myEventsContainer')) {
                    console.log('Router: myEventsContainer found');
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } else if (normalizedPageName === 'registrations') {
            console.log('Router: Waiting for registrations page elements...');
            for (let i = 0; i < 20; i++) {
                if (document.getElementById('registrationsContainer')) {
                    console.log('Router: registrationsContainer found');
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } else if (normalizedPageName === 'notifications') {
            console.log('Router: Waiting for notifications page elements...');
            for (let i = 0; i < 20; i++) {
                if (document.getElementById('notificationsContainer')) {
                    console.log('Router: notificationsContainer found');
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Update URL
        const hashValue = normalizedPageName + (queryString ? `?${queryString}` : '');
        window.location.hash = hashValue;

        // Update active menu
        updateActiveMenuItem();
        
        // Initialize page-specific scripts
        if (typeof initPage === 'function') {
            await initPage();
        }
        
        // Call setup functions if they exist (after scripts have executed)
        if (typeof window.setupLoginForm === 'function') {
            window.setupLoginForm();
        }
        if (typeof window.setupRegisterForm === 'function') {
            window.setupRegisterForm();
        }

        // Scroll to top
        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Error loading page:', error);
        mainContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="empty-state-title">Page Not Found</div>
                <div class="empty-state-message">${error.message}</div>
                <button class="btn btn-primary" onclick="loadPage('dashboard')">Go to Dashboard</button>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// Handle hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';

    // Allow login and register pages even during logout
    if ((window.isLoggingOut || window.isLoggedOut) &&
        hash !== 'login' && hash !== 'register') {
        console.log('Hash change blocked during logout (protected page)');
        return;
    }

    // Only load protected pages if authenticated
    if (AppState.token || hash === 'login' || hash === 'register') {
        loadPage(hash);
    } else {
        loadPage('login');
    }
});

// Load page on initial load
window.addEventListener('DOMContentLoaded', () => {
    // Prevent initial page loading during logout
    if (window.isLoggingOut || window.isLoggedOut) {
        console.log('Initial page load skipped during logout');
        loadMenu();
        return;
    }

    const hash = window.location.hash.replace('#', '') || 'dashboard';
    // Only load protected pages if authenticated
    if (AppState.token || hash === 'login' || hash === 'register') {
        loadPage(hash);
    } else {
        loadPage('login');
    }
    loadMenu();
});

