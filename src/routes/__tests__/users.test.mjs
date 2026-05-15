import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import express from 'express';
import session from 'express-session';
import request from 'supertest';

// --- Mock User mongoose model (must be before any dynamic import) ---
jest.unstable_mockModule('../../schemas/user.mjs', () => {
  const UserMock = jest.fn();
  return { User: UserMock };
});

// --- Mock mockUsers so mutations don't bleed between tests ---
const mockUsersData = [
  { id: 1, name: 'John Doe', email: 'some@email.com', password: '123456' },
  { id: 2, name: 'john', email: 'john@email.com', password: '123456' },
  { id: 3, name: 'Bill', email: 'billg@gmail.com', password: '123456' },
  { id: 4, name: 'Billie', email: 'billie@gmail.com', password: '123456' },
];

jest.unstable_mockModule('../../mocks/mock-users.mjs', () => ({
  mockUsers: mockUsersData.map((u) => ({ ...u })),
}));

// Dynamically import after mocks are set up
const { default: usersRouter } = await import('../../routes/users.mjs');
const { User } = await import('../../schemas/user.mjs');
const { mockUsers } = await import('../../mocks/mock-users.mjs');

// --- Helper: build a minimal Express app with session for each suite ---
function createApp() {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: 'test-secret',
      saveUninitialized: false,
      resave: false,
    }),
  );
  app.use(usersRouter);
  return app;
}

// Reset mockUsers array contents before every test
beforeEach(() => {
  mockUsers.length = 0;
  mockUsersData.forEach((u) => mockUsers.push({ ...u }));
});

// ---------------------------------------------------------------------------
// GET /api/users
// ---------------------------------------------------------------------------
describe('GET /api/users', () => {
  test('should return all users when no query params are given', async () => {
    const app = createApp();
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
    expect(res.body[0]).toMatchObject({ id: 1, name: 'John Doe' });
  });

  test('should filter users by name field', async () => {
    const app = createApp();
    const res = await request(app).get('/api/users?filter=name&value=john');

    expect(res.status).toBe(200);
    // 'John Doe'.includes('john') === false  (case-sensitive),
    // 'john'.includes('john') === true
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: 2, name: 'john' });
  });

  test('should filter users by email field', async () => {
    const app = createApp();
    const res = await request(app).get('/api/users?filter=email&value=gmail');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((u) => u.id)).toEqual(expect.arrayContaining([3, 4]));
  });

  test('should return all users when only filter param is provided (no value)', async () => {
    const app = createApp();
    const res = await request(app).get('/api/users?filter=name');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });

  test('should return all users when only value param is provided (no filter)', async () => {
    const app = createApp();
    const res = await request(app).get('/api/users?value=john');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// GET /api/users/:id
// ---------------------------------------------------------------------------
describe('GET /api/users/:id', () => {
  test('should return user with the given id', async () => {
    const app = createApp();
    const res = await request(app).get('/api/users/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, name: 'John Doe' });
  });

  test('should return 404 when user is not found', async () => {
    const app = createApp();
    const res = await request(app).get('/api/users/999');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ msg: 'User not found!' });
  });

  test('should return 400 for non-numeric id', async () => {
    const app = createApp();
    const res = await request(app).get('/api/users/abc');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ msg: 'Bad request. Invalid ID!' });
  });
});

