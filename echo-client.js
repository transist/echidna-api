var options = {};

var socketioclient = require('socket.io-client');

var base = process.env.ECHIDNA_ECHO_URL || 'http://127.0.0.1:9999';

console.log('connecting to ' + base);
console.log('options ' + JSON.stringify(options));
var socket = socketioclient.connect(base, options);

socket.on('pong', function(data) {
  console.log('pong: ' + data);
});

socket.emit('ping', 'hello world');