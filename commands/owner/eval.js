const discord = require('discord.js');
module.exports = (msg, command, args) => {
  if (msg.author.id !== process.env.OWNER) return msg.reply('You are unable to execute this command.');
  try {
    const code = args.join(" ");
    let evaled = eval(code);

    if (typeof evaled !== "string")
      evaled = require("util").inspect(evaled);

    msg.channel.send(clean(evaled), {code:"xl"});
  } catch (err) {
    msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
  }
}

const clean = text => {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
    return text;
}