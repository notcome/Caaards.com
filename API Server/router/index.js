var url = require('url');
var qs = require('querystring');

var redis, config, verifySignautre;
var handler = {}

var log = require('console').log;

module.exports = function (_config, _redis) {
  config = _config, redis = _redis;
  verifySignautre = require('./verify')(config, redis);
  return exports;
}

exports = {
  onRequest: function (req, res) {
    parseRequest(req);
    res.returnJSON = returnJSON;
    verifySignautre(req, function (server_err, auth_err) {
      if (server_err) throw server_err;
      
      if (auth_err) 
        res.returnJSON(200, {error: auth_err});
      else 
        route(req, res);
    });
  },

  on: function (path, method, cb) {
    handler[path] = {func: cb, type: method};
  }
}

function parseRequest (req) {
  var parsed = url.parse(req.url);
  req.query = qs.parse(parsed.query);
  req.pathname = parsed.pathname;
}

function returnJSON (code, obj) {
  var content = JSON.stringify(obj);

  this.writeHead(code, { 'Content-Type': 'application/json'});
  this.write(content);
  this.end();
}

function route (req, res) {
  var next = handler[req.pathname];
  if (next == null)
    return res.returnJSON(404, {error: config.errors[404]});
  else if (next.type != req.method)
    return res.returnJSON(200, {error: config.errors.wrong_api_format});

  next = next.func;
  //In case of being recognized as cold data
  redis.zadd([config.prefix, 'active-record'].join('.'), 
      new Date().getTime(), req.query.username);

  if (req.method == 'POST') {
    var postData = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
      postData += chunk;
    });
    req.on('end', function () {
      next(req, res, postData);
    });
  }
  else next(req, res);
}
