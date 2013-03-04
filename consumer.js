
var redis = require('redis');
var config = new require('./config.js');
var key = config.ECHIDNA_REDIS_NAMESPACE + ':queue:panel0';

var redisClient = redis.createClient(config.ECHIDNA_REDIS_PORT, config.ECHIDNA_REDIS_HOST);

var iteration = 0;
function consumer() {
  iteration++;
  console.log('popping from key ' + key + ' iteration ' + iteration);
  redisClient.blpop(key, 0, function(err, value) {
    console.dir(value);
    var key = value[0];
    var message = JSON.parse(value[1]);
    console.log(message.time);
    //console.log(JSON.stringify(message));
    process.nextTick(consumer);
  });
}

consumer();

process.stdin.resume();