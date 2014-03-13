var crypto = require('crypto');
var qs = require('querystring');

module.exports = function (method, path, query, key) {
  query = qs.stringify(query);
  var hmac = crypto.createHmac('sha1', key);
  hmac.update([method, path, query].join('\n'));
  return hmac.digest('base64');
}
