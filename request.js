let API_URL = 'https://api.twitch.tv/helix/users?login='
const fetch = require('node-fetch')
fetch(API_URL, {
    method: 'GET',
    body: JSON.stringify(),
    headers: {
        'content-type': "application/json",
        'Client-Id': '',
        'Authorization': ''
    }
}).then(response => {

    response.json().then(result => {
        console.log(result.data[0].id);
    })

})

