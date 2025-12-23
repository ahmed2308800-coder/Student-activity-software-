/**
 * Registration Model
 * Handles event registration data operations
 */
const BaseModel = require('./BaseModel');

class RegistrationModel extends BaseModel {
  constructor() {
    super('registrations');
  }

  /**
   * Find registrations by user
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>}
   */
  async findByUser(userId) {
    return await this.find({ userId: parseInt(userId) });
  }

  /**
   * Find registrations by event
   * @param {string|number} eventId - Event ID
   * @returns {Promise<Array>}
   */
  async findByEvent(eventId) {
    return await this.find({ eventId: parseInt(eventId) });
  }

  /**
   * Find registration by user and event
   * @param {string|number} userId - User ID
   * @param {string|number} eventId - Event ID
   * @returns {Promise<object|null>}
   */
  async findByUserAndEvent(userId, eventId) {
    return await this.findOne({
      userId: parseInt(userId),
      eventId: parseInt(eventId)
    });
  }

  /**
   * Count registrations for an event
   * @param {string|number} eventId - Event ID
   * @returns {Promise<number>}
   */
  async countByEvent(eventId) {
    return await this.count({ eventId: parseInt(eventId) });
  }

  /**
   * Check if user is registered for event
   * @param {string|number} userId - User ID
   * @param {string|number} eventId - Event ID
   * @returns {Promise<boolean>}
   */
  async isRegistered(userId, eventId) {
    const registration = await this.findByUserAndEvent(userId, eventId);
    return registration !== null;
  }

  /**
   * Create registration
   * @param {object} registrationData - Registration data
   * @returns {Promise<object>}
   */
  async create(registrationData) {
    const registration = {
      userId: parseInt(registrationData.userId),
      eventId: parseInt(registrationData.eventId),
      registeredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await super.create(registration);
  }
}

module.exports = new RegistrationModel();
