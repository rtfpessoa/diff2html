/*
 *
 * Utils (hoganjs-utils.js)
 * Author: rtfpessoa
 *
 */

(function() {
  const fs = require("fs");
  const path = require("path");
  const hogan = require("hogan.js");

  const hoganTemplates = require("./diff2html-templates.js");

  let extraTemplates;

  function HoganJsUtils(configuration) {
    this.config = configuration || {};
    extraTemplates = this.config.templates || {};

    const rawTemplates = this.config.rawTemplates || {};
    for (const templateName in rawTemplates) {
      if (rawTemplates.hasOwnProperty(templateName)) {
        if (!extraTemplates[templateName]) extraTemplates[templateName] = this.compile(rawTemplates[templateName]);
      }
    }
  }

  HoganJsUtils.prototype.render = function(namespace, view, params) {
    const template = this.template(namespace, view);
    if (template) {
      return template.render(params);
    }

    return null;
  };

  HoganJsUtils.prototype.template = function(namespace, view) {
    const templateKey = this._templateKey(namespace, view);

    return this._getTemplate(templateKey);
  };

  HoganJsUtils.prototype._getTemplate = function(templateKey) {
    let template;

    if (!this.config.noCache) {
      template = this._readFromCache(templateKey);
    }

    if (!template) {
      template = this._loadTemplate(templateKey);
    }

    return template;
  };

  HoganJsUtils.prototype._loadTemplate = function(templateKey) {
    let template;

    try {
      if (fs.readFileSync) {
        const templatesPath = path.resolve(__dirname, "templates");
        const templatePath = path.join(templatesPath, templateKey);
        const templateContent = fs.readFileSync(templatePath + ".mustache", "utf8");
        template = hogan.compile(templateContent);
        hoganTemplates[templateKey] = template;
      }
    } catch (e) {
      console.error("Failed to read (template: " + templateKey + ") from fs: " + e.message);
    }

    return template;
  };

  HoganJsUtils.prototype._readFromCache = function(templateKey) {
    return extraTemplates[templateKey] || hoganTemplates[templateKey];
  };

  HoganJsUtils.prototype._templateKey = function(namespace, view) {
    return namespace + "-" + view;
  };

  HoganJsUtils.prototype.compile = function(templateStr) {
    return hogan.compile(templateStr);
  };

  module.exports.HoganJsUtils = HoganJsUtils;
})();
