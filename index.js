const { PIA } = require('./pia');
const bodyParser = require('body-parser');
const fs = require('fs');

const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const config = JSON.parse(fs.readFileSync("config.json", 'utf8'));
const pia = new PIA(config.command);

app.get('/', (req, res) => {
	console.log('base page request');
	res.render('index', {
		'connected': pia.connected,
		'region': pia.region,
		'regions': pia.regions
	});
})
app.post('/reg', (req, res) => {
	console.log('region set request');
	let wasConnected = pia.connected;
	pia.region = req.body.region;
	if(wasConnected) {
		var counter = 0;
		while(counter < 10000 && !pia.connected) {
			sleep(100);
			counter += 100;
		}
	}
	res.redirect('/');
});

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }
app.post('/con', (req, res) => {
	console.log("connection request");
	pia.connect();
	var counter = 0;
	while (!pia.connected && counter < 10000) {
		sleep(100);
		counter += 100;
	}
	res.redirect('/');
});
app.post('/dis', (req, res) => {
	console.log("disconnection request");
	pia.disconnect();
	var counter = 0;
	while (pia.connected && counter < 10000) {
		sleep(100);
		counter += 100;
	}
	res.redirect('/');
});

const server = app.listen(config.port, () => {
	console.log(`Express running → PORT ${server.address().port}`);
});