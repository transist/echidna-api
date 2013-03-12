'use strict';

var restify = require('restify');
var config = new require('../config.js');
var qs = require('querystring');

console.log('creating client ' + config.ECHIDNA_STREAMING_URL);
var trends_client = restify.createJsonClient({
    url: config.ECHIDNA_STREAMING_URL,
    version: '*'
});

function getHistoricalData(groupid, interval, start, end, cb) {
  var query = {
    'group-id': groupid,
    'interval': interval,
    'start_time': start,
    'end_time': end
  };

  query = qs.stringify(query);

  var uri = '/?' + qs.unescape(query);
  console.log(uri);
  console.log(
    'querying trends server \"' + config.ECHIDNA_STREAMING_URL + uri + '\"');

  trends_client.get(uri, function(err, req, remote_res, obj) {
    if(err) return cb(err);
    cb(null, obj);
  });
}

exports.getHistoricalData = getHistoricalData;

function filterWordData(w) {
  return w.count > 1 && w.word.length > 1;
}

function debugOutputHistoricalData(err, obj) {
  if(err) return console.log(err);
  obj.forEach(function(v, i) {
    v.words.forEach(function(w, j) {
      if(filterWordData(w))
        console.log(v.time + ':' + w.word + ':' + w.count + ':' + w.source);
    });
  });
  trends_client.close();
}

if(require.main === module) {
  var moment = require('moment');
  var now = moment();
  var begin = moment().subtract('day', 1);

  getHistoricalData(
    'group-other',
    'day',
    begin.utc().format(),
    now.utc().format(),
    debugOutputHistoricalData);
}