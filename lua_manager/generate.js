/*
 * generate.js
 * It will take the pseudo Lua codes along with their metadata and generate the
 * results. The input object is like this:
 *
 * {
     '%f1%': {
       command: 'CMDI',
       variables: {
         var1: 'KEYS[1]',
         var2: 'KEYS[2]',
         var3: 'ARGV[1]'
       },
       source: 'pseudo Lua code'
     },
     '%f2%': {
       command: 'CMDII',
       variables: {
         var1: 'KEYS[1]',
         var2: 'ARGV[1]',
         var3: 'ARGV[2]'
       },
       source: 'pseudo Lua code'
     },
 * }
 *
 * And the generated object is like this:
 *
 * {
     CMD1: 'result code',
     CMD2: 'result code'
 * }
 */

var console = require('console');

module.exports = function (scripts) {
  for (var cmd in scripts)
    replaceVars(scripts[cmd], scripts);
  for (var cmd in scripts)
    getAllDependencies(scripts[cmd], scripts);

  var result = {};
  for (var cmd in scripts) {
    var source = scripts[cmd].source;
    scripts[cmd].dep.forEach(function (dep) {
      source += wrapFunction(removePercent(cmd), scripts[cmd].source)
    });
    result[scripts[cmd].command] = source;
  }
  return result;
}

function replaceVars (script, scripts) {
  var source = script.source.join('\n');
  var regexp = /%[A-z|_]+%/g;
  var vars = source.match(regexp), template = source.split(regexp), replaced = [];

  script.dep = [];
  vars.forEach(function (label) {
    if (script.vars[label])
      replaced.push(script.vars[label]);
    else if (scripts[label]) {
      replaced.push(removePercent(label));
      script.dep.push(label);
    }
    else throw {error: 'UNKNOWN TOKEN: ' + label};
  });

  source = '';
  for (var i = 0; i < template.length - 1; i ++)
    source += template[i] + replaced[i];
  source += template[template.length - 1];
  script.source = source;
  script.dep.sort();
}

function getAllDependencies (script, scripts) {
  if (script.done) return script.dep;

  var new_dep = [];
  script.dep.forEach(function (direct_dep) {
    getAllDependencies(scripts[direct_dep], scripts)
      .forEach(function (indirect_dep) {
      if (exists(script.dep, indirect_dep) == false &&
          exists(new_dep, indirect_dep) == false)
        new_dep.push(indirect_dep);
    });
  });
  script.dep = Array.prototype.concat(script.dep, new_dep).sort();
  script.done = true;
  return script.dep;
}

//Utilities
function removePercent (label) {
  return label.substr(1, label.length - 2);
}

function exists (array, test) {
  array.forEach(function (value) {
    if (value == test) return true;
  });
  return false;
}

function indent(source) {
  var lines = source.split('\n');
  var result = '';
  lines.forEach(function (line) {
    result += '  ' + line + '\n';
  });
  return result;
}

function wrapFunction (func_name, source) {
  return 'function ' + func_name + ' ([KEYS, ARGV])\n' +
         indent(source) + 'end\n';
}
//Utilities
