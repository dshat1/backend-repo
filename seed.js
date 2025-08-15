import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './src/daos/models/product.js';

dotenv.config();

const fakeProducts = [
  { title: "Camiseta básica blanca", description: "100% algodón, unisex", category: "Ropa", price: 2500, stock: 50, status: true },
  { title: "Pantalón vaquero", description: "Corte recto, azul clásico", category: "Ropa", price: 8200, stock: 30, status: true },
  { title: "Zapatillas running", description: "Livianas y cómodas", category: "Calzado", price: 19990, stock: 20, status: true },
  { title: "Gorra deportiva", description: "Visera curva, ajustable", category: "Accesorios", price: 1800, stock: 100, status: true },
  { title: "Sudadera con capucha", description: "Algodón suave, color gris", category: "Ropa", price: 9500, stock: 15, status: true },
  { title: "Cinturón de cuero", description: "Hebilla metálica", category: "Accesorios", price: 3500, stock: 40, status: true },
  { title: "Camisa formal", description: "Blanca, manga larga", category: "Ropa", price: 6700, stock: 25, status: true },
  { title: "Mochila urbana", description: "Impermeable, varios compartimentos", category: "Accesorios", price: 12800, stock: 12, status: true }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(fakeProducts);
    console.log("✅ Productos de prueba insertados correctamente");
    process.exit();
  } catch (error) {
    console.error("❌ Error al insertar productos:", error);
    process.exit(1);
  }
})();
