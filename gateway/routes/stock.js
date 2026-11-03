// gateway/routes/stock.js
const express = require('express');
const proxy = require('express-http-proxy');
require('dotenv').config();
const router = express.Router();

const STOCK_SERVICE_URL = process.env.STOCK_SERVICE_URL || 'http://localhost:4003';

router.use('/', proxy(STOCK_SERVICE_URL, {
  proxyReqPathResolver: (req) => req.originalUrl,
}));

module.exports = router;
