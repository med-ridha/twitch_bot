const fetch = require('node-fetch');
const database = require('./database.js');
let db;
let started = false;
let categories ;
let timer = null;
let quiz = null;
let i = 0;
let token = null;
let players = [];
let amount;
let difficulty;
let type;
let category;
let doc = "!trivia start [amount][category][difficulty][type] | amount : 1 -50 | category: from (9-32) please use !trivia categories for more info | difficulty: easy/medium/hard | type : boolean/multiple ";
function getPlayersFromDB() {
    database.fetchData().then((res) => {
        db = res;
    });
}
getPlayersFromDB();

function allPlayers(client, mrStreamer){
    database.fetchData().then((res) => {
        let msg = "";
        for (let i = 0; i < res.length; i++){
            msg += `[${res[i].name} : ${res[i].score}] `
        }
        client.say(mrStreamer , `${msg}`);
    })
}

function size(arr) {
    let size = 0;
    for (let key in arr) {
        if (arr.hasOwnProperty(key)) size++;
    }
    return size;
}

function setParams(a, c, d, t) {
    i = 0;
    amount = Number(a);
    difficulty = d;
    type = t;
    category = Number(c);
}

function getToken() {
    let API_URL = `https://opentdb.com/api_token.php?command=request`
    fetch(API_URL, {
        method: 'GET',
        body: JSON.stringify(),
    }).then(response => {
        response.json().then(result => {
            token = result.token;
        })
    })
}
async function getQuestions(client, mrStreamer) {
    let promise = new Promise((res)=>{
        let API_URL = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}&token=${token}`
        fetch(API_URL, {
            method:'GET',
            body: JSON.stringify(),
        }).then(response => {
            response.json().then(result => {
                console.log(result.response_code);
                if(result.response_code == 2){
                    client.say(mrStreamer, `invalid paramaters please see the "!trivia doc" for more info`);
                    res(1);
                }
                quiz = result.results;
                res(0);
            });
        })
    });
    let r = await promise;
    return r;
}

async function getCategories() {
    let promise = new Promise((res)=>{
        let API_URL = `https://opentdb.com/api_category.php`
        fetch(API_URL, {
            method:'GET',
            body: JSON.stringify(),
        }).then(response => {
            response.json().then(result => {
                let r = result.trivia_categories;
                let msg = "";
                for (let i = 0; i < r.length; i++){
                    msg += r[i].id + " : " + r[i].name + " | ";
                }
                msg = msg.replace(/Entertainment:/g, "");
                msg = msg.substring(0, msg.length - 2);
                res(msg);
            });
        })
    });
    let r = await promise;
    return r;
}


getToken();
getCategories().then((res)=>{
    categories = res;
})

function more(client, mrStreamer) {
    i = 0;
    getQuestions(client, mrStreamer);
    if (started) {
        client.say(mrStreamer, `hold on we fetching some new questions... , the game will resume shortly`);
        setTimeout(() => {
            client.say(mrStreamer, `nearly there...`);
        }, 1500);
        setTimeout(() => {
            nextQuestion(client, mrStreamer);
        }, 3000);
    }
}

function startTrivia(client, mrStreamer) {
    if (started) {
        client.say(mrStreamer, `the Trivia has already been started`);
    } else {
        getQuestions(client, mrStreamer).then((res)=>{
            if(res == 0){
                getPlayersFromDB();
                players = [];
                i = 0;
                started = true;
                setTimeout(()=>{
                    nextQuestion(client, mrStreamer);
                }, 1000);
            }else{
                return 1;
            }	
        })
    }
    return 0;	
}

