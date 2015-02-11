/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var expressLiquid = require('express-liquid');
var tinyliquid = require('tinyliquid');
var rd = require('rd');
var SocketIO = require('socket.io');
var utils = require('./utils');
var debug = utils.debug('index');


/**
 * 启动应用
 *
 * @return {Object}
 */
exports.start = function (config) {
  config = utils.mergeDefaultConfig(config);
  utils.NS('config', config);

  var app = express();
  var server = http.createServer(app);

  var router = exports.init(config, server);
  app.use(router);

  server.listen(config.port);

  return app;
};

/**
 * 初始化，返回router
 *
 * @return {Object}
 */
exports.init = function (config, server) {
  config = utils.mergeDefaultConfig(config);
  utils.NS('config', config);

  // 初始化socket.io
  var io = SocketIO(server);
  utils.NS('io', io);

  var router = express.Router();
  utils.NS('router', router);

  // 初始化
  utils.NS('lib.server', require('./lib/server'));
  utils.NS('lib.project', require('./lib/project'));
  utils.NS('lib.action', require('./lib/action'));
  utils.NS('lib.plugin', require('./lib/plugin'));
  require('./init');

  var ASSETS_DIR = utils.sourceDir('assets');
  router.use('/assets', serveStatic(ASSETS_DIR));

  // 初始化Liquid模板
  var USER_VIEWS_DIR = utils.viewsDir('.');
  var DEFAULT_VIEWS_DIR = utils.sourceDir('views');
  var renderLiquid = expressLiquid({
    context: utils.NS('tinyliquid.context'),
    includeFile: function (filename, callback) {
      var name = filename.slice(USER_VIEWS_DIR.length + 1);
      debug('template: include file: %s', name);
      fs.exists(filename, function (exists) {
        if (exists) {
          debug('  - include from custom views dir: [%s] %s', name, filename);
          return fs.readFile(filename, callback);
        }
        filename = utils.sourceDir(DEFAULT_VIEWS_DIR, name);
        debug('  - include from default views dir: [%s] %s', name, filename);
        fs.readFile(filename, callback);
      });
    }
  });
  router.use(function (req, res, next) {
    res.context = tinyliquid.newContext();

    res.render = function (view, data, callback) {
      data = data || {};
      Object.keys(res.locals).forEach(function (k) {
        res.context.setLocals(k, res.locals[k]);
      });
      Object.keys(data).forEach(function (k) {
        res.context.setLocals(k, data[k]);
      });
      data.settings = {};
      data.settings['view engine'] = 'liquid';
      data.settings['views'] = USER_VIEWS_DIR;
      data.context = res.context;
      renderLiquid(view, data, function (err, html) {
        if (err) return next(err);
        res.header('content-type', 'text/html');
        res.end(html);
        callback && callback(err, html);
      });
    };

    res.relativeRedirect = function (url) {
      res.redirect(res.getRelativeRedirect(url));
    };

    res.getRelativeRedirect = function (url) {
      return utils.NS('config.urlPrefix') + url;
    };

    res.locals._server = {
      timestamp: Date.now()
    };
    function setLocals (name) {
      Object.defineProperty(res.locals._server, name, {
        get: function () {
          return req[name];
        }
      });
    }
    setLocals('body');
    setLocals('params');
    setLocals('session');
    setLocals('query');
    setLocals('headers');
    setLocals('url');

    res.apiError = function (err, data) {
      data = data || {};
      data.error = err.toString();
      debug('api error: %s', err);
      res.json(data);
    };

    res.apiSuccess = function (data) {
      debug('api success: %s', data);
      res.json(data);
    };

    next();
  });

  router.use(utils.NS('middleware.session'));

  // 初始化路由
  rd.eachFileFilterSync(utils.sourceDir('routes'), /\.js$/, function (f, s) {
    require(f);
  });

  // 创建默认目录
  utils.mkdirIfNotExistSync(utils.dataDir('action'));
  utils.mkdirIfNotExistSync(utils.dataDir('server'));
  utils.mkdirIfNotExistSync(utils.dataDir('project'));
  utils.mkdirIfNotExistSync(utils.dataDir('log'));
  utils.mkdirIfNotExistSync(utils.dataDir('git'));
  utils.mkdirIfNotExistSync(utils.viewsDir('.'));
  utils.mkdirIfNotExistSync(utils.pluginDir('.'));

  // 创建默认数据文件
  if (rd.readFileFilterSync(utils.dataDir('action'), /\.json$/).length < 1) {
    utils.copyDirSync(utils.sourceDir('default_action'), utils.dataDir('action'));
  }

  // 初始化插件
  utils.NS('lib.plugin').list(function (err, list) {
    if (err) throw err;
    var InitPlugin = utils.NS('lib.plugin').InitPlugin;
    list.forEach(function (item) {
      debug('init plugin: %s', item.name);
      var plugin = new InitPlugin(item.name);
      plugin.NS = utils.NS;
      plugin.init();
      plugin.router.use(utils.NS('middleware.check_login'));
      router.use('/plugin/' + item.name, plugin.router);
    });
  });

  setTimeout(function () {
    console.log(utils.NS('dataSource'));
  }, 1000);

  return router;
};
