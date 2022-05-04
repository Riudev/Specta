const Discord = require(`discord.js`);
const { Client, Collection, MessageEmbed,MessageAttachment } = require(`discord.js`);
const { readdirSync } = require(`fs`);
const { join } = require(`path`);
const db = require('quick.db');
const { keep_alive } = require("./server");
const { PREFIX, COLOR, MAINCOLOR } = require(`./config.json`);
const figlet = require("figlet");
const client = new Client({ disableMentions: `` , partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);

client.on(`ready`, () => {
    setInterval(() => {
    let member;
    client.guilds.cache.forEach(async guild => {
      await delay(15);
      member = await client.guilds.cache.get(guild.id).members.cache.get(client.user.id)

      if (!member.voice.channel)
        return;

      if (member.voice.channel.members.size === 1) { return member.voice.channel.leave(); }
    });
  }, (5000));

  figlet.text(`${client.user.username} ready!`, function(err, data) {
    if (err) {
      console.log('Something went wrong');
      console.dir(err);
    }
    console.log(`[info]: ready on client (${client.user.tag})`.rainbow)
    console.log(`[info]: See`.red, `${client.guilds.cache.size} server`.bgCyan, `${client.channels.cache.size} channel`.bgGreen, `${client.users.cache.size} user`.bgMagenta)
  })


});

client.on(`warn`, (info) => console.log(info));
client.on(`error`, console.error);

client.commands = new Collection();
client.aliases = new Collection();
["commands", "events"].forEach(handler => {
  try {
    require(`./handler/${handler}`)(client);
  } catch (e) {
    console.log(e)
  }
});

client.queue = new Map()
process.on('unhandledRejection', console.error);

client.on(`message`, async (message) => {
  if (message.author.bot) return;
 
  let prefix = await db.get(`prefix_${message.guild.id}`)
  if(prefix === null) prefix = PREFIX;

  if(message.content.includes(client.user.id)) {
    message.reply(new Discord.MessageEmbed().setColor("#F0EAD6").setAuthor(`${message.author.username}, My Prefix is ${prefix}, to get started; type ${prefix}help`, message.author.displayAvatarURL({dynamic:true})));
  } 

  if(message.content.startsWith(`${prefix}embed`)){
    const saymsg = message.content.slice(Number(prefix.length) + 5)
    const embed = new Discord.MessageEmbed()
    .setColor(MAINCOLOR)
    .setDescription(saymsg)
    .setFooter(`${message.guild.name}`, client.user.displayAvatarURL())

    message.delete({timeout: 300})
    message.channel.send(embed)
  }


 const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
 if (!prefixRegex.test(message.content)) return;
 const [, matchedPrefix] = message.content.match(prefixRegex);
 const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
 const commandName = args.shift().toLowerCase();
 const command =
   client.commands.get(commandName) ||
   client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
 if (!command) return;
 if (!cooldowns.has(command.name)) {
   cooldowns.set(command.name, new Collection());
 }
 const now = Date.now();
 const timestamps = cooldowns.get(command.name);
 const cooldownAmount = (command.cooldown || 1) * 1000;
 if (timestamps.has(message.author.id)) {
   const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
   if (now < expirationTime) {
     const timeLeft = (expirationTime - now) / 1000;
     return message.reply(
      new MessageEmbed().setColor(COLOR)
      .setTitle(`:x: Please wait \`${timeLeft.toFixed(1)} seconds\` before reusing the \`${prefix}${command.name}\`!`)    
     );
   }
 }
 timestamps.set(message.author.id, now);
 setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
 try {
   command.execute(message, args, client);
 } catch (error) {
   console.error(error);
   message.reply( new MessageEmbed().setColor("#F0EAD6")
   .setTitle(`:x: There was an error executing that command.`)).catch(console.error);
 }


});
function delay(delayInms) {
 return new Promise(resolve => {
   setTimeout(() => {
     resolve(2);
   }, delayInms);
 });
}

client.login(prosses.env.Specta);
