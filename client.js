'use strict';

var socketioclient = require('socket.io-client');
var data = require('echidna-data');
var container = new data.D3Container();
var config = new require('./config.js').Config();
var moment = require('moment');

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var feedconfig = {
  gender: 'Women',
  age: '18-',
  tier: 'Tier1',
  start: '2013-03-01T11:00:00', // start of the range
  end: '2013-03-01T11:02:00', // end of the range
  sampling: 'minute', // time period to get data from
  samples: 10 // top 10 words for each
};

// client
function createClient(config) {
  console.log('client connecting to ' +  config.ECHIDNA_API_PORT);
  var socket = socketioclient.connect('http://localhost:' + config.ECHIDNA_API_PORT, options);
  socket.on('connect', function() {
    console.log('ws client connected');
    socket.on('slice', function(ev) {
      //console.log('ws client received a new message');
      //console.dir(ev);
      var slice = JSON.parse(ev);
      slice.objects.forEach(function(v, i) {
        container.update(v.word, moment(slice.timestamp).valueOf(), v.count);
      });
    });
    socket.emit('feedconfig', feedconfig);
  });
}

createClient(config);

process.stdin.resume();
process.stdin.on('data', function(chunk) {
  console.log(JSON.stringify(container.current(), null, "\t"));
});