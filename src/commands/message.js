const { Command } = require('discord-akairo');
const constants = require('../constants');
const AWS = require('aws-sdk');
const $ = require('cheerio');
var fetch = require('node-fetch');

AWS.config.update({
  region: 'us-west-2',
});

const docClient = new AWS.DynamoDB.DocumentClient();

class MessageCommand extends Command {
  constructor() {
    super('message', {
      aliases: constants.messageAliases,
      channelRestriction: 'dm',
      args: [
        {
          id: 'countryId',
          type: 'integer',
          default: -1,
        },
        {
          id: 'text',
          type: 'string',
          match: 'rest',
        },
      ],
    });
  }

  exec(message, args) {
    console.log(args);
    let tableName = 'PlayerSubscription';
    var userId = message.author.id;
    let readParams = {
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
          message.channel.send('You are not currently subscribed to a game.');
        } else {
          const gameId = data.Item.GameId;
          const userId = data.Item.UserId;
          const code = data.Item.CodeValue;
          const key = data.Item.KeyValue;
          const opts = {
            headers: {
              cookie: `wD_Code=${code}; wD-Key=${key}`,
            },
          };
          const url = `http://webdiplomacy.net/board.php?gameID=${gameId}`;
          fetch(url, opts)
            .then((res) => res.text())
            .then((body) => {
              if (
                body.toString().includes('The userID provided does not exist')
              ) {
                return deletePlayerSubscription(
                  userId,
                  `Your cookies are invalid and need to be reconfigured.`
                );
              }
              if (body.toString().includes('Game not found')) {
                return deletePlayerSubscription(
                  userId,
                  `Game ID ${gameId} not found. You will be unsubscribed from updates.`
                );
              }
              var loggedIn = $('.logon > a', body)
                .attr('href')
                .includes('logoff=on');
              if (!loggedIn) {
                deletePlayerSubscription(
                  userId,
                  `Your cookies are invalid and need to be reconfigured.`
                );
              }

              // check for countries
              var myCountryName = $('.memberYourCountry', body).first().text();

              var countriesTable = $(
                '.memberCountryName',
                '.membersFullTable',
                body
              ).get();
              var countryMap = {};
              for (let i = 0; i < countriesTable.length; i++) {
                var countryId = countriesTable[i].lastChild.attribs.class.split(
                  ' '
                )[0];
                var countryName = countriesTable[i].lastChild.children[0].data;
                if (countryName !== myCountryName) {
                  countryMap[countryId] = countryName;
                }
              }
            });
        }
      }
    });
  }
}

function deletePlayerSubscription(userId, message) {
  const deleteParams = {
    TableName: 'PlayerSubscription',
    Key: {
      UserId: userId,
    },
  };

  docClient.delete(deleteParams, function (err, data) {
    if (err) {
      console.error(
        'Unable to read item. Error JSON:',
        JSON.stringify(err, null, 2)
      );
    } else {
      client.users.get(userId).send(message);
    }
  });
}

module.exports = MessageCommand;
