const User = require('../schemas/user');
const Country = require('../schemas/country');


function getAllUsers(req, res, next) {
  User.find({})
      .sort('login')
      .skip(+req.query['from'])
      .limit(+req.query['to'] - +req.query['from'])
      .select('login -_id')
      .then(users => {
        res.status(200).json(users);
      }).catch(e => {
        console.log(e);
        res.status(404).json({
          message: 'Not Found'
        });
      });
}


function getUserByLogin(req, res, next) {
  User.findOne({ login: req.params.login })
      .select('login email firstName lastName country -_id')
      .populate('country', 'name')
      .then(user => {
        res.status(200).json({
      login: user.login,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country.name
    });
  }).catch(e => {
    console.log(e);
    res.status(404).json({
      message: 'Not Found'
    });
  });
}

function postUserByLogin(req, res, next) {
  let data = JSON.parse(Object.keys(req.body)[0]);

  __saveAndGetCountry(req, res, {data}, __postUserWithCountryId);
}

function putUserByLogin(req, res, next) {
  let data = JSON.parse(Object.keys(req.body)[0]);

  __saveAndGetCountry(req, res, {data}, __putUserWithCountryId);
}

function __saveAndGetCountry(req, res, {data}, callback) {
  country = new Country({
    name: data.country
  });

  country.save().then(country => {
    callback(req, res, {
      login: data.login || req.params.login,
      password: data.password,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      countryId: country._id
    });
  }).catch(() => {
    Country.findOne({name: data.country}).then(country => {
      callback(req, res, {
        login: data.login || req.params.login,
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        countryId: country._id
      });
    })
  });
}

function __postUserWithCountryId(req, res, {login, password, email, firstName, lastName, countryId}) {
  user = new User({
    login,
    password,
    email,
    firstName,
    lastName,
    country: countryId
  });

  user.save().then(() => {
    res.status(200).json({
      message: 'Ok'
    });
  }).catch(e => {
    console.log(e);
    res.status(500).json({
      message: 'Server error'
    });
  });
}

function __putUserWithCountryId(req, res, {login, password, email, firstName, lastName, countryId}) {
  User.findOne({login: login}).then(user => {

    if (!user) {
      throw new Error('404');
    }

    if (!user.checkPassword(password)) {
      throw new Error('403');
    }

    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.country = countryId;
    return user.save();

  }).then(() => {
    res.status(200).json({
      message: 'Ok'
    });
  }).catch(e => {
    console.log(e);
    switch(e.message) {
      case '403':
        res.status(403).json({
          message: 'Wrong password'
        });
        break;
      case '404':
        res.status(404).json({
          message: 'User not found'
        });
        break;
      default:
        res.status(500).json({
          message: 'Server error'
        });
        break;
    }
  });
}

function deleteUserByLogin(req, res, next) {
  User.findOneAndDelete({login: req.params.login}).then(user => {
    res.status(200).json(user);
  }).catch(e => {
    console.log(e);
    res.status(500).json({
      message: 'Server error'
    });
  });
}


module.exports = {
  getAllUsers,
  getUserByLogin,
  putUserByLogin,
  postUserByLogin,
  deleteUserByLogin
};
