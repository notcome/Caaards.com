var sr = require('./send_request')
var key = 'asdf'
var query = { 'username': 'lms', 'word': 'hello' }
var path = '/delete-word'
var method = 'GET'
sr(method, path, query, key, { def: '你好' })
