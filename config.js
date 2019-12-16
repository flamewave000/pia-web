
const fs = require('fs');

class HttpConfig {
	constructor(config) {
		this.config = config
	}
	get port() { return this.config.port; }
}
class HttpsConfig {
	constructor(config) {
		this.config = config
	}
	get port() { return this.config.port; }
	get enabled() { return this.config.enabled; }
	get key() { return this.config.key; }
	get cert() { return this.config.cert; }
	get use_companion() { return this.config.use_companion; }
	get password() { return this.config.password; }
}

class Config {
	constructor() {
		this.config = JSON.parse(fs.readFileSync("config.json", 'utf8'));
	}

	get command() { return this.config.command; }
	get http() { return new HttpConfig(this.config.http); }
	get https() { return new HttpsConfig(this.config.https); }
	get host() { return this.config.host; }
	get exclusive() { return this.config.exclusive; }
	get httpConfig() {
		return {
			host: this.host,
			port: this.config.http.port,
			exclusive: this.exclusive
		}
	}
	get httpsConfig() {
		return {
			host: this.host,
			port: this.config.https.port,
			exclusive: this.exclusive
		}
	}
	get httpsCredentials() {
		return {
			key: fs.readFileSync(this.config.https.key, 'utf8'),
			cert: fs.readFileSync(this.config.https.cert, 'utf8')
		}
	}
}

module.exports.Config = Config;