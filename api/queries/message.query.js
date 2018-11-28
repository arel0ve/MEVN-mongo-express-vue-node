const User = require('../schemas/user');
const Country = require('../schemas/country');
const Message = require('../schemas/message');

async function getMessagesBetweenUsers(req, res, next) {
  const user = await User.findOne({login: req.params.login})
      .select('messages -_id')
      .populate({
        path: 'messages',
        select: 'text from to when -_id',
        populate: [{
          path: 'from',
          select: 'login -_id',
          match: {
            login: req.query.interlocutor
          }
        },{
          path: 'to',
          select: 'login -_id',
          match: {
            login: req.query.interlocutor
          }
        }],
        options: {
          sort: 'when'
        }
      });

  let messages = [];

  user.messages.forEach(message => {
    if (message.from) {
      messages.push({
        interlocutor: req.query.interlocutor,
        text: message.text,
        type: 'in',
        when: message.when
      });
    } else if (message.to) {
      messages.push({
        interlocutor: req.query.interlocutor,
        text: message.text,
        type: 'out',
        when: message.when
      });
    }
  });
  res.status(200).json(messages);
}

module.exports = {
  getMessagesBetweenUsers
};
