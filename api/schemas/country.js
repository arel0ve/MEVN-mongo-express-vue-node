const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    required: true,
    unique: true,
    lowercase: true,
    type: String
  }
});

module.exports = mongoose.model('Country', countrySchema);
