const fs = require('fs');
// const http = require('http');
const https = require('https');
const express = require('express');
const logger = require('morgan');
const config = require('./config.js');
const piholeMw = require('./pihole.js');

// Certs
const privateKey = fs.readFileSync(config.key);
const passPhrase = fs.readFileSync(config.passphrase);
const certificate = fs.readFileSync(config.cert);

// Configure express
const app = express();

// Setup logging
app.use(piholeMw.allowCORS);
app.use(logger('dev'));

app.use(piholeMw.parseBody);

// Serve static files for documentation
app.use(express.static(__dirname + '/public'));

// Paths
app.get('/lists', piholeMw.getLists);
app.post('/lists', piholeMw.addToList({secret: config.secret}));

// Configure server
const server = https.createServer({key: privateKey, cert: certificate, passphrase: passPhrase}, app);
server.listen(config.port);
console.log(`Server listening at https://${config.hostname}:${config.port}\n`);
