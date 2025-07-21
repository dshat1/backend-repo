const fs = require('fs').promises;
const path = require('path');

class CartManager {
    constructor(filePath, productManager) {
        this.path = filePath;
        this.carts = [];
        this.productManager = productManager;
        this.initialize();
    }

    async initialize() {
        try {
            await this.loadCarts();
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(this.path, '[]', 'utf8');
                this.carts = [];
            } else {
                console.error("Error al inicializar CartManager:", error);
            }
        }
    }

    async loadCarts() {
        const data = await fs.readFile(this.path, 'utf8');
        this.carts = JSON.parse(data);
    }

    async saveCarts() {
        await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf8');
    }

    async createCart() {
        await this.loadCarts();
        const newCart = {
            id: this.carts.length > 0 ? Math.max(...this.carts.map(c => c.id)) + 1 : 1,
            products: []
        };
        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    async getCartById(id) {
        await this.loadCarts();
        const cart = this.carts.find(c => c.id === parseInt(id));
        return cart || null;
    }

    async addProductToCart(cartId, productId) {
        await this.loadCarts();
        const cartIndex = this.carts.findIndex(c => c.id === parseInt(cartId));
        if (cartIndex === -1) {
            throw new Error(`Carrito con ID ${cartId} no encontrado.`);
        }

        const product = await this.productManager.getProductById(productId);
        if (!product) {
            throw new Error(`Producto con ID ${productId} no encontrado.`);
        }

        const existingProductIndex = this.carts[cartIndex].products.findIndex(
            p => p.product === parseInt(productId)
        );

        if (existingProductIndex !== -1) {
            this.carts[cartIndex].products[existingProductIndex].quantity++;
        } else {
            this.carts[cartIndex].products.push({ product: parseInt(productId), quantity: 1 });
        }

        await this.saveCarts();
        return this.carts[cartIndex];
    }
}

module.exports = CartManager;