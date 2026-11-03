const Product = require('../models/Product');
const { id, integer } = require('../validation');
exports.getProducts = async (req, res, next) => { try { res.json(await Product.find().sort({ createdAt: -1 })); } catch (error) { next(error); } };
exports.updateProductStock = async (req, res, next) => {
  try {
    if (!id(req.params.productId) || !integer(req.body?.stock)) return res.status(400).json({ message: 'Stock ou identifiant invalide.' });
    const product = await Product.findByIdAndUpdate(req.params.productId, { stock: req.body.stock }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json({ message: 'Stock mis à jour.', product });
  } catch (error) { next(error); }
};
