var crypto = require('crypto');
var querystring = require('querystring');

var TLT = 5; //Timestamp Live Time

function textToSignature (content, key) {
  var signatory = crypto.createHmac('sha1', key);
  signatory.update(content);
  return new Buffer(signatory.digest()).toString('base64');
}

function generateSignature (method, path, query, key) {
  query = querystring.stringify(query.SortedObject());
  return textToSignature([method, path, query].join('\n'), key);
}

function timestampExpired (timestamp) {
  timestamp = parseInt(timestamp);
  var now = new Date.getTime();
  if (timestamp > now) return true;
  if (now - timestamp > TLT * 1000) return true;
  return false;
}

function verifySignature (method, path, query) {
  if (timestampExpired(query.timestamp)) return false;
  var signature = query.signature;
  delete query.signature;
  return signature == generateSignature(method, path, query);
}