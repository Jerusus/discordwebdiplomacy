const { Command } = require('discord-akairo');
const constants = require('../constants');

const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();

class AddCommand extends Command {
  constructor() {
    super('add', {
      aliases: constants.addAliases,
      channelRestriction: 'guild',
      args: [
        {
          id: 'gameId',
        },
      ],
    });
  }

  exec(message, args) {
    var channelId = message.channel.id;
    var gameId = args.gameId;
    console.log(`Called add from ${channelId} with gameId ${gameId}`);
    const query = datastore
      .createQuery('GameSubscription')
      .filter('channelId', channelId);
    datastore.runQuery(query).then((data) => {
      if (!data[0]) {
        datastore.save(
          {
            key: datastore.key('GameSubscription'),
            data: {
              channelId: channelId,
              gameId: gameId,
            },
          },
          (err, res) => {
            if (err) {
              message.channel.send(`Failed to subscribe to gameId: ${gameId}`);
            } else {
              message.channel.send(`Subscribed to: ${fmtUrl(gameId)}`);
            }
          }
        );
      }
    });
  }
}

class RemoveCommand extends Command {
  constructor() {
    super('remove', {
      aliases: constants.removeAliases,
      channelRestriction: 'guild',
      args: [
        {
          id: 'gameId',
        },
      ],
    });
  }

  exec(message, args) {
    var channelId = message.channel.id;
    var gameId = args.gameId;
    console.log(`Called remove from ${channelId} with gameId ${gameId}`);
    const query = datastore
      .createQuery('GameSubscription')
      .filter('channelId', channelId);
    datastore.runQuery(query).then((data) => {
      if (data[0]) {
        var key = data[0][datastore.KEY];
        datastore.delete(key, (err, res) => {
          if (err) {
            message.channel.send(`Failed to unsubscribe to gameId: ${gameId}`);
          } else {
            message.channel.send(`Unsubscribed to: ${fmtUrl(gameId)}`);
          }
        });
      }
    });
  }
}

class ViewCommand extends Command {
  constructor() {
    super('view', {
      aliases: constants.viewAliases,
      channelRestriction: 'guild',
    });
  }

  exec(message) {
    var channelId = message.channel.id;
    console.log(`Called view from ${channelId}`);
    const query = datastore
      .createQuery('GameSubscription')
      .filter('channelId', channelId);
    datastore.runQuery(query).then((data) => {
      var msg = `Subscribed to:`;
      for (game in data) {
        msg += `\n${game}`;
      }
      message.channel.send(msg);
    });
  }
}

function fmtUrl(gameId) {
  return `<http://webdiplomacy.net/board.php?gameID=${gameId}>`;
}

module.exports = { AddCommand, RemoveCommand, ViewCommand };
