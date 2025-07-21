const { Router } = require('express');

module.exports = (io, productManager) => {
    const router = Router();

    router.get('/', async (req, res) => {
        try {
            const products = await productManager.getProducts();
            res.render('home', { products: products, style: 'styles.css' });
        } catch (error) {
            res.status(500).send("Error al cargar la página de inicio.");
        }
    });

    router.get('/products', async (req, res) => {
        try {
            res.render('products', { style: 'styles.css' });
        } catch (error) {
            res.status(500).send("Error al cargar la página de productos.");
        }
    });

    return router;
};