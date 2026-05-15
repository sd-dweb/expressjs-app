import { Router } from 'express';
import { query, validationResult, checkSchema, matchedData } from 'express-validator';
import { mockUsers } from '../mocks/mock-users.mjs';
import { createUserValidationSchema } from '../utils/validationSchemas.mjs';
import { resolveIndexById } from '../utils/middlewares.mjs';
import { User } from '../schemas/user.mjs';
import { hashedPassword } from '../utils/helper.mjs';

const router = Router();

router.get('/api/users',
  query('filter').isString().notEmpty()
    .isLength({ min: 3, max: 10 }).withMessage('Must be at least 3-10 characters'), (req, res) => {
    console.log(req.user);
    console.log(req.session);
    console.log(req.session.id);
    req.sessionStore.get(req.session.id, (err, sessionData) => {
      console.log('sessionData', sessionData);
    });
    const { query: { filter, value } } = req;

    if (filter && value) return res.send(
      mockUsers.filter((user) => user[filter].includes(value)),
    );

    return res.send(mockUsers);
  },
);

router.get('/api/users/:id', resolveIndexById, (req, res) => {
  const { findUserIndex } = req;
  const findUser = mockUsers[findUserIndex];
  if (!findUser) {
    return res.status(404).send({ msg: 'User not found!' });
  }

  return res.status(200).send(findUser);
});

router.post('/api/users',
  checkSchema(createUserValidationSchema),
  async (req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty())
      return res.status(400).send({ errors: result.array() });
    const data = matchedData(req);
    data.password = hashedPassword(data.password);
    const newUser = new User(data);

    try {
      const savedUser = await newUser.save();
      return res.status(201).send(savedUser);
    } catch (error) {
      console.error(error);
      return res.status(400);
    }
  });

router.put('/api/users/:id',  resolveIndexById, (req, res) => {
  const { body, findUserIndex } = req;

  mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body };

  return res.status(200).send(mockUsers[findUserIndex]);
});

router.put('/api/users/:id',  resolveIndexById, (req, res) => {
  const { body, findUserIndex } = req;

  mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body };

  return res.status(200).send(mockUsers[findUserIndex]);
});

router.patch('/api/users/:id', resolveIndexById, (req, res) => {
  const { body, findUserIndex } = req;

  mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body };

  return res.status(200).send(mockUsers[findUserIndex]);
});

router.delete('/api/users/:id', resolveIndexById, (req, res) => {
  const { findUserIndex } = req;

  mockUsers.splice(findUserIndex, 1);

  return res.status(200).send({ msg: 'User deleted successfully!' });
});

export default router;