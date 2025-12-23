/**
 * User Controller
 * Handles user management HTTP requests (Admin only)
 */
const userModel = require('../models/UserModel');
const { ValidationError, NotFoundError } = require('../utils/errors');
const Validators = require('../utils/validators');

class UserController {
  /**
   * Get all users
   * GET /api/users
   */
  async getUsers(req, res, next) {
    try {
      const { role, search, limit, skip } = req.query;
      let query = {};

      if (role) {
        query.role = role;
      }

      // Handle search with OR condition
      if (search) {
        // BaseModel now handles top-level $or
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const options = {
        limit: limit ? parseInt(limit) : undefined,
        skip: skip ? parseInt(skip) : undefined
      };

      const users = await userModel.find(query, options);
      const total = await userModel.count(query);

      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json({
        success: true,
        data: {
          users: usersWithoutPasswords,
          count: usersWithoutPasswords.length,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new NotFoundError('User');
      }

      const { password, ...userWithoutPassword } = user;
      res.json({
        success: true,
        data: { user: userWithoutPassword }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new NotFoundError('User');
      }

      const updateData = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.role) {
        if (!['student', 'club_representative', 'admin', 'guest'].includes(req.body.role)) {
          throw new ValidationError('Invalid role');
        }
        updateData.role = req.body.role;
      }

      const updatedUser = await userModel.updateById(req.params.id, updateData);
      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: userWithoutPassword }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Check if user has created events (referential integrity)
      const eventModel = require('../models/EventModel');
      const events = await eventModel.findByCreator(req.params.id);
      if (events.length > 0) {
        throw new ValidationError('Cannot delete user with existing events');
      }

      const deleted = await userModel.deleteById(req.params.id);
      if (deleted) {
        res.json({
          success: true,
          message: 'User deleted successfully'
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

