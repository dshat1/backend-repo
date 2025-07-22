// /managers/productManager.js
import { promises as fs } from 'fs';

export class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async #readFile() {
    try {
      const content = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async addProduct(prod) {
    const { title, description, price, thumbnail, code, stock } = prod;
    if (
      !title ||
      !description ||
      price === undefined ||
      !thumbnail ||
      !code ||
      stock === undefined
    ) {
      throw new Error('Todos los campos son obligatorios');
    }
    const products = await this.#readFile();
    if (products.some(p => p.code === code)) {
      throw new Error(`El código "${code}" ya existe`);
    }
    const newId = products.length ? products[products.length - 1].id + 1 : 1;
    const newProd = { id: newId, title, description, price, thumbnail, code, stock };
    products.push(newProd);
    await this.#writeFile(products);
    return newProd;
  }

  async getProducts() {
    return await this.#readFile();
  }

  async getProductById(id) {
    const products = await this.#readFile();
    const prod = products.find(p => p.id === id);
    if (!prod) console.error('Not found');
    return prod || null;
  }

  async updateProduct(id, updates) {
    const products = await this.#readFile();
    const idx = products.findIndex(p => p.id === id);
    if (idx < 0) throw new Error('ID no encontrado');
    delete updates.id;
    products[idx] = { ...products[idx], ...updates };
    await this.#writeFile(products);
    return products[idx];
  }

  async deleteProduct(id) {
    const products = await this.#readFile();
    const filtered = products.filter(p => p.id !== id);
    await this.#writeFile(filtered);
  }
}
