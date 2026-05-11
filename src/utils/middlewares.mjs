import { mockUsers } from '../mocks/mock-users.mjs';

export const resolveIndexById = (req, res, next) => {
    const { params: { id } } = req;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        return res.status(400).send({ msg: 'Bad request. Invalid ID!' });
    }

    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);

    if (findUserIndex === -1) {
        return res.status(404).send({ msg: 'User not found!' });
    }
    req.findUserIndex = findUserIndex;
    next();
}