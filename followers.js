require('dotenv').config();
const auth = require('./src/auth.js')
const fs = require('fs');
const fetch = require('node-fetch');
const user_id = process.env.USER_ID
let totalFollowers = 0;
let count = 0;
let cursor = "";
const client_id = process.env.TWITCH_CLIENT_ID;
const file = fs.readFileSync('./.accesstoken.txt', 'utf8');
let ACCESS_TOKEN = file.trim().replace('\n', '');
let followers = new Array();

module.exports.updateAccessToken = async () => {
    try {
        let data = await auth.getAccessToken();
        fs.writeFileSync('./.accesstoken.txt', data.access_token);
        ACCESS_TOKEN = data.access_token;
        return true
    } catch (err) {
        console.log(err);
        return false;
    }
}

let config = {
    method: 'GET',
    headers: {
        'Client-ID': client_id,
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    },
}
async function getLiveFollowers() {
    followers = await getAllFollowers();
    let liveFollowers = new Array();
    let j = 100;
    let i = 0;
    while (i < totalFollowers) {
        let url = 'https://api.twitch.tv/helix/streams?';
        while (i < j && i < totalFollowers) {
            url += `user_id=${followers[i].to_id}&`
            i++;
        }
        j += 100;
        let rawResponse = await fetch(url, config);
        let response = await rawResponse.json();
        for (let stream of response.data) {
            if (stream.type === 'live'){
                liveFollowers.push(stream);
            }
        }
    }
    return liveFollowers;
}

async function getAllFollowers() {
    let result = new Array();
    while (count != totalFollowers || totalFollowers == 0) {
        const listFollowersURL = `https://api.twitch.tv/helix/users/follows?from_id=${user_id}&first=100&after=${cursor}`;
        let rawResponse = await fetch(listFollowersURL, config)
        let response = await rawResponse.json();
        if (response.error === 'Unauthorized') {
            let success = await module.exports.updateAccessToken();
            if (success) {
                rawResponse = await fetch(listFollowersURL, config);
                response = await rawResponse.json();
            }
        }
        totalFollowers = response.total || 0;
        count += response.data?.length || 0;
        cursor = response.pagination?.cursor || 0;
        result.push(...response.data)
    }
    return result;
}
module.exports.getLiveFollowers = getLiveFollowers;
module.exports.getAllFollowers = getAllFollowers;
module.exports.totalFollowers = totalFollowers;
module.exports.count = count;
module.exports.cursor = cursor;
module.exports.followers = followers;
