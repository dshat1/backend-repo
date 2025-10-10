import { Router } from 'express';
import Product from '../daos/models/product.js';
import Cart    from '../daos/models/cart.js';
import { parseQueryFilter } from '../utils/http.js';

const router = Router();

// Home
router.get('/', (_req, res) => {
  res.render('home', { title: 'Bienvenido a la API de productos y carritos' });
});

// Listado con paginación /products
router.get('/products', async (req, res) => {
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const sort  = req.query.sort === 'asc'
    ? { price: 1 }
    : req.query.sort === 'desc'
      ? { price: -1 }
      : {};
  const filter = parseQueryFilter(req.query.query);

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter)
  ]);

  const totalPages  = Math.max(1, Math.ceil(total / limit));
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  const mkLink = (p) => {
    const url = new URL(`${req.protocol}://${req.get('host')}${req.path}`);
    Object.entries(req.query).forEach(([k, v]) => {
      if (k !== 'page') url.searchParams.set(k, v);
    });
    url.searchParams.set('page', p);
    return url.toString();
  };

  res.render('index', {
    title:      'Productos',
    products:   items,
    page,
    totalPages,
    hasPrevPage,
    hasNextPage,
    prevLink: hasPrevPage ? mkLink(page - 1) : null,
    nextLink: hasNextPage ? mkLink(page + 1) : null,
    query: req.query.query || '',
    sort:  req.query.sort  || '',
    limit
  });
});

// Detalle de producto
router.get('/products/:pid', async (req, res) => {
  const product = await Product.findById(req.params.pid).lean();
  if (!product) {
    return res.status(404).render('404', { message: 'Producto no encontrado' });
  }
  res.render('products', { title: product.title, product });
});

// Vista de carrito
router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate('products.product')
      .lean();

    if (!cart) {
      return res.status(404).render('404', { message: 'Carrito no encontrado' });
    }

    // --- LÓGICA AÑADIDA ---
    // Calcula el subtotal para cada producto y el total del carrito
    let cartTotal = 0;
    cart.products.forEach(item => {
      // Nos aseguramos de que product no sea null
      if (item.product) {
        item.subtotal = item.product.price * item.quantity;
        cartTotal += item.subtotal;
      }
    });

    res.render('cart', {
      title: 'Tu Carrito de Compras',
      cart,
      cartTotal // Pasamos el total a la vista
    });
  } catch (err) {
    next(err);
  }
});
// Vista de Checkout
router.get('/checkout', async (req, res, next) => {
  try {
    const cartId = req.cookies.cartId;
    const cart = await Cart.findById(cartId).populate('products.product').lean();

    if (!cart || cart.products.length === 0) {
      // Si el carrito está vacío, no tiene sentido ir al checkout
      return res.redirect('/cart');
    }

    let cartTotal = 0;
    cart.products.forEach(item => {
      if (item.product) {
        item.subtotal = item.product.price * item.quantity;
        cartTotal += item.subtotal;
      }
    });

    res.render('checkout', {
      title: 'Finalizar Compra',
      cart,
      cartTotal,
    });
  } catch (err) {
    next(err);
  }
});

// Vista de Pedido Exitoso
router.get('/order-success/:oid', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.oid).lean();
    if (!order) {
      return res.status(404).render('404', { message: 'Pedido no encontrado' });
    }
    res.render('success', {
      title: 'Compra Exitosa',
      order,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
