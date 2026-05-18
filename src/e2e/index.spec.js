import request from 'supertest';
import { createApp } from '../createApp.mjs';
import mongoose from 'mongoose';

describe('api/auth/status', () => {
  let app;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/express_db_test')
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => console.log(err));

    app = createApp();
  });

  it('should return 401 when not logged in', async () => {
    const res = await request(app).get('/api/auth/status');
    expect(res.statusCode).toBe(401);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});