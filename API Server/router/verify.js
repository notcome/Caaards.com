var config, redis;

function timestampExpired (timestamp) {
  timestamp = parseInt(timestamp);
  var now = new Date().getTime();
  if (timestamp > now) return true;
  if (now - timestamp > config.auth.auth_tlt * 1000) return true;
  return false;
}

function getPassword (username, cb) {
  redis.get([config.prefix, 'auth', username].join('.'), cb);
}

function checkParameters (req, cb) {
  if (timestampExpired(req.query.timestamp))
    cb(null, config.errors.auth.timestamp_expired);
  else getPassword(req.query.username, function (err, key) {
    if (err) cb(err);
    else if (key == null)
      cb(null, config.errors.auth.user_not_existed);
    else verifySignature(req, key, cb);
  });
}

function verifySignature (req, key, cb) {
  var client_side_result = req.query.signature, 
      server_side_result;
  delete req.query.signature;

  if (req.query.version != '1') {
    cb(null, config.errors.auth.auth_version_not_supported);
    return;
  } else {
    server_side_result = require('./signature')(req.method, req.pathname, req.query, key);
    if (client_side_result == server_side_result) cb();
    else cb(null, config.errors.auth.auth_failed);
  }
}

module.exports = function (_config, _redis) {
  config = _config, redis = _redis;
  return checkParameters;
}
