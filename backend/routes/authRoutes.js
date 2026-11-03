// backend/routes/authRoutes.js
const express = require('express');
const { login, register, me, logout } = require('../controllers/secureAuthController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const attempts = new Map();
const loginLimit = (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, until: now + 15 * 60000 };
  if (entry.until < now) { entry.count = 0; entry.until = now + 15 * 60000; }
  entry.count += 1;
  attempts.set(key, entry);
  if (entry.count > 20) return res.status(429).json({ message: 'Trop de tentatives. Réessayez plus tard.' });
  next();
};

router.post('/login', loginLimit, login);
router.post('/register', register);
router.get('/me', authenticateToken, me);
router.post('/logout', logout);

module.exports = router;
