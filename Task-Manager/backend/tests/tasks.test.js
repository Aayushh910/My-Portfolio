import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { Todo } from '../models/Todo.js';

describe('Task Management CI/CD API Test Suite', () => {
  const mockTasks = [
    {
      _id: '67123456789abcdef0123456',
      title: 'CI/CD Pipeline Setup',
      description: 'Implement GitHub Actions CI workflow for Practical 12',
      status: 'pending',
      priority: 'high',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    // Mock the Mongoose query chain: Todo.find().sort().lean()
    jest.spyOn(Todo, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTasks),
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Practical 12 Primary Requirement: GET /tasks returns HTTP status 200
  test('GET /tasks should return HTTP status 200 and a list of tasks', async () => {
    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0]).toHaveProperty('title', 'CI/CD Pipeline Setup');
  });

  // Post-Laboratory Assignment Requirement: Automated test for a second endpoint
  test('GET /api/health should return HTTP status 200 and system operational status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'Todo Management API');
    expect(response.body).toHaveProperty('timestamp');
  });
});
