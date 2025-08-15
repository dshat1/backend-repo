import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import productsRouter from './src/routes/products.js';
import cartsRouter from './src/routes/carts.js';
import viewsRouter from './src/routes/views.js';
import methodOverride from 'method-override';
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import Cart from './src/daos/models/cart.js';
import ordersRouter from './src/routes/orders.js'; 

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handlebars
const hbs = handlebars.create({
  helpers: { eq: (a, b) => a === b }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use('/api/orders', ordersRouter);

// Estilo global
app.use((req, res, next) => {
  res.locals.style = 'styles.css';
  next();
});

// Mensajes flash
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

// CartId en cookie
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

// Conexión a MongoDB
connectDB();

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (req.originalUrl.startsWith('/api/')) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  } else {
    res.status(500).send('Error interno del servidor');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en http://localhost:${PORT}`);
});