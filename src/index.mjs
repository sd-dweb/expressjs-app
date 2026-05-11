import express from 'express';
import routes from './routes/index.mjs';
import cookieParser from 'cookie-parser';

export const app = express();

app.use(express.json());
app.use(cookieParser('secret'));
app.use(routes);

const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} - ${req.originalUrl}`);
    next();
}

const PORT = process.env.PORT || 3000;

app.get('/', loggingMiddleware, (req, res) => {
    res.cookie('hello', 'world', { maxAge: 60 * 60 * 1000, signed: true });
    res.status(200).send({ msg: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

