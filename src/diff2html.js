/*
 *
 * Diff to HTML (diff2html.js)
 * Author: rtfpessoa
 *
 * Diff commands:
 *   git diff
 */

(function (global, undefined) {

  var diffParser = require("./diff-parser.js").DiffParser;
  var htmlPrinter = require("./html-printer.js").HtmlPrinter;

  function Diff2Html() {
  }

  /*
   * config
   * {
   * "wordByWord" : true (default)
   * OR
   * "charByChar" : true
   * }
   *
   */

  /*
   * Generates pretty html from string diff input
   */
  Diff2Html.prototype.getPrettyHtmlFromDiff = function (diffInput, config) {
    var diffJson = diffParser.generateDiffJson(diffInput);

    var configOrEmpty = config || {};
    return htmlPrinter.generateLineByLineJsonHtml(diffJson, configOrEmpty);
  };

  /*
   * Generates json object from string diff input
   */
  Diff2Html.prototype.getJsonFromDiff = function (diffInput) {
    return diffParser.generateDiffJson(diffInput);
  };

  /*
   * Generates pretty html from a json object
   */
  Diff2Html.prototype.getPrettyHtmlFromJson = function (diffJson, config) {
    var configOrEmpty = config || {};
    return htmlPrinter.generateLineByLineJsonHtml(diffJson, configOrEmpty);
  };

  /*
   * Generates pretty side by side html from string diff input
   */
  Diff2Html.prototype.getPrettySideBySideHtmlFromDiff = function (diffInput, config) {
    var diffJson = diffParser.generateDiffJson(diffInput);

    var configOrEmpty = config || {};
    return htmlPrinter.generateSideBySideJsonHtml(diffJson, configOrEmpty);
  };

  /*
   * Generates pretty side by side html from a json object
   */
  Diff2Html.prototype.getPrettySideBySideHtmlFromJson = function (diffJson, config) {
    var configOrEmpty = config || {};
    return htmlPrinter.generateSideBySideJsonHtml(diffJson, configOrEmpty);
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Diff2Html = new Diff2Html();
  } else if (typeof global.Diff2Html === 'undefined') {
    global.Diff2Html = new Diff2Html();
  }

})(this);
