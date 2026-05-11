import { Router } from 'express';

const router = Router();

router.get('/api/products', (req, res) => {
    res.send([{ id: 123, name: 'iphone', price: 1200.00 }]);
})

export default router;