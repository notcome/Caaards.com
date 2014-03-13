var config = require('./config');
var redis = require('./redis')(config.redis);

var router = require('./router')(config, redis);
var https = require('./https')(config.https, router.onRequest);
router.on('/auth', function (req, res) {
  res.returnJSON(200, 'succeed');
})