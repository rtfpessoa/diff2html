/*
 *
 * HtmlPrinter (html-printer.js)
 * Author: rtfpessoa
 *
 */

(function (ctx, undefined) {

  var lineByLinePrinter = require("./line-by-line-printer.js").LineByLinePrinter;
  var sideBySidePrinter = require("./side-by-side-printer.js").SideBySidePrinter;

  function HtmlPrinter() {
  }

  HtmlPrinter.prototype.generateLineByLineJsonHtml = lineByLinePrinter.generateLineByLineJsonHtml;

  HtmlPrinter.prototype.generateSideBySideJsonHtml = sideBySidePrinter.generateSideBySideJsonHtml;

  // expose this module
  ((typeof module !== 'undefined' && module.exports) ||
  (typeof exports !== 'undefined' && exports) ||
  (typeof window !== 'undefined' && window) ||
  (typeof self !== 'undefined' && self) ||
  (typeof $this !== 'undefined' && $this) ||
  Function('return this')())["HtmlPrinter"] = new HtmlPrinter();

})(this);
