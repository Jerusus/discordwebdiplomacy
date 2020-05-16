const { Command } = require('discord-akairo');
const constants = require('../constants');

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
    message.channel.send(`Called add from ${channelId} with gameId ${gameId}`);
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
    message.channel.send(
      `Called remove from ${channelId} with gameId ${gameId}`
    );
  }
}

module.exports = { AddCommand, RemoveCommand };
