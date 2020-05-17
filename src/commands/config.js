const { Command } = require('discord-akairo');
const constants = require('../constants');

class ConfigCommand extends Command {
  constructor() {
    super('config', {
      aliases: constants.configAliases,
    });
  }

  exec(message) {
    if (message.guild) {
      let setCommands = [];
      for (let alias of constants.setAliases) {
        setCommands.push('`' + constants.prefix + alias + '`');
      }
      let removeCommands = [];
      for (let alias of constants.removeAliases) {
        removeCommands.push('`' + constants.prefix + alias + '`');
      }
      message.channel
        .send(`Subscribe this channel to a game by typing ${setCommands.join(
        '|'
      )} with the desired game ID.
For example, \`d.set 182418\` to subscribe to <http://webdiplomacy.net/board.php?gameID=182418>.
Unsubscribe this channel by typing ${removeCommands.join('|')}.`);
    } else {
      let cookieCommands = [];
      for (let alias of constants.cookieAliases) {
        cookieCommands.push('`' + constants.prefix + alias + '`');
      }
      message.channel.send(
        `Type ${cookieCommands.join('|')} to start configuring message alerts.` //todo full instructions
      );
    }
  }
}

module.exports = ConfigCommand;
