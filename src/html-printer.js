/*
 *
 * HtmlPrinter (html-printer.js)
 * Author: rtfpessoa
 *
 */

(function() {

  var LineByLinePrinter = require('./line-by-line-printer.js').LineByLinePrinter;
  var sideBySidePrinter = require('./side-by-side-printer.js').SideBySidePrinter;

  function HtmlPrinter() {
  }

  HtmlPrinter.prototype.generateLineByLineJsonHtml = function(diffFiles, config) {
    var lineByLinePrinter = new LineByLinePrinter(config);
    return lineByLinePrinter.generateLineByLineJsonHtml(diffFiles);
  };

  HtmlPrinter.prototype.generateSideBySideJsonHtml = sideBySidePrinter.generateSideBySideJsonHtml;

  module.exports.HtmlPrinter = new HtmlPrinter();

})();
