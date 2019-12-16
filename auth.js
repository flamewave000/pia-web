const { Config } = require('./config');
const crypto = require('crypto');

function getSalt() {
	const fs = require('fs');
	return fs.readFileSync('config.json');
}

function generateJwtSignature(body) {
	return crypto.createHash('sha256').update(body).update(getSalt()).digest('base64');
}

module.exports.authCheck = function (req, res, next) {
	const config = new Config();
	if (!req.query.auth)
		return res.redirect('/login');
	let jwt = req.query.auth.split('.');
	let signature = generateJwtSignature(`${jwt[0]}.${jwt[1]}`);
	if (signature !== jwt[2])
		return res.redirect('/login');
	next()
}
module.exports.login = function (req, res) {
	const config = new Config();
	if (config.https.password)
		res.render('login');
	else
		res.redirect('/');
}
module.exports.auth = function (req, res) {
	const config = new Config();
	if (!config.https.password)
		return res.sendStatus(400);
	let pwd = crypto.createHash('sha256').update(req.body.pwd).digest('hex');
	if (pwd === config.https.password) {
		let jwtHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64');
		let jwtPayload = Buffer.from(JSON.stringify({ iss: new Date().toUTCString() })).toString('base64');
		let jwtSignature = generateJwtSignature(`${jwtHeader}.${jwtPayload}`);
		console.log(`${new Date().toUTCString()} > authentication succeeded: token {${jwtHeader}.${jwtPayload}.${jwtSignature}}`);
		return res.json({ jwt: `${jwtHeader}.${jwtPayload}.${jwtSignature}` });// hash the config file as our server secret
	}
	console.log('${new Date().toUTCString()} > authentication failed');
	res.sendStatus(403);
}