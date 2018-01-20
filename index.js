const rpio = require('rpio');
const express = require('express');
const crypto = require('crypto-js');
const bodyParser = require('body-parser');
const child = require('child_process');
const pin = 40;
const key = "beka";
const ttl = 1000;
const push = 800;
var table = {};
var app = express();

rpio.open(pin, rpio.OUTPUT, rpio.LOW);

app.use(bodyParser.json());
app.use(express.static('Web'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function(req, res) { 
    res.sendFile(__dirname + '/Web/index.html');
});

app.get('/nonce', function(req, res) {
	var n = Math.random().toString();
	if (Object.keys(table).length > 3) table = {};
	var h = crypto.SHA3(key + n).toString();
	table[h] = new Date().getTime() + ttl;
	res.send({ nonce: n });
});

app.post('/door', function(req, res) {
	console.log(req.body);
	var k = req.body.key;
	console.log(k);
	console.log(table);
	if (table.hasOwnProperty(k)) {
		if (table[k] > new Date().getTime()) {
			delete table[k];
			if (!rpio.read(pin)) {
				rpio.write(pin, rpio.HIGH);
				setTimeout(function() {
					rpio.write(pin, rpio.LOW);
				},push);
			}
			res.status(200).send();
		} else {
			delete table[k];
			res.status(420).send();
		}
	} else res.status(420).send();	
});
	
try {
    app.listen(8888, function() {
        console.log('doing the thing');
    });
} catch (e) {
    console.log('failed to start server');
    process.exit();
}
