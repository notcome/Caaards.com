module.exports = function (req, res, config, redis) {
  var username = req.query.username, word = req.query.word;

  function p (str) { return [config.prefix, username, str].join('.'); };
  function s (str) { return [str, word].join('.'); };
  redis.deleteWord([p('wordset'), p('quiz'), p(s('word')), p(s('star'))], [word], function (err, reply) {
    if (err)
      return res.returnJSON(500, config.errors[500]);
    if (reply == null)
      return res.returnJSON(200, config.errors.word_not_existed);
    res.returnJSON(200, 'succeed');
  });
};
