const { MessageEmbed } = require("discord.js");
const { COLOR, MAINCOLOR } = require(`../../config.json`)

module.exports = {
 async specta(member, message, arg, client) {

    let resultsEmbed = new MessageEmbed()
      .setTitle(`❗ | Hey Are you enjoying your time with Specta!`)
      .setColor(MAINCOLOR)

    if (member.voice.channel !== member.guild.me.voice.channel) {

      member.send(resultsEmbed)
      return false;
    }
    return true;
  }
};
