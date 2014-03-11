var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('./secrets/key.pem', {encoding: 'utf8'}),
  cert: fs.readFileSync('./secrets/cert.pem', {encoding: 'utf8'})
};

/*
module.exports = function (config) {

}
*/

console.log(options.key);
console.log(options.cert);

var server = https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
});

server.listen(8888);
