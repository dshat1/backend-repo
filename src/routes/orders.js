// src/routes/orders.js

import { Router } from 'express';
import Cart from '../daos/models/cart.js';
import Order from '../daos/models/order.js';
import { validateIds } from '../middlewares/validateIds.js';
import Product from '../daos/models/product.js';
import { purchaseProducts } from '../services/purchaseService.js';
import Ticket from '../models/Ticket.js';

const router = Router();

// Endpoint para crear una orden a partir del carrito
router.post('/', async (req, res, next) => {
  try {
    const { name, lastName, email, phone, address, city } = req.body;
    const cartId = req.cookies.cartId;

    // Validación básica de campos
    if (!name || !lastName || !email || !phone || !address || !city || !cartId) {
      // Redirige de vuelta al checkout con un mensaje de error
      return res.status(400).redirect('/checkout?error=missing_fields');
    }

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart || cart.products.length === 0) {
      return res.status(400).redirect('/cart?error=empty_cart');
    }

    // Calcular el monto total y preparar los productos para el pedido
    let totalAmount = 0;
    const orderProducts = cart.products.map(item => {
      if (item.product) {
        totalAmount += item.product.price * item.quantity;
        return {
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        };
      }
      return null;
    }).filter(p => p !== null);

    // Crear el nuevo pedido
    const newOrder = await Order.create({
      code: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchaser: { name, lastName, email, phone, address, city },
      products: orderProducts,
      amount: totalAmount,
    });

    // Vaciar el carrito después de crear el pedido
    cart.products = [];
    await cart.save();

    // Redirigir a la página principal con un mensaje de éxito
    res.redirect('/?success=order_placed');
  } catch (err) {
    next(err);
  }
});

export default router;

// New endpoint: purchase from cart (creates ticket, checks stock)
import passport from '../passport/jwt.js';
router.post('/purchase', passport.authenticate('jwt', { session:false }), async (req, res, next) => {
  try {
    // assume cart id in cookie or user.cart
    const user = req.user;
    const cartId = req.cookies.cartId || (user.cart ? user.cart._id : null);
    if (!cartId) return res.status(400).json({ error: 'No cart' });
    const Cart = (await import('../daos/models/cart.js')).default;
    const cart = await Cart.findById(cartId).populate('products.product').lean();
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const result = await purchaseProducts(user, cart.products);
    // if some purchased, remove them from cart
    if (result.successful && result.successful.length > 0) {
      // filter out successful products from cart
      const remaining = cart.products.filter(cp => !result.successful.find(s => String(s.product._id) === String(cp.product._id)));
      const CartModel = (await import('../daos/models/cart.js')).default;
      const cdoc = await CartModel.findById(cartId);
      cdoc.products = remaining;
      await cdoc.save();
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});
