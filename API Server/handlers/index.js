var console = require('console');

var load_list = {
  '/auth': 'GET',

  '/delete-word': 'GET',
  '/add-word': 'POST',
  '/get-word': 'GET'
};

function load_handlers (register) {
  for (var path in load_list) {
    var handler = require('./' + path.substr(1));
    register(path, load_list[path], handler);
    console.log('HTTPS handler', path, 'loaded.');
  }
}

module.exports = load_handlers;
