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
  }
}

module.exports = CookieCommand;
