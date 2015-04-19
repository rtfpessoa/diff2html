/*
 *
 * HtmlPrinter (html-printer.js)
 * Author: rtfpessoa
 *
 */

(function (global, undefined) {

  var lineByLinePrinter = require("./line-by-line-printer.js").LineByLinePrinter;
  var sideBySidePrinter = require("./side-by-side-printer.js").SideBySidePrinter;

  function HtmlPrinter() {
  }

  HtmlPrinter.prototype.generateLineByLineJsonHtml = lineByLinePrinter.generateLineByLineJsonHtml;

  HtmlPrinter.prototype.generateSideBySideJsonHtml = sideBySidePrinter.generateSideBySideJsonHtml;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports.HtmlPrinter = new HtmlPrinter();
  } else if (typeof global.HtmlPrinter === 'undefined') {
    global.HtmlPrinter = new HtmlPrinter();
  }

})(this);
