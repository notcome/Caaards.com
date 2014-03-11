var fs = require('fs');
var console = require('console');

module.exports = function (redis) {
  var scripts = fs.readdirSync('./lua');
  scripts.forEach(function (script_name) {
    if (script_name[0] == '.') return;
    var script_code = fs.readFileSync('./lua/' + script_name, {encoding: 'utf8'});
    loadScript(redis, script_name.substr(0, script_name.length - 4), script_code);
  });
}

//Although the function is async but it is safe.
//The function is invoked at the server's initialization, so we will have enough time.
//Plus we will throw any error to terminate the program.
function loadScript(redis, script_name, script_code) {
  redis.script('load', script_code, function (err, sha) {
    if (err) throw err;
    redis[script_name] = function (keys, args, cb) {
      redis.evalsha([sha, keys.length].concat(keys).concat(args),
        cb ? cb : function (err) { if (err) throw err; });
    }
    console.log('Lua script', script_name, 'loaded.');
  });
}
