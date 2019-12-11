
const fs = require('fs');

class Config {
	constructor() {
		this.config = JSON.parse(fs.readFileSync("config.json", 'utf8'));
	}

	get command() { return this.config.command; }
	get server() { return this.config.server; }
	get httpConfig() {
		return {
			host: this.config.server.host,
			port: this.config.server.http_port,
			exclusive: this.config.server.exclusive
		}
	}
	get httpsConfig() {
		return {
			host: this.config.server.host,
			port: this.config.server.https_port,
			exclusive: this.config.server.exclusive
		}
	}
	get httpsCredentials() {
		return {
			key: fs.readFileSync(this.config.server.https_key, 'utf8'),
			cert: fs.readFileSync(this.config.server.https_cert, 'utf8')
		}
	}
}

module.exports.Config = Config;