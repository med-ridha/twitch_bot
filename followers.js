require('dotenv').config();
const auth = require('./src/auth.js')
const fs = require('fs');
const fetch = require('node-fetch');
const user_id = process.env.USER_ID
let totalFollowers = 0;
let count = 0;
let cursor = "";
const client_id = process.env.TWITCH_CLIENT_ID;
const file = fs.readFileSync('./accesstoken.txt', 'utf8');
let ACCESS_TOKEN = file.trim().replace('\n', '');

module.exports.updateAccessToken = async () => {
    try {
        let data = await auth.getAccessToken();
        fs.writeFileSync('./accesstoken.txt', data.access_token);
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
module.exports.getFollowers = async () => {
    if (count  != totalFollowers || totalFollowers == 0) {
        const listFollowersURL = `https://api.twitch.tv/helix/users/follows?from_id=${user_id}&after=${cursor}`;
        let rawResult = await fetch(listFollowersURL, config);
        let result = await rawResult.json();
        if (result.error === 'Unauthorized') {
            let success = await module.exports.updateAccessToken();
            if (success) {
                rawResult = await fetch(listFollowersURL, config);
                result = await rawResult.json();
            }
        }
        totalFollowers = result.total || 0;
        count += result.data?.length || 0;
        cursor = result.pagination?.cursor || 0;
        return result.data;
    }
    else {
        return [];
    }
}
module.exports.totalFollowers = totalFollowers;
module.exports.count = count;
module.exports.cursor = cursor;
