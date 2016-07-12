/*
 *
 * Utils (hoganjs-utils.js)
 * Author: rtfpessoa
 *
 */

(function() {
  var fs = require('fs');
  var path = require('path');

  var hogan = require('hogan.js');

  var hoganTemplates = require('./templates/diff2html-templates.js');

  var templatesPath = path.resolve(__dirname, 'templates');

  function HoganJsUtils() {
  }

  HoganJsUtils.prototype.render = function(namespace, view, params, configuration) {
    var template = this.template(namespace, view, configuration);
    if (template) {
      return template.render(params);
    }

    return null;
  };

  HoganJsUtils.prototype.template = function(namespace, view, configuration) {
    var config = configuration || {};
    var templateKey = this._templateKey(namespace, view);

    return this._getTemplate(templateKey, config);
  };

  HoganJsUtils.prototype._getTemplate = function(templateKey, config) {
    var template;

    if (!config.noCache) {
      template = this._readFromCache(templateKey);
    }

    if (!template) {
      template = this._loadTemplate(templateKey);
    }

    return template;
  };

  HoganJsUtils.prototype._loadTemplate = function(templateKey) {
    var template;

    try {
      if (fs.readFileSync) {
        var templatePath = path.join(templatesPath, templateKey);
        var templateContent = fs.readFileSync(templatePath + '.mustache', 'utf8');
        template = hogan.compile(templateContent);
        hoganTemplates[templateKey] = template;
      }
    } catch (e) {
      console.error('Failed to read (template: ' + templateKey + ') from fs: ' + e.message);
    }

    return template;
  };

  HoganJsUtils.prototype._readFromCache = function(templateKey) {
    return hoganTemplates[templateKey];
  };

  HoganJsUtils.prototype._templateKey = function(namespace, view) {
    return namespace + '-' + view;
  };

  module.exports.HoganJsUtils = new HoganJsUtils();
})();
