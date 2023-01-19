const fetch = require('node-fetch');
const url = 'https://id.twitch.tv/oauth2/token'
module.exports.getAccessToken = async () => {
    return await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_SECRET,
            grant_type: 'client_credentials'
        })
    }).then(res => res.json());
}
