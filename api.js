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

var edata = require('echidna-data');
var socketio = require('socket.io');
//https://github.com/LearnBoost/socket.io-client
var moment = require('moment');
var redis = require('redis');
var config = new require('./config.js');

var redisClient = redis.createClient(config.ECHIDNA_REDIS_PORT, config.ECHIDNA_REDIS_HOST);

var iteration = 0;

var activeConnections = {};
var activeQueues = [];

function feedConsumer(key) {
  iteration++;
  redisClient.blpop(key, 0, function(err, value) {
    var message = JSON.parse(value[1]);
    //console.log(message.time);

    for(var id in activeConnections) {
      var socket = activeConnections[id];
      if(socket.queueKey !== key)
        continue;
      var feedconfig = activeConnections[id].feedconfig;
      //console.log('emitting slice on socket ' + id);
      socket.emit('slice', message);
    }
    process.nextTick(feedConsumer.bind(null, key));
  });
}

function newFeedConfig(socket, data) {
  console.log('ws server received a new feedconfig');
  console.dir(data);
  var key = config.ECHIDNA_REDIS_NAMESPACE + ':queue:panel0';
  var feedconfig = new edata.FeedConfig(data);
  socket.feedconfig =  new edata.FeedConfig(data);
  socket.queueKey = config.ECHIDNA_REDIS_NAMESPACE + ':queue:panel0';
  if(feedconfig.isRealtime()) {
    if(activeQueues.indexOf(socket.queueKey) === -1) {
      feedConsumer(socket.queueKey);
      activeQueues.push(socket.queueKey);
    }
  } else {
    console.log('TODO: do once: fetch and emit from trends API');
  }

}

function newConnection(socket) {
    console.log('ws server has a connection');
    console.dir(socket);
    activeConnections[socket.id] = socket;
    socket.on('feedconfig', newFeedConfig.bind(null, socket));
    socket.emit('ping', 'test');
}

// server
function createServer(config, cb) {
  var io = socketio.listen(config.ECHIDNA_API_PORT, function() {
    console.log('server listening on port ' + io.server.address().port);
    config.ECHIDNA_API_PORT = io.server.address().port;
    cb(null, config);
  });

  io.sockets.on('connection', newConnection);
}

createServer(config, function(err) {
  if(err) return console.log(err);
  console.log('Listening on port ' + config.ECHIDNA_API_PORT);
});