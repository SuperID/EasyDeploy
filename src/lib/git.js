/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var rd = require('rd');
var git = require('git');
var utils = require('../utils');
var debug = utils.debug('lib:git');


function EasyDeployGitClient (project) {
  this.project = project;
  this.dir = utils.dataDir('git', project.repositoryLocalTemp);
  this.debug = utils.debug('lib:git:' + project.name);
  this.debug('created');
}

EasyDeployGitClient.prototype.init = function (callback) {
  var cmd = 'git clone ' + this.project.repository + ' ' + this.project.repositoryLocalTemp;
  this.debug('init: %s', cmd);
  child_process.exec(cmd, {
    cwd: path.dirname(this.dir)
  }, function (err, stdout, stderr) {
    if (err) return callback(err);
    callback(null, 'stdout:\n' + stdout + '\n\nstderr:\n' + stderr);
  });
};

EasyDeployGitClient.prototype._initBefore = function (callback) {
  if (this.repo) return callback(null, this.repo, this);
  var me = this;

  fs.exists(this.dir, function (exists) {
    if (exists) {
      openRepo();
    } else {
      me.init(function (err, out) {
        if (err) return callback(err);
        console.log(out);
        openRepo();
      });
    }
  });

  function openRepo () {
    switchBranch(function () {
      me.debug('open repo');
      new git.Repo(me.dir, function (err, repo) {
        if (err) return callback(err);
        me.repo = repo;
        callback(null, me.repo, me);
      });
    });
  }

  function switchBranch (callback) {
    var cmd = 'git checkout origin/' + me.project.branch;
    me.debug('switch branch: %s', cmd);
    child_process.exec(cmd, {
      cwd: me.dir
    }, function (err, stdout, stderr) {
      if (err) return callback(err);
      callback(null, 'stdout:\n' + stdout + '\n\nstderr:\n' + stderr);
    });
  }
};

EasyDeployGitClient.prototype.commits = function (callback) {
  this._initBefore(function (err, repo, me) {
    if (err) return callback(err);
    me.debug('commits');
    repo.log(callback);
  });
};


module.exports = EasyDeployGitClient;
