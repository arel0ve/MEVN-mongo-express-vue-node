const mongoose = require('mongoose');
const config = require('./config/config');

const User = require('./schemas/user');

mongoose.connect(config.dbURL, config.options);
mongoose.connection
    .once('open', () => {
      console.log(`Mongoose - successful connection ...`);
    })
    .on('error', error => console.warn(error));

User.find({}).then(users => {
  console.log(users);
});

