//init express
const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require("pusher");
const fs = require('fs');
const app = express();
const port = process.env.PORT;

let sessionsData = [
    {
        id: '123456',
        fileVersion: 0
    }
]

let currentSession = "123"

const pusher = new Pusher({
    appId: "1506685",
    key: "13fcdedc78efac0503d7",
    secret: "3e94094902503561ff9d",
    cluster: "eu",
    useTLS: true
});

//static public
app.use(express.static('public'));
app.use(bodyParser.json());

app.post("/api/orders/new", (req, res) => {
    console.log("request body",req.body);
    let order = newOrder(req.body, currentSession);
    pusher.trigger("orders", "new-order", order);
    res.status(200).send(order);
})

function newOrder(order, sessionId) {
    currentSessionData = sessionsData.find(session => session.id === sessionId)
    if(!currentSessionData || currentSessionData.fileVersion == 0) {
        console.log(sessionsData.find(session => session.id === sessionId))
        fs.mkdir(`sessions/${sessionId}/`, {recursive: true}, () => {
            fs.writeFile(`sessions/${sessionId}/data.json`, JSON.stringify({fileVersion: 1, options: [], ingredients: [], orders: []}), ()=>{
                sessionsData.push({id: sessionId, fileVersion: 1})
            })
        })
    }
    fs.readFile(`sessions/${sessionId}/data.json`, (err, data) => {
        if (err) {
            console.log(err);
            return err;
        }
        data = JSON.parse(data);
        data.orders.push(order);
        fs.writeFile(`sessions/${sessionId}/data.json`, JSON.stringify(data), (err) => {
            if (err) {
                console.log(err);
                return err;
            }
            return order;
        });
    });
}

function getOrders(sessionId) {
    if(sessionsData.find(session => session.id === sessionId)?.fileVersion == 0) {
        console.log(sessionsData.find(session => session.id === sessionId))
        fs.mkdir(`sessions/${sessionId}/`, {recursive: true}, () => {
            fs.writeFile(`sessions/${sessionId}/data.json`, JSON.stringify({fileVersion: 1, options: [], ingredients: [], orders: []}), ()=>{
                sessionsData.push({id: sessionId, fileVersion: 1})
            })
        })
        return [];
    }
    fs.readFile(`sessions/${sessionId}/data.json`, (err, data) => {
        if(err) {
            console.error(err);
            return err;
        }
        return JSON.parse(data).orders;
    })
}

//start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});