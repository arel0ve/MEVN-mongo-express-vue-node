const User = require('../schemas/user');


function getAllUsers(req, res, next) {
  User.find({}, 'login').then(users => {
    res.status(200).json(users);
  }).catch(e => {
    console.log(e);
    res.status(404).json({
      message: 'Not Found'
    });
  });
}


function getUserByLogin(req, res, next) {
  User.findOne({ login: req.params.login }, 'login email firstName lastName country').then(user => {
    res.status(200).json(user);
  }).catch((e => {
    console.log(e);
    res.status(404).json({
      message: 'Not Found'
    });
  }));
}


function putUserByLogin(req, res, next) {
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
    res.status(200).json({
      message: 'Ok'
    });
  }).catch(e => {
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


function postUserByLogin(req, res, next) {
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
    res.status(200).json({
      message: 'Ok'
    });
  }).catch((e) => {
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
  postUserByLogin
};
