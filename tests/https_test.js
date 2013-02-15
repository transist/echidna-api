'use strict';

var app = require('../app.js');

var restify = require('restify');
var assert = require('assert');

var client;

describe('https', function() {
  before(function(done) {
    process.env.ECHIDNA_API_PORT = 0;
    process.env.ECHIDNA_API_IP = "127.0.0.1";
    process.env.ECHIDNA_API_HTTPS = 1;
    app.main(null, function(url, hostname, port) {
      console.log('creating https client for ' + url);
      client = restify.createJsonClient({
        url: url,
        version: '*'
      });
      done();
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

  after(function() {
    app.close();
  });

});