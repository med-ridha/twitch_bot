//const extra = require('./extra.js')
//const { pickuplines, /*emotes*/ puns } = extra;
//let p =  0;
//let g =  0;
//let b = false;
//let spamtheJAM = null;
module.exports.doTheThing = function (chatbot, message, mrStreamer, trans){
    console.log(message.substr(0, 1));
    if(message.substr(0, 1) === '!'){
        message = message.substr(1, message.length - 1);
        let args = message.split(" ");
        let command = args.shift();
        let messageRaw = args.join(" ");
        switch(command.toLowerCase()){
            case "send":
                chatbot.say(mrStreamer, messageRaw);
                break;
            case "transto":
                trans.translateTo(args).then(msg => {
                    let finalmessage = "";
                    for(let i=0; i < msg[0].length; i++) 
                    {
                        if (msg[0][i][0] !== null)
                        finalmessage += msg[0][i][0] + ' ';
                    }
                    chatbot.say(mrStreamer, `${finalmessage}`);
                });
                break;
            case "spamthejam" :
                break;
            case "stopthejam" :
                break;
            default:
                return;
        }
    }else{
        chatbot.say(mrStreamer, message);
    }
}

/* Todo:
 * Implement this
    
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


*/
