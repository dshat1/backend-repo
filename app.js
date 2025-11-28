import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';

// === New Imports ===
import passport from 'passport';
import sessionsRouter from './src/routes/sessions.js';
import usersRouter from './src/routes/users.js';

import connectDB from './src/config/db.js';
import Cart from './src/daos/models/cart.js';

// Routers
import productsRouter from './src/routes/products.js';
import cartsRouter from './src/routes/carts.js';
import viewsRouter from './src/routes/views.js';
import ordersRouter from './src/routes/orders.js';

// Load environment variables
dotenv.config();

// App setup
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== Template Engine ====================
const hbs = handlebars.create({
  helpers: { eq: (a, b) => a === b }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// ==================== Global Middlewares ====================
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());

// ==================== Custom Middlewares ====================

// Global style variable for views
app.use((req, res, next) => {
  res.locals.style = 'styles.css';
  next();
});

// Flash messages for feedback
app.use((req, res, next) => {
  const { success, error, product_name, stock } = req.query;
  if (success === 'order_placed') {
    res.locals.success_message = '✅ ¡Pedido realizado con éxito!';
  } else if (error === 'no_stock') {
    res.locals.error_message = `❌ La cantidad solicitada de "${product_name}" no está disponible. Stock actual: ${stock}.`;
  } else if (error === 'exceeds_stock') {
    res.locals.error_message = `❌ No puedes agregar más de "${product_name}". La cantidad total excede el stock disponible (${stock}).`;
  } else if (error === 'empty_cart') {
    res.locals.error_message = '❌ Tu carrito está vacío. No se puede realizar el pedido.';
  }
  next();
});

// Ensure cartId cookie and cart existence
app.use(async (req, res, next) => {
  try {
    let cartId = req.cookies.cartId;
    let cart = null;

    if (cartId) {
      cart = await Cart.findById(cartId);
    }
    if (!cart) {
      cart = await Cart.create({ products: [] });
      cartId = cart._id.toString();
      res.cookie('cartId', cartId, { httpOnly: true });
    }

    const totalItemsInCart = cart.products.reduce((acc, item) => acc + item.quantity, 0);

    res.locals.cartId = cartId;
    res.locals.totalItemsInCart = totalItemsInCart;

    next();
  } catch (err) {
    next(err);
  }
});

// ==================== Database Connection ====================
connectDB();

// ==================== Routes ====================
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/orders', ordersRouter);
app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);

// ==================== Error Handler ====================
app.use((err, req, res, next) => {
  console.error(err);
  if (req.originalUrl.startsWith('/api/')) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  } else {
    res.status(500).send('Error interno del servidor');
  }
});

// ==================== Server Start ====================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en http://localhost:${PORT}`);
});
import mocksRouter from "./src/routes/mocks.router.js";
app.use("/api/mocks", mocksRouter);
