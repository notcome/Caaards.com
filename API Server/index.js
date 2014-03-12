var config = require('./config');
var redis = require('./redis')(config.redis);
require('./utils');

var router = require('./router')(config.router, redis);
var https = require('./https')(config.https, router.onRequest);