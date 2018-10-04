const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const mongoose = require('mongoose');

const User = require('./model-user');

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/api/users', (req, res) => {
  User.find({}, 'login').then(users => {
    res.statusCode = 200;
    res.send(users);
  }).catch((e => {
    console.log(e);
    res.statusCode = 404;
    res.send("Not Found");
  }));
});

app.get('/api/user/:login', (req, res) => {
  User.findOne({ login: req.params.login }, 'login email firstName lastName country').then(user => {
    res.statusCode = 200;
    res.send(user);
  }).catch((e => {
    console.log(e);
    res.statusCode = 404;
    res.send("Not Found");
  }));
});

app.put('/api/user/:login', (req, res) => {
  let data = JSON.parse(Object.keys(req.body)[0]);
  User.findOne({login: req.params.login}).then(user => {

    if (!user) {
      throw new Error('404');
    }

    if (!user.checkPassword(data.password)) {
      throw new Error('403');
    }

    user.email = data.email;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.country = data.country;
    return user.save();

  }).then(() => {
    res.statusCode = 200;
    res.send('Ok');
  }).catch((e) => {
    switch(e.message) {
      case '403':
        res.statusCode = 403;
        res.send('Wrong password');
        break;
      case '404':
        res.statusCode = 404;
        res.send('User not found');
        break;
      default:
        res.statusCode = 500;
        res.send('Wrong password');
        break;
    }
  });
});

app.post('/api/user', (req, res) => {
  let data = JSON.parse(Object.keys(req.body)[0]);
  user = new User({
    login: data.login,
    password: data.password,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    country: data.country
  });

  user.save().then(() => {
    res.statusCode = 200;
    res.send('Ok');
  }).catch((e) => {
    console.log(e);
    res.statusCode = 500;
    res.send('Server error');
  });
});

mongoose.connect(config.dbURL, config.options);
mongoose.connection
    .once('open', () => {
      console.log(`Mongoose - successful connection ...`);
      app.listen(process.env.PORT || config.port,
          () => console.log(`Server start on port ${config.port} ...`))
    })
    .on('error', error => console.warn(error));
