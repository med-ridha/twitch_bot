class ModClient {
    static endpoint = "https://api.twitch.tv/helix";
    static modID = null;
    static broadcasterID = null;
    static modToken = null;
    static accessToken = null;
    static refreshToken = null;

    constructor(streamer) {
        this.modID = process.env.MOD_ID;
        this.broadcastID = process.env.BROADCASTER_ID;
        this.modToken = process.env.MOD_TOKEN;
        this.accessToken = require('fs').readFileSync('./.accesstoken.txt', 'utf8').trim().replace('\n', '');
        this.refreshToken = require('fs').readFileSync('./.refreshtoken.txt', 'utf8').trim().replace('\n', '');
        if (this.accessToken == null || this.accessToken == '') {
            this.getAccessToken(streamer);
        } else {
            this.getBroadcastID(streamer);
        }

    }

    async getBroadcastID(streamer) {
        let url = `${ModClient.endpoint}/users?login=${streamer}`;
        let response = await fetch(url, {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${this.accessToken}`
            }
        });
        let data = await response.json();
        this.broadcastID = data.data[0].id;
        return data.data[0].id;
    }

    async getTwitchID(username) {
        let url = `${ModClient.endpoint}/users?login=${username}`;
        let response = await fetch(url, {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${this.accessToken}`
            }
        });
        let data = await response.json();
        return data.data[0].id;
    }

    async getAccessToken(streamer) {
        console.log('talking to twitch...')
        let url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&code=${process.env.CODE}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`;
        console.log(url)
        let response = await fetch(encodeURI(url), {
            method: "POST",
        });
        let data = await response.json();
        console.log(data);

        if (data.access_token) {
            require('fs').writeFileSync('./.accesstoken.txt', data.access_token);
            require('fs').writeFileSync('./.refreshtoken.txt', data.refresh_token);
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.getBroadcastID(streamer);
            console.log('got the token!');
        } else {
            console.log('sorry something went wrong acquiring the token!')
        }
    }

    async handleUnauthorized() {
        let url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&refresh_token=${this.refreshToken}&grant_type=refresh_token`;
        let response = await fetch(encodeURI(url));
        let data = await response.json();
        if (data.accessToken) {
            require('fs').writeFileSync('./.accesstoken.txt', data.access_token);
            require('fs').writeFileSync('./.refreshtoken.txt', data.refresh_token);
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            console.log('got the token!');
        } else {
            console.log('sorry something went wrong refreshing the token!')
        }
    }

    async banUser(username) {
        console.log(username)
        console.log(this.broadcastID);
        console.log(this.modID);
        const user_id = await this.getTwitchID(username);

        const url = `${ModClient.endpoint}/moderation/bans?broadcaster_id=${this.broadcastID}&moderator_id=${this.modID}`;
        const body = {
            data: {
                user_id: user_id,
            }
        }

        const response = await fetch(encodeURI(url), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${this.accessToken}`
            },
            body: JSON.stringify(body)
        });
        console.log(await response.json());
        return response;
    }
}

module.exports = ModClient;
