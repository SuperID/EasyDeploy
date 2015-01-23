/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var rd = require('rd');
var utils = require('../utils');
var debug = utils.debug('lib:server');


/**
 * 读取Server列表
 *
 * @param {Function} callback
 */
exports.list = function (callback) {
  var list = [];
  rd.eachFileFilter(utils.dataDir('server'), /\.json$/, function (f, s, next) {
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
 * 保存Server信息
 *
 * @param {Object} data
 * @param {Function} callback
 */
exports.save = function (data, callback) {
  if (!data.name) data.name = 'unnamed_' + utils.randomString(10);
  var filename = utils.dataDir('server', data.name + '.json');
  utils.writeJSONFile(filename, data, callback);
};
