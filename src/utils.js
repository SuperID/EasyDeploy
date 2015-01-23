/**
 * EasyDeploy
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var utils = require('lei-utils');
exports = module.exports = utils;
var leiNS = require('lei-ns');
var clone = require('clone');
var debug = require('debug');
var DEFAULT_CONFIG = require('./default_config');


utils.NS = leiNS.Namespace();

utils.debug = function (name) {
  return debug('easydeploy:' + name);
};

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
