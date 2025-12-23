/**
 * Authentication Service
 * Handles user authentication and authorization logic
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/UserModel');
const logModel = require('../models/LogModel');
const { ValidationError, AuthenticationError } = require('../utils/errors');
const Validators = require('../utils/validators');

class AuthService {
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} Created user (without password)
   */
  async register(userData) {
    // Validate input
    if (!userData.email || !Validators.isValidEmail(userData.email)) {
      throw new ValidationError('Valid email is required');
    }

    if (!userData.password) {
      throw new ValidationError('Password is required');
    }

    const passwordValidation = Validators.validatePassword(userData.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message);
    }

    // Check if user already exists
    const existingUser = await userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = await userModel.create({
      email: userData.email,
      password: hashedPassword,
      name: userData.name || '',
      role: userData.role || 'student'
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate user and generate JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} User data and token
   */
  async login(email, password, reqInfo = {}) {
    // Validate input
    if (!email || !Validators.isValidEmail(email)) {
      throw new ValidationError('Valid email is required');
    }

    if (!password) {
      throw new ValidationError('Password is required');
    }

    // Find user
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Log login
    await logModel.create({
      userId: user.id || user._id,
      action: 'login',
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Generate JWT token
   * @param {object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: (user.id || user._id).toString(),
      email: user.email,
      role: user.role
    };

    const secret = process.env.JWT_SECRET || 'default-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {object} Decoded token payload
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      return jwt.verify(token, secret);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<object|null>}
   */
  async getUserById(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      return null;
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();

