if (process.argv.length > 2) {
	const commands = require('./commands');
	switch (process.argv[2]) {
		case '--pass':
			commands.pass();
			break;
		case '--gen-cert':
			commands.gen_cert();
			break;
		case '--help':
		default:
			commands.help();
			break;
	}
	return;
}

const bodyParser = require('body-parser');
const { Config } = require('./config');
const config = new Config();

const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
if (config.https.enabled) {
	const auth = require('./auth');
	app.get('/login', auth.login);
	app.post('/auth', auth.auth);
	app.use(auth.authCheck);
}
app.use('/', require('./route').create(config.command));

function logServerStart(port, isHttps = false) {
	console.log(`Express running http${isHttps ? 's' : ''} server → PORT ${port}`);
}

if (config.https.enabled) {
	const http = require('http');
	const https = require('https');

	const https_server = https.createServer(config.httpsCredentials, app);
	const http_server = http.createServer(express().get('/', (req, res) => {
		res.redirect(`https://${https_server.address().address}:${https_server.address().port}`);
	}));

	if (config.https.use_companion) {
		https_server.listen(config.httpsConfig, () => {
			logServerStart(https_server.address().port, true);
		});
		http_server.listen(config.httpConfig, () => {
			logServerStart(http_server.address().port);
		});
	}
}
else {
	const server = app.listen(config.http.port, config.host, () => {
		logServerStart(server.address().port);
	})
}
