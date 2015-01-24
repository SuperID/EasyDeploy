/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var rd = require('rd');
var utils = require('../utils');
var debug = utils.debug('lib:action');


/**
 * 读取Action列表
 *
 * @param {Function} callback
 */
exports.list = function (callback) {
  var list = [];
  rd.eachFileFilter(utils.dataDir('action'), /\.json$/, function (f, s, next) {
    utils.readJSONFile(f, function (err, data) {
      if (err) return next(err);
      list.push(data);
      next();
    });
  }, function (err) {
    callback(err, list);
  });
};

/**
 * 保存Action信息
 *
 * @param {Object} data
 * @param {Function} callback
 */
exports.save = function (data, callback) {
  if (!data.name) data.name = 'unnamed_' + utils.randomString(10);
  var filename = utils.dataDir('action', data.name + '.json');
  utils.writeJSONFile(filename, data, callback);
};

/**
 * 读取指定name
 *
 * @param {String} name
 * @param {Function} callback
 */
exports.get = function (name, callback) {
  var filename = utils.dataDir('action', name + '.json');
  utils.readJSONFile(filename, callback);
};

/**
 * 删除指定name
 *
 * @param {String} name
 * @param {Function} callback
 */
exports.delete = function (name, callback) {
  var filename = utils.dataDir('action', name + '.json');
  utils.deleteFile(filename, callback);
};
