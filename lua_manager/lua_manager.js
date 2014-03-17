var fs = require('fs');
var console = require('console');

function removePercent (label) {
  return label.substr(1, label.length - 2);
}

function getMetadataPos (lines) {
  if (lines[0] != '--[[')
    throw {error: 'METADATA_HEAD_NOT_FOUND'};
  
  var endline = 1;
  while (lines[endline] != ']]--') {
    endline ++;
    if (endline == lines.length)
      throw {error: 'METADATA_END_NOT_FOUND'};
  }
  return endline;
}

function parseMetadata (lines) {
  var metadata = {};
  lines.forEach(function (info) {
    var key = '', i = 0;
    while (info[i] != ':') key += info[i ++];
    //skip ': '
    i ++; i ++;
    metadata[key] = info.substr(i);
  });
  return metadata;
}

function processMetadata(lines) {
  var metadata = parseMetadata(lines);
  var result = {};
  result.func_name = metadata.name;
  result.vars = {};

  function checkPercentAndSet (array, varset, type) {
    var i = 1;
    array.forEach(function (label) {
      if (label[0] == '%' && label[label.length - 1] == '%')
        varset[label] = type + '[' + i ++ + ']';
      else
        throw {error: 'METADATA_BAD_FORMAT'};
    });
  }

  checkPercentAndSet(metadata.keys.split(', '), result.vars, 'KEYS');
  checkPercentAndSet(metadata.argv.split(', '), result.vars, 'ARGV');
  return result;
}

function processScript (lines) {
  var meta_endline = getMetadataPos(lines);
  var source = lines.slice(meta_endline + 1);
  //1st line must be '--[['
  var result = processMetadata(lines.slice(1, meta_endline));
  result.source = source;
  return result;
}

/*
 * Multi Object in node-redis uses a predefined command list to generate
 * accpetable commands. We could not add user-defined command to it. Therefore
 * we need to provide SHA of each script so user could invoke EVALSHA directly.
 */

var RedisScripts = module.exports = function(client) {
}

RedisScripts.prototype = {
  load: function (directory, callback) {
    var file_list = fs.readdirSync(directory);
    var scripts = {};
    file_list.forEach(function (filename) {
      if (filename[0] == '.') return;
      if (filename.substr(-4) != '.lua') return;

      var info = processScript(fs.readFileSync(directory + '/' + filename, 'utf8').split('\n'));
      info.command = filename.substr(0, filename.length - 4);
      scripts['%' + info.func_name + '%'] = info;
    });
    //console.log(scripts);
    console.log(require('./generate')(scripts));
  }
};

RedisScripts.prototype.load('./');


///%[A-z|_]+%/g

