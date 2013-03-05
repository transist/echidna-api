var socketioclient = require('socket.io-client');

var base = 'http://127.0.0.1:9999';

var uri = process.env.ECHIDNA_ECHO_URI || 'socket.io';
var options = {
  //resource: uri + '/socket.io'
};

console.log('connecting to ' + base);
console.log('options ' + JSON.stringify(options));
var socket = socketioclient.connect(base, options);

socket.on('pong', function(data) {
  console.log('pong: ' + data);
});

socket.emit('ping', 'hello world');