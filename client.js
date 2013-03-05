'use strict';

//https://github.com/LearnBoost/socket.io-client
var socketioclient = require('socket.io-client');
var data = require('echidna-data');
var container = new data.D3Container();
var feedconfig = new data.FeedConfig();
var config = new require('./config.js');
var moment = require('moment');

var options ={
  transports: ['websocket'],
  'force new connection': true
};

feedconfig.setDemographics('Women',  '18-', 'Tier1');
//feedconfig.setHistoric('2013-03-01T11:00:00', '2013-03-01T11:02:00', 'minute');
feedconfig.setRealtime('minute', 30);
feedconfig.setWordCount(10);

// client
function createClient(config) {
  var url = process.env.ECHIDNA_API_URL || 'http://localhost:62704';
  console.log('client connecting to ' +  url);
  var socket = socketioclient.connect(url, options);
  socket.on('connect', function() {
    console.log('ws client connected');

    socket.on('slice', function(slice) {
      slice.words.forEach(function(v, i) {
        container.update(v.word, moment(slice.timestamp).valueOf(), v.count);
      });
    });

    socket.on('disconnect', function() {
      console.log('client disconnected');
    });
    socket.emit('feedconfig', feedconfig.toJSON());
  });
}

createClient(config);

process.stdin.resume();
process.stdin.on('data', function(chunk) {
  console.log(JSON.stringify(container.current(), null, "\t"));
});