/**
 * NotificationObserver Unit Tests
 */
const notificationModule = require('../../src/notifications/NotificationObserver');
const { NotificationSubject, NotificationObserver } = notificationModule;

describe('NotificationObserver Pattern', () => {
  let subject;

  beforeEach(() => {
    // Create a fresh subject for each test
    subject = new NotificationSubject();
  });

  describe('Observer Pattern Implementation', () => {
    it('should attach and notify observers', async () => {
      const mockObserver = {
        update: jest.fn()
      };

      subject.attach(mockObserver);

      const notificationData = {
        userId: '507f1f77bcf86cd799439011',
        type: 'test',
        title: 'Test',
        message: 'Test message'
      };

      await subject.notify(notificationData);

      expect(mockObserver.update).toHaveBeenCalledWith(notificationData);
    });

    it('should detach observers', () => {
      const mockObserver = {
        update: jest.fn()
      };

      subject.attach(mockObserver);
      subject.detach(mockObserver);

      expect(subject.observers).not.toContain(mockObserver);
    });

    it('should notify multiple observers', async () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };

      subject.attach(observer1);
      subject.attach(observer2);

      const notificationData = {
        userId: '507f1f77bcf86cd799439011',
        type: 'test',
        title: 'Test',
        message: 'Test message'
      };

      await subject.notify(notificationData);

      expect(observer1.update).toHaveBeenCalled();
      expect(observer2.update).toHaveBeenCalled();
    });
  });

  describe('Notification Methods', () => {
    it('should notify about event submission', async () => {
      const notifySpy = jest.spyOn(subject, 'notify');
      const event = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Event'
      };
      const userId = '507f1f77bcf86cd799439012';

      await subject.notifyEventSubmitted(event, userId);

      expect(notifySpy).toHaveBeenCalled();
    });

    it('should notify about event approval', async () => {
      const notifySpy = jest.spyOn(subject, 'notify');
      const event = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Event'
      };
      const userId = '507f1f77bcf86cd799439012';

      await subject.notifyEventApproved(event, userId);

      expect(notifySpy).toHaveBeenCalled();
    });
  });
});

