const fetch = require('node-fetch');
module.exports.translate = async function(message){
    if(message.length > 1){
        try {
            let url = "https://translate.googleapis.com/translate_a/single?client=gtx&ie=UTF-8&oe=UTF-8&dt=bd&dt=ex&dt=ld&dt=md&dt=rw&dt=rm&dt=ss&dt=t&dt=at&dt=qc&sl=auto&tl=en&hl=en&q="
            let options = {
                method : `GET`,
                headers:{
                    'Content-Type' : 'application/json'
                }
            }
            url += message;
            url = encodeURI(url);
            const result = await fetch(url, options);
            const raw = await result.json();
            return await raw;
        }catch {
            return "something went wrong!! at t:20" ;
        }
    }
    else return `nothing to translate :(`
}


module.exports.translateTo = async function(args){
    let to = args.shift();
    let message = args.join(" ");
    try {
        let url = "https://translate.googleapis.com/translate_a/single?client=gtx&ie=UTF-8&oe=UTF-8&dt=bd&dt=ex&dt=ld&dt=md&dt=rw&dt=rm&dt=ss&dt=t&dt=at&dt=qc&sl=auto&tl="+to+"&hl=en&q="
        let options = {
            method : `GET`,
            headers:{
                'Content-Type' : 'application/json'
            }
        }
        url += message;
        url = encodeURI(url);
        const result = await fetch(url, options);
        const raw = await result.json();
        return await raw;
    }catch {
        return "something went wrong!! at t:67" ;
    }

}
