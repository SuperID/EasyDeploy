/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var utils = require('../utils');
var NS = utils.NS;
var router = NS('router');


router.get('/project/:name',
  NS('middleware.check_login'),
function (req, res, next) {
  NS('lib.project').get(req.params.name, function (err, info) {
    if (err) res.locals.error = err;

    res.locals.input = info;
    res.locals.project = info;
    res.locals.nav = 'projects';
    res.render('project/item');
  });
});

router.get('/projects/new',
  NS('middleware.check_login'),
function (req, res, next) {
  res.locals.input = {};
  res.locals.nav = 'projects';
  res.render('project/item');
});

function saveItem (req, res, next) {
  NS('lib.project').save(req.body, function (err) {
    if (err) {
      res.locals.error = err;
      res.locals.input = req.body;
      res.locals.nav = 'projects';
      res.render('project/item');
    } else {
      res.relativeRedirect('/project/' + req.body.name);
    }
  });
}
router.post('/project/:name',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
saveItem);

router.post('/projects/new',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
saveItem);

router.delete('/project/:name.json',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  NS('lib.project').delete(req.params.name, function (err) {
    if (err) return res.apiError(err);
    res.apiSuccess({name: req.params.name});
  });
});

router.get('/projects',
  NS('middleware.check_login'),
function (req, res, next) {
  res.locals.nav = 'projects';
  res.render('project/list');
});

function addServer (req, res, next) {
  NS('lib.project').get(req.params.name, function (err, info) {
    if (err) res.locals.error = err;

    res.locals.project = info;
    res.locals.nav = 'projects';
    res.render('project/add_server');
  });
}

router.get('/project/:name/servers/add',
  NS('middleware.check_login'),
addServer);

router.post('/project/:name/servers/add',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  NS('lib.project').addServer(req.params.name, req.body, function (err) {
    if (err) {
      res.locals.error = err;
      addServer(req, res, next);
    } else {
      res.relativeRedirect('/project/' + req.params.name);
    }
  });
});
