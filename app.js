import express from 'express';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';

const app = express();
app.use(express.json());

app.use('/products', productsRouter);
app.use('/carts', cartsRouter);

const PORT = 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server corriendo en http://localhost:${PORT}`)
);
app.on('error', (err) => {
  console.error('Error en el servidor:', err);
});