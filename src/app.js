const Discord = require('discord.js');
const { AkairoClient } = require('discord-akairo');
const DBL = require('dblapi.js');
const constants = require('./constants');

const client = new AkairoClient({
  prefix: constants.prefix,
  allowMention: true,
  commandDirectory: './src/commands/',
  listenerDirectory: './src/listeners/',
});

client.login(process.env.TOKEN).then(() => {
  console.log('Logged in!');
});
