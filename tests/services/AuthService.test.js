/**
 * AuthService Unit Tests
 */
const authService = require('../../src/services/AuthService');
const userModel = require('../../src/models/UserModel');
const { ValidationError, AuthenticationError } = require('../../src/utils/errors');

jest.mock('../../src/models/UserModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      };

      userModel.findByEmail.mockResolvedValue(null);
      userModel.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        password: 'hashedPassword'
      });
      bcrypt.hash.mockResolvedValue('hashedPassword');

      const result = await authService.register(userData);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(userData.email);
      expect(userModel.create).toHaveBeenCalled();
    });

    it('should throw error if email is invalid', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123'
      };

      await expect(authService.register(userData)).rejects.toThrow(ValidationError);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      userModel.findByEmail.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

      await expect(authService.register(userData)).rejects.toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const email = 'test@example.com';
      const password = 'Password123';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email,
        password: 'hashedPassword',
        role: 'student'
      };

      userModel.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const result = await authService.login(email, password);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error for invalid credentials', async () => {
      userModel.findByEmail.mockResolvedValue(null);

      await expect(authService.login('test@example.com', 'wrong')).rejects.toThrow(AuthenticationError);
    });
  });
});

