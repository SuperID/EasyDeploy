/**
 * EasyDeploy example
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var http = require('http');
var express = require('express');
var easydeploy = require('../');
var utils = require('lei-utils');
var debug = require('debug')('example');

// good luck
utils.bugfree();

// init express
var app = express();
app.get('/test', function (req, res, next) {
  res.send(new Date());
});

// create http server instance
var server = http.createServer(app);

// init easydeploy
var config = {
  port: process.env.PORT || 3000
};
app.use(easydeploy.init(config, server));

server.listen(config.port);
