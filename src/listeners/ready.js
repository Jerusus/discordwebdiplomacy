const { Listener } = require('discord-akairo');
class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
    });
  }

  exec() {
    console.log(
      `DiscordWebDiplomacy started. ${this.client.guilds.cache.size} guilds, ${this.client.channels.cache.size} channels, and ${this.client.users.cache.size} users.`
    );
    let flag = 0;
    let notices = [
      `"d.help" for commands`,
      `${this.client.users.size.toLocaleString()} users`,
    ];
    this.client.user.setActivity(notices[0]);
    setInterval(() => {
      this.client.user.setActivity(notices[flag % notices.length]);
      flag++;
    }, 600000);
  }
}

module.exports = ReadyListener;
