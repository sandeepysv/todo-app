import request from 'supertest';
import { app, server } from '../src/app';
import mongoose from 'mongoose';
import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import User from '../src/models/user.model';

describe('User APIs', () => {
  // Test user object to use in test cases
  const adminUser = {
    username: 'admin',
    password: 'password',
    role: 'admin',
  };

  // Variable to store the JWT token for the test user
  let token: string;

  // Before all tests, create a user and get the JWT token
  beforeAll(async () => {
    await User.deleteMany({});
    const res = await request(app).post('/api/user').send(adminUser);
    token = res.body.token;
  });

  describe('POST /api/user', () => {
    it('should create a new user', async () => {
      const res = await request(app).post('/api/user').send({
        username: 'user',
        password: 'password',
        role: 'user',
      });
      expect(res.status).toBe(201);
      expect(res.body.username).toBe('user');
    });

    it('should return 409 if username already taken', async () => {
      const res = await request(app).post('/api/user').send(adminUser);
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Username already taken');
    });
  });

  describe('POST /api/login', () => {
    it('should log into an existing user', async () => {
      const res = await request(app).post('/api/login').send(adminUser);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe(adminUser.username);
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 if username or password is invalid', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: adminUser.username, password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid username or password');
    });
  });

  describe('GET /api/user', () => {
    it('should return the logged in user object', async () => {
      const res = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe(adminUser.username);
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app).get('/api/user');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication Failed!');
    });
  });

  // After all tests, close the Mongoose and Express servers
  afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
  });

});