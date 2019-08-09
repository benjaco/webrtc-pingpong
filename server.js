const express = require('express');
const ws = require('ws');
const http = require("http");

const app = express();
const server = http.createServer(app);


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client.html');
});


const wss = new ws.Server({server: server, path: "/ws"});

wss.on('connection', function (ws) {

    ws.hasPeer = (()=>{
        let other = Array.from(wss.clients).find(i =>
            i !== ws &&
            i.readyState === ws.OPEN &&
            i.hasPeer === false );

        if (other) {
            other.hasPeer = ws;
            return other;
        }
        return false;
    })();

    if (ws.hasPeer) {
        ws.send(JSON.stringify({type: ":create_offer"}))
    }

    ws.on('message', function (message) {
        if (ws.hasPeer) {
            ws.hasPeer.send(message);
        }
    });


    ws.on('close', function () {
        if (ws.hasPeer) {
            ws.hasPeer.send(JSON.stringify({type: ":peer_disconnected"}));
            ws.hasPeer.hasPeer = false;
        }
    });
});

server.listen(3000, "0.0.0.0", function () {
    console.log('Example app listening on port 3000!')
});