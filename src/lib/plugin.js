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

