const { Command } = require('discord-akairo');
const constants = require('../constants');

class ConfigCommand extends Command {
  constructor() {
    super('config', {
      aliases: constants.configAliases,
    });
  }

  exec(message) {
    let removeCommands = [];
    for (let alias of constants.removeAliases) {
      removeCommands.push('`' + constants.prefix + alias + '`');
    }
    if (message.guild) {
      let setCommands = [];
      for (let alias of constants.setAliases) {
        setCommands.push('`' + constants.prefix + alias + '`');
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
        'WARNING: ONLY CONFIGURE COOKIES IF YOU TRUST THE PERSON HOSTING THIS BOT. YOUR COOKIES ARE SENSITIVE DATA.\n' +
        'You can only have at most one active game subscription.\n' +
        'You will need the values from your `wD_Code` and `wD-Key` cookies.\n' +
        'For example, on Chrome you can obtain these from Settings -> Privacy and Security -> Site Settings -> Cookies.\n' +
        'Search for your webdiplomacy.net cookies.';
      message.channel.send(instructions);
      var instructions2 =
        `Type ${cookieCommands.join(
          '|'
        )} to start configuring your cookies. **Calling this command will overwrite your previous settings.**\n` +
        `Type \`cancel\` in the middle of the command to cancel.`;
      message.channel.send(instructions2);
      var instructions3 = `Type ${removeCommands.join(
        '|'
      )} to remove your game subscription.`;
      message.channel.send(instructions3);
    }
  }
}

module.exports = ConfigCommand;
