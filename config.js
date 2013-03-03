function Config() {
  var config = {
    ECHIDNA_REDIS_HOST: process.env.ECHIDNA_REDIS_HOST || "127.0.0.1",
    ECHIDNA_REDIS_PORT: process.env.ECHIDNA_REDIS_PORT || 6379,
    ECHIDNA_REDIS_NAMESPACE: process.env.ECHIDNA_REDIS_NAMESPACE || process.env.USER + ':d',
    ECHIDNA_API_IP: process.env.ECHIDNA_API_IP || "0.0.0.0",
    ECHIDNA_API_PORT: parseInt(process.env.ECHIDNA_API_PORT) || 0
  };
  return config;
}

exports.Config = Config;