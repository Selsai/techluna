require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const logger = require('./logger');

async function bootstrap() {
  const { MONGO_URI, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGO_URI || !ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 16) throw new Error('Variables administrateur requises ; mot de passe de 16 caractères minimum.');
  await mongoose.connect(MONGO_URI);
  try {
    if (await User.exists({ role: 'admin' })) throw new Error('Un administrateur existe déjà. Aucune modification effectuée.');
    await User.create({ username: ADMIN_USERNAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    logger.info('Administrateur initial créé');
  } finally { await mongoose.disconnect(); }
}
bootstrap().catch((error) => { logger.error('Création administrateur impossible', { error: error.name }); process.exitCode = 1; });
