
var users_offset = {
  'echidna': 0, // production
  'staging': 1,
  'testing': 2,
  'development': 3,
  'rngadam': 4,
  'flyerhzm': 5,
  'rainux': 6,
  'simsicon': 7
};

var base_port = {
  'echidna-spider': 62200,
  'echidna-streaming': 62300,
  'echidna-worker': 62400,
  'echidna-trends': 62500,
  'echidna-monitoring': 62600,
  'echidna-api': 62700,
  'echidna-deploy': 62800
};

function getPort(project) {
  var offset = users_offset[process.env.USER];
  if(!users_offset[process.env.USER])
    offset = users_offset['development'];

  return base_port[project] + offset;
}

function getNamespace(env) {
  return 'e:' + process.env.USER + ':' + env[0];
}

function Config() {
  var config = {
    ECHIDNA_ENV: process.env.ECHIDNA_ENV || 'development',
    ECHIDNA_REDIS_HOST: process.env.ECHIDNA_REDIS_HOST || "127.0.0.1",
    ECHIDNA_REDIS_PORT: process.env.ECHIDNA_REDIS_PORT || 6379,
    ECHIDNA_REDIS_NAMESPACE: process.env.ECHIDNA_REDIS_NAMESPACE || getNamespace(process.env.ECHIDNA_ENV || 'development'),
    ECHIDNA_API_IP: process.env.ECHIDNA_API_IP || "0.0.0.0",
    ECHIDNA_API_PORT: parseInt(process.env.ECHIDNA_API_PORT) || getPort('echidna-api')
  };
  return config;
}

module.exports = new Config();