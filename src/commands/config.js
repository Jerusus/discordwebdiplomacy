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
      var instructions =
        'This bot can store cookies for you to forward your private messages on webDiplomacy to Discord.\n' +
        'You will need the values from your `wD_Code` and `wD-Key` cookies.\n' +
        'For example, on Chrome you can obtain these from Settings -> Privacy and Security -> Site Settings -> Cookies.\n' +
        'Search for your webdiplomacy.net cookies.';
      message.channel.send(instructions);
      message.channel.send(
        `Type ${cookieCommands.join('|')} to start configuring your cookies.`
      );
    }
  }
}

module.exports = ConfigCommand;
