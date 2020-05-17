const { Command } = require('discord-akairo');
const constants = require('../constants');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
});

const tableName = 'PlayerSubscription';
const docClient = new AWS.DynamoDB.DocumentClient();

class CookieCommand extends Command {
  constructor() {
    super('cookie', {
      aliases: constants.cookieAliases,
      channelRestriction: 'dm',
    });
  }

  exec(message) {
    var userId = message.author.id;
    console.log(`Called cookie by ${userId}`);
    var instructions = `instructions`; //todo
    message.channel.send(instructions);
    var codePrompt = `codePrompt`; //todo
    message.channel.send(codePrompt);
    const codeCollector = message.channel.createMessageCollector(
      (m) => m.author.id == userId,
      {
        max: 1,
      }
    );
    codeCollector.on('collect', (m) => {
      if (m == 'quit' || m == constants.prefix + 'quit') {
      } else {
        message.channel.send('collected: ' + m);
        var keyPrompt = `keyPrompt`; //todo
        message.channel.send(keyPrompt);
        const keyCollector = message.channel.createMessageCollector(
          (m) => m.author.id == userId,
          {
            max: 1,
          }
        );
        keyCollector.on('collect', (m) => {
          if (m == 'quit' || m == constants.prefix + 'quit') {
          } else {
            message.channel.send('collected: ' + m);
            message.channel.send('I can do stuff now');
          }
        });
      }
    });
  }
}

module.exports = CookieCommand;
