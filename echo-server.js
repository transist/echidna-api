

var uri = process.env.ECHIDNA_ECHO_URI || 'socket.io';
var options = {
  //resource: uri + '/socket.io'
};

console.log('starting server with uri ' + uri);
console.log('options ' + JSON.stringify(options));

var io = require('socket.io').listen(9999, options);
io.set('log level', 1);

var rootSockets = io.on('connection', function(socket)
{
  console.log('connection from client');
  socket.on('ping', function(e) {
    console.log('ping: ' + e);
    socket.emit('pong', e);
  });
});