/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var rd = require('rd');
var async = require('async');
var utils = require('../utils');
var debug = utils.debug('lib:plugin');


/**
 * 读取插件列表
 *
 * @param {Function} callback
 */
exports.list = function (callback) {
  fs.readdir(utils.pluginDir('.'), function (err, list1) {
    if (err) return callback(err);

    list1 = list1.map(function (n) {
      return {
        name: n,
        path: utils.pluginDir(n)
      };
    });
    debug('list plugin dir: %s', list1.length);

    fs.readdir(utils.sourceDir('default_plugin'), function (err, list2) {
      if (err) return callback(err);

      list2 = list2.map(function (n) {
        return {
          name: n,
          path: utils.sourceDir('default_plugin', n)
        };
      });
      debug('list default plugin dir: %s', list2.length);

      var list = [];
      async.eachSeries(list1.concat(list2), function (item, next) {

        fs.stat(item.path, function (err, stats) {
          if (err) return next(err);
          if (!stats.isDirectory()) return next();

          utils.readJSONFile(path.resolve(item.path, 'package.json'), function (err, info) {
            if (err) return next(err);

            item.info = info;
            item.name = info.name;
            list.push(item);
            next();
          });
        });

      }, function (err) {
        callback(err, list);
      })
    });
  });
};

/**
 * 根据插件名称取插件的路径
 *
 * @param {String} name
 * @param {Function} callback
 */
exports.resolvePath = function (name, callback) {
  var dir = utils.pluginDir(name);
  fs.exists(dir, function (exists) {
    if (exists) return callback(null, dir);

    var dir = utils.sourceDir('default_plugin', name);
    fs.exists(dir, function (exists) {
      if (exists) return callback(null, dir);

      callback(new Error('could not resolved plugin `' + name + '`'));
    });
  });
};

/**
 * 取插件的package信息
 *
 * @param {String} name
 * @param {Function} callback
 */
exports.getPackageInfo = function (name, callback) {
  exports.resolvePath(name, function (err, dir) {
    if (err) return callback(err);

    utils.readJSONFile(path.resolve(dir, 'package.json'), callback);
  });
};

/**
 * 保存Project信息
 *
 * @param {Object} data
 * @param {Function} callback
 */
exports.save = function (data, callback) {
  if (!data.name) data.name = 'unnamed_' + utils.randomString(10);

  exports.get(data.name, function (err, ret) {
    if (ret) {
      data = utils.merge(ret, data);
    }

    var filename = utils.dataDir('plugin', data.name + '.json');
    utils.writeJSONFile(filename, data, callback);
  });
};

/**
 * 读取指定name
 *
 * @param {String} name
 * @param {Function} callback
 */
exports.get = function (name, callback) {
  var filename = utils.dataDir('plugin', name + '.json');
  utils.readJSONFile(filename, function (err, ret) {
    if (err) {
      if (err.code === 'ENOENT') return callback(null, {name: name});
      return callback(err);
    }

    debug('get: name [%s]', name, filename);
    callback(null, ret);
  });
};

/**
 * 启用插件
 *
 * @param {String} name
 * @param {Function} callback
 */
exports.enable = function (name, callback) {
  exports.get(name, function (err, data) {
    if (err) return callback(err);

    data.enable = true;
    exports.save(data, callback);
  });
};

/**
 * 停用插件
 *
 * @param {String} name
 * @param {Function} callback
 */
exports.disable = function (name, callback) {
  exports.get(name, function (err, data) {
    if (err) return callback(err);

    data.enable = false;
    exports.save(data, callback);
  });
};

