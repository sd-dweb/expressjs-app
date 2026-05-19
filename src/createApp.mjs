import routes from './routes/index.mjs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import './strategies/local-strategy.mjs';
// import './strategies/google-strategy.mjs';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.mjs';

export function createApp() {
  const app = express();

  // CORS
  app.use(cors({ origin: 'http://localhost:4200' }));

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(express.json());
  app.use(cookieParser('secret'));
  app.use(session({
    secret: 'secret-secret',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(routes);

  const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} - ${req.originalUrl}`);
    next();
  };

  app.post('/api/auth',
    passport.authenticate('local'),
    (req, res) => {
      res.sendStatus(200);
    },
  );

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
    console.log('SessionID: ', req.session.id);
    // req.sessionStore.get(req.sessionID, (err, session) => {
    //     console.log(session);
    // })

    return req.user
      ? res.status(200).send({ authenticated: true, user: req.user })
      : res.status(401).send('Unauthorized');
  });

  app.post('/api/auth/logout', (req, res) => {
    if (!req.user) return res.status(401).send('Unauthorized');
    req.logout((err) => {
      if (err) return res.sendStatus(400);
      return res.status(200).send('Logged out successfully');
    });
  });

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
  });

  app.get('/api/cart', (req, res) => {
    if (!req.session.user) return res.status(401).send('Bad credentials');
    res.status(200).send(req.session.cart ?? []);
  });

  app.get('/api/auth/google', passport.authenticate('google'), (_req, _res) => {

  });

  app.get('/api/auth/google/redirect', passport.authenticate('google'), (req, res) => {
    console.log('req.session: ', req.session);
    console.log('req.user', req.user);
    res.status(200).send('Google authentication successful');
  });

  return app;
}