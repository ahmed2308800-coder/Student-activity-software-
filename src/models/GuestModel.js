/**
 * Guest Model
 * Handles guest/event participant data operations
 */
const BaseModel = require('./BaseModel');

class GuestModel extends BaseModel {
  constructor() {
    super('guests');
  }

  /**
   * Find guests by event
   * @param {string|number} eventId - Event ID
   * @returns {Promise<Array>}
   */
  async findByEvent(eventId) {
    return await this.find({ eventId: parseInt(eventId) });
  }

  /**
   * Find guest by email and event
   * @param {string} email - Guest email
   * @param {string|number} eventId - Event ID
   * @returns {Promise<object|null>}
   */
  async findByEmailAndEvent(email, eventId) {
    return await this.findOne({
      email: email.toLowerCase(),
      eventId: parseInt(eventId)
    });
  }

  /**
   * Find guests by status
   * @param {string|number} eventId - Event ID
   * @param {string} status - Guest status
   * @returns {Promise<Array>}
   */
  async findByStatus(eventId, status) {
    return await this.find({
      eventId: parseInt(eventId),
      status
    });
  }

  /**
   * Update guest status
   * @param {string|number} id - Guest ID
   * @param {string} status - New status
   * @returns {Promise<object|null>}
   */
  async updateStatus(id, status) {
    return await this.updateById(id, { status });
  }

  /**
   * Create guest
   * @param {object} guestData - Guest data
   * @returns {Promise<object>}
   */
  async create(guestData) {
    const guest = {
      ...guestData,
      email: guestData.email.toLowerCase(),
      eventId: parseInt(guestData.eventId),
      invitedBy: parseInt(guestData.invitedBy),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await super.create(guest);
  }
}

module.exports = new GuestModel();
