import express from 'express';

export const app = express();

app.use(express.json());

const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} - ${req.originalUrl}`);
    next();
}

// app.use(loggingMiddleware);

const PORT = process.env.PORT || 3000;

const mockUsers = [
    { id: 1, name: 'John Doe', email: 'some@email.com' },
    { id: 2, name: 'John', email: 'john@email.com' },
    { id: 3, name: 'Bill', email: 'billg@gmail.com' },
    { id: 4, name: 'Billie', email: 'billie@gmail.com' },
];

app.get('/', loggingMiddleware, (req, res) => {
    res.status(200).send({ msg: 'Hello World!' });
});

app.get('/api/users', (req, res) => {
    const { query: { filter, value } } = req;

    if (filter && value) return res.send(
            mockUsers.filter((user) => user[filter].includes(value))
        )

    return res.send(mockUsers);
});

app.post('/api/users', (req, res) => {
    console.log(req.body);
    const { body } = req;
    const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...body };
    mockUsers.push(newUser);

    return res.status(201).send(newUser);
})

app.get('/api/users/:id', (req, res) => {
    const parsedId = parseInt(req.params.id);
    if (isNaN(parsedId)) {
        return res.status(400).send({ msg: 'Bad request. Invalid ID!' });
    }

    const findUser = mockUsers.find((mock) => mock.id === parsedId);
    if (!findUser) {
        return res.status(404).send({ msg: 'User not found!' });
    }

    return res.status(200).send(findUser);
})

app.get('/api/products', (req, res) => {
    res.send([
        { id: 123, name: 'iphone', price: 1023 },
    ])
})

app.put('/api/users/:id', (req, res) => {
    const { body, params: { id } } = req;
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
        return res.status(400).send({ msg: 'Bad request. Invalid ID!' });
    }

    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);

    if (findUserIndex === -1) {
        return res.status(404).send({ msg: 'User not found!' });
    }

    mockUsers[findUserIndex] = { id: parsedId, ...body };

    return res.status(200).send(mockUsers[findUserIndex]);
})

app.patch('/api/users/:id', (req, res) => {
    const { body, params: { id } } = req;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        return res.status(400).send({ msg: 'Bad request. Invalid ID!' });
    }

    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);

    if (findUserIndex === -1) {
        return res.status(404).send({ msg: 'User not found!' });
    }

    mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body };

    return res.status(200).send(mockUsers[findUserIndex]);
})

app.delete('/api/users/:id', (req, res) => {
    const { params: { id } } = req;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        return res.status(400).send({ msg: 'Bad request. Invalid ID!' });
    }
    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
    if (findUserIndex === -1) {
        return res.status(404).send({ msg: 'User not found!' });
    }
    mockUsers.splice(findUserIndex, 1)

    return res.status(200).send({ msg: 'User deleted successfully!' });
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

