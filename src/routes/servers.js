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
    if (err) res.locals.error = err;

    res.locals.input = req.body;
    res.locals.nav = 'servers';
    res.render('server/item');
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

