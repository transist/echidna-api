'use strict';

var restify = require('restify');
var config = new require('../config.js');
var qs = require('querystring');

String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

// TODO: remove hack to get existing data
// this only looks at keys that already exist
var validGroups = ['group-other'];
function initValidGroupsFromRedis(cb) {
  var redis = require('redis');
  var redisClient = redis.createClient(
    config.ECHIDNA_REDIS_PORT,
    config.ECHIDNA_REDIS_HOST);

  var searchTerm = config.ECHIDNA_REDIS_NAMESPACE + ':api/messages/*/trends';
  redisClient.keys(searchTerm, function(err, values) {
    if(!values.length) {
      console.log('ERROR: no keys found for message queue!');
      return;
    }
    values.forEach(function(v, i) {
      //e:rngadam:d:api/messages/group-other/trends
      var groupNameMatch = v.match('/*\/messages\/\(.*\)\/trends');
      if(groupNameMatch && groupNameMatch[1] && groupNameMatch[1].length > 0) {
        console.log(groupNameMatch[1]);
        validGroups.push(groupNameMatch[1]);
      } else {
        console.log('invalid ' + v);
      }
    });
    if(cb)
      cb();
  });
}

function getGroupId(feedconfig) {
  var str = feedconfig.toJSON();
  var hash =  Math.abs(str.hashCode());
  var index = hash % validGroups.length;
  console.log('Using index ' + index + ' for ' + str + ' with hash ' + hash);
  return validGroups[index];
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
  console.log('Group id: ' + getGroupId(feedconfig));
}

if(require.main === module) {
  initValidGroupsFromRedis(example);
} else {
  initValidGroupsFromRedis();
}