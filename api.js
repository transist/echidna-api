'use strict';

var syslog = require('node-syslog');
var edata = require('echidna-data');
var socketio = require('socket.io');
var moment = require('moment');
var redis = require('redis');

var config = new require('./config.js');
var group = new require('./lib/group.js');
var historical = new require('./lib/historical.js');

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
  // blocking call to Redis
  redisClient.brpop(key, 0, function(err, value) {
    //TODO: these errors permanently abort the feed consumer...
    if(err) return syslog.err(err);
    var slices = JSON.parse(value[1]);
    if(!(slices instanceof Array)) {
      return syslog.err('Expected Array, got ' + value[1]);
    }

    // for every connected client, we check if the
    // queue matches what this consumer is looking for
    // and if yes, publish every update that has the same sampling
    var clients = io.sockets.clients();
    for(var id in clients) {
      var socket = clients[id];
      // only if its the queue this socket wants
      if(socket.queueKey !== key)
        continue;
      // only iterate for as many words are requested
      emitSlices(socket, slices);
    }
    process.nextTick(feedConsumer.bind(null, key));
  });
}

function emitSlices(socket, slices) {
  // select the socket.feedconfig.count words that have the highest frequency across
  // all slices...
  var max;
  if(socket.feedconfig.numberItems) {
    max = slices.length < socket.feedconfig.numberItems ? slices.length : socket.feedconfig.numberItems;
  } else {
    max = slices.length;
  }

  for(var i=0; i<max; i++) {
      // this is the correct panel, we just need to check sampling
      if(socket.feedconfig.sampling === slices[i].type) {
        var slice = new edata.Slice(slices[i]);
        slice.words = slice.words.slice(0, socket.feedconfig.count);
        console.log('MATCHING slice #' + i + ' emitting count words ' + slice.words.length);
        socket.emit('slice', slice);
      } else {
        console.log('NOT MATCHING: type ' + slices[i].type + ' sampling ' + socket.feedconfig.sampling);
      }
  }
}

function emitHistoricalData(socket, err, slices) {
  if(err) return syslog.error(err);
  emitSlices(socket, slices);
}

function newFeedConfig(socket, data) {
  syslog.info('API server received a new feedconfig from ' + socket.id);
  console.dir(data);
  socket.feedconfig = new edata.FeedConfig(data);

  var panelid = group.getGroupId(socket.feedconfig);
  socket.queueKey = config.ECHIDNA_REDIS_NAMESPACE + ':api/messages/' + panelid + '/trends';
  //socket.queueKey ='e:echidna:p:api/messages/' + panelid + '/trends';
  //socket.queueKey = 'e:echidna:p:api/messages/group-other/trends';

  if(socket.feedconfig.isRealtime()) {
    if(activeQueues.indexOf(socket.queueKey) === -1) {
      syslog.info('adding feedConsumer on key: ' + socket.queueKey + ' for ' + socket.id);
      activeQueues.push(socket.queueKey);
      feedConsumer(socket.queueKey);
    } else {
      syslog.info('queue already active, not adding: ' + socket.queueKey);
    }
    var end = moment();
    var start = moment().subtract(
      socket.feedconfig.sampling,
      socket.feedconfig.numberItems)

    historical.getHistoricalData(
      panelid,
      socket.feedconfig.sampling,
      start.utc().format(),
      end.utc().format(),
      emitHistoricalData.bind(null, socket))

  } else if(socket.feedconfig.isHistorical()) {
    historical.getHistoricalData(
      panelid,
      socket.feedconfig.sampling,
      socket.feedconfig.start,
      socket.feedconfig.end,
      emitHistoricalData.bind(null, socket))
  } else {
    syslog.error('Unknown feedconfig configuration ' + JSON.stringify(socket.feedconfig));
    return;
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

