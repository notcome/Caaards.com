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

function replaceVars (script, scripts) {
  script.funcs = [];
  var source = script.source.join('\n');
  var regexp = /%[A-z|_]+%/g;
  var vars = source.match(regexp), template = source.split(regexp), replaced = [];

  vars.forEach(function (label) {
    if (script.vars[label])
      replaced.push(script.vars[label]);
    else if (scripts[label]) {
      replaced.push(removePercent(label));
      script.funcs.push(label);
    }
    else throw {error: 'UNKNOWN TOKEN: ' + label};
  });

  source = '';
  for (var i = 0; i < template.length - 1; i ++)
    source += template[i] + replaced[i];
  source += template[template.length - 1];
  script.source = source;
}

function indent(source) {
  var lines = source.split('\n');
  var result = '';
  lines.forEach(function (line) {
    result += '  ' + line + '\n';
  });
  return result;
}

function addExtFunction(script, scripts) {
  if (script.funcs.length == 0)
    return 'function ' + script.func_name + ' ([KEYS, ARGV])\n' + 
            indent(script.source) + 'end\n';
            
  script.source = addExtFunction(scripts[script.funcs.pop()], scripts) + script.source;
  return addExtFunction(script, scripts);
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

    for (var func_name in scripts)
      replaceVars(scripts[func_name], scripts);
    for (var func_name in scripts)
      addExtFunction(scripts[func_name], scripts);

    console.log(scripts['%word_add%'].source);
  }
};

RedisScripts.prototype.load('./');


///%[A-z|_]+%/g

