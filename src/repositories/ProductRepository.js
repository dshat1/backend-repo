import Product from '../daos/models/product.js';

export default class ProductRepository {
  async create(data) { return Product.create(data); }
  async findById(id) { return Product.findById(id).lean(); }
  async list(query = {}, options = {}) { return Product.find(query, null, options).lean(); }
  async updateById(id, update) { return Product.findByIdAndUpdate(id, update, { new: true }).lean(); }
  async decrementStock(id, quantity) {
    return Product.findOneAndUpdate({ _id: id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true }).lean();
  }
}
