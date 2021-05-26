const { Command } = require('discord-akairo');
const constants = require('../constants');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
});

const tableName = 'GameSubscription';
const docClient = new AWS.DynamoDB.DocumentClient();

class SetCommand extends Command {
  constructor() {
    super('set', {
      aliases: constants.setAliases,
      channel: 'guild',
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
    console.log(`Called set from ${channelId} with gameId ${gameId}`);

    const readParams = {
      TableName: tableName,
      Key: {
        ChannelId: channelId,
      },
    };

    docClient.get(readParams, function (err, data) {
      if (err) {
        console.error(
          'Unable to read item. Error JSON:',
          JSON.stringify(err, null, 2)
        );
      } else {
        if (data.Item == undefined) {
          // new channel
          const newParams = {
            TableName: tableName,
            Item: {
              ChannelId: channelId,
              GameId: gameId,
            },
          };
          docClient.put(newParams, function (err, data) {
            if (err) {
              console.error(
                'Unable to add item. Error JSON:',
                JSON.stringify(err, null, 2)
              );
              message.channel.send(`Failed to subscribe to gameId: ${gameId}`);
            } else {
              message.channel.send(`Subscribed to: ${fmtUrl(gameId)}`);
            }
          });
        } else {
          const updateParams = {
            TableName: tableName,
            Key: { ChannelId: channelId },
            UpdateExpression: 'set GameId = :s',
            ExpressionAttributeValues: {
              ':s': gameId,
            },
            ReturnValues: 'UPDATED_NEW',
          };
          docClient.update(updateParams, function (err, data) {
            if (err) {
              console.error(
                'Unable to update item. Error JSON:',
                JSON.stringify(err, null, 2)
              );
              message.channel.send(
                `Failed to update subscription to gameId: ${gameId}`
              );
            } else {
              message.channel.send(`Subscribed to: ${fmtUrl(gameId)}`);
            }
          });
        }
      }
    });
  }
}

function fmtUrl(gameId) {
  return `<${constants.website}/board.php?gameID=${gameId}>`;
}

module.exports = SetCommand;
