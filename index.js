const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Express app!')
});

app.listen(3000, () => {
  console.log('server started');
});


const Discord = require("discord.js")
require("dotenv").config()

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
})

let bot = {
    client,
    prefix: "!",
    owners: ["441868649435758610"]
}

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.slashcommands = new Discord.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events")(bot,reload)
client.loadCommands = (bot,reload) => require("./handlers/commands")(bot,reload)
client.loadSlashCommands = (bot,reload) => require("./handlers/slashcommands")(bot,reload)

client.loadEvents(bot, false)
client.loadCommands(bot,false)
client.loadSlashCommands(bot,false)

module.export = bot

// client.on("ready",()=>{
//     console.log(`Logged in as ${client.user.tag}`)
// })
// client.on("messageCreate",(message)=>{
//     if(message.content == "hi"){
//         message.reply("Hello Worlds!")
//     }
// })
client.login(process.env.TOKEN)