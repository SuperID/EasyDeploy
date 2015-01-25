/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var utils = require('../utils');
var NS = utils.NS;
var router = NS('router');
var io = NS('io');
var async = require('async');
var SSHClient = require('lei-ssh');
var tinyliquid = require('tinyliquid');


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

router.get('/project/:name/server/:id',
  NS('middleware.check_login'),
function (req, res, next) {
  NS('lib.project').getServerById(req.params.name, req.params.id, function (err, ret) {
    if (err) res.locals.error = err;

    res.locals.input = ret;
    addServer(req, res, next);
  });
});

function saveServer (req, res, next) {
  NS('lib.project').addServer(req.params.name, req.body, function (err) {
    if (err) {
      res.locals.error = err;
      addServer(req, res, next);
    } else {
      res.relativeRedirect('/project/' + req.params.name);
    }
  });
}

router.post('/project/:name/servers/add',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
saveServer);

router.post('/project/:name/server/:id',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
saveServer);

router.delete('/project/:name/server/:id.json',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  NS('lib.project').deleteServerById(req.params.name, req.params.id, function (err) {
    if (err) return res.apiError(err);
    res.apiSuccess({name: req.params.name, id: req.params.id});
  });
});

// -----------------------------------------------------------------------------

var executeTasks = {};

function generateExecCommands (task, callback) {
  var context = tinyliquid.newContext();
  context.setLocals('project', task.projectInfo);
  context.setLocals('deploy', task.deployInfo);
  context.setLocals('server', task.serverInfo);
  context.setLocals('action', task.actionInfo);
  tinyliquid.run('cd {{deploy.path}}\n' + task.actionInfo.list, context, function (err) {
    if (err) return callback(err);

    task.commands = context.getBuffer();
    callback(null);
  });
}

router.post('/project/:name/execute.json',
  NS('middleware.check_login'),
  NS('middleware.multiparty'),
  NS('middleware.json'),
  NS('middleware.urlencoded'),
function (req, res, next) {
  var id = utils.randomString(30);
  executeTasks[id] = {
    id: id,
    project: req.params.name,
    deployId: req.body.id,
    action: req.body.action
  };
  res.apiSuccess({url: res.getRelativeRedirect('/project/' + req.params.name + '/execute/realtime/' + id)});
});

router.get('/project/:name/execute/realtime/:id',
  NS('middleware.check_login'),
function (req, res, next) {
  var task = executeTasks[req.params.id];
  async.series([
    function (next) {
      if (!task) return next(new Error('invalid task'));
      next();
    },
    function (next) {
      NS('lib.project').get(req.params.name, function (err, ret) {
        res.locals.project = task.projectInfo = ret;
        next(err);
      });
    },
    function (next) {
      NS('lib.project').getServerById(req.params.name, task.deployId, function (err, ret) {
        res.locals.deploy_server = task.deployInfo = ret;
        next(err);
      });
    },
    function (next) {
      NS('lib.action').get(task.action, function (err, ret) {
        res.locals.action = task.actionInfo = ret;
        next(err);
      });
    },
    function (next) {
      NS('lib.server').get(task.deployInfo.name, function (err, ret) {
        res.locals.server = task.serverInfo = ret;
        next(err);
      });
    }
  ], function (err) {
    if (err) res.locals.error = err;

    generateExecCommands(task, function (err) {
      if (err) res.locals.error = err;

      res.locals.task = task;
      res.locals.nav = 'projects';
      res.render('project/execute');
    });

  });
});

io.on('connection', function (socket) {
  var task;

  socket.emit('error log', '已建立连接...\n');

  socket.on('task id', function (id) {
    task = executeTasks[id];
    if (!task) return socket.emit('error log', '任务' + id + '不存在!');

    if (task.stream) {
      listenStream();
    } else {
      var options = {
        host: task.serverInfo.host,
        port: task.serverInfo.port,
        username: task.serverInfo.user,
        privateKey: task.serverInfo.key.trim()
      };
      task.ssh = new SSHClient(options);
      task.ssh.connect(function (err) {
        if (err) return socket.emit('error log', '连接到远程服务器失败: ' + err);

        var commands = task.commands.split('\n').map(function (item) {
          return item.trim();
        }).filter(function (item) {
          return item;
        });
        task.ssh.exec(commands, function (err, stream) {
          if (err) return socket.emit('error log', '执行命令失败: ' + err);

          task.stream = stream;
          listenStream();
        });
      });
    }
  });

  function listenStream () {
    task.stream.on('data', function (chunk) {
      socket.emit('log', chunk.toString());
    });
    task.stream.on('end', function () {
      socket.emit('error log', '结束.');
    });
  }
});
