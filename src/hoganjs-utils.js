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

  var hoganTemplates;

  var templatesPath = path.resolve(__dirname, 'templates');
  var templatesCache = {};

  function HoganJsUtils() {
    try {
      hoganTemplates = require('./templates/diff2html-templates.js');
    } catch (_ignore) {
      hoganTemplates = {};
    }
  }

  HoganJsUtils.prototype.render = function(namespace, view, params) {
    var templateKey = this._templateKey(namespace, view);

    var template = this._getTemplate(templateKey);
    if (template) {
      return template.render(params);
    }

    return null;
  };

  HoganJsUtils.prototype._getTemplate = function(templateKey) {
    var template = this._readFromCache(templateKey);

    if (!template) {
      template = this._loadTemplate(templateKey);
    }

    return template;
  };

  HoganJsUtils.prototype._loadTemplate = function(templateKey) {
    var template;
    if (fs.readFileSync) {
      var templatePath = path.join(templatesPath, templateKey);
      var templateContent = fs.readFileSync(templatePath + '.mustache', 'utf8');
      template = hogan.compile(templateContent);
      templatesCache[templateKey] = template;
    }

    return template;
  };

  HoganJsUtils.prototype._readFromCache = function(templateKey) {
    return global.browserTemplates && global.browserTemplates[templateKey] ||
      hoganTemplates[templateKey] ||
      templatesCache[templateKey];
  };

  HoganJsUtils.prototype._templateKey = function(namespace, view) {
    return namespace + '-' + view;
  };

  module.exports.HoganJsUtils = new HoganJsUtils();

})();
