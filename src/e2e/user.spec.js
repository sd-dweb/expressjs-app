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

  it('should create the user', async () => {
    const res = await request(app).post('/api/users').send(
      { id: 1, name: 'John Doe', email: 'some@email.com', password: '123456' },
    );
    expect(res.statusCode).toBe(201);
  });

  it('should log the user information and visit /api/auth/status and return authenticated user', async () => {
    const response = await request(app).post('/api/auth/')
      .send({ name: 'John Doe', password: '123456' })
      .then((res) => {
        return request(app)
          .get('/api/auth/status')
          .set('Cookie', res.header['set-cookie']);
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.user.name).toBe('John Doe');
    expect(response.body.user.email).toBe('some@email.com');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});