/*
 *
 * Diff to HTML (diff2html.js)
 * Author: rtfpessoa
 *
 */

(function() {
  var diffParser = require('./diff-parser.js').DiffParser;
  var htmlPrinter = require('./html-printer.js').HtmlPrinter;
  var utils = require('./utils.js').Utils;

  function Diff2Html() {
  }

  var defaultConfig = {
    wordByWord: true,
    outputFormat: 'line-by-line',
    matching: 'none',
    matchWordsThreshold: 0.25,
    matchingMaxComparisons: 2500,
    maxLineLengthHighlight: 10000
  };

  /*
   * Generates json object from string diff input
   */
  Diff2Html.prototype.getJsonFromDiff = function(diffInput, config) {
    var cfg = utils.safeConfig(config, defaultConfig);
    return diffParser.generateDiffJson(diffInput, cfg);
  };

  /*
   * Generates the html diff. The config parameter configures the output/input formats and other options
   */
  Diff2Html.prototype.getPrettyHtml = function(diffInput, config) {
    var cfg = utils.safeConfig(config, defaultConfig);

    var diffJson = diffInput;
    if (!cfg.inputFormat || cfg.inputFormat === 'diff') {
      diffJson = diffParser.generateDiffJson(diffInput, cfg);
    }

    var fileList = '';
    if (cfg.showFiles === true) {
      fileList = htmlPrinter.generateFileListSummary(diffJson, cfg);
    }

    var diffOutput = '';
    if (cfg.outputFormat === 'side-by-side') {
      diffOutput = htmlPrinter.generateSideBySideJsonHtml(diffJson, cfg);
    } else {
      diffOutput = htmlPrinter.generateLineByLineJsonHtml(diffJson, cfg);
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
    var cfg = utils.safeConfig(config, defaultConfig);
    cfg.inputFormat = 'diff';
    cfg.outputFormat = 'line-by-line';
    return this.getPrettyHtml(diffInput, cfg);
  };

  /*
   * Generates pretty html from a json object
   */
  Diff2Html.prototype.getPrettyHtmlFromJson = function(diffJson, config) {
    var cfg = utils.safeConfig(config, defaultConfig);
    cfg.inputFormat = 'json';
    cfg.outputFormat = 'line-by-line';
    return this.getPrettyHtml(diffJson, cfg);
  };

  /*
   * Generates pretty side by side html from string diff input
   */
  Diff2Html.prototype.getPrettySideBySideHtmlFromDiff = function(diffInput, config) {
    var cfg = utils.safeConfig(config, defaultConfig);
    cfg.inputFormat = 'diff';
    cfg.outputFormat = 'side-by-side';
    return this.getPrettyHtml(diffInput, cfg);
  };

  /*
   * Generates pretty side by side html from a json object
   */
  Diff2Html.prototype.getPrettySideBySideHtmlFromJson = function(diffJson, config) {
    var cfg = utils.safeConfig(config, defaultConfig);
    cfg.inputFormat = 'json';
    cfg.outputFormat = 'side-by-side';
    return this.getPrettyHtml(diffJson, cfg);
  };

  var diffObject = new Diff2Html();
  module.exports.Diff2Html = diffObject;

  // Expose diff2html in the browser
  global.Diff2Html = diffObject;
})();
