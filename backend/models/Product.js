// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  category: { type: String, enum: ['Audio', 'Ordinateurs', 'Téléphones', 'Accessoires', 'Composants', 'Écrans & tablettes'], default: 'Accessoires' },
  imageUrl: { type: String, default: '' },
  stock: { type: Number, required: true, min: 0 },
}, {
  timestamps: true, // Ajoute createdAt et updatedAt
});

module.exports = mongoose.model('Product', productSchema);
