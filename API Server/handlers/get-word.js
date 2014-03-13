module.exports = function (req, res, config, redis) {
  var username = req.query.username, word = req.query.word;

  function p (str) { return [config.prefix, username, str].join('.'); };
  function s (str) { return [str, word].join('.'); };
  
  redis.getWord([p('wordset'), p(s('word'))], [word], function (err, reply) {
    if (err)
      return res.returnJSON(500, config.errors[500]);
    if (reply == null)
      return res.returnJSON(200, config.errors.word_not_existed);
    res.returnJSON(200, reply);
  });
};
