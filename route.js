module.exports.create = function (command) {
	const express = require('express');
	const { PIA } = require('./pia');
	const router = express.Router();
	const pia = new PIA(command);

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	router.get('/', (req, res) => {
		console.log('base page request');
		res.render('index', {
			'connected': pia.connected,
			'region': pia.region,
			'regions': pia.regions
		});
	})
	router.post('/reg', (req, res) => {
		console.log('region set request');
		let wasConnected = pia.connected;
		pia.region = req.body.region;
		if (wasConnected) {
			var counter = 0;
			while (counter < 10000 && !pia.connected) {
				sleep(100);
				counter += 100;
			}
		}
		res.redirect('/');
	});
	router.post('/con', (req, res) => {
		console.log("connection request");
		pia.connect();
		var counter = 0;
		while (!pia.connected && counter < 10000) {
			sleep(100);
			counter += 100;
		}
		res.redirect('/');
	});
	router.post('/dis', (req, res) => {
		console.log("disconnection request");
		pia.disconnect();
		var counter = 0;
		while (pia.connected && counter < 10000) {
			sleep(100);
			counter += 100;
		}
		res.redirect('/');
	});
	return router;
}