// Dynamic Menu System

const MENU_ITEMS = {
    student: [
        { label: 'Dashboard', path: 'dashboard', icon: 'home' },
        { label: 'Browse Events', path: 'events', icon: 'calendar' },
        { label: 'My Registrations', path: 'registrations', icon: 'list' },
        { label: 'Notifications', path: 'notifications', icon: 'bell' }
    ],
    club_representative: [
        { label: 'Dashboard', path: 'dashboard', icon: 'home' },
        { label: 'My Events', path: 'my-events', icon: 'calendar' },
        { label: 'Create Event', path: 'events/create', icon: 'plus' },
        { label: 'Registrations', path: 'registrations', icon: 'users' },
        { label: 'Guests', path: 'guests', icon: 'user-friends' },
        { label: 'Analytics', path: 'analytics', icon: 'chart-bar' },
        { label: 'Notifications', path: 'notifications', icon: 'bell' }
    ],
    admin: [
        { label: 'Dashboard', path: 'dashboard', icon: 'home' },
        { label: 'All Events', path: 'events', icon: 'calendar' },
        { label: 'Pending Events', path: 'events/pending', icon: 'clock' },
        { label: 'Users', path: 'users', icon: 'users' },
        { label: 'Analytics', path: 'analytics', icon: 'chart-bar' },
        { label: 'Notifications', path: 'notifications', icon: 'bell' },
        { label: 'Backup', path: 'backup', icon: 'database' }
    ],
    guest: [
        { label: 'Events', path: 'events', icon: 'calendar' },
        { label: 'Invitations', path: 'invitations', icon: 'envelope' }
    ]
};

async function loadMenu() {
    const navMenu = document.getElementById('navMenu');
    const navUser = document.getElementById('navUser');
    
    if (!navMenu || !navUser) return;

    // Clear existing menu
    navMenu.innerHTML = '';
    navUser.innerHTML = '';

    // If not logged in, show login/register
    if (!AppState.token || !AppState.role) {
        navMenu.innerHTML = `
            <li><a href="#login" onclick="loadPage('login')">Login</a></li>
            <li><a href="#register" onclick="loadPage('register')">Register</a></li>
        `;
        return;
    }

    // Get menu items for current role
    const menuItems = MENU_ITEMS[AppState.role] || MENU_ITEMS.guest;

    // Build menu items
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#${item.path}" onclick="loadPage('${item.path}')">
                <i class="fas fa-${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
        navMenu.appendChild(li);
    });

    // Add logout button
    const logoutLi = document.createElement('li');
    logoutLi.innerHTML = `
        <a href="#logout" onclick="handleLogout()" class="text-danger">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
        </a>
    `;
    navMenu.appendChild(logoutLi);

    // Build user info
    if (AppState.user) {
        const userInitials = AppState.user.name 
            ? AppState.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : AppState.user.email[0].toUpperCase();
        
        navUser.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${userInitials}</div>
                <div>
                    <div style="font-weight: 600; font-size: 0.875rem;">${AppState.user.name || AppState.user.email}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${AppState.role}</div>
                </div>
            </div>
        `;
    }

    // Update active menu item
    updateActiveMenuItem();
}

function updateActiveMenuItem() {
    const currentPath = window.location.hash.replace('#', '') || 'dashboard';
    const menuLinks = document.querySelectorAll('.nav-menu a');
    
    menuLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').replace('#', '');
        if (href === currentPath || currentPath.startsWith(href)) {
            link.classList.add('active');
        }
    });
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});


