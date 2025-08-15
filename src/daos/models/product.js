import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category:    { type: String, index: true },
  price:       { type: Number, required: true, min: 0, index: true },
  stock:       { type: Number, default: 0, min: 0 },
  status:      { type: Boolean, default: true }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', productSchema);
