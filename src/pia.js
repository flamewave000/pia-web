const { execSync } = require('child_process');


class PIA {
	constructor(command) {
		this.command = command;
	}

	execute(cmd) {
		return execSync(`${this.command} ${cmd}`).toString();
	}

	get connected() {
		return this.execute(`get vpnip`).trim().toLowerCase() != "unknown";
	}

	connect() {
		return this.execute(`connect`);
	}
	disconnect() {
		return this.execute(`disconnect`);
	}

	get region() {
		return this.execute("get region").replace('\n', '');
	}
	set region(value) {
		this.execute(`set region ${value}`);
	}
	get regions() {
		return this.execute("get regions").split('\n').filter(String);
	}
}
module.exports.PIA = PIA;