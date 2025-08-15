// src/routes/orders.js

import { Router } from 'express';
import Cart from '../daos/models/cart.js';
import Order from '../daos/models/order.js';
import { validateIds } from '../middlewares/validateIds.js';
import Product from '../daos/models/product.js';

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