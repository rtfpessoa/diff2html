/*
 *
 * Diff to HTML (diff2html.js)
 * Author: rtfpessoa
 *
 */

(function() {
  var diffParser = require('./diff-parser.js').DiffParser;
  var htmlPrinter = require('./html-printer.js').HtmlPrinter;

  function Diff2Html() {
  }

  /*
   * Line diff type configuration
   var config = {
   'wordByWord': true, // (default)
   // OR
   'charByChar': true
   };
   */

  /*
   * Generates json object from string diff input
   */
  Diff2Html.prototype.getJsonFromDiff = function(diffInput, config) {
    var configOrEmpty = config || {};
    return diffParser.generateDiffJson(diffInput, configOrEmpty);
  };

  /*
   * Generates the html diff. The config parameter configures the output/input formats and other options
   */
  Diff2Html.prototype.getPrettyHtml = function(diffInput, config) {
    var configOrEmpty = config || {};

    var diffJson = diffInput;
    if (!configOrEmpty.inputFormat || configOrEmpty.inputFormat === 'diff') {
      diffJson = diffParser.generateDiffJson(diffInput, configOrEmpty);
    }

    var fileList = '';
    if (configOrEmpty.showFiles === true) {
      fileList = htmlPrinter.generateFileListSummary(diffJson, configOrEmpty);
    }

    var diffOutput = '';
    if (configOrEmpty.outputFormat === 'side-by-side') {
      diffOutput = htmlPrinter.generateSideBySideJsonHtml(diffJson, configOrEmpty);
    } else {
      diffOutput = htmlPrinter.generateLineByLineJsonHtml(diffJson, configOrEmpty);
    }

    return fileList + diffOutput;
  };

  /*
   * Deprecated methods - The following methods exist only to maintain compatibility with previous versions
   */

  /*
   * Generates pretty html from string diff input
   */
  Diff2Html.prototype.getPrettyHtmlFromDiff = function(diffInput, config) {
    var configOrEmpty = config || {};
    configOrEmpty.inputFormat = 'diff';
    configOrEmpty.outputFormat = 'line-by-line';
    return this.getPrettyHtml(diffInput, configOrEmpty);
  };

  /*
   * Generates pretty html from a json object
   */
  Diff2Html.prototype.getPrettyHtmlFromJson = function(diffJson, config) {
    var configOrEmpty = config || {};
    configOrEmpty.inputFormat = 'json';
    configOrEmpty.outputFormat = 'line-by-line';
    return this.getPrettyHtml(diffJson, configOrEmpty);
  };

  /*
   * Generates pretty side by side html from string diff input
   */
  Diff2Html.prototype.getPrettySideBySideHtmlFromDiff = function(diffInput, config) {
    var configOrEmpty = config || {};
    configOrEmpty.inputFormat = 'diff';
    configOrEmpty.outputFormat = 'side-by-side';
    return this.getPrettyHtml(diffInput, configOrEmpty);
  };

  /*
   * Generates pretty side by side html from a json object
   */
  Diff2Html.prototype.getPrettySideBySideHtmlFromJson = function(diffJson, config) {
    var configOrEmpty = config || {};
    configOrEmpty.inputFormat = 'json';
    configOrEmpty.outputFormat = 'side-by-side';
    return this.getPrettyHtml(diffJson, configOrEmpty);
  };

  var diffObject = new Diff2Html();
  module.exports.Diff2Html = diffObject;

  // Expose diff2html in the browser
  global.Diff2Html = diffObject;
})();
