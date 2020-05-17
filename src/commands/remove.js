const { Command } = require('discord-akairo');
const constants = require('../constants');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
});

const tableName = 'GameSubscription';
const docClient = new AWS.DynamoDB.DocumentClient();

class RemoveCommand extends Command {
  constructor() {
    super('remove', {
      aliases: constants.removeAliases,
      channelRestriction: 'guild',
    });
  }

  exec(message) {
    var channelId = message.channel.id;
    console.log(`Called remove from ${channelId}`);

    const deleteParams = {
      TableName: tableName,
      Key: {
        ChannelId: channelId,
      },
    };

    docClient.delete(deleteParams, function (err, data) {
      if (err) {
        console.error(
          'Unable to read item. Error JSON:',
          JSON.stringify(err, null, 2)
        );
      } else {
        message.channel.send(
          `This channel is now unsubscribed from webDiplomacy games.`
        );
      }
    });
  }
}

module.exports = RemoveCommand;
