require('dotenv').config()
const tmi = require("tmi.js");
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

function getBadges(tags) {
    let status = "";
    try {
        for (let [key] of Object.entries(tags.badges)) {
            if (key =="broadcaster") status += "[broad]"; 
            if (key === "subscriber" || key === "founder") status += '[sub]';
            if (key === "moderator")  status += '[mod]'; 
            if (key === "vip") status += '[vip]';
            if (key === "verified") status += '[verified]';
            if (key === "bits") status += 'bits'; 
            if (key === "staff") status += '[staff]'; 
            if (key === "premium") status += '[premium]'; 
            if (key === "global_mod") status += '[gmod]';
            if (key === "broadcaster") status += '[broad]';
            if (key === "admin") status += '[admin]'; 
            if (key === "turbo") status += '[turbo]'; 
        }
    } catch (e) {
        msg += "";
    }
    return status;
}
let client = tmi.Client(Options);
// for when the bot joins the raffle
setupBot(client);
let join = false;
let messageCache = [];
function setupBot(client) {
    mrStreamer = Options.channels[0].replace('#', '');
    client.connect().catch((e) => console.error(error));
    client.on('connected', () => {
        console.log('connected to ' + mrStreamer)
    })
    client.on('disconnected', () => {
        console.log('disconnected from ' + mrStreamer)
    })
    client.on("cheer", (_, tags, message, self) => {
        if (self) return
    });
    client.on("message", (_, tags, message, self) => {
        if (self) return;
        let username = tags.username; let isBot = false; let isCommand = false;
        if (message.substring(0, 1) === '!') { isCommand = true; }
        if (checkIsBot(username.toLowerCase())) { isBot = true; }

        message = message.toString().replace(/\s+/g, ' ');
        message = message.toString().replace(/&/g, ' ');
        messageCache.push([username, message]);
        if (messageCache.length > 100) messageCache.shift();
        let args = message.split(" ");
        if (talk) {
            args = message.toLowerCase().split(" ");
            if (args[0] === `!trivia` || args[0] === `!t`) {
                let [_msg, _count, status] = getBadges(tags);
                trivia.gameManager(args, status, client, mrStreamer, username);
            }
            if (args[0] === "!transto") {
                let status = getBadges(tags);
                if (!isBot && (status.includes('vip') || status.includes('mod') || status.includes('broad'))){
                    args.shift();
                    translate.translateTo(args).then(msg => {
                        let finalmessage = "";
                        for (let i = 0; i < msg[0].length; i++) {
                            if (msg[0][i][0] !== null)
                                finalmessage += msg[0][i][0] + ' ';
                        }
                        client.say(mrStreamer, `${finalmessage}`);
                    });
                }

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


