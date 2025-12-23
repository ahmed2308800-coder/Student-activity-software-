/**
 * Validation Middleware
 * Input validation and sanitization
 */
const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');
const Validators = require('../utils/validators');

/**
 * Sanitize request body to prevent NoSQL injection
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = Validators.sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = Validators.sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = Validators.sanitizeInput(req.params);
  }
  next();
};

/**
 * Validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new ValidationError(errorMessages));
  }
  next();
};

/**
 * Get request information for logging
 */
const getRequestInfo = (req) => {
  return {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') || 'Unknown'
  };
};

module.exports = {
  sanitizeInput,
  validate,
  getRequestInfo
};

