const { readdirSync } = require("fs");
require('colors');

module.exports = (client, Discord) => {
  const load = dirs => {
    const events = readdirSync(`./events/${dirs}/`).filter(d => d.endsWith("js") );
    for (let file of events) {
      let evt = require(`../events/${dirs}/${file}`);
      let eName = file.split('.')[0];
      client.on(eName, evt.bind(null, client))
      console.log('[Events]'.yellow + ` Loaded ` + eName.green + '✅');
    }
  };
  ["client", "guild"].forEach((x) => load(x));
  console.log(`${amount} Events Loaded`.brightGreen);
};
