// TODO: deprecated: queue has been renamed (kept for future debugging.)
var redis = require('redis');
var config = require('../config.js');
var moment = require('moment');

var redisClient = redis.createClient(
  config.ECHIDNA_REDIS_PORT,
  config.ECHIDNA_REDIS_HOST);

var iteration = 0;

function queueData() {
  var data = {
    time: moment(),
    words: [
      {word: 'one', count: 17, source: 'http://some/url'},
      {word: 'two', count: 13, source: 'http://some/url'},
      {word: 'three', count: 12, source: 'http://some/url'},
      {word: 'four', count: 11, source: 'http://some/url'},
      {word: 'five', count: 10, source: 'http://some/url'},
      {word: 'six', count: 9, source: 'http://some/url'},
      {word: 'seven', count: 8, source: 'http://some/url'},
      {word: 'eight', count: 6, source: 'http://some/url'},
      {word: 'nine', count: 5, source: 'http://some/url'},
      {word: 'ten', count: 4, source: 'http://some/url'},
      {word: 'eleven', count: 3, source: 'http://some/url'},
      {word: 'twelve', count: 2, source: 'http://some/url'},
      {word: 'thirteen', count: 1, source: 'http://some/url'},
      {word: 'fourteen', count: 1, source: 'http://some/url'},
      {word: 'fifteen', count: 1, source: 'http://some/url'},
    ]
  };

  var key = config.ECHIDNA_REDIS_NAMESPACE + ':api:messages/panel-other/trends';
  var multi = redisClient.multi();
  iteration++;
  var payload = JSON.stringify(data);
  multi.rpush(key, payload);
  multi.ltrim(key, 0, 98);
  multi.exec(function(err, replies) {
    if(err) return console.log(err);
    if(replies[0] < 100) {
      console.log(replies);
      console.log('executed on key ' + key + ' iteration ' + iteration);
    }

  });
}

setInterval(queueData, 1000);
