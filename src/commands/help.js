const { Command } = require('discord-akairo');
const constants = require('../constants');

class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help'],
    });
  }

  exec(message) {
    let configCommands = [];
    for (let alias of constants.configAliases) {
      configCommands.push('`' + constants.prefix + alias + '`');
    }
    message.channel.send(
      `Configure your games by typing ${configCommands.join('|')}.
Type the command in a channel to receive new turn notifications.
Type the command in a DM to the bot to receive message notifications.`
    );
  }
}

module.exports = HelpCommand;
