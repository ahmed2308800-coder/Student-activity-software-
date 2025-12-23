/**
 * Application Constants
 */

module.exports = {
  ROLES: {
    STUDENT: 'student',
    CLUB_REPRESENTATIVE: 'club_representative',
    ADMIN: 'admin',
    GUEST: 'guest'
  },

  EVENT_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
  },

  NOTIFICATION_TYPES: {
    EVENT_SUBMITTED: 'event_submitted',
    EVENT_APPROVED: 'event_approved',
    EVENT_REJECTED: 'event_rejected',
    EVENT_UPDATED: 'event_updated',
    NEW_REGISTRATION: 'new_registration',
    REGISTRATION_CONFIRMED: 'registration_confirmed',
    REGISTRATION_CANCELLED: 'registration_cancelled',
    GUEST_INVITED: 'guest_invited',
    EVENT_REMINDER: 'event_reminder'
  },

  LOG_ACTIONS: {
    LOGIN: 'login',
    LOGOUT: 'logout',
    EVENT_CREATED: 'event_created',
    EVENT_UPDATED: 'event_updated',
    EVENT_DELETED: 'event_deleted',
    EVENT_APPROVED: 'event_approved',
    EVENT_REJECTED: 'event_rejected',
    REGISTRATION_CREATED: 'registration_created',
    REGISTRATION_CANCELLED: 'registration_cancelled',
    FEEDBACK_SUBMITTED: 'feedback_submitted',
    GUEST_INVITED: 'guest_invited',
    ATTENDANCE_MARKED: 'attendance_marked'
  },

  PERMISSIONS: {
    // Student permissions
    STUDENT: [
      'view_events',
      'register_event',
      'cancel_registration',
      'view_own_registrations'
    ],
    // Club Representative permissions
    CLUB_REPRESENTATIVE: [
      'view_events',
      'create_event',
      'edit_own_event',
      'delete_own_event',
      'view_own_event_registrations',
      'register_event'
    ],
    // Admin permissions
    ADMIN: [
      'view_events',
      'create_event',
      'edit_any_event',
      'delete_any_event',
      'approve_event',
      'reject_event',
      'view_all_registrations',
      'view_analytics',
      'manage_users',
      'view_logs',
      'create_backup'
    ],
    // Guest permissions
    GUEST: [
      'view_events'
    ]
  }
};

