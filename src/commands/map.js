const { Command } = require('discord-akairo');
const constants = require('../constants');
const AWS = require('aws-sdk');
const $ = require('cheerio');
var fetch = require('node-fetch');

AWS.config.update({
  region: 'us-west-2',
});

const docClient = new AWS.DynamoDB.DocumentClient();

class MapCommand extends Command {
  constructor() {
    super('map', {
      aliases: constants.mapAliases,
    });
  }

  exec(message) {
    let tableName;
    let readParams;
    if (message.guild) {
      tableName = 'GameSubscription';
      var channelId = message.channel.id;
      readParams = {
        TableName: tableName,
        Key: {
          ChannelId: channelId,
        },
      };
    } else {
      tableName = 'PlayerSubscription';
      var userId = message.author.id;
      readParams = {
        TableName: tableName,
        Key: {
          UserId: userId,
        },
      };
    }
    docClient.get(readParams, function (err, data) {
      if (err) {
        console.error(
          'Unable to read item. Error JSON:',
          JSON.stringify(err, null, 2)
        );
      } else {
        if (data.Item == undefined) {
          if (message.guild) {
            message.channel.send(
              'This channel is not currently subscribed to a game.'
            );
          } else {
            message.channel.send('You are not currently subscribed to a game.');
          }
        } else {
          const gameId = item.GameId;
          const url = `http://webdiplomacy.net/board.php?gameID=${gameId}`;
          fetch(url)
            .then((res) => res.text())
            .then((body) => {
              var imageLink = $('#LargeMapLink', body).attr('href');
              message.channel.send(`http://webdiplomacy.net/${imageLink}`);
            });
        }
      }
    });
  }
}

module.exports = MapCommand;
