/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var utils = require('lei-utils');
exports = module.exports = utils;
var leiNS = require('lei-ns');
var clone = require('clone');
var mkdirp = require('mkdirp');
var createDebug = require('debug');
var DEFAULT_CONFIG = require('./default_config');


utils.NS = leiNS.Namespace();

utils.debug = function (name) {
  return createDebug('easydeploy:' + name);
};

var debug = utils.debug('utils');

/**
 * 从环境变量中获取配置信息
 */
utils.getConfigFromEnv = function () {
  var ret = {};
  function formatName (b) {
    b = b.map(function (v) {
      return v.toLowerCase();
    });
    if (b.length < 2) {
      return b[0];
    } else {
      return b[0] + b.slice(1).map(function (v) {
        if (v.length < 2) return v;
        return v[0].toUpperCase() + v.slice(1);
      }).join('');
    }
  }
  Object.keys(process.env).forEach(function (k) {
    var b = k.toUpperCase().split('_');
    if (b[0] === 'EASYDEPLOY') {
      ret[formatName(b.slice(1))] = process.env[k];
    }
  });
  return ret;
};

/**
 * 合并默认配置
 *
 * @param {Object} config
 * @return {Object}
 */
utils.mergeDefaultConfig = function (config) {
  return utils.merge(clone(DEFAULT_CONFIG), clone(config));
};

/**
 * 取数据目录
 *
 * @param {String} paths
 * @return {String}
 */
utils.dataDir = function () {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(utils.NS('config.dataDir'));
  return path.resolve.apply(null, args);
};

/**
 * 读取JSON文件
 *
 * @param {String} filename
 * @param {Function} callback
 */
utils.readJSONFile = function (filename, callback) {
  fs.readFile(filename, function (err, content) {
    if (err) return callback(err);
    content = content.toString();
    try {
      var data = JSON.parse(content);
    } catch (err) {
      err.content = content;
      return callback(err, content);
    }
    callback(null, data);
  });
};

/**
 * 输出JSON文件
 *
 * @param {String} filename
 * @param {Mixed} data
 * @param {Function} callback
 */
utils.writeJSONFile = function (filename, data, callback) {
  mkdirp(path.dirname(filename), function (err) {
    if (err) return callback(err);

    try {
      var content = JSON.stringify(data);
    } catch (err) {
      err.data = data;
      return callback(err);
    }

    fs.writeFile(filename, content, callback);
  });
};

/**
 * 处理回调函数，如果出错返回预设的默认值
 *
 * @param {Function} callback
 * @param {Mixed} v
 */
utils.defaultErrorValue = function (callback, v) {
  v = v || '#Error#';
  return function (err, ret) {
    if (err) {
      console.error(err.stack);
      return callback(null, v);
    }
    if (typeof ret === 'undefined') {
      ret = v;
    }
    callback(null, ret);
  }
};

/**
 * 删除指定文件
 *
 * @param {String} filename
 * @param {Function} callback
 */
utils.deleteFile = function (filename, callback) {
  debug('delete file: %s', filename);
  fs.unlink(filename, callback);
};