// ---------------------------------------------------------------------------
// POST /api/users
// ---------------------------------------------------------------------------
describe('POST /api/users', () => {
  test('should create a new user and return 201', async () => {
    const savedUser = {
      _id: 'some-mongo-id',
      name: 'Alice',
      email: 'alice@example.com',
    };
    User.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savedUser),
    }));

    const app = createApp();
    const res = await request(app).post('/api/users').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'securepass',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
    expect(User).toHaveBeenCalledTimes(1);
  });

  test('should return 400 when required fields are missing', async () => {
    const app = createApp();
    const res = await request(app).post('/api/users').send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('should return 400 when name is too short', async () => {
    const app = createApp();
    const res = await request(app).post('/api/users').send({
      name: 'Al', // less than 3 chars
      email: 'alice@example.com',
      password: 'securepass',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('should return 400 when email is missing', async () => {
    const app = createApp();
    const res = await request(app).post('/api/users').send({
      name: 'Alice',
      password: 'securepass',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('should return 400 when password is missing', async () => {
    const app = createApp();
    const res = await request(app).post('/api/users').send({
      name: 'Alice',
      email: 'alice@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('should hash the password before saving', async () => {
    let capturedData = {};
    User.mockImplementation((data) => {
      capturedData = data;
      return {
        save: jest.fn().mockResolvedValue({ ...data, _id: 'id' }),
      };
    });

    const app = createApp();
    await request(app).post('/api/users').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'plainpassword',
    });

    expect(capturedData.password).toBeDefined();
    expect(capturedData.password).not.toBe('plainpassword');
    // bcrypt hashes start with $2
    expect(capturedData.password).toMatch(/^\$2/);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/users/:id
// ---------------------------------------------------------------------------
describe('PUT /api/users/:id', () => {
  test('should replace a user and return the updated user', async () => {
    const app = createApp();
    const res = await request(app).put('/api/users/1').send({
      name: 'Updated Name',
      email: 'updated@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, name: 'Updated Name', email: 'updated@example.com' });
    // Original password field should be replaced (PUT replaces the whole object)
    expect(res.body.password).toBeUndefined();
  });

  test('should return 404 when user id does not exist', async () => {
    const app = createApp();
    const res = await request(app).put('/api/users/999').send({ name: 'Test' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ msg: 'User not found!' });
  });

  test('should return 400 for non-numeric id', async () => {
    const app = createApp();
    const res = await request(app).put('/api/users/abc').send({ name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ msg: 'Bad request. Invalid ID!' });
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/users/:id
// ---------------------------------------------------------------------------
describe('PATCH /api/users/:id', () => {
  test('should partially update a user and preserve existing fields', async () => {
    const app = createApp();
    const res = await request(app).patch('/api/users/1').send({
      name: 'Patched Name',
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      name: 'Patched Name',
      email: 'some@email.com', // original email preserved
    });
  });

  test('should return 404 when user id does not exist', async () => {
    const app = createApp();
    const res = await request(app).patch('/api/users/999').send({ name: 'Test' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ msg: 'User not found!' });
  });

  test('should return 400 for non-numeric id', async () => {
    const app = createApp();
    const res = await request(app).patch('/api/users/abc').send({ name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ msg: 'Bad request. Invalid ID!' });
  });

  test('should update only the provided fields', async () => {
    const app = createApp();
    const res = await request(app).patch('/api/users/2').send({
      email: 'newemail@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 2,
      name: 'john',               // unchanged
      email: 'newemail@example.com', // updated
    });
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/users/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/users/:id', () => {
  test('should delete a user and return success message', async () => {
    const app = createApp();
    const res = await request(app).delete('/api/users/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ msg: 'User deleted successfully!' });
    expect(mockUsers).toHaveLength(3);
    expect(mockUsers.find((u) => u.id === 1)).toBeUndefined();
  });

  test('should return 404 when user id does not exist', async () => {
    const app = createApp();
    const res = await request(app).delete('/api/users/999');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ msg: 'User not found!' });
  });

  test('should return 400 for non-numeric id', async () => {
    const app = createApp();
    const res = await request(app).delete('/api/users/abc');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ msg: 'Bad request. Invalid ID!' });
  });

  test('should not affect other users when one is deleted', async () => {
    const app = createApp();
    await request(app).delete('/api/users/2');

    expect(mockUsers).toHaveLength(3);
    expect(mockUsers.map((u) => u.id)).toEqual([1, 3, 4]);
  });
});

