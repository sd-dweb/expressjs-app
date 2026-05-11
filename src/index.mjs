import express from 'express';
import usersRouter from './routes/users.mjs';

export const app = express();

app.use(express.json());
app.use(usersRouter);

const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} - ${req.originalUrl}`);
    next();
}

// app.use(loggingMiddleware);

const PORT = process.env.PORT || 3000;

app.get('/', loggingMiddleware, (req, res) => {
    res.status(200).send({ msg: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

