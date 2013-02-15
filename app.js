var restify = require('restify');

function usage(req, res, next) {
  res.send({
    collections: ['brands']
  });
}

function brand(req, res, next) {
  res.send({
    'brand': req.params.brand,
    collections: ['keywords']
  });
}

function brands(req, res, next) {
  res.send({brands: ['converse']});
}

function keywords(req, res, next) {
  res.send({
    keywords: [
      "all", "chevron", "chuck", "converse", "converse100", "jack", "one",
      "purcell", "star", "taylor", "先锋", "历史上", "原创", "叛逆", "地位", "声音", "强大",
      "影像", "成就", "永恒", "潮流", "独特", "瞬间", "精神", "经典", "艺术", "视觉", "音乐",
    ]
  });
}

var synonyms_url = "http://localhost:9000";
var client = restify.createJsonClient({
    url: synonyms_url,
    version: '*'
});

function related_keywords(req, res, next) {
  client.post('/v1/dicts/synonyms', {'text': req.params.keyword}, function(err, req, remote_res, obj) {
    res.send(obj);
  });
}

var server;

function main(cb) {
  server = restify.createServer({
    version: '1.0.0'
  });

  server.get('/api', usage);
  server.get('/api/brands', brands);
  server.get('/api/brands/converse', brand);
  server.get('/api/brands/:brand/keywords', keywords);
  server.get('/api/brands/:brand/keywords/:keyword', related_keywords);

  var port = process.env.ECHIDNA_API_PORT || 3000;
  var ip = process.env.ECHIDNA_API_IP || "0.0.0.0";

  server.listen(port, ip, function() {
    if (require.main === module) {
      console.log('%s listening at %s', server.name, server.url);
    }

    if(cb) {
      cb(server.url);
    }
  });
}

function close() {
  if(server) {
    server.close();
  }
}

exports.main = main;
exports.close = close;

if (require.main === module) {
  main();
}