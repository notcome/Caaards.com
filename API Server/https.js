var https = require('https');
var fs = require('fs');

module.exports = function (config, on_request) {
  var options = {
    key: fs.readFileSync(config.key, {encoding: 'utf8'}),
    cert: fs.readFileSync(config.cert, {encoding: 'utf8'}),
  };
  var server = https.createServer(options, on_request);
  server.listen(config.port, config.host);
  return server;
}
