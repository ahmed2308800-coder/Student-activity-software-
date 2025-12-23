/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */
const authService = require('../services/AuthService');
const { ValidationError } = require('../utils/errors');
const { getRequestInfo } = require('../middlewares/validationMiddleware');

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const reqInfo = getRequestInfo(req);
      const result = await authService.login(email, password, reqInfo);
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getUserById(req.userId);
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

