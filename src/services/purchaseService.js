import mongoose from 'mongoose';
import ProductRepoClass from '../repositories/ProductRepository.js';
import Ticket from '../models/Ticket.js';
import { v4 as uuidv4 } from 'uuid';
const ProductRepo = new ProductRepoClass();

export async function purchaseProducts(user, cartItems) {
  // cartItems: [{ product: { _id }, quantity }]
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const successful = [];
    const failed = [];
    for (const item of cartItems) {
      const id = item.product._id ? item.product._id : item.product;
      const prod = await ProductRepo.decrementStock(id, item.quantity);
      if (prod) {
        successful.push({ product: prod, quantity: item.quantity, unitPrice: prod.price });
      } else {
        const p = await ProductRepo.findById(id);
        failed.push({ product: p, available: p ? p.stock : 0, requested: item.quantity });
      }
    }
    let ticket = null;
    let amount = 0;
    if (successful.length > 0) {
      amount = successful.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
      ticket = await Ticket.create({
        code: uuidv4(),
        amount,
        purchaser: user._id || user.id,
        products: successful.map(s => ({ product: s.product._id, quantity: s.quantity, unitPrice: s.unitPrice }))
      });
    }
    await session.commitTransaction();
    session.endSession();
    return { ticket, successful, failed, status: failed.length === 0 ? 'complete' : 'partial' };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
