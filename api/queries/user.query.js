const User = require('../schemas/user');
const Country = require('../schemas/country');


async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({})
        .sort('login')
        .skip(+req.query['from'])
        .limit(+req.query['to'] - +req.query['from'])
        .select('login inputMessages outputMessages -_id')
        .populate('inputMessages', 'text -_id')
        .populate('outputMessages', 'text -_id');
    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(404).json({
      message: 'Not Found'
    });
  }
}

async function getUsersByCountry(req, res, next) {
  try {
    if (!req.query.country) {
      throw new Error('404');
    }

    const country = await Country.findOne({name: req.query.country});

    if (!country) {
      throw new Error('404');
    }

    const users = await User.find({country: country._id})
        .sort('login')
        .select('login -_id');
    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(404).json({
      message: 'Not Found'
    });
  }
}

async function getFriendsByLogin(req, res, next) {
  try {
    if (!req.query.login) {
      throw new Error('404');
    }
    const user = await User.findOne({login: req.query.login})
        .select('login friends -_id')
        .populate('friends', 'login -_id');

    if (!user) {
      throw new Error('404');
    }

    res.status(200).json(user);
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
        .select('login email firstName lastName country birthday friends -_id')
        .populate('country', 'name -_id')
        .populate('friends', 'login -_id');
    let friends = [];
    for (const friend of user.friends) {
      friends.push(friend.login);
    }
    res.status(200).json({
      login: user.login,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country.name,
      birthday: user.birthday,
      friends: friends
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
      birthday: new Date(data.birthday),
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

    let friendsQuery = [];
    for (const friend in data.friends) {
      if (data.friends[friend]) {
        friendsQuery.push({
          login: friend
        });
      }
    }

    let friendsIds = [];

    if (friendsQuery.length > 0) {
      const friends = await User.find({}).or(friendsQuery).select('_id');
      for (const friend of friends) {
        friendsIds.push(friend._id);
      }
    }

    user.email = data.email;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.birthday = data.birthday;
    user.country = country._id;
    user.friends = friendsIds;
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
  getUsersByCountry,
  getFriendsByLogin,
  getUserByLogin,
  putUserByLogin,
  postUserByLogin,
  deleteUserByLogin,
};
