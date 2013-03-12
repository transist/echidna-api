'use strict';

//https://github.com/LearnBoost/socket.io-client
var socketioclient = require('socket.io-client');
var data = require('echidna-data');
var container = new data.D3Container();
var feedconfig = new data.FeedConfig();

var config = new require('../config.js');
var moment = require('moment');

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var DESIRED_WORD_COUNT = 5;
var DESIRED_X_VALUES = 30;
feedconfig.setDemographics('Women',  '18-', '1');
//feedconfig.setHistoric('2013-03-01T11:00:00', '2013-03-01T11:02:00', 'minute');
feedconfig.setRealtime('hour', DESIRED_X_VALUES);
feedconfig.setWordCount(DESIRED_WORD_COUNT);

// client
function createClient(config) {
  var url = process.env.ECHIDNA_API_URL || 'https://echidna.transi.st';
  console.log('client connecting to ' +  url + ' options ' + JSON.stringify(options));
  var socket = socketioclient.connect(url, options);
  socket.on('connect', function() {
    console.log('client connected ');

    socket.on('slice', function(slice) {
      var stringified = JSON.stringify(slice);
      console.log('slice is: ' + stringified);
      var s = new data.Slice(slice);
      if(s.words.length > DESIRED_WORD_COUNT)
        console.log(
          'Warning: Desired word count ' + DESIRED_WORD_COUNT
          + ' Actual word count ' + s.words.length);
      s.checkValid();
      container.updateSlice(s);
    });

    socket.on('disconnect', function() {
      console.log('client disconnected');
    });

    var fc = feedconfig.toJSON();
    console.log('Emitting feedconfig ' + fc);
    socket.emit('feedconfig', feedconfig.toJSON());
  });
}

createClient(config);

process.stdin.resume();
process.stdin.on('data', function(chunk) {
  var current = container.current();
  console.log(JSON.stringify(current, null, "\t"));
  console.log('number of unique words: ' + current.length);
  if(current.length > 0)
    console.log('number of time units: ' + current[0].values.length);
});