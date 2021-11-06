const extra = require('./extra.js')
const { pickuplines, puns } = extra;
let JAM = ["babyJAM", "catJAM", `Dance`];
let ph = ``;
let spamtheJAM = '';
module.exports.parseTheThing = function (chatbot, message, mrStreamer, trans){
    if(message.substr(0, 1) === '!'){
        message = message.substr(1, message.length - 1);
        let args = message.split(" ");
        let command = args.shift();
        let messageRaw = args.join(" ");
        switch(command.toLowerCase()){
            case "send": case "s":
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
            case "jam":
                for (let i = 0; i < 35; i++) {
                    let pos = Math.floor(Math.random() * JAM.length);
                    ph += `${JAM[pos]} `;
                }
                chatbot.say(mrStreamer, ph);
                ph = ``;
                break;
            case "spamthejam" :
                spamtheJAM = setInterval(() => {
                    for (let i = 0; i < 35; i++) {
                        let pos = Math.floor(Math.random() * JAM.length);
                        ph += `${JAM[pos]} `;
                    }
                    chatbot.say(mrStreamer, ph);
                    ph = ``;
                }, 1000);
                break;
            case "stopthejam" :
                clearInterval(spamtheJAM);
                break;
            case "pun":
                if (puns.length == 0) {
                    break;
                } else {
                    let pos = Math.floor(Math.random() * puns.length);
                    chatbot.say(mrStreamer, ` ${puns[pos]}`);
                    puns.splice(pos, 1);
                }
                break;
            case "pickupline":
                if (pickuplines.length == 0) {
                    if (message.includes("zarga")) {
                        break;
                    }
                } else {
                    let pos = Math.floor(Math.random() * pickuplines.length);
                    chatbot.say(mrStreamer, `${pickuplines[pos]}`);
                    pickuplines.splice(pos, 1);
                }
                break;
            default:
                return;
        }
    }
}

