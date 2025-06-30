import { promises as fs } from 'fs';

export class CartManager {
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

  async createCart() {
    const carts = await this.#readFile();
    const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;
    const newCart = { id: newId, products: [] };
    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.#readFile();
    return carts.find(c => c.id === id) || null;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.#readFile();
    const cart = carts.find(c => c.id === cid);
    if (!cart) throw new Error('Carrito no existe');
    const item = cart.products.find(p => p.product === pid);
    if (item) item.quantity++;
    else cart.products.push({ product: pid, quantity: 1 });
    await this.#writeFile(carts);
    return cart;
  }
}
