const { Router } = require('express');

module.exports = (productManager, io) => {
    const router = Router();

    router.get('/', async (req, res) => {
        try {
            const products = await productManager.getProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener productos.' });
        }
    });

    router.get('/:pid', async (req, res) => {
        try {
            const product = await productManager.getProductById(req.params.pid);
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({ error: 'Producto no encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el producto.' });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const newProduct = await productManager.addProduct(req.body);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdated', updatedProducts); // Notifica a los clientes de WebSocket
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:pid', async (req, res) => {
        try {
            const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
            const products = await productManager.getProducts();
            io.emit('productsUpdated', products); // Notifica a los clientes de WebSocket
            res.json(updatedProduct);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    router.delete('/:pid', async (req, res) => {
        try {
            await productManager.deleteProduct(req.params.pid);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdated', updatedProducts); // Notifica a los clientes de WebSocket
            res.status(200).json({ message: 'Producto eliminado exitosamente.' });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    return router;
};