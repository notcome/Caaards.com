var config = require('./config');
var redis = require('./redis')(config.redis);

var router = require('./router')(config, redis);
var https = require('./https')(config.https, router.onRequest);

router.on('/auth', 'GET', function (req, res) {
  res.returnJSON(200, 'succeed');
});

router.on('/add-word', 'POST', function (req, res, post_data) {
  var username = req.query.username, word = req.query.word;

  function p (str) { return [config.prefix, username, str].join('.'); };
  function s (str) { return [str, word].join('.'); };
  
  redis.send_command('multi', []);
  redis.addWord([p('wordset'), p(s('word')), p(s('star'))], [word, post_data])
  redis.updateQuiz([p('quiz'), p(s('star')), p('intervals')], [new Date().getTime(), word, Math.random()])
  
  redis.send_command('exec', [], function (err, replies) {
    if (err) 
      return res.returnJSON(500, config.errors[500]);
    if (replies[0] == null)
      return res.returnJSON(200, config.errors.word_existed);
    res.returnJSON(200, 'succeed');
  });
});

router.on('/delete-word', 'GET', function (req, res) {
  var username = req.query.username, word = req.query.word;

  function p (str) { return [config.prefix, username, str].join('.'); };
  function s (str) { return [str, word].join('.'); };
  redis.deleteWord([p('wordset'), p('quiz'), p(s('word')), p(s('star'))], [word], function (err, reply) {
    if (err)
      return res.returnJSON(500, config.errors[500]);
    if (reply == null)
      return res.returnJSON(200, config.errors.word_not_existed);
    res.returnJSON(200, 'succeed');
  })
});
