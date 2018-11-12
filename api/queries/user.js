const User = require('../schemas/user');
const Country = require('../schemas/country');


async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({})
        .sort('login')
        .skip(+req.query['from'])
        .limit(+req.query['to'] - +req.query['from'])
        .select('login -_id');
    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(404).json({
      message: 'Not Found'
    });
  }
}

async function getUserByLogin(req, res, next) {
  try {
    const user = await User.findOne({ login: req.params.login })
        .select('login email firstName lastName country -_id')
        .populate('country', 'name');
    res.status(200).json({
      login: user.login,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country.name
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({
      message: 'Not Found'
    });
  }
}

async function postUserByLogin(req, res, next) {
  try {
    const data = JSON.parse(Object.keys(req.body)[0]);
    let country = await Country.findOne({name: data.country});

    if (!country) {
      country = new Country({
        name: data.country
      });
      country = await country.save();
    }

    let user = new User({
      login: data.login,
      password: data.password,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      country: country._id
    });

    await user.save();

    res.status(200).json({
      message: 'Ok!'
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: 'Server error'
    });
  }
}

async function putUserByLogin(req, res, next) {
  try {
    const data = JSON.parse(Object.keys(req.body)[0]);
    let country = await Country.findOne({name: data.country});

    if (!country) {
      country = new Country({
        name: data.country
      });
      country = await country.save();
    }

    let user = await User.findOne({login: req.params.login});

    if (!user) {
      throw new Error('404');
    }

    if (!user.checkPassword(data.password)) {
      throw new Error('403');
    }

    user.email = data.email;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.country = country._id;
    await user.save();

    res.status(200).json({
      message: 'Ok!'
    });
  } catch (e) {
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
  }
}

async function deleteUserByLogin(req, res, next) {
  try {
    const user = await User.findOneAndDelete({login: req.params.login});
    res.status(200).json(user);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: 'Server error'
    });
  }
}


module.exports = {
  getAllUsers,
  getUserByLogin,
  putUserByLogin,
  postUserByLogin,
  deleteUserByLogin
};
