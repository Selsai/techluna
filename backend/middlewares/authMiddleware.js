// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticateToken = async (req, res, next) => {
  const token = req.cookies?.session;
  if (!token) return res.status(401).json({ message: 'Connexion requise.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await require('../models/User').findById(payload.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'Session invalide.' });
    req.user = user;
    next();
  } catch (error) { return res.status(401).json({ message: 'Session invalide.' }); }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès interdit' });
  next();
};
