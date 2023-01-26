require('/home/ridha/src/twitch_bot/node_modules/dotenv').config()
// const trivia = require("./src/trivia.js");
const screen = require('./src/screen.js')
const chatBox = require('./src/chatbox.js')
const tmi = require("tmi.js");
//const writeToConsole = require('./src/writeToConsolev2.js').writeToConsole;
const translate = require("./src/translate.js");
const args = process.argv.slice(2);
const me = process.env.me
let translatethis = false;
let talk = false;
let chat = false;

if (args.includes('--users')) {
    console.log(`user1 ${process.env.user1}\nuser2 ${process.env.user2}\nuser3 ${process.env.user3}`)
    process.exit(0)
}

if (args.includes('--translate')) {
    translatethis = true;
    args.splice(args.indexOf('--translate'), 1);
}

if (args.includes('--talk')) {
    talk = true;
    args.splice(args.indexOf('--talk'), 1);
}

let mrStreamer = args[0] || me;
if (!args[1]) {
    args[1] = 'nouser';
}

let channels = [mrStreamer];

let oauths = {
    user1: process.env.user1_oauth,
    user2: process.env.user2_oauth,
    user3: process.env.user3_oauth,
};

let users = {
    user1: process.env.user1,
    user2: process.env.user2,
    user3: process.env.user3,
}

let Options = {};
if (args[1] === 'nouser' && !chat) {
    Options = {
        options: { debug: false, messagesLogLevel: "info" },
        connection: {
            reconnect: true,
            secure: true,
        },
        channels: channels,
    }
} else {
    Options = {
        options: { debug: false, messagesLogLevel: "info" },
        connection: {
            reconnect: true,
            secure: true,
        },
        identity: {
            username: `${users[args[1]]}`,
            password: `${oauths[args[1]]}`,
        },
        channels: channels,
    }
}

function checkIsBot(username) {
    //tmi client doesn't have a tag for bots :(
    return username == "streamelements" ||
        username == "nightbot" ||
        username == "streamlabs";
}

let client = tmi.Client(Options);
screen.setLiveChannels(mrStreamer)
setInterval(() => {
    screen.setLiveChannels(mrStreamer);
}, (1000 * 60) * 5);
// for when the bot joins the raffle
setupBot(client);
let join = false;
let messageCache = [];
function setupBot(client) {
    mrStreamer = Options.channels[0].replace('#', '');
    client.connect().catch((e) => screen.handleError(e));
    screen.setLabels(mrStreamer, users[args[1]]);
    client.on('connected', () => {
        screen.handleMessage('connected to ' + mrStreamer)
    })
    client.on('disconnected', () => {
        screen.handleMessage('disconnected from ' + mrStreamer)
    })
    client.on("cheer", (_, tags, message, self) => {
        if (self) return
        screen.addMessage(message, tags)
    });
    client.on("message", (_, tags, message, self) => {
        let username = tags.username; let isBot = false; let isCommand = false;
        if (message.substring(0, 1) === '!') { isCommand = true; }
        if (self || checkIsBot(username.toLowerCase())) { isBot = true; }
        message = message.toString().replace(/\s+/g, ' ');
        message = message.toString().replace(/&/g, ' ');
        messageCache.push([username, message]);
        if (messageCache.length > 100) messageCache.shift();
        if (translatethis) {
            if (isCommand || isBot) {
                screen.addMessage(message, tags)
            }
            else {
                translate.translate(message).then(raw => {
                    let res = "";
                    for (let i = 0; i < raw[0].length; i++) {
                        if (raw[0][i][0] !== null)
                            res += raw[0][i][0];
                    }
                    screen.addMessage(res, tags)
                });
            }
        }
        else {
            screen.addMessage(message, tags)
        }
        if (self) return;
        let args = message.split(" ");
        if (talk) {
            args = message.toLowerCase().split(" ");
            if (args[0] === `!trivia` || args[0] === `!t`) {
                // trivia.gameManager(args, status, client, mrStreamer, username);
            }
            message = message.toLowerCase();
            if (!join && tags.username.toLowerCase() === "streamelements" && message.includes(`enter by typing "!join"`)) {
                setTimeout(() => {
                    client.say(mrStreamer, `!join`);
                }, 5500);
                setTimeout(() => {
                    join = false;
                }, 40000);
                join = true;
            }
            if (
                message.toLowerCase().includes(`what's poppin`) ||
                message.toLowerCase().includes(`whats poppin`)
            ) {
                setTimeout(() => {
                    client.say(mrStreamer, `@${tags.username} don't mind me just watching`);
                }, 4000);
            }
        }
    });
}
async function switchStreamer(streamer) {
    messageCache = [];
    await client.disconnect()
    Options.channels = [streamer];
    client = new tmi.client(Options);
    setupBot(client)
}

function handleInput(message) {
    if (talk)
        chatBox.parseTheThing(client, message, mrStreamer, translate, messageCache);
}
module.exports.handleInput = handleInput;
module.exports.switchStreamer = switchStreamer;
