/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var utils = require('../utils');
var NS = utils.NS;
var router = NS('router');


router.get('/server/:name',
  NS('middleware.check_login'),
function (req, res, next) {
  NS('lib.server').get(req.params.name, function (err, info) {
    if (err) res.locals.error = err;

    res.locals.input = info;
    res.locals.nav = 'servers';
    res.render('server/item');
  });
});

router.get('/servers/new',
  NS('middleware.check_login'),
function (req, res, next) {
  res.locals.input = {};
  res.locals.nav = 'servers';
  res.render('server/item');
});

function saveItem (req, res, next) {
  NS('lib.server').save(req.body, function (err) {
    if (err) {
      res.locals.error = err;
      res.locals.input = req.body;
      res.locals.nav = 'servers';
      res.render('server/item');
    } else {
      res.relativeRedirect('/server/' + req.body.name);
    }
  });
}
router.post('/server/:name',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
saveItem);

router.post('/servers/new',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
saveItem);

router.delete('/server/:name.json',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  NS('lib.server').delete(req.params.name, function (err) {
    if (err) return res.apiError(err);
    res.apiSuccess({name: req.params.name});
  });
});

router.get('/servers',
  NS('middleware.check_login'),
function (req, res, next) {
  res.locals.nav = 'servers';
  res.render('server/list');
});
