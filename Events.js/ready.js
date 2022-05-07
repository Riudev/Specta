require('colors')
const { PREFIX } = require(`../../config.json`);

module.exports = async client => {
	client.user.setActivity(`${PREFIX}help | Specta Cafe`, { type: "STREAMING",
	       url: "https://discord.gg/kUUQjJRj"});
};
