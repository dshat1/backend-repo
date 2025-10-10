import authorize from '../middlewares/authorization.js';
import { Router } from 'express';
import passport from '../passport/jwt.js';
import mongoose from 'mongoose';
import Cart from '../daos/models/cart.js';
import Product from '../daos/models/product.js';
import { validateIds } from '../middlewares/validateIds.js';

const router = Router();

// Obtener carrito (populate)
router.get('/:cid',
  validateIds('cid'),
  async (req, res) => {
    const cart = await Cart.findById(req.params.cid)
      .populate('products.product')
      .lean();
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  }
);

// Crear carrito
router.post('/', async (_req, res) => {
  const created = await Cart.create({ products: [] });
  res.status(201).json({ status: 'success', payload: created });
});

// Agregar o incrementar producto
router.post('/:cid/products/:pid',
  validateIds('cid', 'pid'),
  async (req, res, next) => {
    try {
      let { quantity } = req.body;
      quantity = Math.max(1, Number(quantity) || 1);

      const product = await Product.findById(req.params.pid);
      if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

      const cart = await Cart.findById(req.params.cid);
      if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

      const item = cart.products.find(p => String(p.product) === req.params.pid);
      if (item) {
        if (item.quantity + quantity > product.stock) {
          return res.status(400).redirect(`back?error=exceeds_stock&product_name=${product.title}&stock=${product.stock}`);
        }
        item.quantity += quantity;
      } else {
        if (quantity > product.stock) {
          return res.status(400).redirect(`back?error=no_stock&product_name=${product.title}&stock=${product.stock}`);
        }
        cart.products.push({ product: req.params.pid, quantity });
      }

      await cart.save();
      
      res.redirect('back');

    } catch(err) {
      next(err);
    }
  }
);

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid',
  validateIds('cid', 'pid'),
  async (req, res) => {
    const updated = await Cart.findByIdAndUpdate(
      req.params.cid,
      { $pull: { products: { product: req.params.pid } } },
      { new: true }
    )
    .populate('products.product')
    .lean();

    if (!updated) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.redirect(`/carts/${req.params.cid}`);
  }
);

// Reemplazar todos los productos
router.put('/:cid',
  validateIds('cid'),
  async (req, res) => {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', message: 'products debe ser un array' });
    }

    const ids = products.map(p => p.product);
    if (!ids.every(id => mongoose.isValidObjectId(id))) {
      return res.status(400).json({ status: 'error', message: 'Algún productId es inválido' });
    }
    const count = await Product.countDocuments({ _id: { $in: ids } });
    if (count !== ids.length) {
      return res.status(400).json({ status: 'error', message: 'Algún productId no existe' });
    }

    const normalized = products.map(p => ({
      product: p.product,
      quantity: Math.max(1, Number(p.quantity) || 1)
    }));

    const updated = await Cart.findByIdAndUpdate(
      req.params.cid,
      { $set: { products: normalized } },
      { new: true }
    )
    .populate('products.product')
    .lean();

    if (!updated) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: updated });
  }
);

// Actualizar sólo cantidad de un producto
router.post('/:cid/products/:pid/update-quantity',
  validateIds('cid', 'pid'),
  async (req, res, next) => {
    try {
      let { quantity } = req.body;
      quantity = Math.max(1, Number(quantity) || 1);

      const cart = await Cart.findById(req.params.cid);
      if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }

      const item = cart.products.find(p => String(p.product) === req.params.pid);
      if (!item) {
        return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
      }
      
      const product = await Product.findById(req.params.pid);
      if (!product) {
        return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
      }

      if (quantity > product.stock) {
        return res.status(400).json({ status: 'error', message: `La cantidad no puede exceder el stock disponible (${product.stock}).` });
      }

      item.quantity = quantity;
      await cart.save();

      res.json({ status: 'success', message: 'Cantidad actualizada', payload: cart });
    } catch (err) {
      next(err);
    }
  }
);

// Vaciar carrito
router.delete('/:cid',
  validateIds('cid'),
  async (req, res) => {
    const updated = await Cart.findByIdAndUpdate(
      req.params.cid,
      { $set: { products: [] } },
      { new: true }
    )
    .populate('products.product')
    .lean();

    if (!updated) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.redirect(`/carts/${req.params.cid}`);
  }
);

export default router;