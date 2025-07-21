const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = [];
        this.initialize();
    }

    async initialize() {
        try {
            await this.loadProducts();
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(this.path, '[]', 'utf8');
                this.products = [];
            } else {
                console.error("Error al inicializar ProductManager:", error);
            }
        }
    }

    async loadProducts() {
        const data = await fs.readFile(this.path, 'utf8');
        this.products = JSON.parse(data);
    }

    async saveProducts() {
        await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf8');
    }

    async getProducts() {
        await this.loadProducts();
        return this.products;
    }

    async getProductById(id) {
        await this.loadProducts();
        const product = this.products.find(p => p.id === parseInt(id));
        return product || null;
    }

    async addProduct(product) {
        await this.loadProducts();
        const newProduct = {
            id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1,
            title: product.title,
            description: product.description,
            code: product.code || `code-${Date.now()}`,
            price: product.price,
            status: product.status !== undefined ? product.status : true,
            stock: product.stock,
            category: product.category,
            thumbnails: product.thumbnails || []
        };
        this.products.push(newProduct);
        await this.saveProducts();
        return newProduct;
    }

    async updateProduct(id, updates) {
        await this.loadProducts();
        let productIndex = this.products.findIndex(p => p.id === parseInt(id));
        if (productIndex === -1) {
            throw new Error(`Producto con ID ${id} no encontrado.`);
        }
        const updatedProduct = { ...this.products[productIndex] };
        for (const key in updates) {
            if (key !== 'id') {
                updatedProduct[key] = updates[key];
            }
        }
        this.products[productIndex] = updatedProduct;
        await this.saveProducts();
        return updatedProduct;
    }

    async deleteProduct(id) {
        await this.loadProducts();
        const initialLength = this.products.length;
        this.products = this.products.filter(p => p.id !== parseInt(id));
        if (this.products.length === initialLength) {
            throw new Error(`Producto con ID ${id} no encontrado.`);
        }
        await this.saveProducts();
    }
}

module.exports = ProductManager;