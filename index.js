const rpio = require('rpio');
const express = require('express');
const crypto = require('crypto-js');
const bodyParser = require('body-parser');
const child = require('child_process');
const moment = require('moment');
const winston = require('winston');


const pin = 40;
const lights = 12;
// const openPin = 37;
// const closePin = 38;
const key = "passwordHere";
const ttl = 500;
const push = 500;
const lightsTimeout = 10000;
const doorLightsTimeout = 5000;
let table = {};
const app = express();

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'door.log' })
  ]
});

const sink = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'data.log' })
  ]
});

rpio.open(pin, rpio.OUTPUT, rpio.LOW);
rpio.open(lights, rpio.OUTPUT, rpio.LOW);
// rpio.open(openPin, rpio.INPUT, rpio.PULL_DOWN);
// rpio.open(closePin, rpio.INPUT, rpio.PULL_DOWN);

app.use(bodyParser.json());
app.use(express.static('Web'));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.get('/state', (req, res) => {
//   const open = rpio.read(openPin);
//   const closed = rpio.read(closePin);
//   let s = '';
//   if (!(open || closed)) s = 'Moving';
//   else if (open && closed) s = 'Error!!!!';
//   else if (open) s = 'Open';
//   else if (closed) s = 'Closed';
//   res.send({ state: s });
// });

app.post('/lights', (req, res) => {
  const k = req.body.key;
  if (table.hasOwnProperty(k)) {
    if (!rpio.read(lights)) {
      rpio.write(lights, rpio.HIGH);
      setTimeout(() => {
        rpio.write(lights, rpio.LOW);
      }, lightsTimeout);
    } else {
      rpio.write(lights, rpio.LOW);
    } 
    res.status(200).send();
  } else {
    res.sendStatus(420);
  }
});

app.get('/nonce', (req, res) => {
  const n = Math.random().toString();
  const h = crypto.SHA3(key + n).toString();
  const now = moment();
  logger.info(h + ' : ' + now.local().format('YYYY-M-D,H:m:s'));
  table[h] = now;
  res.send({ nonce: n });
});

app.post('/door', (req, res) => {
  logger.info(req.body);
  const k = req.body.key;
  const t = req.body.timer;
  if (table.hasOwnProperty(k)) {
    const now = moment();
    const life = now.diff(table[k]);
    logger.info(k + ' : ' + life + ' : ' + t);
    if (life < ttl) {
      setTimeout(() => {
        if (!rpio.read(pin)) {
          // push the button
          rpio.write(pin, rpio.HIGH);
          setTimeout(() => {
            rpio.write(pin, rpio.LOW);
          },push);
          // turn on lights
          rpio.write(lights, rpio.HIGH);
          setTimeout(() => {
            rpio.write(lights, rpio.LOW);
          }, doorLightsTimeout);
        }
      }, t  * 1000);
      res.status(200).send();
    } else {
      res.status(421).send();
    }
  } else {
    res.status(420).send();
  }
});

app.post('/data', (req, res) => {
  const b = req.body;
  sink.info(JSON.stringify(b));
  res.sendStatus(200).send();
});

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/Web/index.html');
});

app.listen(8888);
