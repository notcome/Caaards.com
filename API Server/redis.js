var redis = require('redis');

module.exports = function (config) {
  var client = redis.createClient(config.port, config.host);
  if (config.auth)
    client.auth(config.auth, function (err) {
      if (err) throw err;
    });
  return client;
}