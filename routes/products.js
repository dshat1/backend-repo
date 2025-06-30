import { Router } from 'express';
import { ProductManager } from '../managers/productManager.js';

const router = Router();
const pm = new ProductManager('./data/products.json');

router.get('/', async (req, res) => {
  const list = await pm.getProducts();
  res.json({ products: list });
});

router.get('/:pid', async (req, res) => {
  const prod = await pm.getProductById(+req.params.pid);
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(prod);
});

router.post('/', async (req, res) => {
  try {
    const newProd = await pm.addProduct(req.body);
    res.status(201).json(newProd);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const updated = await pm.updateProduct(+req.params.pid, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    await pm.deleteProduct(+req.params.pid);
    res.sendStatus(204);
  } catch {
    res.status(400).json({ error: 'No se pudo eliminar' });
  }
});

export default router;
