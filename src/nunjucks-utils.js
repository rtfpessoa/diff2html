/*
 *
 * Utils (utils.js)
 * Author: rtfpessoa
 *
 */

(function() {

  var path = require('path');

  var nunjucks = require('nunjucks');
  var templatesPath = path.resolve(__dirname, 'templates');

  var diffParser = require('./diff-parser.js').DiffParser;
  var printerUtils = require('./printer-utils.js').PrinterUtils;
  var utils = require('./utils.js').Utils;

  var nunjucksEnv = nunjucks.configure(templatesPath, {"autoescape": false})
    .addGlobal('printerUtils', printerUtils)
    .addGlobal('utils', utils)
    .addGlobal('diffParser', diffParser);

  function NunjucksUtils() {
  }

  NunjucksUtils.prototype.render = function(namespace, view, params) {
    var viewPath = path.join(namespace, view);
    return nunjucksEnv.render(viewPath, params);
  };

  module.exports.NunjucksUtils = new NunjucksUtils();

})();
