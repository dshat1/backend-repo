import mongoose from 'mongoose';
const ticketProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  unitPrice: Number
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: Number,
  purchaser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [ticketProductSchema]
});

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
