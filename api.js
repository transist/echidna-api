'use strict';

/*

* must receive every new word and generate datapoints for the matchings feedconfigs
* must be able to populate a timeline with the top n words for every sampling
period
* must be able to update client timeline with this structure:
  [
    {key: 'string', values: [{x, y, sourceid}, {x, y, sourceid}, ...]},
    {key: 'string', values: [{x, y, sourceid}, {x, y, sourceid}, ...]},
    ...
  ]

values array must match (length and x must be the same) for every single key string

...a simultaneous update problem... given a new word and count for a certain timeslice, we
must also update every other values array for every word to "extend" the array in that direction,
even with zero'ed values.


*/

// redisSubscriber subscribes to datapoints events
// socket publishes feedconfig
// io receives feedconfig
// io stores feedconfig to redis
// redisPublisher publishes new data point (word)
// redisSubscriber receives published data point
// io publishes data point based on feedconfig
// socket receives datapoint

var socketio = require('socket.io');
//https://github.com/LearnBoost/socket.io-client
var moment = require('moment');

var config = new require('./config.js').Config();

var iteration = 0;
function updateFeed(feedconfig, socket) {
  var currentDate = moment(feedconfig.start);
  var endDate = moment(feedconfig.end);
  iteration++;
  while(endDate.isAfter(currentDate)) {
    var slice = [];
    for(var i=0; i<feedconfig.samples; i++) {
      slice.push({
        word: 'sample' + i,
        count: iteration
      });
    }
    var container = {
      objects: slice,
      timestamp: currentDate,
    };
    socket.emit('slice', JSON.stringify(container));
    currentDate.add(feedconfig.sampling, 1);
  }
}

// server
function createServer(config, cb) {
  var io = socketio.listen(config.ECHIDNA_API_PORT, function() {
    console.log('server listening on port ' + io.server.address().port);
    config.ECHIDNA_API_PORT = io.server.address().port;
    cb(null, config);
  });

  io.sockets.on('connection', function(socket) {
    console.log('ws server has a connection');
    socket.on('feedconfig', function (data) {
      console.log('ws server received a new feedconfig');
      console.dir(data);
      setInterval(updateFeed.bind(null, data, socket), 1000);
    });
  });
}

createServer(config, function(err) {
  if(err) return console.log(err);
  console.log('Listening on port ' + config.ECHIDNA_API_PORT);
});