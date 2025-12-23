/**
 * Menu Controller
 * Provides dynamic menu based on user role (self-reference)
 */
const { PERMISSIONS, ROLES } = require('../config/constants');

class MenuController {
  /**
   * Get menu items based on user role
   * GET /api/menu
   */
  async getMenu(req, res, next) {
    try {
      const userRole = req.userRole || 'guest';
      const permissions = PERMISSIONS[userRole.toUpperCase()] || PERMISSIONS[userRole] || PERMISSIONS.GUEST;

      // Map permissions to menu items
      const menuItems = this.buildMenuItems(permissions, userRole);

      res.json({
        success: true,
        data: {
          role: userRole,
          permissions,
          menu: menuItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Build menu items from permissions
   * @param {Array} permissions - User permissions
   * @param {string} role - User role
   * @returns {Array} Menu items
   */
  buildMenuItems(permissions, role) {
    const menuMap = {
      'view_events': { label: 'View Events', path: '/events', icon: 'calendar' },
      'register_event': { label: 'Register for Event', path: '/registrations', icon: 'plus-circle' },
      'cancel_registration': { label: 'My Registrations', path: '/registrations/my-registrations', icon: 'list' },
      'view_own_registrations': { label: 'My Registrations', path: '/registrations/my-registrations', icon: 'list' },
      'create_event': { label: 'Create Event', path: '/events/create', icon: 'plus' },
      'edit_own_event': { label: 'My Events', path: '/events/my-events', icon: 'edit' },
      'delete_own_event': { label: 'My Events', path: '/events/my-events', icon: 'trash' },
      'view_own_event_registrations': { label: 'Event Registrations', path: '/registrations/event', icon: 'users' },
      'approve_event': { label: 'Pending Events', path: '/events/pending/list', icon: 'check-circle' },
      'reject_event': { label: 'Pending Events', path: '/events/pending/list', icon: 'x-circle' },
      'view_all_registrations': { label: 'All Registrations', path: '/registrations', icon: 'database' },
      'view_analytics': { label: 'Analytics', path: '/analytics/dashboard', icon: 'bar-chart' },
      'manage_users': { label: 'User Management', path: '/users', icon: 'users' },
      'view_logs': { label: 'System Logs', path: '/logs', icon: 'file-text' },
      'create_backup': { label: 'Backup', path: '/backup', icon: 'save' }
    };

    const menuItems = [];
    const addedPaths = new Set();

    permissions.forEach(permission => {
      if (menuMap[permission] && !addedPaths.has(menuMap[permission].path)) {
        menuItems.push(menuMap[permission]);
        addedPaths.add(menuMap[permission].path);
      }
    });

    // Add common items
    menuItems.push({ label: 'Notifications', path: '/notifications', icon: 'bell' });
    menuItems.push({ label: 'Profile', path: '/auth/me', icon: 'user' });

    return menuItems;
  }
}

module.exports = new MenuController();


