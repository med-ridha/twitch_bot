const chalk = require('chalk')
let tagged;
module.exports.writeToConsole = function (msg, status, username){
  tagged = false;
  let length = 15;
  let space = "";
  if(username.length < length){
    space = Array(Math.abs((length+1) - username.length)).join(" ");
  }
  let width = process.stdout.columns - (length+1);
  if (width < 0){
    console.error(`please resize the your terminal atleast ${length} width`);
    process.exit(0);
  }

  if(msg.toLowerCase().indexOf('zarga') > -1) tagged = true;
  while (msg.length  !== 0 || username.length !== 0) {
    if(status.indexOf("mod") > -1){
      //console.log(`${space}${chalk.green(username.substr(0, length)+`|`)}${msg.substr(0, width)}`);
      process.stdout.write(`${space}${chalk.green(username.substr(0, length)+`|`)}`)
      if(tagged)process.stdout.write(`${chalk.red(msg.substr(0, width))}`)
      else 
        process.stdout.write(`${msg.substr(0, width)}`)
    }else if(status.indexOf("vip") > -1){
      //console.log(`${space}${chalk.magentaBright(username.substr(0, length)+`|`)}${msg.substr(0, width)}`);
      process.stdout.write(`${space}${chalk.magentaBright(username.substr(0, length)+`|`)}`)
      if(tagged)process.stdout.write(`${chalk.red(msg.substr(0, width))}`)
      else 
        process.stdout.write(`${msg.substr(0, width)}`)
    }else if(status.indexOf("sub") > -1){
      //console.log(`${space}${chalk.yellowBright(username.substr(0, length)+`|`)}${msg.substr(0, width)}`);
      process.stdout.write(`${space}${chalk.yellowBright(username.substr(0, length)+`|`)}`)
      if(tagged)process.stdout.write(`${chalk.red(msg.substr(0, width))}`)
      else 
        process.stdout.write(`${msg.substr(0, width)}`)
    }else {
      //console.log(`${space}${chalk.blue(username.substr(0, length)+`|`)}${msg.substr(0, width)}`);
      process.stdout.write(`${space}${chalk.blue(username.substr(0, length)+`|`)}`)
      if(tagged)process.stdout.write(`${chalk.red(msg.substr(0, width))}`)
      else 
        process.stdout.write(`${msg.substr(0, width)}`)
    } 
    //console.log();
    process.stdout.write("\n")
    msg = msg.substring(width, msg.length);
    username =username.substring(length, username.length);
    space = Array(Math.abs((length+1) - username.length)).join(" ");
  }
}
