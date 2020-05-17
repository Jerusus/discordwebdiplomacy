const Discord = require('discord.js');
const { AkairoClient } = require('discord-akairo');
const DBL = require('dblapi.js');
const constants = require('./constants');
const AWS = require('aws-sdk');
const express = require('express');
const http = require('http');
var fetch = require('node-fetch');
const $ = require('cheerio');

const app = express();

app.get('/_ah/start', (req, res) => {
  // handle app engine request
});

AWS.config.update({
  region: 'us-west-2',
});

const tableName = 'GameSubscription';
const docClient = new AWS.DynamoDB.DocumentClient();

const client = new AkairoClient({
  prefix: constants.prefix,
  allowMention: true,
  commandDirectory: './src/commands/',
  listenerDirectory: './src/listeners/',
});

client.login(process.env.TOKEN).then(() => {
  console.log('Logged in!');
});

setInterval(() => {
  newTurnCheck();
}, constants.turnCheckInterval);

function newTurnCheck() {
  var currentTime = Math.floor(Date.now() / 1000);
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
              var interval = constants.turnCheckInterval / 1000;
              if (
                currentTime + phaseLength - interval < turnDeadline &&
                interval < phaseLength
              ) {
                client.channels.get(channelId).send(`@here New turn. <${url}>`);
              }
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
