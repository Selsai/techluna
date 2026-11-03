// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Never log connection credentials.
        if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error('MONGO_URI et JWT_SECRET requis');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connecté');
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

module.exports = connectDB;
