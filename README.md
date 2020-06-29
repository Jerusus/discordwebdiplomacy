# discordwebdiplomacy

A webDiplomacy bot for Discord

This bot will send a notification in your Discord channel when a new turn has just started. At the moment, a server channel can only be subscribed to a single game at a time, and a user can only receive notifications for a single game at a time.

**Click [here](https://discordapp.com/oauth2/authorize?&client_id=711268026191708283&scope=bot&permissions=0) to add this bot to your Discord server, or send this link to your server owner.**

Thanks to [webDiplomacy](http://webdiplomacy.net/) for hosting Diplomacy games.

## Usage

- `d.help`: View available commands.
- `d.configure`: View instructions to configure the bot for yourself and/or your server channel.

### Within a server channel

- `d.set`: Subscribe the current channel to a webDiplomacy game.
- `d.remove`: Unsubscribe the current channel from webDiplomacy games.

### Within a direct message to the bot

- `d.cookie`: Initiate setup for your user to receive notifications for a webDiplomacy game.
- `d.remove`: Unsubscribe from notifications for webDiplomacy games.

## Self-Hosting

For privacy and security reasons, to make full use of the message notification features of this bot, it is recommended you fork this repo and host the bot yourself to use with people you trust and people who trust you.

Create a free [Heroku](https://www.heroku.com/) account to host the bot. The free tier gives you 550 hours a month, but if you add a credit card to your account you can get 1,000 hours which gives your bot 24/7 uptime.

Create an AWS account to use [DynamoDB](https://aws.amazon.com/dynamodb/). Create the following two tables:

1. Table name: **PlayerSubscription** and Primary Key: **UserId**
2. Table name: **GameSubscription** and Primary Key: **ChannelId**

Create a Discord [bot](https://discord.com/developers/applications) to give this application a presence on Discord.

Now to finish it all up, you will need config vars to connect your Heroku app with the AWS database and the Discord account.

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- TOKEN (found here https://discord.com/developers/applications/######/bot but replace the #s with your Discord application's Client ID)

Then deploy to Heroku with `git push heroku master` and add the bot to your Discord server or message it directly!
