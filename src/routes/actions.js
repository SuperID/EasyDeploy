/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var utils = require('../utils');
var NS = utils.NS;
var router = NS('router');


router.get('/action/:name',
  NS('middleware.check_login'),
function (req, res, next) {
  NS('lib.action').get(req.params.name, function (err, info) {
    if (err) res.locals.error = err;

    res.locals.input = info;
    res.locals.nav = 'actions';
    res.render('action/item');
  });
});

router.get('/actions/new',
  NS('middleware.check_login'),
function (req, res, next) {
  res.locals.input = {};
  res.locals.nav = 'actions';
  res.render('action/item');
});

function saveItem (req, res, next) {
  NS('lib.action').save(req.body, function (err) {
    if (err) {
      res.locals.error = err;
      res.locals.input = req.body;
      res.locals.nav = 'actions';
      res.render('action/item');
    } else {
      res.relativeRedirect('/action/' + req.body.name);
    }
  });
}
router.post('/action/:name',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
saveItem);

router.post('/actions/new',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
saveItem);

router.delete('/action/:name.json',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  NS('lib.action').delete(req.params.name, function (err) {
    if (err) return res.apiError(err);
    res.apiSuccess({name: req.params.name});
  });
});

router.get('/actions',
  NS('middleware.check_login'),
function (req, res, next) {
  res.locals.nav = 'actions';
  res.render('action/list');
});
