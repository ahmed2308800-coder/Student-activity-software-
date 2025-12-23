/**
 * Authorization Middleware
 * Role-Based Access Control (RBAC)
 */
const { AuthorizationError } = require('../utils/errors');
const { PERMISSIONS, ROLES } = require('../config/constants');

/**
 * Check if user has required permission
 * @param {string} permission - Required permission
 */
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return next(new AuthorizationError('Authentication required'));
    }

    const userPermissions = PERMISSIONS[req.userRole.toUpperCase()] || PERMISSIONS[req.userRole] || [];

    if (!userPermissions.includes(permission)) {
      return next(new AuthorizationError(`You don't have permission to ${permission}`));
    }

    next();
  };
};

/**
 * Check if user has one of the required roles
 * @param {Array<string>} allowedRoles - Allowed roles
 */
const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return next(new AuthorizationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(new AuthorizationError('Access denied. Insufficient role privileges.'));
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = hasRole(ROLES.ADMIN);

/**
 * Check if user is club representative or admin
 */
const isClubRepOrAdmin = hasRole(ROLES.CLUB_REPRESENTATIVE, ROLES.ADMIN);

/**
 * Check if user is student or higher
 */
const isStudentOrHigher = hasRole(ROLES.STUDENT, ROLES.CLUB_REPRESENTATIVE, ROLES.ADMIN);

module.exports = {
  hasPermission,
  hasRole,
  isAdmin,
  isClubRepOrAdmin,
  isStudentOrHigher
};

