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
      args: [
        {
          id: 'gameId',
          prompt: {
            start:
              'please enter the ID of the game you would like to subscribe to:',
            time: 120000,
          },
        },
        {
          id: 'code',
          prompt: {
            start: 'please enter your wD_Code cookie value:',
            time: 120000,
          },
        },
        {
          id: 'key',
          prompt: {
            start: 'please enter your wD-Key cookie value:',
            time: 120000,
          },
        },
      ],
    });
  }

  exec(message, args) {
    var userId = message.author.id;
    var gameId = args.gameId;
    var code = args.code;
    var key = args.key;
    console.log(`Called cookie by ${userId}`);

    const readParams = {
      TableName: tableName,
      Key: {
        UserId: userId,
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
          // new user
          const newParams = {
            TableName: tableName,
            Item: {
              UserId: userId,
              GameId: gameId,
              CodeValue: code,
              KeyValue: key,
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
            Key: { UserId: userId },
            UpdateExpression: 'set GameId = :s, CodeValue = :x, KeyValue = :y',
            ExpressionAttributeValues: {
              ':s': gameId,
              ':x': code,
              ':y': key,
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

module.exports = CookieCommand;
