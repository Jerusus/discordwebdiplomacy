const Discord = require('discord.js');
const { AkairoClient } = require('discord-akairo');
const DBL = require('dblapi.js');
const constants = require('./constants');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('ping');
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});

const client = new AkairoClient({
  prefix: constants.prefix,
  allowMention: true,
  commandDirectory: './src/commands/',
  listenerDirectory: './src/listeners/',
});

client.login(process.env.TOKEN).then(() => {
  console.log('Logged in!');
});
