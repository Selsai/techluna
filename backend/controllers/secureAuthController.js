const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { text } = require('../validation');
const validUsername = (value) => text(value, 80) && /^[\p{L}\p{N}._ -]+$/u.test(value.trim());

const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 3600000 });
const publicUser = (user) => ({ id: user.id, username: user.username, role: user.role });

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!validUsername(username) || !text(password, 200)) return res.status(400).json({ message: 'Identifiants invalides.' });
    const user = await User.findOne({ username: username.trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Identifiants incorrects.' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('session', token, cookieOptions()).json({ user: publicUser(user) });
  } catch (error) { next(error); }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};
    if (!validUsername(username) || !text(email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !text(password, 200) || password.length < 12) return res.status(400).json({ message: 'Nom, email et mot de passe de 12 caractères minimum requis.' });
    if (await User.exists({ $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }] })) return res.status(409).json({ message: 'Compte déjà existant.' });
    const user = await User.create({ username: username.trim(), email: email.trim().toLowerCase(), password });
    res.status(201).json({ message: 'Compte créé.', user: publicUser(user) });
  } catch (error) { if (error.code === 11000) return res.status(409).json({ message: 'Compte déjà existant.' }); next(error); }
};

exports.me = (req, res) => res.json({ user: publicUser(req.user) });
exports.logout = (req, res) => { const { maxAge, ...options } = cookieOptions(); res.clearCookie('session', options).json({ message: 'Déconnexion effectuée.' }); };
