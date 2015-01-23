/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var utils = require('../utils');
var NS = utils.NS;
var router = NS('router');


router.get('/login', renderLoginPage);
function renderLoginPage (req, res, next) {
  res.locals.nav = 'login';
  res.render('login');
}

router.post('/login',
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  if (req.body.username === NS('config.admin.username') &&
      utils.validatePassword(req.body.password, NS('config.admin.password'))) {
    req.session.login = {
      username: NS('config.admin.username')
    };
    res.relativeRedirect(req.session.return_url || req.query.return_url || '/');
    delete req.session.return_url;
  } else {
    res.locals.error = '帐号或密码不正确';
    renderLoginPage(req, res, next);
  }
});

router.get('/',
  NS('middleware.check_login'),
function (req, res, next) {
  res.end('ok');
});
