var redis, config, handler = {}, verifySignautre;

module.exports = function (_config, _redis) {
  config = _config, redis = _redis;
  verifySignautre = require('./signature')(config.auth.auth_tlt);
  return exports;
}

exports = {
  onRequest: function (req, res) {
    parseRequest(req);

    getPassword(req.query.username, function (err, pass) {
      if (err) throw err;
      else if (pass == null)
        writeResponse(res, 200, {error: config.errors.user_not_existed});
      else if (!verifySignautre(req, pass))
        writeResponse(res, 200, {error: config.errors.auth_failed});
      else route(req, res);
    });
  },

  on: function (path, cb) {
    handler[path] = cb;
  }
}

function parseRequest (req) {
  var parsed = require('url').parse(req.url);
  req.query = require('querystring').parse(parsed.query);
  req.pathname = parsed.pathname;
}

function getPassword (username, cb) {
  redis.get([config.prefix, 'auth', username].join('.'), cb);
}

function writeResponse (res, code, obj) {
  var content = JSON.stringify(obj);

  res.writeHead(code, { 'Content-Type': 'application/json'});
  res.write(content);
  res.end();
}

function route (req, res) {
  if (handler[req.pathname])
    handler[req.pathname](req, res, writeResponse);
  else
    writeResponse(res, 404, {error: config.errors[404]});
}
