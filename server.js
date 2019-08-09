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

    ws.peer = (()=>{
        let other = Array.from(wss.clients).find(i =>
            i !== ws &&
            i.readyState === ws.OPEN &&
            i.peer === false );

        if (other) {
            other.peer = ws;
            return other;
        }
        return false;
    })();

    if (ws.peer) {
        ws.send(JSON.stringify({type: ":create_offer"}))
    }

    ws.on('message', function (message) {
        if (ws.peer) {
            ws.peer.send(message);
        }
    });


    ws.on('close', function () {
        if (ws.peer) {
            ws.peer.send(JSON.stringify({type: ":peer_disconnected"}));
            ws.peer.peer = false;
        }
    });
});

server.listen(3000, "0.0.0.0", function () {
    console.log('Example app listening on port 3000!')
});