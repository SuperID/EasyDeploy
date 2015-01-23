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


// ------------------------- 中间件 ---------------------------------------------
// 初始化中间件
utils.NS('middleware.multiparty', multiparty());
utils.NS('middleware.json', bodyParser.json());
utils.NS('middleware.urlencoded', bodyParser.urlencoded({extended: true}));

/* Session 中间件 */
utils.NS('middleware.session', cookieSession({
  keys: utils.NS('config.cookie.keys')
}));

/* 验证登录权限 */
utils.NS('middleware.check_login', function (req, res, next) {
  if (req.session && req.session.login) return next();
  req.session.return_url = req.url;
  res.relativeRedirect('/login');
});

// -------------------------- 模板引擎 ------------------------------------------

var context = tinyliquid.newContext();
utils.NS('tinyliquid.context', context);

context.setFilter('relative_url', function (url) {
  return utils.NS('config.urlPrefix') + url;
});
