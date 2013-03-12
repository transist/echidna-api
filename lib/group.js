'use strict';

var restify = require('restify');
var config = new require('../config.js');
var qs = require('querystring');

console.log('creating client ' + config.ECHIDNA_STREAMING_URL);
var streaming_api = restify.createJsonClient({
    url: config.ECHIDNA_STREAMING_URL,
    version: '*'
});

function getGroupId(feedconfig, cb) {
  if(typeof cb !== 'function') {
    throw new Error('Expected parameter cb to be function');
  }

  var query = qs.stringify({
    gender: feedconfig.gender,
    tier_id: feedconfig.tier,
    age_range: feedconfig.age
  });

  var uri = '/group_id?' + qs.unescape(query);
  console.log(
    'querying streaming API server \"' + config.ECHIDNA_STREAMING_URL + uri + '\"');

  streaming_api.get(uri, function(err, req, remote_res, obj) {
    if(err) return cb(err);
    cb(null, obj.id);
  });
}

exports.getGroupId = getGroupId;

function example() {
  var edata = require('echidna-data');

  var DESIRED_WORD_COUNT = 5;
  var DESIRED_X_VALUES = 30;
  var feedconfig = new edata.FeedConfig();
  feedconfig.setDemographics('Women',  '18-', '2');
  //feedconfig.setHistoric('2013-03-01T11:00:00', '2013-03-01T11:02:00', 'minute');
  feedconfig.setRealtime('minute', DESIRED_X_VALUES);
  feedconfig.setWordCount(DESIRED_WORD_COUNT);
  console.log(feedconfig.toJSON());
  getGroupId(feedconfig, function(err, id) {
    console.log('Group id: ' + id);
    streaming_api.close();
  })
}

if(require.main === module) {
 example();
} else {
  // do nothing
}