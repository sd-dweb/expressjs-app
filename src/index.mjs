import express from 'express';
import routes from './routes/index.mjs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { mockUsers } from "./mocks/mock-users.mjs";
import passport from 'passport';
import './strategies/local-strategy.mjs'

export const app = express();

app.use(express.json());
app.use(cookieParser('secret'));
app.use(session({
    secret: 'secret-secret',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} - ${req.originalUrl}`);
    next();
}

const PORT = process.env.PORT || 3000;

app.post('/api/auth',
    passport.authenticate('local'),
    (req, res) => {
        res.sendStatus(200);
    }
)

app.get('/', loggingMiddleware, (req, res) => {
    console.log(req.session);
    console.log(req.session.id);
    req.session.visited = true;
    res.cookie('hello', 'world', { maxAge: 60 * 60 * 1000, signed: true });
    res.status(200).send({ msg: 'Hello World!' });
});

app.get('/api/auth/status', (req, res) => {
    console.log('Inside /auth/status endpoint', req.user);
    console.log('Inside /auth/status endpoint', req.session);
    // req.sessionStore.get(req.sessionID, (err, session) => {
    //     console.log(session);
    // })

    return req.user
        ? res.status(200).send({ authenticated: true, user: req.user })
        : res.status(401).send('Unauthorized');
})

app.post('/api/auth/logout', (req, res) => {
    if (!req.user) return res.status(401).send('Unauthorized');
    req.logout((err) => {
        if (err) return res.sendStatus(400);
        return res.status(200).send('Logged out successfully');
    });
})

app.post('/api/cart', (req, res) => {
    if (!req.session.user) return res.status(401).send('Bad credentials');
    const { body: item } = req;
    const { cart } = req.session;

    if (cart) {
        cart.push(item);
    } else {
        req.session.cart = [item];
    }

    return res.status(201).send(item);
})

app.get('/api/cart', (req, res) => {
    if (!req.session.user) return res.status(401).send('Bad credentials');
    res.status(200).send(req.session.cart ?? []);
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

