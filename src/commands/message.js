const { Command } = require('discord-akairo');
const constants = require('../constants');
const AWS = require('aws-sdk');
const $ = require('cheerio');
var fetch = require('node-fetch');
const { URLSearchParams } = require('url');

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
              countryMap[0] = 'Global';
              for (let i = 0; i < countriesTable.length; i++) {
                var countryId = countriesTable[i].lastChild.attribs.class
                  .split(' ')[0]
                  .replace('country', '');
                var countryName = countriesTable[i].lastChild.children[0].data;
                if (countryName !== myCountryName) {
                  countryMap[countryId] = countryName;
                }
              }

              if (!countryMap[args.countryId]) {
                let keyValues = [];
                for (let key in countryMap) {
                  keyValues.push([key, countryMap[key]]);
                }

                keyValues.sort((a, b) => {
                  return a[0] - b[0];
                });

                let countryListMessage = [];
                for (let countryPair in keyValues) {
                  countryListMessage.push(
                    keyValues[countryPair][0] +
                      ' - ' +
                      keyValues[countryPair][1]
                  );
                }

                let messageCommands = [];
                for (let alias of constants.messageAliases) {
                  messageCommands.push('`' + constants.prefix + alias + '`');
                }

                let response = `Send a message to a country by typing ${messageCommands.join(
                  '|'
                )} with the country's ID:\n\`\`\`${countryListMessage.join(
                  '\n'
                )}\`\`\`\nE.g., \`d.message 3 I won't stab you I promise!\``;

                message.channel.send(response);
              } else {
                if (!args.text) {
                  message.channel.send(
                    'The message content is empty, not sending.'
                  );
                } else {
                  const params = new URLSearchParams();
                  params.append('newmessage', args.text);

                  let postOpts = {
                    method: 'post',
                    body: params,
                    headers: {
                      headers: {
                        cookie: `wD_Code=${code}; wD-Key=${key}`,
                      },
                    },
                  };

                  fetch(
                    `http://webdiplomacy.net/message.php?gameID=${gameId}&msgCountryID=${args.countryId}`,
                    postOpts
                  )
                    .then((res) => res.text())
                    .then((body) => {
                      message.react(':incoming_envelope:');
                    });
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
