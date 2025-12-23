/**
 * BaseModel Unit Tests (MySQL)
 */
const BaseModel = require('../../src/models/BaseModel');
const database = require('../../src/config/database');

// Mock database
jest.mock('../../src/config/database', () => ({
  getPool: jest.fn(),
  query: jest.fn(),
  queryOne: jest.fn()
}));

class TestModel extends BaseModel {
  constructor() {
    super('test_table');
  }
}

describe('BaseModel', () => {
  let model;
  let mockPool;

  beforeEach(() => {
    model = new TestModel();
    mockPool = {
      execute: jest.fn(),
      query: jest.fn()
    };
    database.getPool.mockReturnValue(mockPool);
    database.query.mockImplementation(async (sql, params) => {
      // Mock query results
      if (sql.includes('SELECT') && sql.includes('COUNT')) {
        return [{ count: 5 }];
      }
      if (sql.includes('SELECT')) {
        return [{ id: 1, name: 'Test' }];
      }
      if (sql.includes('INSERT')) {
        return { insertId: 1 };
      }
      if (sql.includes('UPDATE')) {
        return { affectedRows: 1 };
      }
      if (sql.includes('DELETE')) {
        return { affectedRows: 1 };
      }
      return [];
    });
  });

  describe('isValidId', () => {
    it('should validate correct integer ID', () => {
      expect(model.isValidId('1')).toBe(true);
      expect(model.isValidId(1)).toBe(true);
      expect(model.isValidId('123')).toBe(true);
    });

    it('should reject invalid ID', () => {
      expect(model.isValidId('invalid')).toBe(false);
      expect(model.isValidId('0')).toBe(false);
      expect(model.isValidId(null)).toBe(false);
      expect(model.isValidId(undefined)).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find document by id', async () => {
      database.query.mockResolvedValueOnce([{ id: 1, name: 'Test', created_at: new Date() }]);
      
      const result = await model.findById(1);
      
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Test');
      expect(database.query).toHaveBeenCalled();
    });

    it('should return null for invalid id', async () => {
      const result = await model.findById('invalid');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new document', async () => {
      database.query
        .mockResolvedValueOnce({ insertId: 1 }) // INSERT
        .mockResolvedValueOnce([{ id: 1, name: 'Test', created_at: new Date() }]); // SELECT

      const data = { name: 'Test' };
      const result = await model.create(data);

      expect(result).toHaveProperty('id');
      expect(database.query).toHaveBeenCalled();
    });
  });

  describe('updateById', () => {
    it('should update document by id', async () => {
      database.query
        .mockResolvedValueOnce({ affectedRows: 1 }) // UPDATE
        .mockResolvedValueOnce([{ id: 1, name: 'Updated', updated_at: new Date() }]); // SELECT

      const result = await model.updateById(1, { name: 'Updated' });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Updated');
    });

    it('should return null for invalid id', async () => {
      const result = await model.updateById('invalid', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete document by id', async () => {
      database.query.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await model.deleteById(1);

      expect(result).toBe(true);
    });

    it('should return false for invalid id', async () => {
      const result = await model.deleteById('invalid');
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count documents', async () => {
      database.query.mockResolvedValueOnce([{ count: 10 }]);

      const result = await model.count();

      expect(result).toBe(10);
    });
  });
});
