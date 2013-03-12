var options = {};

console.log('options ' + JSON.stringify(options));
var io = require('socket.io').listen(9999, options);
io.set('log level', 5);

var rootSockets = io.on('connection', function(socket)
{
  console.log('connection from client');
  socket.on('ping', function(e) {
    console.log('ping: ' + e);
    socket.emit('pong', e);
  });
});