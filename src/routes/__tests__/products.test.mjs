import { describe, test, expect } from '@jest/globals';
import express from 'express';
import cookieParser from 'cookie-parser';
import cookieSignature from 'cookie-signature';
import request from 'supertest';
import productsRouter from '../../routes/products.mjs';

const COOKIE_SECRET = 'test-secret';

// Helper: returns the signed cookie string that cookie-parser expects
// Format: hello=s%3A<value>.<signature>
function makeSignedCookie(name, value, secret) {
  const signed = 's:' + cookieSignature.sign(value, secret);
  return `${name}=${encodeURIComponent(signed)}`;
}

function createApp() {
  const app = express();
  app.use(cookieParser(COOKIE_SECRET));
  app.use(productsRouter);
  return app;
}

// ---------------------------------------------------------------------------
// GET /api/products
// ---------------------------------------------------------------------------
describe('GET /api/products', () => {
  test('should return 200 and product list when signed cookie is correct', async () => {
    const app = createApp();
    const cookie = makeSignedCookie('hello', 'world', COOKIE_SECRET);

    const res = await request(app)
      .get('/api/products')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: 123, name: 'iphone', price: 1200 });
  });

  test('should return 403 when no cookie is sent', async () => {
    const app = createApp();
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ msg: 'sorry. you need the correct cookie' });
  });

  test('should return 403 when signed cookie has wrong value', async () => {
    const app = createApp();
    const cookie = makeSignedCookie('hello', 'wrong-value', COOKIE_SECRET);

    const res = await request(app)
      .get('/api/products')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ msg: 'sorry. you need the correct cookie' });
  });

  test('should return 403 when cookie name is wrong', async () => {
    const app = createApp();
    const cookie = makeSignedCookie('other', 'world', COOKIE_SECRET);

    const res = await request(app)
      .get('/api/products')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ msg: 'sorry. you need the correct cookie' });
  });

  test('should return 403 when cookie is unsigned (plain value)', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/api/products')
      .set('Cookie', 'hello=world');

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ msg: 'sorry. you need the correct cookie' });
  });

  test('should return 403 when cookie is signed with the wrong secret', async () => {
    const app = createApp();
    const cookie = makeSignedCookie('hello', 'world', 'wrong-secret');

    const res = await request(app)
      .get('/api/products')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ msg: 'sorry. you need the correct cookie' });
  });

  test('response should contain expected product fields', async () => {
    const app = createApp();
    const cookie = makeSignedCookie('hello', 'world', COOKIE_SECRET);

    const res = await request(app)
      .get('/api/products')
      .set('Cookie', cookie);

    const [product] = res.body;
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(typeof product.id).toBe('number');
    expect(typeof product.name).toBe('string');
    expect(typeof product.price).toBe('number');
  });
});

