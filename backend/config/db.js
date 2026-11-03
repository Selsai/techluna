// config/db.js
const mongoose = require('mongoose');
const logger = require('../logger');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Never log connection credentials.
        if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error('MONGO_URI et JWT_SECRET requis');
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('MongoDB connecté');
    } catch (err) {
        logger.error('Connexion MongoDB impossible', { error: err.name });
        throw err;
    }
};

module.exports = connectDB;
