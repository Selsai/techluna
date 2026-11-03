const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const notify = require('../notify');
const { id, integer, address } = require('../validation');
const statuses = ['En attente', 'En cours de traitement', 'Expédiée', 'Délivrée', 'Annulée'];
const payments = ['Carte bancaire', 'PayPal', 'Virement'];
const shippings = ['colissimo', 'chronopost'];

/** Crée une commande après validation, réservation conditionnelle du stock et recalcul serveur du total. */
exports.createOrder = async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, shippingMethod } = req.body || {};
  if (!Array.isArray(items) || items.length < 1 || items.length > 50 || !address(shippingAddress) || !payments.includes(paymentMethod) || !shippings.includes(shippingMethod)) return res.status(400).json({ message: 'Commande invalide.' });
  if (items.some((item) => !id(item.productId) || !integer(item.quantity, 1)) || new Set(items.map((item) => String(item.productId))).size !== items.length) return res.status(400).json({ message: 'Produits ou quantités invalides.' });
  const reserved = [];
  try {
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findOneAndUpdate({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: false });
      if (!product) {
        for (const previous of reserved) await Product.updateOne({ _id: previous.productId }, { $inc: { stock: previous.quantity } });
        return res.status(409).json({ message: 'Stock insuffisant ou produit introuvable.' });
      }
      reserved.push(item);
      orderItems.push({ productId: product.id, quantity: item.quantity, price: product.price });
    }
    const total = Math.round(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    const order = await Order.create({ userId: req.user.id, items: orderItems, total, shippingAddress, paymentMethod, shippingMethod });
    notify(process.env.ADMIN_EMAIL, 'Nouvelle commande', `Commande ${order.id} créée.`);
    if (req.user.email) notify(req.user.email, 'Confirmation de commande TechLuna', `Votre commande ${order.id} a été créée. Total : ${total.toFixed(2)} €.`);
    res.status(201).json({ message: 'Commande créée.', order });
  } catch (error) {
    for (const item of reserved) await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }).catch(() => {});
    next(error);
  }
};

exports.getOrders = async (req, res, next) => { try { res.json(await Order.find().sort({ createdAt: -1 })); } catch (error) { next(error); } };
exports.getMyOrders = async (req, res, next) => { try { res.json(await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })); } catch (error) { next(error); } };
exports.updateOrderStatus = async (req, res, next) => {
  try {
    if (!id(req.params.orderId) || !statuses.includes(req.body?.status)) return res.status(400).json({ message: 'Statut ou identifiant invalide.' });
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Commande introuvable.' });
    if (process.env.NOTIFICATION_URL || process.env.RESEND_API_KEY) {
      const customer = await User.findById(order.userId).select('email');
      if (customer?.email) notify(customer.email, 'Suivi de votre commande TechLuna', `La commande ${order.id} est maintenant : ${order.status}.`);
    }
    res.json({ message: 'Statut mis à jour.', order });
  } catch (error) { next(error); }
};
exports.validateOrder = (req, res, next) => { req.params.orderId = req.params.id; req.body = { status: 'En cours de traitement' }; return exports.updateOrderStatus(req, res, next); };
exports.deleteOrder = async (req, res, next) => { try { if (!id(req.params.id)) return res.status(400).json({ message: 'Identifiant invalide.' }); const order = await Order.findByIdAndDelete(req.params.id); if (!order) return res.status(404).json({ message: 'Commande introuvable.' }); res.json({ message: 'Commande supprimée.' }); } catch (error) { next(error); } };
