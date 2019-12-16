const readline = require('readline');
module.exports.pass = function () {
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
}
module.exports.gen_cert = function () {
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
}
module.exports.help = function () {
	console.log(`    pia-web.[sh|bat] (command)
    (nothing)   Starts the server.
    --help      Display this help message.
    --pass      Set the server password for HTTPS (saves to config.json)
    --gen-cert  Generate HTTPS key/cert pair
                optional usage: <cmd> --gen-cert <key_name> <cert_name>
                    key_name   Define the key name
                    cert_name  Define the certificate name
`);
}