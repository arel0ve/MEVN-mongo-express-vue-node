const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 40510});

const User = require('./schemas/user');
const Message = require('./schemas/message');
const _ = require('lodash');

const connectedUsers = [];

wss.on('connection', function (ws) {
  connectedUsers.push(ws);

  ws.on('close', function () {
    _.pull(connectedUsers, ws);
  });

  ws.on('message', async function (msg) {
    try {
      const data = JSON.parse(msg);
      if (!data.from || !data.to || !data.message) {
        throw new Error('400');
      }

      const [userFrom, userTo] = await Promise.all([
        User.findOne({login: data.from}),
        User.findOne({login: data.to})
      ]);

      if (!userFrom || !userTo) {
        throw new Error('404');
      }

      let message = new Message({
        text: data.message,
        from: userFrom._id,
        to: userTo._id
      });

      message = await message.save();

      userFrom.outputMessages.push(message._id);

      userTo.inputMessages.push(message._id);

      await Promise.all([
        userFrom.save(),
        userTo.save()
      ]);

      connectedUsers.forEach(wsUser => {
        wsUser.send(JSON.stringify({
          type: "msg-send-ok",
          from: data.from,
          to: data.to,
          message: data.message
        }));
      });
    } catch (e) {
      console.log(e);
      switch(e.message) {
        case '400':
          ws.send(JSON.stringify({
            type: "msg-send-err",
            message: 'Got not from/to users'
          }));
          break;
        case '404':
          ws.send(JSON.stringify({
            type: "msg-send-err",
            message: 'Users not found'
          }));
          break;
        default:
          ws.send(JSON.stringify({
            type: "msg-send-err",
            message: 'Server error'
          }));
          break;
      }
    }

  });

});

module.exports = wss;
