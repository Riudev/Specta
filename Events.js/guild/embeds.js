const { Client, Collection, MessageEmbed } = require("discord.js");
const { COLOR } = require(`../../config.json`)

module.exports = {
 async embeds(message, titel) {

    try{
      await message.reactions.removeAll();
       await message.react(" ");
      }catch{
        }

    let resultsEmbed = new MessageEmbed()
      .setTitle("❎" + titel)
      .setColor(COLOR)
      
      message.channel.send(resultsEmbed);
    return;

  }
};
