//below is code that probably would've been used for handling the requests sent by the microcontroller, and return required tracking data
/*
const http = require('http');
const fs = require('fs');
const path = require('path');
const json_raw = fs.readFileSync(path.resolve(__dirname, "/data/all_on-orbit_bodies.json"));
let all_bodies = JSON.parse(json_raw);
let filtered_bodies = all_bodies.filter(function(x) { return x.OBJECT_TYPE === 'PAYLOAD'; });
let body_ids = filtered_bodies.map(x => x.OBJECT_ID);
let {satelliteSelected, satelliteSelectedPosition, userLocation} = require('./app.js')
var server = http.createServer((req, res) => {
    if (req.url == '/get'){
        res.writeHead(200, {'Content-Type': 'application/json'});
        var {lat, long, alt} = satelliteSelectedPosition;
        var {userLat, userLong} = userLocation;
        //make response body
        var jsonResponse = `{"satelliteSelected": "${satelliteSelected}", "satelliteLat": "${lat}", "satelliteLon": "${long}", "satelliteAlt": "${alt}", "userLat": "${userLat}", "userLong": "${userLong}"}`;
        res.write(jsonResponse);
        res.end();
    } else {
        res.end('Invalid Request!');
    }
    console.log(res);
}, (req) => { console.log(req.connection + 'sending request')});
module.exports = {server, filtered_bodies, body_ids}
server.listen(8080, () => {console.log("Server should be listening on 8080.")});
*/