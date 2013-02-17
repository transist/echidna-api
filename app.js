var restify = require('restify');
var fs = require('fs');

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

function related_keywords(req, res, next) {
  console.log('connecting to synonyms server ' + JSON.stringify(synonyms_client.url));
  synonyms_client.post('/v1/dicts/synonyms', {'text': req.params.keyword}, function(err, req, remote_res, obj) {
    res.send(obj);
  });
}

function setup_server(server) {
  server.get('/api', usage);
  server.get('/api/brands', brands);
  server.get('/api/brands/:brand', brand);
  server.get('/api/brands/:brand/keywords', keywords);
  server.get('/api/brands/:brand/keywords/:keyword', related_keywords);
}

var server, https_server;
var synonyms_client;

function main(cb, cb_https) {
  var http_options = {
    version: '1.0.0'
  };
  server = restify.createServer(http_options);
  setup_server(server);

  var synonyms_url = process.env.ECHIDNA_SYNONYMS_API || "http://localhost:9000";
  console.log('creating client ' + synonyms_url);
  synonyms_client = restify.createJsonClient({
      url: synonyms_url,
      version: '*'
  });

  if(process.env.ECHIDNA_API_HTTPS) {
    var https_options = {
      key: fs.readFileSync('/etc/ssl/self-signed/server.key'),
      certificate: fs.readFileSync('/etc/ssl/self-signed/server.crt'),
      version: '1.0.0'
    };
    https_server = restify.createServer(https_options);
    setup_server(https_server);
  }

  var ip = process.env.ECHIDNA_API_IP || "0.0.0.0";
  var port = process.env.ECHIDNA_API_PORT || 3000;

  server.listen(port, ip, function() {
    if (require.main === module) {
      console.log('%s listening at %s', server.name, server.url);
    }

    if(https_server) {
      port = server.address().port + 1;

      https_server.listen(port, ip, function() {
        console.log('%s listening at %s', https_server.name, https_server.url);
        if(cb_https) {
          cb_https(https_server.url, https_server.address().host, https_server.address().port);
        }
      });
    }

    if(cb) {
      cb(server.url, server.address().host, server.address().port);
    }
  });
}

function close() {
  if(server) {
    server.close();
  }
  if(https_server) {
   https_server.close();
  }
}

exports.main = main;
exports.close = close;

if (require.main === module) {
  main();
}
