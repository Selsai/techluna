const mongoose = require('mongoose');
const Joi = require('joi');

/** Vérifie une chaîne non vide et sa longueur maximale avant toute écriture en base. */
const text = (value, max = 200) => typeof value === 'string' && !Joi.string().trim().min(1).max(max).required().validate(value).error;
/** Accepte uniquement un identifiant MongoDB textuel à 24 caractères hexadécimaux. */
const id = (value) => typeof value === 'string' && !Joi.string().hex().length(24).required().validate(value).error && mongoose.isValidObjectId(value);
/** Refuse les chaînes numériques afin que les quantités proviennent d'un entier JSON. */
const integer = (value, min = 0) => !Joi.number().integer().min(min).strict().required().validate(value).error;
const addressSchema = Joi.object({
  street: Joi.string().trim().min(1).max(120).required(),
  city: Joi.string().trim().min(1).max(120).required(),
  postalCode: Joi.string().trim().min(1).max(120).required(),
  country: Joi.string().trim().min(1).max(120).required(),
}).unknown(true).required();
const address = (value) => !addressSchema.validate(value).error;

module.exports = { text, id, integer, address };
