const chalk = require('chalk')
const writeTo = require("./writeToConsole.js");
module.exports.writeToConsole = function (message, status, username){
    let tagged = false;
    let usernameSpace = 15;
    let space = "";
    if (username.length < usernameSpace){
        space = Array(Math.abs((usernameSpace+1) - username.length)).join(" ");
    }
    let width = process.stdout.columns - (usernameSpace + 1); //offset by one cause of the |

    if (width < 0){
        console.error(`please resize the your terminal atleast ${usernameSpace + 1} width`);
        process.exit(0);
    }

    if (message.toLowerCase().indexOf('zarga') > -1) tagged = true;
    let words = message.split(" ");
    let counter = 0;
    let borrowUsername = username;
    // eslint-disable-next-line no-constant-condition
    while (true){
        counter += 1;
        if (words.length <= 0 && borrowUsername.length <= 0) break;
        let remainingWidth = width;
        if (status.indexOf("mod") > -1) {
            process.stdout.write(`${space}${chalk.green(borrowUsername.substr(0, usernameSpace))}|`);
        }else if (status.indexOf("vip") > -1){
            process.stdout.write(`${space}${chalk.magentaBright(borrowUsername.substr(0, usernameSpace))}|`);
        }else if (status.indexOf("sub") > -1){
            process.stdout.write(`${space}${chalk.yellow(borrowUsername.substr(0, usernameSpace))}|`);
        }else {
            process.stdout.write(`${space}${chalk.blue(borrowUsername.substr(0, usernameSpace))}|`);
        }
        while(words.length > 0 && remainingWidth > 0){
            if (words[0] !== undefined && words[0].length > width){
                process.stdout.write("\n")
                writeTo.writeToConsole(words[0], status, username);
                words.shift();
            } else if (words[0] !== undefined && (words[0].length) < remainingWidth){
                if (tagged){
                    process.stdout.write(`${chalk.red(words[0])} `);
                }else {
                    process.stdout.write(`${words[0]} `);
                }
                remainingWidth -= words[0].length + 1;
                words.shift();
            } else if (words[0] && words[0].length >= remainingWidth){
                break;
            }
        }
        //console.log();
        process.stdout.write("\n")
        borrowUsername = borrowUsername.substring(usernameSpace, borrowUsername.length);
        space = Array(Math.abs((usernameSpace+1) - borrowUsername.length)).join(" ");
        if (counter > 100) process.exit(1);
    }
    
}
