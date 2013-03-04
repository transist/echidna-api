var redis = require('redis');
var config = require('./config.js');
var moment = require('moment');

var redisClient = redis.createClient(config.ECHIDNA_REDIS_PORT, config.ECHIDNA_REDIS_HOST);

/*
function updateFeed(feedconfig, socket) {
  var currentDate = new data.FeedConfig(feedconfig);
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
*/

var iteration = 0;

function queueData() {
  var data = {
    time: moment(),
    words: [
      {word: 'one', count: 17, panelid: 0, source: 'http://some/url'},
      {word: 'two', count: 13, panelid: 0, source: 'http://some/url'},
      {word: 'three', count: 12, panelid: 0, source: 'http://some/url'},
      {word: 'four', count: 11, panelid: 0, source: 'http://some/url'},
      {word: 'five', count: 10, panelid: 0, source: 'http://some/url'},
      {word: 'six', count: 9, panelid: 0, source: 'http://some/url'},
      {word: 'seven', count: 8, panelid: 0, source: 'http://some/url'},
      {word: 'eight', count: 6, panelid: 0, source: 'http://some/url'},
      {word: 'nine', count: 5, panelid: 0, source: 'http://some/url'},
      {word: 'ten', count: 4, panelid: 0, source: 'http://some/url'},
      {word: 'eleven', count: 3, panelid: 0, source: 'http://some/url'},
      {word: 'twelve', count: 2, panelid: 0, source: 'http://some/url'},
      {word: 'thirteen', count: 1, panelid: 0, source: 'http://some/url'},
      {word: 'fourteen', count: 1, panelid: 0, source: 'http://some/url'},
      {word: 'fifteen', count: 1, panelid: 0, source: 'http://some/url'},
    ]
  };

  var key = config.ECHIDNA_REDIS_NAMESPACE + ':queue:panel0';
  var multi = redisClient.multi();
  iteration++;
  var payload = JSON.stringify(data);
  console.log(payload);
  multi.rpush(key, payload);
  multi.ltrim(key, 0, 99);
  multi.exec(function(err, replies) {
    console.log(replies);
    console.log('executed on key ' + key + ' iteration ' + iteration);
  });
}

setInterval(queueData, 100);
