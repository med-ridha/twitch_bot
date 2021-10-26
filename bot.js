require('/home/ridha/src/twitch_bot/node_modules/dotenv').config()
const { StaticAuthProvider } = require("twitch-auth");
const { ApiClient } = require("twitch");
const extra = require("./extra.js");
const tmi = require("tmi.js");
const opn = require("opn");
//const trivia = require("./quiz.js");
const translate = require("./translate.js");
const fetch = require('node-fetch');
const clientId = process.env.client_id;
const accessToken = process.env.access_token ;
const authProvider = new StaticAuthProvider(clientId, accessToken);
const apiClient = new ApiClient({ authProvider });
const { pickuplines, emotes, puns } = extra;
const args = process.argv.slice(2);
let translatethis = false;
let talk = false;
let mods = true;
const me = process.env.me 
if(args.includes('--users')){
  console.log(`user1 ${process.env.user1}\nuser2 ${process.env.user2}\nuser3 ${process.env.user3}`)
  process.exit(0)
}


if(args.includes('--translate')){
    translatethis = true;
    args.splice(args.indexOf('--translate'), 1);
}

if(args.includes('--mods')){
    mods = false;
    args.splice(args.indexOf('--mods'), 1);
}
if(args.includes('--talk')){
    talk = true;
    args.splice(args.indexOf('--talk'), 1);
}
let mrStreamer = args[0] || me;
if (!args[1]) {
  args[1] = me;
}

let channels = [mrStreamer, me];

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

const client = tmi.Client({
  options: { debug: false, messagesLogLevel: "info" },
  connection: {
    reconnect: false,
    secure: true,
  },
  identity: {
    username: `${users[args[1]]}`,
    password: `${oauths[args[1]]}`,
  },
  channels: channels,
});
client.connect().catch(console.error);

client.on("connected", () => {
  console.log(`connected to ${channels} as ${users[args[1]]}`);
});
client.on("disconnected", () => {
  console.log(`disconneted from ${channels}`);
});
let p =  0;
let g =  0;
let b = false;
let join = false;
let spamtheJAM = null;

