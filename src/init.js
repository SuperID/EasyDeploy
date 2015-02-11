/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var tinyliquid = require('tinyliquid');
var multiparty = require('connect-multiparty');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var async = require('async');
var utils = require('./utils');
var debug = utils.debug('init');
var NS = utils.NS;


// ------------------------- 中间件 ---------------------------------------------
// 初始化中间件
NS('middleware.multiparty', multiparty());
NS('middleware.json', bodyParser.json());
NS('middleware.urlencoded', bodyParser.urlencoded({extended: true}));

/* Session 中间件 */
NS('middleware.session', cookieSession({
  keys: NS('config.cookie.keys')
}));

/* 验证登录权限 */
NS('middleware.check_login', function (req, res, next) {
  if (req.session && req.session.login) return next();
  req.session.return_url = req.url;
  res.relativeRedirect('/login');
});

// -------------------------- 模板引擎 ------------------------------------------

var context = tinyliquid.newContext();
NS('tinyliquid.context', context);

context.setFilter('relative_url', function (url) {
  return NS('config.urlPrefix') + url;
});

context.setAsyncLocals('data_server_list', function (name, callback) {
  NS('lib.server').list(utils.defaultErrorValue(callback, []));
});

context.setAsyncLocals('data_project_list', function (name, callback) {
  NS('lib.project').list(utils.defaultErrorValue(callback, []));
});

context.setAsyncLocals('data_action_list', function (name, callback) {
  NS('lib.action').list(utils.defaultErrorValue(callback, []));
});

context.setAsyncLocals('data_execute_tasks', function (name, callback) {
  var list = [];
  Object.keys(NS('executeTasks')).forEach(function (k) {
    list.push(NS('executeTasks')[k]);
  });
  callback(null, list);
});

context.setAsyncLocals('_user_default_ssh_key', function (name, callback) {
  fs.readFile(path.resolve(process.env.HOME, '.ssh/id_rsa'), function (err, data) {
    callback(null, (data || '').toString());
  });
});

context.setAsyncLocals('data_plugin_list', function (name, callback) {
  NS('lib.plugin').list(utils.defaultErrorValue(callback, []));
});

context.setAsyncFilter('plugin_get_status', function (name, callback) {
  NS('lib.plugin').get(name, utils.defaultErrorValue(callback, {}));
});

context.setAsyncLocals('data_git_repository_list', function (name, callback) {
  var list = [];
  debug(Object.keys(NS('dataSource.git_repository_list')));
  async.eachSeries(Object.keys(NS('dataSource.git_repository_list')), function (name, next) {
    NS('dataSource.git_repository_list.' + name)({}, function (err, ret) {
      if (Array.isArray(ret)) {
        list = list.concat(ret);
      }
      next();
    });
  }, function (err) {
    callback(null, list);
  });
});
