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

var syslog = require('node-syslog');
var edata = require('echidna-data');
var socketio = require('socket.io');
//https://github.com/LearnBoost/socket.io-client
var moment = require('moment');
var redis = require('redis');
var config = new require('./config.js');

var redisClient = redis.createClient(
  config.ECHIDNA_REDIS_PORT,
  config.ECHIDNA_REDIS_HOST);

syslog.init("api",
  syslog.LOG_PID | syslog.LOG_ODELAY | syslog.LOG_CONS | syslog.LOG_PERORR,
  syslog.LOG_LOCAL3);

syslog.error = function(message) {
   syslog.log(syslog.LOG_ERROR, message);
   console.log(message);
}

syslog.info = function(message) {
   syslog.log(syslog.LOG_INFO, message);
   console.log(message);
}

syslog.debug = function(message) {
   syslog.log(syslog.LOG_DEBUG, message);
   console.log(message);
}

var activeQueues = [];
var io;
function feedConsumer(key) {
  redisClient.brpop(key, 0, function(err, value) {
    if(err) return syslog.err(err);
    var message = JSON.parse(value[1]);
    var clients = io.sockets.clients();
    for(var id in clients) {
      var socket = clients[id];
      if(socket.queueKey !== key)
        continue;
      var feedconfig = socket.feedconfig;
      // TODO: make a decision if this slice applies to this feedconfig
      //syslog.debug('emitting to socket ' + soc211ket.id + ' new message ' + message);
      socket.emit('slice', message);
    }
    process.nextTick(feedConsumer.bind(null, key));
  });
}

function newFeedConfig(socket, data) {
  syslog.info('API server received a new feedconfig from ' + socket.id);
  console.dir(data);
  var feedconfig = new edata.FeedConfig(data);
  socket.feedconfig =  new edata.FeedConfig(data);

  var panelid = 'panel-other'; // TODO; lookup queue id based on feedconfig parameters
  socket.queueKey = config.ECHIDNA_REDIS_NAMESPACE + ':api:messages/' + panelid + '/trends';

  if(feedconfig.isRealtime()) {
    if(activeQueues.indexOf(socket.queueKey) === -1) {
      syslog.info('adding feedConsumer on key: ' + socket.queueKey + ' for ' + socket.id);
      activeQueues.push(socket.queueKey);
      feedConsumer(socket.queueKey);
    } else {
      syslog.info('queue already active, not adding: ' + socket.queueKey);
    }
  } else if(feedconfig.isHistoric()) {
    syslog.info('TODO: do once: fetch and emit from trends API');
  } else {
    syslog.error('Unknown feedconfig configuration ' + JSON.stringify(feedconfig));
  }
}

function newConnection(socket) {
    syslog.info('API server has a connection ' + socket.id);
    socket.on('disconnect', function(socket) {
      syslog.info('socket ' + socket.id + ' disconnected');
    });
    socket.on('feedconfig', newFeedConfig.bind(null, socket));
}

// server
function createServer(config, cb) {
  syslog.info('configured port ' + config.ECHIDNA_API_PORT);
  io = socketio.listen(config.ECHIDNA_API_PORT, function() {
    syslog.info('API server listening on port ' + io.server.address().port);
    config.ECHIDNA_API_PORT = io.server.address().port;
  });
  io.set('log level', 1);
  io.sockets.on('connection', newConnection.bind());
}

createServer(config);

