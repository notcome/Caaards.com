var fs = require('fs');
var console = require('console');

var src = fs.readFileSync('./QUUPDATE.lua', 'utf8');
var arr = src.split('\n');


function load_Lua_script (filename, encoding) {
  if (encoding == null) encoding = 'utf8';
  var source = fs.readFileSync(filename, encoding);

  var lines = [];
  source.split('\n').forEach(function (line) {
    var i = line.length - 1;
    while (line[i] == ' ') i --;
    i ++;
    lines.push(line.substr(0, i));
  });
  return lines;
}
///%[A-z|_]+%/g

function getMetadataPos (lines) {
  if (lines[0] != '--[[')
    throw {error: 'METADATA_HEAD_NOT_FOUND'};
  
  var metadata_end = 1;
  while (lines[metadata_end] != ']]--') {
    metadata_end ++;
    if (metadata_end == lines.length)
      throw {error: 'METADATA_END_NOT_FOUND'};
  }

}

function get_metadata (lines) {
  if (lines[0] != '--[[')
    throw {error: 'METADATA_HEAD_NOT_FOUND'};
  
  var metadata_end = 1;
  while (lines[metadata_end] != ']]--') {
    metadata_end ++;
    if (metadata_end == lines.length)
      throw {error: 'METADATA_END_NOT_FOUND'};
  }

  var metadata = {};
  lines.slice(1, metadata_end).forEach(function (info) {
    var key = '', i = 0;
    while (info[i] != ':') key += info[i ++];
    //skip ': '
    i ++; i ++;
    metadata[key] = info.substr(i);
  });

  return metadata;
}

function process_metadata (raw) {
  var metadata = {};
  metadata.function_name = raw.name;
  metadata.variables = {};
  
  function check_percent_and_set (array, obj, type) {
    var i = 1;
    array.forEach(function (str) {
      if (str[0] != '%' || str[str.length - 1] != '%')
        throw {error: 'METADATA_BAD_FORMAT'};
      obj[str] = type + '[' + i ++ + ']';
    });
  }
  
  check_percent_and_set(raw.keys.split(', '), metadata.variables, 'KEYS');
  check_percent_and_set(raw.argv.split(', '), metadata.variables, 'ARGV');
  return metadata;
}

function processScript (lines) {

}

/*
 * Multi Object in node-redis uses a predefined command list to generate
 * accpetable commands. We could not add user-defined command to it. Therefore
 * we need to provide SHA of each script so user could invoke EVALSHA directly.
 */

RedisScripts.prototype = {
  load: function (directory, callback) {
    var file_list = fs.readdirSync(directory);
    var scripts = {};
    file_list.forEach(function (filename) {
      if (filename[0] == '.') return;
      if (filename.substr(-4) != '.lua') return;

//parseLuaScript
//return
//func_name: used by other script
//command: used by redis client
//variables: var list
//source: source other than metadata
      var info = processScript(fs.readFileSync(directory + '/' + filename, 'utf8').split('\n'));
      info.command = filename.substr(-4);
      scripts[info.func_name] = info;
    });
  }
};

var RedisScripts = module.exports = function(client) {
}
