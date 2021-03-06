const { setIntervalAsync } = require('set-interval-async/dynamic')
const DBL = require("dblapi.js");

exports.message = msg => {
  require('./index.js').commands.handle(msg);
}
exports.ready = () => {
  global.client.user.setPresence({ game: { name: 'with Democracy | d!help' }})
  console.log("Bot has started.")

  setIntervalAsync(
    async () => {await require('./index.js').checker(global.client)},
    10000
  )

  if (process.env.DBLAPI) {
    const dbl = new DBL(process.env.DBLAPI, global.client);

    dbl.on('error', e => {
     console.log(`Error Posting Server Count`);
     console.error(e);
    })
  }
}
exports.join = (guild) => {
  // Finding channel to post welcome message in.
  let defaultChannel = "";
  guild.channels.forEach((channel) => {
    if(channel.type == "text" && defaultChannel == "") {
      if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  })
  if (defaultChannel) {
    defaultChannel.send([
      'Hi, thanks for inviting me into your server! To start off, you\'d want to set a channel were rules and votes will be posted',
      'You can do that by running the command `d!setup`!',
      'The rule creation process is all automated, and easy to use. Just set it and forget it.',
      'If you run into any problems, you can type d!help for a list of commands and d!debug to debug the bot if it is not working correctly.'
    ].join('\n'))
  }
}
exports.guildMemberAdd = async (user) => {
  let config = await global.Database.query("SELECT * FROM `servers` WHERE server_id = ?", user.guild.id);
  config = config[0]
  if (!config || !config.msg_on_join || user.user.bot) return;
  const channel = user.user;
  const votes = await global.Database.query(`SELECT * FROM \`votes\` WHERE (status = 2 AND server_id = ?)`, [user.guild.id]);
  await channel.send('Rules for **' + user.guild.name + '**:')
  if (config.channel_vote_id && config.channel_rules_id) {
    await channel.send(`The rules for this server can be found here: <#${config.channel_rules_id}>. For more info send ${config.prefix}help in the server.`)
  }
  for (var i = 0; i < votes.length; i++) {
    channel.send(global.Database.formatRule(votes[i]));
  }
}
