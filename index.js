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
    prefix: "n.",
    owners: ["441868649435758610"]
}

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events")(bot,reload)

client.loadEvents(bot, false)

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