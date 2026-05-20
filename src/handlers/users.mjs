import { matchedData, validationResult } from 'express-validator';
import { mockUsers } from '../mocks/mock-users.mjs';
import { hashedPassword } from '../utils/helper.mjs';
import { User } from '../schemas/user.mjs';

export const getUserByIdHandler = (request, response) => {
  const { findUserIndex } = request;
  const findUser = mockUsers[findUserIndex];
  if (!findUser) return response.sendStatus(404);
  return response.send(findUser);
};

export const createUserHandler = async (request, response) => {
  const result = validationResult(request);
  if (!result.isEmpty()) return response.status(400).send(result.array());
  const data = matchedData(request);
  data.password = hashedPassword(data.password);
  const newUser = new User(data);
  try {
    const savedUser = await newUser.save();
    return response.status(201).send(savedUser);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return response.status(409).send({ msg: `${field} already exists` });
    }
    console.error('Create user error:', err.message);
    return response.status(400).send({ msg: err.message });
  }
};