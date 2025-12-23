/**
 * Input Validation Utilities
 * Prevents NoSQL injection and validates data
 */

class Validators {
  /**
   * Sanitize input to prevent NoSQL injection
   * @param {any} input - Input to sanitize
   * @returns {any} Sanitized input
   */
  static sanitizeInput(input) {
    if (typeof input === 'string') {
      // Remove MongoDB operators
      return input.replace(/[$]/g, '').trim();
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const key in input) {
        if (input.hasOwnProperty(key)) {
          // Remove keys that start with $ (MongoDB operators)
          if (!key.startsWith('$')) {
            sanitized[key] = this.sanitizeInput(input[key]);
          }
        }
      }
      return sanitized;
    }
    return input;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} { valid: boolean, message: string }
   */
  static validatePassword(password) {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: 'Password is valid' };
  }

  /**
   * Validate ObjectId format (legacy - for backward compatibility)
   * @param {string} id - ID to validate
   * @returns {boolean}
   */
  static isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Validate integer ID format (MySQL)
   * @param {string|number} id - ID to validate
   * @returns {boolean}
   */
  static isValidId(id) {
    if (id === null || id === undefined) return false;
    const numId = parseInt(id);
    return !isNaN(numId) && numId > 0;
  }

  /**
   * Validate date
   * @param {string|Date} date - Date to validate
   * @returns {boolean}
   */
  static isValidDate(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  }

  /**
   * Validate event data
   * @param {object} eventData - Event data to validate
   * @returns {object} { valid: boolean, errors: string[] }
   */
  static validateEventData(eventData) {
    const errors = [];

    if (!eventData.title || eventData.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (!eventData.description || eventData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (!eventData.date || !this.isValidDate(eventData.date)) {
      errors.push('Valid date is required');
    } else {
      const eventDate = new Date(eventData.date);
      if (eventDate < new Date()) {
        errors.push('Event date cannot be in the past');
      }
    }

    if (!eventData.location || !eventData.location.name) {
      errors.push('Location name is required');
    }

    if (!eventData.maxSeats || eventData.maxSeats < 1) {
      errors.push('Maximum seats must be at least 1');
    }

    if (eventData.maxSeats && !Number.isInteger(Number(eventData.maxSeats))) {
      errors.push('Maximum seats must be an integer');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;