function getBadges(tags) {
  let msg = "";
  
  try {
    for (let [key, value] of Object.entries(tags.badges)) {
      //console.log(`${key}: ${value}`);
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
  let length = status.length + username.length + 4;
  let columnsLeft = process.stdout.columns - length;
  if (columnsLeft < 0){
    console.error(`please resize the your terminal atleast ${length} width`);
    process.exit(0);
  }
  console.log(`${status}  ${username}|${msg.substr(0, columnsLeft)}`);
  msg = msg.substring(columnsLeft, msg.length);
  let space = Array(length-1).join(" ");
  while (msg.length  !== 0 ) {
    console.log(`${space}|${msg.substr(0, columnsLeft)}`);
    msg = msg.substring(columnsLeft, msg.length);
  }
}

process.stdout.on("resize" , () =>{
  console.clear();
  console.log('resizing the console will clear it to prevent ugly messages')
})

let started = false;
let messages = [];
let uniquechatters = [];
let transtimeout = true;
let nexttime = [];
let t = [];
client.on("cheer", (channel, tags, message, self) =>{
  console.error(`${message}${tags.username} |||||||||||| test`);
  process.exit(0);
});
client.on("message", (channel, tags, message, self) => {
  if (self || message.substr(0, 1) === '!') return;
  let username = tags.username;
  if(username.toLowerCase() === `streamlabs` || username.toLowerCase() === `streamelements` || username.toLowerCase() === `nightbot`) return;
  message = message.toString().replace(/\s+/g, ' ');
  message = message.toString().replace(/&/g, ' ');
  let status = getBadges(tags);
  let space2 = Array(Math.abs(14 - status.length)).join(" ");
  let space3 = Array(Math.abs(20 - username.length)).join(" ");
  status += space2;
  username = space3 + username;
  if(translatethis){
    if(mods && (status.includes('vip') || status.includes('mod'))){
      writeToConsole(message, status, username);
      //console.log(`[${status}]${space2}<${tags.username}>${space3} : ${message} (original)`);
    }
    else{
      try {
        let url = "https://translate.googleapis.com/translate_a/single?client=gtx&ie=UTF-8&oe=UTF-8&dt=bd&dt=ex&dt=ld&dt=md&dt=rw&dt=rm&dt=ss&dt=t&dt=at&dt=qc&sl=auto&tl=en&hl=en&q="
        let options = {
          method : `GET`,
          headers:{
            'Content-Type' : 'application/json'
          }
        }
        url += message;
        url = encodeURI(url);
        fetch(url, options).then(res => res.json()).then(alteredmessage =>{
          let finalmessage = "";
          for(let i = 0; i < alteredmessage[0].length; i++) {
            if(alteredmessage[0][i][0] !== "null" && alteredmessage[0][i][0] !== null)
              finalmessage += alteredmessage[0][i][0];
          }
          writeToConsole(finalmessage, status, username);
         // console.log(`[${status}]${space2}<${tags.username}>${space3} : ${finalmessage}`);
        });
      }catch {
        console.log("something went wrong!! at b:125") ;
      }
    }
  }
  else {
    writeToConsole(message, status, username);
    //console.log(`[${status}]${space2}<${tags.username}>${space3} : ${message}`);
  }
  if(channel === '#'+mrStreamer){
    let args = message.split(" ");
    if(talk){
      if(uniquechatters[tags.username] === undefined) uniquechatters[tags.username] = true;
      if(!message.includes('$translate') && !message.includes('$transto')){
        messages.push(["@"+tags.username.toLowerCase(), message]);
      }

      if(messages.length > 60) messages.shift();
      if (args[0].toLowerCase() === "$translate") {
        if(status.includes('mod') || status.includes('vip') || tags.username.toLowerCase() === mrStreamer.toLowerCase()){
          if(uniquechatters[tags.username]){
            if(args[1]){
              messages.reverse();
              let msg = "";
              if(args[1].indexOf('@') >= 0){
                for(let i = 0; i < messages.length; i++){
                  if(messages[i][0].toLowerCase() === args[1].toLowerCase()){
                    msg += messages[i][1];
                    break;
                  }
                }
              }
              translate.translate(args, msg).then(trans => {
                let finalmessage = "";
                for(let i = 0; i < trans[0].length; i++) finalmessage += trans[0][i][0];
                console.log(finalmessage)
                client.say(mrStreamer, `@${tags.username} : ${finalmessage} `);
              });
              uniquechatters[tags.username] = false;
              nexttime[tags.username] = 60;
              t[tags.username] = setInterval(() => { nexttime[tags.username] -= 1}, 1000);
              setTimeout(()=>{ uniquechatters[tags.username] = true; clearInterval(t[tags.username]) }, (60000))
            }else{
              client.say(mrStreamer, `@${tags.username} $translate [message or @username]`)
            }
          }else{
            client.say(mrStreamer, `@${tags.username} ayo chill, for spamming and rate limiting purposes this ability is on cooldown for you, ${nexttime[tags.username]} seconds remaining`)
          }
        }else{
          client.say(mrStreamer, ` @${tags.username} sorry, for spamming and rate limiting purposes you are not allowed to use this FeelsBadMan`);
        }
      }
      args = message.toLowerCase().split(" ");
      if (args[0] == "!trivia") {
        //trivia.gameManager(args, status, client, mrStreamer, tags.username);
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

      if (message.includes(`it`) && message.includes(`s`) && message.includes(`my`) && (message.includes(`birthday`) || message.includes(`bday`))) {
        setTimeout(() => {
          client.say(mrStreamer, `@${tags.username} happy birthday!`);
        }, 3000);
      }

      if (
      message.toLowerCase().includes(`what's poppin`) ||
        message.toLowerCase().includes(`whats poppin`)
    ) {
        setTimeout(() => {
          client.say(mrStreamer, `@${tags.username} don't mind me just watching`);
        }, 4000);
      }

      if (args.includes("pick") && args.includes("up") && args.includes(`line`)) {
        if (pickuplines.length == 0) {
          if (message.includes("zarga")) {
            client.say(mrStreamer, `that is enough`);
            return;
          }
        } else {
          let pos = Math.floor(Math.random() * pickuplines.length);
          client.say(mrStreamer, `${pickuplines[pos]}`);
          pickuplines.splice(pos, 1);
          return;
        }
        return;
      }

      if (args.includes("pun") || args.includes("puns")) {
        if (puns.length == 0) {
          if (message.includes("zarga")) {
            client.say(mrStreamer, ` that is enough`);
            return;
          }
        } else {
          let pos = Math.floor(Math.random() * puns.length);
          client.say(mrStreamer, ` ${puns[pos]}`);
          puns.splice(pos, 1);
          return;
        }
        return;
      }
      if (message.includes("zarga")) {
        if (message.includes("stupid")) {
          setTimeout(() => {
            client.say(
              mrStreamer,
              `${tags.username} i presume that your presumption is Precisely incorrect and your diabolical mind is insufficiently cultivated To comprehend my Meaning `
            );
          }, 3000);
          return;
        }
        if ((message.includes("thank") &&(message.includes("u") || message.includes("you"))) || message.includes("thnx") ||message.includes("merci") || message.includes("thnks")) {
          client.say(mrStreamer, `@${tags.username} you are welcome :D`);
          return;
        }
        if ( message.includes("hahaha") || message.includes("ahahah") || message.includes(`hhhaaa`) || message.includes(`aahahaah`)) {
          client.say(mrStreamer, `@${tags.username} LUL`);
          return;
        }

      }

      let JAM = ["babyJAM", "catJAM", `Dance`];
      let ph = ``;
      if (args[0] === `!jam` && tags.username === me) {
        for (let i = 0; i < 35; i++) {
          let pos = Math.floor(Math.random() * JAM.length);
          ph += `${JAM[pos]} `;
        }
        client.say(mrStreamer, ph);
        ph = ``;
      }
      if (tags.username === me && message === "!spamthejam") {
        spamtheJAM = setInterval(() => {
          for (let i = 0; i < 35; i++) {
            let pos = Math.floor(Math.random() * JAM.length);
            ph += `${JAM[pos]} `;
          }
          client.say(mrStreamer, ph);
          ph = ``;
        }, 1000);
      }

      if (tags.username === me && message === "!stopthejam") {
        clearInterval(spamtheJAM);
      }
    }
  }
  if(channel === '#'+me){
    let args = message.split(" ");
    if (args[0].toLowerCase() === "$translate") {
      if(status.includes('mod') || status.includes('vip') || tags.username.toLowerCase() === me.toLowerCase()){
        if(args[1]){
          messages.reverse();
          let msg = "";
          if(args[1].indexOf('@') >= 0){
            for(let i = 0; i < messages.length; i++){
              if(messages[i][0].toLowerCase() === args[1].toLowerCase()){
                msg += messages[i][1];
                msg += " / "
              }
            }
          }
          translate.translate(args, msg).then(trans => {
            let finalmessage = "";
            for(let i = 0; i < trans[0].length; i++) finalmessage += trans[0][i][0];
            client.say(me, `${finalmessage} @${tags.username}`);
          });
        }else{
          client.say(me, `@${tags.username} $translate [message or @username]`)
        }
      }else{
        client.say(me, ` @${tags.username} sorry, for spamming and rate limiting purposes you are not allowed to use this FeelsBadMan`);
      }
    }
    if(talk && args[0] === '$transto'){
      if(tags.username.toLowerCase() === me){
        translate.translateTo(args).then(msg => {
          let finalmessage = "";
          for(let i=0; i < msg[0].length; i++) finalmessage += msg[0][i][0] + ' ';
          client.say(mrStreamer, `${finalmessage}`);
        });
      }else{
        client.say(me, `@${tags.username} Get Out!`);
      }
    }
  }
});



