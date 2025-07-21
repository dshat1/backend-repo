const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const ProductManager = require('./daos/ProductManager');
const CartManager = require('./daos/CartManager'); // NUEVO
const productManager = new ProductManager(path.join(__dirname, 'daos', 'products.json'));
const cartManager = new CartManager(path.join(__dirname, 'daos', 'carts.json'), productManager); // NUEVO

const app = express();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server);

app.engine('handlebars', engine({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
    partialsDir: path.join(__dirname, '..', 'views', 'partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router'); // NUEVO
const viewsRouter = require('./routes/views.router');

app.use('/api/products', productsRouter(productManager, io)); // Pasa io también al router de productos
app.use('/api/carts', cartsRouter(cartManager, productManager)); // NUEVO: Pasa cartManager y productManager
app.use('/', viewsRouter(io, productManager));

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    try {
        const products = await productManager.getProducts();
        socket.emit('productsUpdated', products);
    } catch (error) {
        console.error("Error al enviar productos iniciales:", error);
    }

    socket.on('addProduct', async (product) => {
        try {
            await productManager.addProduct(product);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdated', updatedProducts);
        } catch (error) {
            console.error("Error al agregar producto por websocket:", error);
            socket.emit('error', 'Error al agregar el producto.');
        }
    });

    socket.on('deleteProduct', async (id) => {
        try {
            await productManager.deleteProduct(id);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdated', updatedProducts);
        } catch (error) {
            console.error("Error al eliminar producto por websocket:", error);
            socket.emit('error', 'Error al eliminar el producto.');
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});