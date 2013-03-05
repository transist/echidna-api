var socketioclient = require('socket.io-client');

var url = 'http://127.0.0.1:9999';
console.log('connecting to ' + url);

var options = {
};

var socket = socketioclient.connect(url, options);

// The usage of .of() is important
socket.on('pong', function(data) {
  console.log('pong: ' + data);
});

socket.emit('ping', 'hello world');