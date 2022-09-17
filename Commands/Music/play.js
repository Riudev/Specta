const { play } = require("../clound/play");
const { Client, Collection, MessageEmbed } = require("discord.js");
const { embed } = require("../../events/guild/embed");
const ytsr = require("youtube-sr")

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Plays song from YouTube/Stream",
  cooldown: 1.5,
  edesc: ` `,
  
async execute(message, args, client) {
    if (!message.guild) return;

    const { channel } = message.member.voice;
    const serverQueue = message.client.queue.get(message.guild.id);

    if (!channel) return embeds(message, "Please join a Voice Channel first");
    if (serverQueue && channel !== message.guild.me.voice.channel)
      return embeds(message, `You must be in the same Voice Channel as me`);

    if (!args.length)
      return embeds(message, `Usage: ${message.client.prefix}play <YouTube URL | Video Name | Soundcloud URL>`);

    message.react(" ").catch(console.error);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return embed(message, "I need permissions to connect join your channel!");
    if (!permissions.has("SPEAK"))
      return embed(message, "I need permissions to speak in your channel");

    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const urlValid = videoPattern.test(args[0]);

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 100,
      filters: [],
      realseek: 0,
      playing: true
    };

    let songInfo = null;
    let song = null;

    try {
      //If something is playing
      if (serverQueue) {

        if (urlValid) {
          message.channel.send(new MessageEmbed().setColor("#F0EAD6")
            .setDescription(`**🔎Searching [\`${song.title}\`](${args.join(" ")})**`))

        }
        else { //send searching TITLE
          message.channel.send(new MessageEmbed().setColor("#F0EAD6")
            .setDescription(`**🔎Searching \`${args.join(" ")}\`**`))
        }
      } else {
        //queueConstruct.connection = await channel.join();
        //message.channel.send(new MessageEmbed().setColor("#F0EAD6")
          //.setDescription(`**👍 Joined \`${channel.name}\` 📄 bound \`#${message.channel.name}\`**`)
          //.setFooter(`By: ${message.author.username}#${message.author.discriminator}`))

        if (urlValid) {
          message.channel.send(new MessageEmbed().setColor("#F0EAD6")
            .setDescription(`**:notes: Searching 🔍 [\`${song.title}\`](${args.join(" ")})**`)) 
        }
        else { //send searching TITLE
          message.channel.send(new MessageEmbed().setColor("#F0EAD6")
            .setDescription(`**🔎Searching \`${args.join(" ")}\`**`))
        }
        queueConstruct.connection.voice.setSelfDeaf(true);
        queueConstruct.connection.voice.setDeaf(true);
      }
    }
    catch {
    }

    if (urlValid) {
      try {
        songInfo = await ytsr.searchOne(search) ;
        song = {
          title: songInfo.title,
          url: songInfo.url,
          thumbnail: songInfo.thumbnail,
          duration: songInfo.durationFormatted,
       };
      } catch (error) {
        if (error.statusCode === 403) return embed(message, "Max. uses of api Key, please refresh!");
        console.error(error);
        return embed(message, error.message);
      }
    } 
 
    else {
      try {
        songInfo = await ytsr.searchOne(search) ;
        song = {
          title: songInfo.title,
          url: songInfo.url,
          thumbnail: songInfo.thumbnail,
          duration: songInfo.durationFormatted,
       };
      } catch (error) {
        console.error(error);
        return embed(message, error);        
      }                                                               
    }

    let thumb = " "
    if (song.thumbnail === undefined) thumb = " ";
    else thumb = song.thumbnail.url;
    if (serverQueue) {
      let estimatedtime = Number(0);
      for (let i = 0; i < serverQueue.songs.length; i++) {
        let minutes = serverQueue.songs[i].duration.split(":")[0];   
        let seconds = serverQueue.songs[i].duration.split(":")[1];    
        estimatedtime += (Number(minutes)*60+Number(seconds));   
      }
      if (estimatedtime > 60) {
        estimatedtime = Math.round(estimatedtime / 60 * 100) / 100;
        estimatedtime = estimatedtime + " Minutes"
      }
      else if (estimatedtime > 60) {
        estimatedtime = Math.round(estimatedtime / 60 * 100) / 100;
        estimatedtime = estimatedtime + " Hours"
      }
      else {
        estimatedtime = estimatedtime + " Seconds"
      }

      serverQueue.songs.push(song);
      const newsong = new MessageEmbed()
        .setTitle(song.title)
        .setColor("#F0EAD6")
        .setThumbnail(thumb)
        .setURL(song.url)
        .setDescription("**music has been added to the queue**")
        .addField("Music playing", `\`${estimatedtime}\``, true)
        .addField("queue position", `**\`${serverQueue.songs.length - 1}\`**`, true)
        .setFooter(`Requested by: ${message.author.username}#${message.author.discriminator}`, message.member.user.displayAvatarURL({ dynamic: true }))

        return serverQueue.textChannel
        .send(newsong)
        .catch(console.error);
      
    }

    queueConstruct.songs.push(song);

    message.client.queue.set(message.guild.id, queueConstruct);

    try {
      play(queueConstruct.songs[0], message, client);
    } catch (error) {
      console.error(error);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return embed(message, `Could not join the channel: ${error}`);
    }
  }
};

