/**
 * EasyDeploy Plugin: git-local
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */


module.exports = function (plugin) {

  var path = require('path');
  var NS = plugin.NS;

  plugin.data.register('git_repository_list', function (params, callback) {
    plugin.getStatus(function (err, status) {
      if (err) return res.apiError(err);

      if (!Array.isArray(status.list)) status.list = [];
      status.list.forEach(function (item) {
        item.$plugin = 'git-local';
      });

      callback(null, status.list);
    });
  });

  plugin.data.register('git_repository_commit_list', function (params, callback) {
    callback(null, [
      {
        id: 'aaaaaaaa',
        committer: {name: 'Lei', email: 'lei@www.com'},
        committed_date: new Date(),
        message: 'aaa\nbbb',
        short_message: 'aaa'
      },
      {
        id: 'aaaaaaaa',
        committer: {name: 'Lei', email: 'lei@www.com'},
        committed_date: new Date(),
        message: 'aaa\nbbb',
        short_message: 'aaa'
      }
    ]);
  });

  plugin.data.register('git_repository_branch_list', function (params, callback) {
    callback(null, [
      {name: 'master'},
      {name: 'lei_dev'}
    ]);
  });


  plugin.router.get('/', function (req, res, next) {
    res.sendFile(path.resolve(__dirname, 'setting.html'));
  });

  plugin.router.get('/list.json', function (req, res, next) {
    plugin.dataSource.git_repository_list({}, function (err, ret) {
      if (err) return res.apiError(err);
      res.apiSuccess({list: ret});
    });
  });

  plugin.router.post('/add.json',
    NS('middleware.multiparty'),
    NS('middleware.json'),
    NS('middleware.urlencoded'),
  function (req, res, next) {
    if (!req.body.name) return res.apiError('请指定名称');
    if (!req.body.url) return res.apiError('请指定Git源');

    plugin.getStatus(function (err, status) {
      if (err) return res.apiError(err);

      if (!Array.isArray(status.list)) status.list = [];
      status.list.push({name: req.body.name, url: req.body.url});

      plugin.saveStatus(status, function (err) {
        if (err) return res.apiError(err);

        res.apiSuccess({list: status.list});
      });
    });
  });

};
