const blessed = require('blessed');
const chalk = require('chalk')
const followers = require('../followers.js')
let error = null;

const screen = blessed.screen({
    smartCSR: true,
    title: 'twitch chat',
});
const list = blessed.list({
    label: 'live channels',
    parent: screen,
    scrollable: true,
    top: 0,
    right: 0,
    width: '20%',
    height: '100%',
    border: {
        type: 'line'
    },
    keys: true,
    vi: true,
    search: false,
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        focus: {
            border: {
                bg: 'grey'
            }
        }
    }
})
const box = blessed.box({
    label: 'chat',
    scrollable: true,
    top: 'top',
    left: 0,
    width: '80%',
    height: '80%',
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: 'grey'
        },
    }
});
const errorMessage = blessed.message({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '50%',
    height: 'shrink',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'red',
        border: {
            fg: '#f0f0f0'
        },
    }
});

const input = blessed.textarea({
    label: 'Write stuff',
    bottom: 0,
    left: 0,
    width: '80%',
    height: '20%',
    inputOnFocus: true,
    border: {
        type: 'line',
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: 'red'
        },
    }
});

function getBadges(tags) {
    let msg = "";
    let count = 0;
    try {
        for (let [key] of Object.entries(tags.badges)) {
            if (key === "subscriber" || key === "founder") { key = chalk.yellow(`[❤️️]`); count += 3 }
            else if (key === "moderator") { key = chalk.green(`[♔]`); count += 3 }
            else if (key === "vip") { key = chalk.magenta(`[◆]`); count += 3 }
            else if (key === "verified") { key = chalk.blue(`[✓]`); count += 3 }
            else if (key === "bits") { key = chalk.red(`[¢]`); count += 3 }
            else if (key === "staff") { key = chalk.cyan(`[✯]`); count += 3 }
            else if (key === "premium") { key = chalk.red(`[ᴴ]`); count += 3 }
            else if (key === "global_mod") { key = chalk.cyan(`[╀]`); count += 3 }
            else if (key === "broadcaster") { key = chalk.red(`[⬤]`); count += 3 }
            else if (key === "admin") { key = chalk.red(`[✪]`); count += 3 }
            else if (key === "turbo") { key = chalk.blue(`[➠]`); count += 3 }
            else key = "";
            msg += `${key}`;
        }
    } catch (e) {
        msg += "";
    }
    return [msg, count];
}

module.exports.addMessage = (message, tags) => {
    try {
        let [status, count] = getBadges(tags)
        let color = tags.color ? tags.color : '#FFFFFF'
        let username = tags.username;
        let space = Array(Math.abs(30 - username.length)).join(' ');
        let statusSpace = Array(Math.abs(10 - count)).join(' ');
        let time = new Date().toLocaleTimeString().split(':').slice(0, 2).join(':');
        let totalSpace = Array(51).join(' ');
        let width = 1 + (box.width - totalSpace.length);
        let tagged = false
        tagged = message.indexOf('zarga') > -1;
        let i = 0;
        let firstHalf = `${time} ${statusSpace}${status}${chalk.hex(color)(username)}${space}`
        while (message.length > 0) {
            if (i > 0) {
                totalSpace = Array(45).join(' ');
            } else {
                totalSpace = Array(0).join(' ');
            }
            if (tagged) {
                box.pushLine(`${totalSpace}${firstHalf}:${chalk.red(message.substring(0, width))}`);
            } else {
                box.pushLine(`${totalSpace}${firstHalf}:${message.substring(0, width)}`);
            }
            if (box.getScrollHeight() >= 24) { box.deleteTop(); }
            firstHalf = "";
            i += 1;
            message = message.substring(width);
        }
        screen.render();

    } catch (err) {
        this.handleError(err);
    }
}
screen.key('l' , function(ch, key){
    return list.focus();
})
screen.key('q', function(ch, key) {
    return process.exit(0);
});

screen.key(['i', 'a'], function(ch, key) {
    input.focus();
});


input.key('enter', function(ch, key) {
    let value = input.getValue();
    value = value.replace(/\n/g, '');
    box.insertBottom(value);
    input.clearValue();
    input.resetScroll();
    screen.render();
});


screen.key('e', function(_ch, _key) {
    if (error != null) {
        error.focus();
    }
})

screen.key('esc', function(_ch, _key) {
    screen.focus()
})

screen.append(box);
screen.append(input);
screen.remove(errorMessage)


screen.key('r', function(ch, key) {
    screen.realloc();
    screen.render();
});

function createError(error) {
    return blessed.message({
        parent: screen,
        top: 'center',
        left: 'center',
        width: '50%',
        height: 'shrink',
        content: error,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            },
            focus: {
                border: {
                    bg: 'red'
                }
            }
        }
    })
}
module.exports.handleError = (errorMessage) => {
    try {
        error = createError(`${errorMessage} \n\t press any key to close (not q)`);
        screen.append(error)
        error.focus();
        screen.render();
        error.addListener('keypress', (_ch, _key) => {
            try {
                screen.remove(error);
                error.destroy();
                error = null;
                screen.render();
            } catch (err) {
                // TODO: handle error
            }
        })
        setTimeout(() => {
            if (error != null) {
                screen.remove(error);
                error.destroy();
                error = null;
                screen.render();
            }
        }, 5000)
    } catch (err) {
        this.handleError(err + " in error handler line 185")
    }
}
const loading = blessed.loading({
    parent: list,
    top: 'center',
    left: 'center',
    width: '90%',
    height: 'shrink',
    border: 'line',
    content: 'fetching data... ',
})

list.on('select', function(item, index) {
    module.exports.handleError(item.content);
    screen.render();
});
function setLiveFollowes() {
    followers.getLiveFollowers().then((result) => {
        list.clearItems()
        let items = new Array(); 
        for (let follower of result) {
            items.push({user_name: follower.user_name , viewer_count :follower.viewer_count})
        }
        items.sort( (a, b) => {
            return b.viewer_count - a.viewer_count;
        })
        for (let f of items) {
            list.add(f.user_name + "| " + `${chalk.red(f.viewer_count)}`)
        }
        loading.stop();
        screen.render();
    })
}
setLiveFollowes()
setInterval(() => {
    setLiveFollowes()
    console.log('282')
}, (1000 * 60) * 5)
box.focus();

screen.render();
