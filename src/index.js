if (process.argv.length > 2) {
	const readline = require('readline');
	switch (process.argv[2]) {
		case '--pass':
			var rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			})
			rl.question('Enter password: ', (answer) => {
				rl.close();
				const crypto = require('crypto');
				let hash = crypto.createHash('sha256').update(answer).digest('hex');
				const fs = require('fs');
				const config = JSON.parse(fs.readFileSync("config.json", 'utf8'));
				config.https.password = hash;
				fs.writeFileSync('config.json', JSON.stringify(config, null, '\t'));
			})
			break;
		case '--gen-cert':
			var rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});
			new Promise((resolve) => {
				if (process.argv.length == 5)
					resolve(process.argv[3] + '.pem');
				else
					rl.question('Filename for key: [key] ', (answer) => {
						resolve((answer || 'key') + '.pem');
					});
			}).then((keyName) => {
				return new Promise((resolve) => {
					if (process.argv.length == 5)
						resolve({ keyName: keyName, certName: process.argv[4] + '.pem' });
					else
						rl.question('Filename for certificate: [cert] ', (answer) => {
							resolve({ keyName: keyName, certName: (answer || 'cert') + '.pem' });
						});
				})
			}).then((pair) => {
				rl.close()
				const csr = '__' + Math.abs(Math.floor(Math.random() * Math.floor(0xFFFFFFFFFFFFFFFF))).toString() + '__.pem';
				const child_process = require('child_process');
				child_process.execSync('openssl genrsa -out ' + pair.keyName)
				child_process.spawnSync('openssl', ['req', '-new', '-key', pair.keyName, '-out', csr], { stdio: 'inherit' });
				child_process.execSync(`openssl x509 -req -days 9999 -in ${csr} -signkey ${pair.keyName} -out ${pair.certName}`);
				child_process.execSync('rm ' + csr);
				return new Promise((resolve) => {
					rl = readline.createInterface({
						input: process.stdin,
						output: process.stdout
					});
					rl.question('Would you like to update the server config to the new key? [y/N] ',
						(answer) => { resolve([answer == 'y' || answer == 'Y', pair]) })
				});
			}).then((updateConfig) => {
				rl.close();
				if (!updateConfig[0]) return;
				console.log('writing to config.json');
				const fs = require('fs');
				const config = JSON.parse(fs.readFileSync("config.json", 'utf8'));
				config.https.key = updateConfig[1].keyName;
				config.https.cert = updateConfig[1].certName;
				fs.writeFileSync('config.json', JSON.stringify(config, null, '\t'));
			}).catch((reason) => { rl.close(); });
			break;
		case '--help':
		default:
			console.log(`	npm start             Start server.
	--help		Display this help message.
	--pass		Set the server password for HTTPS (saves to config.json)
	--gen-cert	Generate HTTPS key/cert pair
				optional usage: <cmd> --gen-cert <key_name> <cert_name>
					key_name   Define the key name
					cert_name  Define the certificate name
`);
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
const auth = require('./auth');
app.get('/login', auth.login);
app.post('/auth', auth.auth);
app.use(auth.authCheck);
app.use('/',  require('./route').create(config.command));

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
