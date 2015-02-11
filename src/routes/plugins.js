/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var utils = require('../utils');
var NS = utils.NS;
var router = NS('router');


router.get('/plugin/:name/setting',
  NS('middleware.check_login'),
function (req, res, next) {
  NS('lib.plugin').get(req.params.name, function (err, info) {
    if (err) res.locals.error = err;
    res.locals.plugin = info;

    NS('lib.plugin').getPackageInfo(req.params.name, function (err, ret) {
      res.locals.plugin_package = ret;

      res.locals.nav = 'plugins';
      res.render('plugin/setting');
    });
  });
});

router.post('/plugin/:name/enable.json',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  NS('lib.plugin').enable(req.params.name, function (err) {
    if (err) return res.apiError(err);
    res.apiSuccess({name: req.params.name});
  });
});

router.post('/plugin/:name/disable.json',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  NS('lib.plugin').disable(req.params.name, function (err) {
    if (err) return res.apiError(err);
    res.apiSuccess({name: req.params.name});
  });
});

router.get('/plugins',
  NS('middleware.check_login'),
function (req, res, next) {
  res.locals.nav = 'plugins';
  res.render('plugin/list');
});
