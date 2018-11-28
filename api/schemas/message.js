const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    required: true,
    type: String
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  when: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Message', messageSchema);
