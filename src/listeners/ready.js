const { Listener } = require('discord-akairo');
module.exports = class Ready extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      eventName: 'ready',
    });
  }

  exec() {
    console.log(
      `DiscordWebDiplomacy started. ${this.client.guilds.size} guilds, ${this.client.channels.size} channels, and ${this.client.users.size} users.`
    );
    let flag = 0;
    let notices = [
      `"d.help" for commands`,
      `${this.client.users.size.toLocaleString()} users`,
    ];
    this.client.user.setGame(notices[0]);
    setInterval(() => {
      this.client.user.setGame(notices[flag % notices.length]);
      flag++;
    }, 600000);
  }
};
