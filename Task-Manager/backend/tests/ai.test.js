import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { aiService } from '../services/aiService.js';

describe('Practical 13: AI-Powered Task Description Generation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Successful description generation
  test('POST /api/ai/generate-description should return 200 with generated description', async () => {
    const mockGeneratedDescription =
      'Revise important DSA concepts and solve practice problems before the examination.';

    jest.spyOn(aiService, 'generateDescription').mockResolvedValue(mockGeneratedDescription);

    const response = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Prepare for DSA examination' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      description: mockGeneratedDescription,
    });
  });

  // 2. Empty or invalid task title
  test('POST /api/ai/generate-description should return 400 if title is empty or missing', async () => {
    const responseEmpty = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: '   ' });

    expect(responseEmpty.status).toBe(400);
    expect(responseEmpty.body).toHaveProperty('success', false);
    expect(responseEmpty.body.message).toMatch(/title is required/i);

    const responseMissing = await request(app)
      .post('/api/ai/generate-description')
      .send({});

    expect(responseMissing.status).toBe(400);
    expect(responseMissing.body).toHaveProperty('success', false);
  });

  // 3. Excessively long task title
  test('POST /api/ai/generate-description should return 400 if title exceeds maximum length', async () => {
    const longTitle = 'A'.repeat(305);

    const response = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: longTitle });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toMatch(/exceeds maximum allowed limit/i);
  });

  // 4. Missing API configuration
  test('POST /api/ai/generate-description should return 500 when AI API key is unconfigured', async () => {
    const missingKeyError = new Error('Groq API key is not configured on the server. Please set GROQ_API_KEY in the backend environment.');
    missingKeyError.statusCode = 500;
    missingKeyError.code = 'MISSING_API_KEY';

    jest.spyOn(aiService, 'generateDescription').mockRejectedValue(missingKeyError);

    const response = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Implement search feature' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toMatch(/API key is not configured/i);
  });

  // 5. AI provider failure / upstream error
  test('POST /api/ai/generate-description should return 502 when AI provider returns an error', async () => {
    const providerError = new Error('AI provider error: Upstream model failed to process request.');
    providerError.statusCode = 502;

    jest.spyOn(aiService, 'generateDescription').mockRejectedValue(providerError);

    const response = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Refactor database queries' });

    expect(response.status).toBe(502);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toMatch(/AI provider error/i);
  });

  // 6. Rate limit / quota error (429)
  test('POST /api/ai/generate-description should return 429 when rate limit is reached', async () => {
    const rateLimitError = new Error('AI provider rate limit reached. Please wait a moment before trying again.');
    rateLimitError.statusCode = 429;

    jest.spyOn(aiService, 'generateDescription').mockRejectedValue(rateLimitError);

    const response = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Setup Redis cluster' });

    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toMatch(/rate limit/i);
  });

  // 7. Timeout / Network error (504)
  test('POST /api/ai/generate-description should return 504 when AI request times out', async () => {
    const timeoutError = new Error('AI request timed out after 15 seconds.');
    timeoutError.statusCode = 504;

    jest.spyOn(aiService, 'generateDescription').mockRejectedValue(timeoutError);

    const response = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Deploy to AWS' });

    expect(response.status).toBe(504);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toMatch(/timed out/i);
  });

  // 8. Service unit validation for missing API key
  test('aiService.generateDescription should enforce validation directly', async () => {
    await expect(aiService.generateDescription('')).rejects.toHaveProperty('statusCode', 400);
    await expect(aiService.generateDescription('A'.repeat(305))).rejects.toHaveProperty('statusCode', 400);
  });
});
