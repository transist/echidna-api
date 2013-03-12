var restify = require('restify');
var config = new require('../config.js');
var http = require('http');
var moment = require('moment');
var qs = require('querystring');

var trends_url = process.env.ECHIDNA_TRENDS_API || "http://127.0.0.1:62300";
console.log('creating client ' + trends_url);
trends_client = restify.createJsonClient({
    url: trends_url,
    version: '*'
});

console.log('connecting to trends server ' + JSON.stringify(trends_client.url));
var now = moment();
var one_hour_ago = moment().subtract('hour', 1);
var query = {
  'group-id': 'group-other',
  'interval': 'minute',
  'start_time': one_hour_ago.utc().format(),
  'end_time': now.utc().format()
};

query = qs.stringify(query);

console.log('query: ' + JSON.stringify(query));
//var uri = '/?group_id=group-other&interval=minute&start_time=2013-03-12T11:05:00+8:00&end_time=2013-03-12T12:05:00+8:00';
var uri = '/?' + qs.unescape(query);
console.log(uri);
trends_client.get(uri, function(err, req, remote_res, obj) {
  obj.forEach(function(v, i) {
    v.words.forEach(function(w, j) {
      console.log(w.word);
    });
  });
  console.log(uri);
});