var io = require('socket.io').listen(9999);

io.set('log level', 1);

var options = {
};

var rootSockets = io.on('connection', function(socket)
{
  console.log('connection');
  socket.on('ping', function(e) {
    console.log('ping: ' + e);
    socket.emit('pong', e);
  });
});