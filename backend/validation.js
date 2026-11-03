const mongoose = require('mongoose');

const text = (value, max = 200) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
const id = (value) => mongoose.isValidObjectId(value);
const integer = (value, min = 0) => Number.isInteger(value) && value >= min;
const address = (value) => value && ['street', 'city', 'postalCode', 'country'].every((key) => text(value[key], 120));

module.exports = { text, id, integer, address };
