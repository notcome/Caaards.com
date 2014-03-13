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

  on: function (path, cb) {
    handler[path] = cb;
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
  if (handler[req.pathname])
    handler[req.pathname](req, res);
  else
    res.returnJSON(404, {error: config.errors[404]});
}
