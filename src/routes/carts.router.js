const { Router } = require('express');

module.exports = (cartManager, productManager) => { // Recibe ambos managers
    const router = Router();

    router.post('/', async (req, res) => {
        try {
            const newCart = await cartManager.createCart();
            res.status(201).json(newCart);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el carrito.' });
        }
    });

    router.get('/:cid', async (req, res) => {
        try {
            const cart = await cartManager.getCartById(req.params.cid);
            if (cart) {
                res.json(cart.products);
            } else {
                res.status(404).json({ error: 'Carrito no encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los productos del carrito.' });
        }
    });

    router.post('/:cid/product/:pid', async (req, res) => {
        try {
            const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
            res.status(200).json(updatedCart);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    return router;
};