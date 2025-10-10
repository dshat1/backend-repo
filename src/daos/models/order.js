// src/daos/models/order.js

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Código único para el pedido, para no exponer el _id de la DB
  code: {
    type: String,
    unique: true,
    required: true,
  },
  // Datos del comprador
  purchaser: {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
  },
  // Productos incluidos en la compra
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number, // Guardamos el precio al momento de la compra
  }],
  // Monto total de la compra
  amount: {
    type: Number,
    required: true,
  },
  // Estado del pedido
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);