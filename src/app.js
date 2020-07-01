const Discord = require('discord.js');
const { AkairoClient } = require('discord-akairo');
const constants = require('./constants');
const AWS = require('aws-sdk');
const express = require('express');
const http = require('http');
var fetch = require('node-fetch');
const $ = require('cheerio');

const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('ping');
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});

AWS.config.update({
  region: 'us-west-2',
});

const docClient = new AWS.DynamoDB.DocumentClient();

const client = new AkairoClient({
  prefix: constants.prefix,
  allowMention: true,
  commandDirectory: './src/commands/',
  listenerDirectory: './src/listeners/',
});

client.login(process.env.TOKEN).then(() => {
  console.log('Logged in!');
  privateScan();
  publicScan();
});

setInterval(() => {
  privateScan();
}, constants.privateScanInterval);

setInterval(() => {
  publicScan();
}, constants.publicScanInterval);

// ping self to avoid heroku idling
setInterval(() => {
  fetch(process.env.HOST).then((r) => {});
}, 300000);

setTimeout(() => {
  client.ws.connection.triggerReady();
}, 30000);

function privateScan() {
  console.log('Running private scan...');
  var currentTime = Math.floor(Date.now() / 1000);
  const tableName = 'PlayerSubscription';
  var scanParams = {
    TableName: tableName,
  };
  docClient.scan(scanParams, function (err, data) {
    if (err) {
      console.error(
        'Unable to read item. Error JSON:',
        JSON.stringify(err, null, 2)
      );
    } else {
      for (let item of data.Items) {
        // process each player subscription
        const userId = item.UserId;
        const gameId = item.GameId;
        const code = item.CodeValue;
        const key = item.KeyValue;
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
            // check for game end
            var nextPhase = $('.gameTimeRemainingNextPhase', body)
              .text()
              .includes('Finished');
            if (nextPhase) {
              deletePlayerSubscription(
                userId,
                `<${url}> is now finished. You will be unsubscribed from updates.`
              );
            }

            // check for messages
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
              countryMap[countryId] = countryName;
            }

            var myCountryName = $('.memberYourCountry', body).first().text();

            for (var i = 0; i < countriesTable.length; i++) {
              var countryNumber = i + 1;
              fetch(
                `http://webdiplomacy.net/board.php?gameID=${gameId}&msgCountryID=${countryNumber}`,
                opts
              )
                .then((res) => res.text())
                .then((chatBody) => {
                  var messageTime = $('.left.time', chatBody);
                  var messages = [];
                  var messageCountryName;

                  for (let i = 0; i < messageTime.length; i++) {
                    var time = messageTime[i].children[0].attribs.unixtime;
                    var interval = constants.privateScanInterval / 1000;
                    if (currentTime - interval < time) {
                      var message = messageTime
                        .parent()
                        .children('.right')
                        .eq(i)
                        .text();
                      var countryId = messageTime
                        .parent()
                        .children('.right')
                        .eq(i)
                        .attr('class')
                        .split(' ')[1];
                      if (countryMap[countryId] === myCountryName) continue;
                      messages.push(message);
                      messageCountryName = countryMap[countryId];
                    }
                  }
                  if (messages.length > 0) {
                    if (!messageCountryName) {
                      messageCountryName = 'Notice';
                    }
                    var discordMessage =
                      '**' +
                      messageCountryName +
                      ':**\n```' +
                      messages.join('\n') +
                      '```';
                    client.users.get(userId).send(discordMessage);
                  }
                });
            }
          });
      }
    }
  });
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

function publicScan() {
  console.log('Running public scan...');
  var currentTime = Math.floor(Date.now() / 1000);
  const tableName = 'GameSubscription';
  var scanParams = {
    TableName: tableName,
  };
  docClient.scan(scanParams, function (err, data) {
    if (err) {
      console.error(
        'Unable to read item. Error JSON:',
        JSON.stringify(err, null, 2)
      );
    } else {
      for (let item of data.Items) {
        const channelId = item.ChannelId;
        const gameId = item.GameId;
        const url = `http://webdiplomacy.net/board.php?gameID=${gameId}`;
        fetch(url)
          .then((res) => res.text())
          .then((body) => {
            if (body.includes('Game not found')) {
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
                  client.channels
                    .get(channelId)
                    .send(
                      `Game ID ${gameId} not found. This channel will be unsubscribed from updates.`
                    );
                }
              });
              return;
            }
            // check for new turn
            var nextPhase = $('.gameTimeRemainingNextPhase', body).text();
            if (nextPhase.includes('Finished')) {
              // the game is over!
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
                  client.channels
                    .get(channelId)
                    .send(
                      `<${url}> is now finished. This channel will unsubscribe from updates.`
                    );
                }
              });
            } else {
              // the game is ongoing
              var turnDeadline = $('.timestampGames', body).attr('unixtime');
              var phaseLength = convertTimeToSeconds(
                $('.gameHoursPerPhase > strong', body).text()
              );
              // alert if just recently new turn
              var interval = constants.publicScanInterval / 1000;
              if (
                currentTime + phaseLength - interval < turnDeadline &&
                interval < phaseLength
              ) {
                client.channels.get(channelId).send(`@here New turn. <${url}>`);
              }
            }

            // check for general messages
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
              countryMap[countryId] = countryName;
            }

            var messageTime = $('.left.time', body);
            var discordMessage = [];
            for (let i = 0; i < messageTime.length; i++) {
              var time = messageTime[i].children[0].attribs.unixtime;
              if (currentTime - interval < time) {
                var message = messageTime
                  .parent()
                  .children('.right')
                  .eq(i)
                  .text();
                var countryId = messageTime
                  .parent()
                  .children('.right')
                  .eq(i)
                  .attr('class')
                  .split(' ')[1];
                var formattedMessage =
                  '**' + countryMap[countryId] + ':**\n```' + message + '```';
                discordMessage.push(formattedMessage);
              }
            }
            if (discordMessage.length > 0) {
              client.channels.get(channelId).send(discordMessage.join('\n'));
            }
          });
      }
    }
  });
}

function convertTimeToSeconds(timeString) {
  switch (timeString) {
    case '5 minutes':
      return 5 * 60;
    case '7 minutes':
      return 7 * 60;
    case '10 minutes':
      return 10 * 60;
    case '15 minutes':
      return 15 * 60;
    case '20 minutes':
      return 20 * 60;
    case '30 minutes':
      return 30 * 60;
    case '1 hours':
      return 3600;
    case '2 hours':
      return 2 * 3600;
    case '4 hours':
      return 4 * 3600;
    case '6 hours':
      return 6 * 3600;
    case '8 hours':
      return 8 * 3600;
    case '10 hours':
      return 10 * 3600;
    case '12 hours':
      return 12 * 3600;
    case '14 hours':
      return 14 * 3600;
    case '16 hours':
      return 16 * 3600;
    case '18 hours':
      return 18 * 3600;
    case '20 hours':
      return 20 * 3600;
    case '22 hours':
      return 22 * 3600;
    case '1 day':
      return 24 * 3600;
    case '1 day, 1 hours':
      return 25 * 3600;
    case '1 day, 12 hours':
      return 32 * 3600;
    case '2 days':
      return 48 * 3600;
    case '2 days, 2 hours':
      return 50 * 3600;
    case '3 days':
      return 72 * 3600;
    case '4 days':
      return 4 * 86400;
    case '5 days':
      return 5 * 86400;
    case '6 days':
      return 6 * 86400;
    case '7 days':
      return 7 * 86400;
    case '10 days':
      return 10 * 86400;
  }
}
