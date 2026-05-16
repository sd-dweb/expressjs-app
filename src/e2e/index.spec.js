import request from 'supertest';
import express from 'express';

const app = express();

app.get('/hello', (req, res) => res.sendStatus(200));

describe('Home page', () => {
    it('get hello endpoint expect 200', async () => {
        const res = await request(app)
            .get('/hello')
            .expect(200);

        expect(res.statusCode).toBe(200);
    })
})