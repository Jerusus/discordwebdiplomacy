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
    let mapCommands = [];
    for (let alias of constants.mapAliases) {
      mapCommands.push('`' + constants.prefix + alias + '`');
    }
    let messageCommands = [];
    for (let alias of constants.messageAliases) {
      messageCommands.push('`' + constants.prefix + alias + '`');
    }
    message.channel.send(
      `Configure your games by typing ${configCommands.join('|')}.
Type the command in a channel to receive new turn notifications.
Type the command in a DM to the bot to receive message notifications.
Once subscribed, type ${mapCommands.join(
        '|'
      )} to display the current turn's map.
Send messages to other countries in-game by typing ${messageCommands.join(
        '|'
      )} in a DM to the bot.`
    );
  }
}

module.exports = HelpCommand;
