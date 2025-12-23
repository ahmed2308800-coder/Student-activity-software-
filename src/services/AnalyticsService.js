/**
 * Analytics Service
 * Provides analytics data for admin dashboard
 */
const userModel = require('../models/UserModel');
const eventModel = require('../models/EventModel');
const registrationModel = require('../models/RegistrationModel');
const { ROLES, EVENT_STATUS } = require('../config/constants');

class AnalyticsService {
  /**
   * Get dashboard statistics
   * @returns {Promise<object>} Analytics data
   */
  async getDashboardStats() {
    // Total users by role
    const totalUsers = await userModel.count();
    const students = await userModel.count({ role: ROLES.STUDENT });
    const clubReps = await userModel.count({ role: ROLES.CLUB_REPRESENTATIVE });
    const admins = await userModel.count({ role: ROLES.ADMIN });

    // Total events by status
    const totalEvents = await eventModel.count();
    const pendingEvents = await eventModel.count({ status: EVENT_STATUS.PENDING });
    const approvedEvents = await eventModel.count({ status: EVENT_STATUS.APPROVED });
    const rejectedEvents = await eventModel.count({ status: EVENT_STATUS.REJECTED });

    // Total registrations
    const totalRegistrations = await registrationModel.count();

    // Events per status (for charts)
    const eventsPerStatus = {
      pending: pendingEvents,
      approved: approvedEvents,
      rejected: rejectedEvents,
      cancelled: await eventModel.count({ status: EVENT_STATUS.CANCELLED })
    };

    // Users per role (for charts)
    const usersPerRole = {
      student: students,
      club_representative: clubReps,
      admin: admins,
      guest: await userModel.count({ role: ROLES.GUEST })
    };

    // Participation statistics
    const allEvents = await eventModel.find({ status: EVENT_STATUS.APPROVED });
    let totalSeats = 0;
    let totalRegistered = 0;

    for (const event of allEvents) {
      totalSeats += event.maxSeats;
      const regCount = await registrationModel.countByEvent(event.id || event._id);
      totalRegistered += regCount;
    }

    const participationRate = totalSeats > 0 
      ? ((totalRegistered / totalSeats) * 100).toFixed(2) 
      : 0;

    return {
      users: {
        total: totalUsers,
        byRole: usersPerRole,
        breakdown: {
          students,
          clubRepresentatives: clubReps,
          admins
        }
      },
      events: {
        total: totalEvents,
        byStatus: eventsPerStatus,
        breakdown: {
          pending: pendingEvents,
          approved: approvedEvents,
          rejected: rejectedEvents
        }
      },
      registrations: {
        total: totalRegistrations
      },
      participation: {
        totalSeats,
        totalRegistered,
        participationRate: parseFloat(participationRate)
      }
    };
  }

  /**
   * Get events statistics
   * @returns {Promise<object>}
   */
  async getEventsStats() {
    const events = await eventModel.find();
    const stats = {
      total: events.length,
      byStatus: {},
      byCategory: {},
      upcoming: 0,
      past: 0
    };

    const now = new Date();

    for (const event of events) {
      // Count by status
      stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;

      // Count by category
      const category = event.category || 'general';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count upcoming vs past
      const eventDate = new Date(event.date);
      if (eventDate > now) {
        stats.upcoming++;
      } else {
        stats.past++;
      }
    }

    return stats;
  }

  /**
   * Get participation statistics
   * @returns {Promise<object>}
   */
  async getParticipationStats() {
    const approvedEvents = await eventModel.find({ status: EVENT_STATUS.APPROVED });
    const stats = {
      totalEvents: approvedEvents.length,
      totalSeats: 0,
      totalRegistrations: 0,
      averageRegistrationsPerEvent: 0,
      mostPopularEvents: []
    };

    const eventRegistrations = [];

    for (const event of approvedEvents) {
      stats.totalSeats += event.maxSeats;
      const eventId = event.id || event._id;
      const regCount = await registrationModel.countByEvent(eventId);
      stats.totalRegistrations += regCount;
      eventRegistrations.push({
        eventId: eventId.toString(),
        title: event.title,
        registrations: regCount,
        maxSeats: event.maxSeats
      });
    }

    stats.averageRegistrationsPerEvent = approvedEvents.length > 0
      ? (stats.totalRegistrations / approvedEvents.length).toFixed(2)
      : 0;

    // Get top 5 most popular events
    stats.mostPopularEvents = eventRegistrations
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 5);

    return stats;
  }
}

module.exports = new AnalyticsService();

