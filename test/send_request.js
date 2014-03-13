var crypto = require('crypto');
var https = require('https');
var console = require('console');
var qs = require('querystring');

function signature (method, path, query, key) {
  query = qs.stringify(query);
  var hmac = crypto.createHmac('sha1', key);
  require('console').log([method, path, query].join('\n'));
  hmac.update([method, path, query].join('\n'));
  return hmac.digest('base64');
}

var options = {
  hostname: '127.0.0.1',
  port: 8663,
  rejectUnauthorized: false
};

module.exports = function (method, path, query, key) {
  query.timestamp = new Date().getTime();
  query.version = 1;
  delete query.signature;
  query.signature = signature(method, path, query, key);

  var opt = new Object(options);
  opt.method = method, opt.path = path + '?' + qs.stringify(query);

  var req = https.request(opt, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);

    res.on('data', function(d) {
      console.log(d.toString('utf8'));
    });
  });
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
}
