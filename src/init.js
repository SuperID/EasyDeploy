/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var tinyliquid = require('tinyliquid');
var multiparty = require('connect-multiparty');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var utils = require('./utils');
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
