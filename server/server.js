var oeApp = require('oe-cloud');
var path = require('path');
var loopback = oeApp.loopback;
var app = loopback();
var options = oeApp.options;

// apphome is used by oe-cloud to know application server directory
// as of now it used for picking providers.json
app.locals.apphome = __dirname;

options.bootDirs.push(path.join(__dirname, 'boot'));
options.clientAppRootDir = __dirname;
var sslConfig = require('./ssl-config');
options["sslConfig"] = {
	key: sslConfig.privateKey, 
	cert: sslConfig.certificate, 
};

oeApp.boot(app, options, function () {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED="0";
  var context = loopback.getCurrentContext();
  if (context) {
    context.set('callContext', {});
  }
  app.start();
});

app.get('/', function (req, res) {
  console.log("inside get method");
  res.sendFile('index.html', { root: path.join(__dirname, '../client/') });
});