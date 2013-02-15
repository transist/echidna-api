'use strict';
var app = require('../app.js');

var restify = require('restify');
var assert = require('assert');

function createStaticReturn(cb) {
  var http = require("http");
  var server = http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify({ 'synonyms': ['hello'] }));
    response.end();
  });

  server.listen(0, cb);
  return server;
}

describe('API', function() {
  var client;

  before(function(done) {
    process.env.ECHIDNA_API_PORT = 0;
    process.env.ECHIDNA_API_IP = "127.0.0.1";
    var server;
    server = createStaticReturn(function() {
      process.env.ECHIDNA_SYNONYMS_API = "http://localhost:" + server.address().port;
      console.log('static server at ' + process.env.ECHIDNA_SYNONYMS_API);
      app.main(function(u) {
        client = restify.createJsonClient({
          url: u,
          version: '*'
        });
        done();
      });
    });
  });

  it('main api entry point works and list collections', function(done) {
    client.get('/api', function(err, req, res, obj) {
      if(err) return done(err);
      if(res.statusCode != 200)
        return done(new Error('wrong status code ' + res.statusCode));
      if(!obj || !obj.collections || obj.collections[0] != 'brands')
        return done(new Error('invalid collections ' + JSON.stringify(obj)));
      done();
    });
  });

  it('sub-collections for brand', function(done) {
    client.get('/api/brands/converse', function(err, req, res, obj) {
      if(err) return done(err);
      if(res.statusCode != 200)
        return done(new Error('wrong status code ' + res.statusCode));
      if(!obj || !obj.collections || obj.collections[0] != 'keywords')
        return done(new Error('invalid collections ' + JSON.stringify(obj)));
      done();
    });
  });

  it('converse brand keywords', function(done) {
    client.get('/api/brands/converse/keywords', function(err, req, res, obj) {
      if(err) return done(err);
      if(res.statusCode != 200)
        return done(new Error('wrong status code ' + res.statusCode));
      if(!obj || !obj.keywords || obj.keywords[0] != 'all')
        return done(new Error('invalid keywords ' + JSON.stringify(obj)));
      done();
    });
  });

  it('related keywords return results', function(done) {
    client.get('/api/brands/converse/keywords/%E6%9C%AC%E6%9D%A5', function(err, req, res, obj) {
      if(err) return done(err);
      if(res.statusCode != 200)
        return done(new Error('wrong status code ' + res.statusCode));
      if(!obj || !obj['synonyms'] || obj['synonyms'][0] != 'hello')
        return done(new Error('invalid result: ' + obj));
      //if(obj['synonyms'].length == 0)
      //  return done(new Error('no synonyms found'));
      done();
    });
  });

  after(function() {
    app.close();
  });
});
