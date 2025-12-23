/**
 * User Model
 * Handles user data operations
 */
const BaseModel = require('./BaseModel');

class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {Promise<object>}
   */
  async create(userData) {
    const user = {
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await super.create(user);
  }

  /**
   * Update user by ID
   * @param {string|number} id - User ID
   * @param {object} data - Update data
   * @returns {Promise<object|null>}
   */
  async updateById(id, data) {
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    return await super.updateById(id, data);
  }

  /**
   * Check if user exists by email
   * @param {string} email - User email
   * @returns {Promise<boolean>}
   */
  async existsByEmail(email) {
    const user = await this.findByEmail(email);
    return user !== null;
  }
}

module.exports = new UserModel();
