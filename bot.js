require('/home/ridha/src/twitch_bot/node_modules/dotenv').config()
const { spawn } = require("child_process");
const cors = require('cors');
const chatbox = require('./src/chatbox.js');
const express = require('express')
const path = require('path');
const tmi = require("tmi.js");
const chalk = require('chalk');
//const trivia = require("./src/quiz.js");
const translate = require("./src/translate.js");
const args = process.argv.slice(2);
const me = process.env.me

let translatethis = false;
let talk = false;
let chat = false;
let mods = true;
let width = process.stdout.columns;

if(args.includes('--users')){
  console.log(`user1 ${process.env.user1}\nuser2 ${process.env.user2}\nuser3 ${process.env.user3}`)
  process.exit(0)
}
if(args.includes('--chat-box')){
  chat = true;
  args.splice(args.indexOf('--chat-box'), 1);
}

if(args.includes('--translate')){
  translatethis = true;
  args.splice(args.indexOf('--translate'), 1);
}

if(args.includes('--mods')){
    mods = false;
    args.splice(args.indexOf('--mods'), 1);
}

if(args.includes('--autobot')){
    talk = true;
    args.splice(args.indexOf('--talk'), 1);
}
let mrStreamer = args[0] || me;
if (!args[1] || chat) {
  args[1] = 'user1';
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

let Options2 = {
  options: { debug: false, messagesLogLevel: "info" },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: `${users[args[1]]}`,
    password: `${oauths[args[1]]}`,
  },
  channels: [],
}
let Options = {};
if(args[1] === 'nouser' && !chat){
   Options = {
    options: { debug: false, messagesLogLevel: "info" },
    connection: {
      reconnect: true,
      secure: true,
    },
    channels: channels,
  }
}else{
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
let chatbot = tmi.Client(Options2);
if(chat){
  chatbot.connect().catch(console.error);
  chatbot.on("connected", () => {
    console.log(`chat bot connected to ${me} as ${users[args[1]]}`);
  });
  chatbot.on("disconnected", () => {
    console.log(`chat bot disconneted from ${me}`);
  });
  spawn("qutebrowser", ["localhost:1337/chatbox", "--target", "window"])
}
let client = tmi.Client(Options);
client.connect().catch(console.error);
client.on("connected", () => {
  console.log(`client connected to ${channels} as ${users[args[1]]}`);
});
client.on("disconnected", () => {
  console.log(`client disconneted from ${channels}`);
});


function getBadges(tags) {
  let msg = "";
  try {
    for (let [key] of Object.entries(tags.badges)) {
      if (key === "subscriber") key = `sub/`;
      else if (key === "moderator") key = `mod/`;
      else if (key === "vip") key = `vip/`;
      else key = "";
      msg += `${key}`;
    }
    msg = msg.substring(0, msg.length - 1);
  } catch (e) {
    msg += "";
  }
  return msg;
}
function writeToConsole(msg, status, username){
  let length = 15;
  let space = "";
  if(username.length < length){
    space = Array(Math.abs((length+1) - username.length)).join(" ");
  }
  let columnsLeft = process.stdout.columns - (length+1);
  if (columnsLeft < 0){
    console.error(`please resize the your terminal atleast ${length} width`);
    process.exit(0);
  }

  if(msg.toLowerCase().indexOf('zarga') > -1) msg = chalk.red(msg);
  while (msg.length  !== 0 || username.length !== 0) {
    if(status.indexOf("mod") > -1){
      console.log(`${space}${chalk.green(username.substr(0, length)+`|`)}${msg.substr(0, columnsLeft)}`);
    }else if(status.indexOf("vip") > -1){
      console.log(`${space}${chalk.magentaBright(username.substr(0, length)+`|`)}${msg.substr(0, columnsLeft)}`);
    }else if(status.indexOf("sub") > -1){
      console.log(`${space}${chalk.yellowBright(username.substr(0, length)+`|`)}${msg.substr(0, columnsLeft)}`);
    }else {
      console.log(`${space}${chalk.blue(username.substr(0, length)+`|`)}${msg.substr(0, columnsLeft)}`);
    } 
    msg = msg.substring(columnsLeft, msg.length);
    username =username.substring(length, username.length);
    space = Array(Math.abs((length+1) - username.length)).join(" ");
  }
}

process.stdout.on("resize" , () =>{
  if(process.stdout.columns !== width){
    console.clear();
    console.log('resizing the console will clear it to prevent ugly messages')
    width = process.stdout.columns;
  }
})

//let started = false;
//let messages = [];
//let uniquechatters = [];
//let transtimeout = true;
//let nexttime = [];
//let t = [];
client.on("cheer", (channel, tags, message, self) =>{
  if(self) return
  let username = tags.username;
  writeToConsole(message, getBadges(tags), username);
});
let join = false;
client.on("message", (channel, tags, message, self) => {
  if (self || message.substr(0, 1) === '!') return;
  let username = tags.username;
  if(username.toLowerCase() === `streamlabs` || username.toLowerCase() === `streamelements` || username.toLowerCase() === `nightbot`) return;
  message = message.toString().replace(/\s+/g, ' ');
  message = message.toString().replace(/&/g, ' ');
  let status = getBadges(tags);
  if(translatethis){
    if(mods && (status.includes('vip') || status.includes('mod'))){
      writeToConsole(message, status, username);
    }
    else{
      translate.translate(message).then(raw =>{
        let res = "";
        for(let i = 0; i < raw[0].length; i++) {
          if(raw[0][i][0] !== null)
            res += raw[0][i][0];
        }
        writeToConsole(res, status, username);
      });
    }
  }
  else {
    writeToConsole(message, status, username);
  }
  let args = message.split(" ");
  if(talk){
    args = message.toLowerCase().split(" ");
    if (args[0] == "!trivia") {
      client.say(mrStreamer, `feature currently disabled`)
    }
    if (tags.username.toLowerCase() === me && message.toLowerCase() === "!nospoil") {
      client.say(mrStreamer, "NOSPOIL");
      setInterval(() => {
        client.say(mrStreamer, "NOSPOIL");
      }, 50);
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

const app = express()
app.use(cors());
app.use(express.json());
app.post('/sendmessage', function (req, res) {
  let message = req.body.message;
  if (chat)
    chatbox.parseTheThing(chatbot, message, mrStreamer, translate, client);
  res.json({'res': "ok"});
})
app.get('/chatbox', (req, res)=>{
  res.sendFile(path.join(__dirname, './chatbox.html'));
})
app.get('/getID', function (req, res) {
  let data = {
    streamer: mrStreamer,
    user: users[args[1]]
  }
  res.json(data);
})

app.post('/changeStreamer',  (req, res)=>{
  mrStreamer = req.body.message.split(" ")[1];
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
    channels: [mrStreamer],
  }
  client = new tmi.client(Options);
  client.connect()
    .then(()=>{
      console.log(`connected to ${mrStreamer}`);
    })
    .then(() => res.json({'res': 'ok'}))
    .catch(console.error)
})
app.listen(1337);
