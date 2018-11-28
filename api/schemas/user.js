const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  login: {
    required: true,
    unique: true,
    lowercase: true,
    type: String
  },
  email: {
    required: true,
    unique: true,
    lowercase: true,
    type: String
  },
  hashedPassword: {
    required: true,
    type: String
  },
  salt: {
    required: true,
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  birthday: {
    type: Date
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
});

userSchema.method('encryptPassword', function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

userSchema.virtual('password')
    .set(function (password) {
      this.__plainPassword = password;
      this.salt = Math.random() + '';
      this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
      return this.__plainPassword;
    });

userSchema.methods.checkPassword = function (pass) {
  return this.encryptPassword(pass) === this.hashedPassword;
};

module.exports = mongoose.model('User', userSchema);
