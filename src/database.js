require('dotenv').config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGOD_URL;
/*
function Comparator(a, b) {
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
}*/
let people = [];

module.exports.fetchData = async function() {
    let promise = new Promise((res) => {
        MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            let dbo = db.db("mydb");
            dbo.collection("scoreboard").find({}).toArray(function(err, result) {
                if (err) throw err;
                if (!result) return;
                for (let i = 0; i < result.length; i++) {
                    people.push({ name: result[i].name, score: result[i].score });
                }
                db.close().then(() => {
                    res(people);
                });
            });
        });
    })
    people = [];
    let result = await promise;
    return result;
}

module.exports.addtodb = async function(data) {
    let promise = new Promise((res) => {
        addtobackupdb(data).then(() => {
            deleteCollection().then(() => {
                MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("mydb");
                    dbo.collection("scoreboard").insertMany(data, function(err, result) {
                        if (err) throw err;
                        console.log(result);
                        db.close().then(() => {
                            res(0);
                        })
                    });
                });
            })
        })
    });
    let result = await promise;
    return result;
}


async function deleteCollection() {
    let promise = new Promise((res) => {
        MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            let dbo = db.db("mydb");
            dbo.collection("scoreboard").drop(function(err, delOK) {
                if (err) throw err;
                if (delOK) console.log("collection deleted");
                db.close().then(() => {
                    res(0);
                })
            })
        });
    });
    let result = await promise;
    return result;
}

async function addtobackupdb(data) {
    try {
        let promise = new Promise((res) => {
            MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, db) {
                let dbo = db.db("backup");
                dbo.collection("scoreboard2").insertMany(data, function(err, result) {
                    console.log(result);
                    db.close().then(() => {
                        res(0);
                    })
                });
            });
        });
        let result = await promise;
        return result;
    } catch (ex) {
        console.log("there was a problem writing to the backup database");
    }
}
