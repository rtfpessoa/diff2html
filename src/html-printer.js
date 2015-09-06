/*
 *
 * HtmlPrinter (html-printer.js)
 * Author: rtfpessoa
 *
 */

(function(ctx, undefined) {

  var lineByLinePrinter = require('./line-by-line-printer.js').LineByLinePrinter;
  var sideBySidePrinter = require('./side-by-side-printer.js').SideBySidePrinter;

  function HtmlPrinter() {
  }

  HtmlPrinter.prototype.generateLineByLineJsonHtml = lineByLinePrinter.generateLineByLineJsonHtml;

  HtmlPrinter.prototype.generateSideBySideJsonHtml = sideBySidePrinter.generateSideBySideJsonHtml;

  module.exports['HtmlPrinter'] = new HtmlPrinter();

})(this);
