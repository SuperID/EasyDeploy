/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var rd = require('rd');
var utils = require('../utils');
var debug = utils.debug('lib:project');


/**
 * 读取Project列表
 *
 * @param {Function} callback
 */
exports.list = function (callback) {
  var list = [];
  rd.eachFileFilter(utils.dataDir('project'), /\.json$/, function (f, s, next) {
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

    var filename = utils.dataDir('project', data.name + '.json');
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
  var filename = utils.dataDir('project', name + '.json');
  utils.readJSONFile(filename, callback);
};

/**
 * 删除指定name
 *
 * @param {String} name
 * @param {Function} callback
 */
exports.delete = function (name, callback) {
  var filename = utils.dataDir('project', name + '.json');
  utils.deleteFile(filename, callback);
};

/**
 * 添加部署服务器
 *
 * @param {String} name
 * @param {Object} data
 * @param {Function} callback
 */
exports.addServer = function (name, data, callback) {
  exports.get(name, function (err, project) {
    if (err) return callback(err);

    if (!data.id) data.id = utils.randomString(10);
    if (!Array.isArray(project.servers)) {
      project.servers = [data];
    } else {
      var isExist = false;
      project.servers = project.servers.map(function (item) {
        if (item.id === data.id) {
          isExist = true;
          return data;
        } else {
          return item;
        }
      });
      if (!isExist) {
        project.servers.push(data);
      }
    }

    exports.save(project, callback);
  });
};
