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

  exec(message) {
    var channelId = message.channel.id;
    var gameId = args.gameId;
    console.log(`Called add ${channelId} from with gameId ${gameId}`);
  }
}

class RemoveCommand extends Command {
  constructor() {
    super('remove', {
      aliases: constants.removeAliases,
      args: [
        {
          id: 'gameId',
        },
      ],
    });
  }

  exec(message) {
    var channelId = message.channel.id;
    var gameId = args.gameId;
    console.log(`Called remove ${channelId} from with gameId ${gameId}`);
  }
}

module.exports = AddCommand;
module.exports = RemoveCommand;
