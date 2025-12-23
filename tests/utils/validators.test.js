/**
 * Validators Unit Tests
 */
const Validators = require('../../src/utils/validators');

describe('Validators', () => {
  describe('sanitizeInput', () => {
    it('should remove MongoDB operators from strings', () => {
      const input = 'test$injection';
      const result = Validators.sanitizeInput(input);
      expect(result).toBe('testinjection');
    });

    it('should sanitize objects', () => {
      const input = {
        name: 'test',
        $where: 'malicious',
        normal: 'value'
      };
      const result = Validators.sanitizeInput(input);
      expect(result).not.toHaveProperty('$where');
      expect(result).toHaveProperty('name');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(Validators.isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(Validators.isValidEmail('invalid')).toBe(false);
      expect(Validators.isValidEmail('test@')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = Validators.validatePassword('Password123');
      expect(result.valid).toBe(true);
    });

    it('should reject weak password', () => {
      const result = Validators.validatePassword('weak');
      expect(result.valid).toBe(false);
    });
  });

  describe('isValidObjectId', () => {
    it('should validate correct ObjectId', () => {
      expect(Validators.isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('should reject invalid ObjectId', () => {
      expect(Validators.isValidObjectId('invalid')).toBe(false);
    });
  });

  describe('validateEventData', () => {
    it('should validate correct event data', () => {
      const eventData = {
        title: 'Test Event',
        description: 'This is a test event description',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: { name: 'Test Location' },
        maxSeats: 10
      };
      const result = Validators.validateEventData(eventData);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid event data', () => {
      const eventData = {
        title: 'AB',
        description: 'Short',
        date: 'invalid',
        maxSeats: 0
      };
      const result = Validators.validateEventData(eventData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