async function format(msg){
    let promise = new Promise((res, _)=>{
        msg = msg.replace(/&#039;/g, "'");
        msg = msg.replace(/&quot;/g, '"');
        msg = msg.replace(/&aacute;/g, 'á');
        msg = msg.replace(/&amp;/g, '&');
        msg = msg.replace(/&shy;/g, '');
        msg = msg.replace(/&eacute;/g, 'é');
        msg = msg.replace(/&iacute;/g, 'í');
        msg = msg.replace(/&ldquo;/g, '“');
        msg = msg.replace(/&rdquo;/g, '”');
        msg = msg.replace(/&lsquo;/g, '‘');
        msg = msg.replace(/&rsquo;/g, '’');
        msg = msg.replace(/&sbquo;/g, '‚');
        msg = msg.replace(/&bdquo;/g, '„');
        res(msg);
    });
    let r = await promise;
    return r;
}

let question 
let correctAnswer
let suggestions = []

async function nextQuestion(client, mrStreamer) {
    question = await format(quiz[i].question); 
    correctAnswer = await format(quiz[i].correct_answer);
    let message = "";
    if (quiz[i].type === "multiple"){
        suggestions[0] = await format(quiz[i].incorrect_answers[0]);
        suggestions[1] = await format(quiz[i].incorrect_answers[1]);
        suggestions[2] = await format(quiz[i].incorrect_answers[2]);
        suggestions[3] = correctAnswer;
        suggestions = suggestions.sort();
        for (let counter = 1; counter <= 4; counter++){
            message += `${counter}: ${suggestions[counter-1]}`
            if (counter <4 ) {
                message += ` | `;
            }
        }
    }else{
        suggestions[0] = await format(quiz[i].incorrect_answers[0]);
        suggestions[1] = correctAnswer;
        for (let counter = 1; counter <= 2; counter++){
            message += `${counter}: ${suggestions[counter-1]}`
            if (counter < 2 ) {
                message += ` | `;
            }
        }
    }
    client.say(mrStreamer, `question : ${question}`)
    client.say(mrStreamer, `suggestions : [ ${message} ]`)
    console.log(correctAnswer);
    i++;
}

let currentQuestionPlayers = [];
function play(client, mrStreamer, answer, player) {
    // so that people can't spam answers
    console.log(currentQuestionPlayers);
    if (!currentQuestionPlayers[player]){
        currentQuestionPlayers[player] = true;
        if (!players[player]){
            players[player] = 0;
        }
        if (suggestions[answer-1] === correctAnswer) {
            client.say(mrStreamer, `correct : ${player}`)
            players[player]++;
            currentQuestionPlayers = [];
            nextQuestion(client, mrStreamer);
        }
    }
}



function stopTrivia(client, mrStreamer) {
    clearTimeout(timer);
    let msg = "";
    if (size(players) > 0) {
        let max = -100;
        for (let i in players) {
            if (players[i] > max) {
                max = players[i];
            }
        }
        for (let i in players) {
            if (players[i] == max) {
                msg += i + " ";
            }
        }
        if (max > 0) {
            client.say(mrStreamer, `and the winner is... Drum roll please`);
            setTimeout(() => {
                client.say(mrStreamer, `${msg}Congrats on winning the trivia with ${max} point(s)`);
            }, 2500);
        } else {
            client.say(mrStreamer, `LUL no one has scored more than 0`)
        }
    } else {
        client.say(mrStreamer, `No players FeelsBadMan`);
    }
    quiz = null;
    started = false;
    for (let k = 0; k < db.length; k++) {
        if (players[db[k].name]) {
            db[k].score += players[db[k].name];
        }
    }
    for (let i in players) {
	let found = false;
	for(let j = 0; j < db.length; j++){
		if(i === db[j].name){
			found = true;
			break;
		}
	}
	if(!found){
		db.push({ name: i, score: players[i] });
	}
    }
    if(size(players) > 0){
        console.log(db);
        database.addtodb(db);
    }
    return 0;
}


function scoreBoard(client, mrStreamer) {
    let scoreBoard = "";
    if (started) {
        client.say(mrStreamer, `a game is being played right now please wait after it ends to view the score Board`);
        return;
    } else if (size(players) == 0) {
        client.say(mrStreamer, `score Board is empty... FeelsBadMan`);
        return;
    } else {
        for (let i in players) {
            scoreBoard += "[" + i + " : " + players[i] + "]"
        }
        client.say(mrStreamer, `${scoreBoard}`);
    }
    return 0;
}

function info (client, mrStreamer){
    let msg = "only mods and the streamer can controll the game. players can join by typing !t and the answer number, the question lasts for 15 seconds, correct answer +1, wrong answer -1, u can't change your answer once submitted. you can see all time scores with '!trivia scoreboard'";
    client.say(mrStreamer, `${msg}`);
}

module.exports.gameManager = function(args, status, client, mrStreamer, username) {
    let trustedUser = (status.includes(`mod`) || username.toLowerCase() === mrStreamer.toLowerCase() || username === `i_am_zarga`);
    if(!args[1] && trustedUser){
        info(client, mrStreamer);
        return 0;
    }else if(args[1] == 'alltimeplayers' && trustedUser){
        allPlayers(client, mrStreamer);
    }else if (args[1] === `more` && trustedUser) {
        more(client, mrStreamer);
    } else if (args[1] === `start` && trustedUser) {
        client.say(mrStreamer, `game starting soon each player has one chance to answer each question, answer by typing !t followed by suggestion number`)
        setParams(args[2] || 10, args[3] || 0, args[4] || "", args[5] || "");
        setTimeout(() => {
            startTrivia(client, mrStreamer)
        }, 1000);
    } else if (args[1] === 'stop' && trustedUser) {
        stopTrivia(client, mrStreamer);
        return 0;
    } else if (args[1] === `scoreboard` ) {
        if(started){
            client.say(mrStreamer, `@${username} u can't use that when a game is being played`)
        }else{
            scoreBoard(client, mrStreamer);
        }
        return 0;
    }else if(args[1] === 'doc' && trustedUser){
        client.say(mrStreamer, `${doc}`);
        return 0;
    }else if (args[1] === 'categories' && trustedUser){
        client.say(mrStreamer, `${categories}`);
        return 0;
    } else {
        if (started) {
            if (args[1] === 'nooneleft' && trustedUser){        
                currentQuestionPlayers = [];
                nextQuestion(client, mrStreamer);
            }else if (!isNaN(args[1]) && (args[1] <= 4 && args[1] > 0)) {
                play(client, mrStreamer, args[1], username);
            } else {
                client.say(mrStreamer, `the answer should be the number of one of the choices`);
                return;
            }
        }
    }
}
