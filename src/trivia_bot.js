require('dotenv').config();
const tmi = require("tmi.js");
const trivia = require('./quiz.js')
const mrStreamer = process.argv[2];
if (!mrStreamer) {
    console.log("no Streamer name detected please insert a stream name to connect to");
    process.exit(0);
}
const client = tmi.Client({
    options: { debug: false, messagesLogLevel: "info" },
    connection: {
        reconnect: false,
        secure: true
    },
    identity: {
        username: 'z_trivia_bot',
        password: process.env.z_trivia_bot_oauth
    },
    channels: [mrStreamer]
});
client.connect();
client.on("connected", () => {
    console.log(`connected to ${mrStreamer}`);
});
client.on("disconnected", () => {
    console.log(`disconnected from ${mrStreamer}`);
});

function getBadges(tags) {
    var msg = "";
    try {
        for (var [key, value] of Object.entries(tags.badges)) {
            if (key === 'subscriber') key = `sub/`
            else if (key === 'moderator') key = `mod/`
            else if (key === 'vip') key = `vip/`
            else key = '';
            msg += `${key}`

        }
        msg = msg.substring(0, msg.length - 1);

    } catch (e) {
        msg += '';
    }
    if (msg.length == 0) {
        msg = `none`;
    }
    return msg;
}
client.on("message", (channel, tags, message, self) => {
    var status = getBadges(tags);
    if (self) {
        console.log(`[${status}]<${tags.username}> : ${message}`);
        return;
    }
    var args = message.toLowerCase().split(" ");
    if (args[0] === `!trivia`) {
        trivia.gameManager(args, status, client, mrStreamer, tags.username);
    }
    if(args[0] === '!bot'){
        client.say(mrStreamer, ``);
    }
})
