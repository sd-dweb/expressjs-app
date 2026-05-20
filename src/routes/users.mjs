import { Router } from 'express';
import { query, checkSchema } from 'express-validator';
import { mockUsers } from '../mocks/mock-users.mjs';
import { User } from '../schemas/user.mjs';
import { createUserValidationSchema } from '../utils/validationSchemas.mjs';
import { resolveIndexById } from '../utils/middlewares.mjs';
import { createUserHandler } from '../handlers/users.mjs';

const router = Router();

router.get('/api/users',
  query('filter').isString().notEmpty()
    .isLength({ min: 3, max: 10 }).withMessage('Must be at least 3-10 characters'), async (req, res) => {
    // console.log(req.user);
    // console.log(req.session);
    // console.log(req.session.id);
    // req.sessionStore.get(req.session.id, (err, sessionData) => {
    //   console.log('sessionData', sessionData);
    // });
    const { query: { filter, value } } = req;

    const query = filter && value ? { [filter]: { $regex: value, $options: 'i' } } : {};
    const users = await User.find(query);

    return res.send(users);
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
  createUserHandler,
);

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

router.delete('/api/users/:id', async (req, res) => {
  const { params: { id } } = req;

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) return res.status(404).send({ msg: 'User not found!' });

  return res.status(200).send({ msg: 'User deleted successfully!' });
});

export default router;