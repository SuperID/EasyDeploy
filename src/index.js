/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var fs = require('path');
var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var expressLiquid = require('express-liquid');
var tinyliquid = require('tinyliquid');
var rd = require('rd');
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
  var router = exports.init(config);
  app.use(router);
  app.listen(config.port);
  return app;
};

/**
 * 初始化，返回router
 *
 * @return {Object}
 */
exports.init = function (config) {
  config = utils.mergeDefaultConfig(config);
  utils.NS('config', config);

  var router = express.Router();
  utils.NS('router', router);

  // 初始化
  utils.NS('lib.server', require('./lib/server'));
  utils.NS('lib.project', require('./lib/project'));
  require('./init');

  var ASSETS_DIR = path.resolve(__dirname, 'assets');
  router.use('/assets', serveStatic(ASSETS_DIR));

  // 初始化Liquid模板
  var VIEWS_DIR = path.resolve(__dirname, 'views');
  var renderLiquid = expressLiquid({
    context: utils.NS('tinyliquid.context')
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
      data.settings['views'] = VIEWS_DIR;
      data.context = res.context;
      renderLiquid(view, data, function (err, html) {
        if (err) return next(err);
        res.header('content-type', 'text/html');
        res.end(html);
        callback && callback(err, html);
      });
    };

    res.relativeRedirect = function (url) {
      res.redirect(utils.NS('config.urlPrefix') + url);
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
  rd.eachFileFilterSync(path.resolve(__dirname, 'routes'), /\.js$/, function (f, s) {
    require(f);
  });

  return router;
};