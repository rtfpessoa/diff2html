/*
 *
 * LineByLinePrinter (line-by-line-printer.js)
 * Author: rtfpessoa
 *
 */

(function() {
  var diffParser = require('./diff-parser.js').DiffParser;
  var printerUtils = require('./printer-utils.js').PrinterUtils;
  var utils = require('./utils.js').Utils;
  var Rematch = require('./rematch.js').Rematch;

  var hoganUtils;

  var genericTemplatesPath = 'generic';
  var baseTemplatesPath = 'line-by-line';
  var iconsBaseTemplatesPath = 'icon';
  var tagsBaseTemplatesPath = 'tag';

  function LineByLinePrinter(config) {
    this.config = config;

    var HoganJsUtils = require('./hoganjs-utils.js').HoganJsUtils;
    hoganUtils = new HoganJsUtils(config);
  }

  LineByLinePrinter.prototype.makeFileDiffHtml = function(file, diffs) {
    var fileDiffTemplate = hoganUtils.template(baseTemplatesPath, 'file-diff');
    var filePathTemplate = hoganUtils.template(genericTemplatesPath, 'file-path');
    var fileIconTemplate = hoganUtils.template(iconsBaseTemplatesPath, 'file');
    var fileTagTemplate = hoganUtils.template(tagsBaseTemplatesPath, printerUtils.getFileTypeIcon(file));

    return fileDiffTemplate.render({
      file: file,
      fileHtmlId: printerUtils.getHtmlId(file),
      diffs: diffs,
      filePath: filePathTemplate.render({
        fileDiffName: printerUtils.getDiffName(file)
      }, {
        fileIcon: fileIconTemplate,
        fileTag: fileTagTemplate
      })
    });
  };

  LineByLinePrinter.prototype.makeLineByLineHtmlWrapper = function(content) {
    return hoganUtils.render(genericTemplatesPath, 'wrapper', {'content': content});
  };

  LineByLinePrinter.prototype.generateLineByLineJsonHtml = function(diffFiles) {
    var that = this;
    var htmlDiffs = diffFiles.map(function(file) {
      var diffs;
      if (file.blocks.length) {
        diffs = that._generateFileHtml(file);
      } else {
        diffs = that._generateEmptyDiff();
      }
      return that.makeFileDiffHtml(file, diffs);
    });

    return this.makeLineByLineHtmlWrapper(htmlDiffs.join('\n'));
  };

  var matcher = Rematch.rematch(function(a, b) {
    var amod = a.content.substr(1);
    var bmod = b.content.substr(1);

    return Rematch.distance(amod, bmod);
  });

  LineByLinePrinter.prototype.makeColumnLineNumberHtml = function(block) {
    return hoganUtils.render(genericTemplatesPath, 'column-line-number', {
      diffParser: diffParser,
      blockHeader: utils.escape(block.header),
      lineClass: 'd2h-code-linenumber',
      contentClass: 'd2h-code-line'
    });
  };

  LineByLinePrinter.prototype._generateFileHtml = function(file) {
    var that = this;
    return file.blocks.map(function(block) {
      var lines = that.makeColumnLineNumberHtml(block);
      var oldLines = [];
      var newLines = [];

      function processChangeBlock() {
        var matches;
        var insertType;
        var deleteType;

        var comparisons = oldLines.length * newLines.length;
        var maxComparisons = that.config.matchingMaxComparisons || 2500;
        var doMatching = comparisons < maxComparisons && (that.config.matching === 'lines' ||
          that.config.matching === 'words');

        if (doMatching) {
          matches = matcher(oldLines, newLines);
          insertType = diffParser.LINE_TYPE.INSERT_CHANGES;
          deleteType = diffParser.LINE_TYPE.DELETE_CHANGES;
        } else {
          matches = [[oldLines, newLines]];
          insertType = diffParser.LINE_TYPE.INSERTS;
          deleteType = diffParser.LINE_TYPE.DELETES;
        }

        matches.forEach(function(match) {
          oldLines = match[0];
          newLines = match[1];

          var processedOldLines = [];
          var processedNewLines = [];

          var common = Math.min(oldLines.length, newLines.length);

          var oldLine, newLine;
          for (var j = 0; j < common; j++) {
            oldLine = oldLines[j];
            newLine = newLines[j];

            that.config.isCombined = file.isCombined;
            var diff = printerUtils.diffHighlight(oldLine.content, newLine.content, that.config);

            processedOldLines +=
              that.makeLineHtml(file.isCombined, deleteType, oldLine.oldNumber, oldLine.newNumber,
                diff.first.line, diff.first.prefix);
            processedNewLines +=
              that.makeLineHtml(file.isCombined, insertType, newLine.oldNumber, newLine.newNumber,
                diff.second.line, diff.second.prefix);
          }

          lines += processedOldLines + processedNewLines;
          lines += that._processLines(file.isCombined, oldLines.slice(common), newLines.slice(common));
        });

        oldLines = [];
        newLines = [];
      }

      for (var i = 0; i < block.lines.length; i++) {
        var line = block.lines[i];
        var escapedLine = utils.escape(line.content);

        if (line.type !== diffParser.LINE_TYPE.INSERTS &&
          (newLines.length > 0 || (line.type !== diffParser.LINE_TYPE.DELETES && oldLines.length > 0))) {
          processChangeBlock();
        }

        if (line.type === diffParser.LINE_TYPE.CONTEXT) {
          lines += that.makeLineHtml(file.isCombined, line.type, line.oldNumber, line.newNumber, escapedLine);
        } else if (line.type === diffParser.LINE_TYPE.INSERTS && !oldLines.length) {
          lines += that.makeLineHtml(file.isCombined, line.type, line.oldNumber, line.newNumber, escapedLine);
        } else if (line.type === diffParser.LINE_TYPE.DELETES) {
          oldLines.push(line);
        } else if (line.type === diffParser.LINE_TYPE.INSERTS && Boolean(oldLines.length)) {
          newLines.push(line);
        } else {
          console.error('Unknown state in html line-by-line generator');
          processChangeBlock();
        }
      }

      processChangeBlock();

      return lines;
    }).join('\n');
  };

  LineByLinePrinter.prototype._processLines = function(isCombined, oldLines, newLines) {
    var lines = '';

    for (var i = 0; i < oldLines.length; i++) {
      var oldLine = oldLines[i];
      var oldEscapedLine = utils.escape(oldLine.content);
      lines += this.makeLineHtml(isCombined, oldLine.type, oldLine.oldNumber, oldLine.newNumber, oldEscapedLine);
    }

    for (var j = 0; j < newLines.length; j++) {
      var newLine = newLines[j];
      var newEscapedLine = utils.escape(newLine.content);
      lines += this.makeLineHtml(isCombined, newLine.type, newLine.oldNumber, newLine.newNumber, newEscapedLine);
    }

    return lines;
  };

  LineByLinePrinter.prototype.makeLineHtml = function(isCombined, type, oldNumber, newNumber, content, possiblePrefix) {
    var lineNumberTemplate = hoganUtils.render(baseTemplatesPath, 'numbers', {
      oldNumber: utils.valueOrEmpty(oldNumber),
      newNumber: utils.valueOrEmpty(newNumber)
    });

    var lineWithoutPrefix = content;
    var prefix = possiblePrefix;

    if (!prefix) {
      var lineWithPrefix = printerUtils.separatePrefix(isCombined, content);
      prefix = lineWithPrefix.prefix;
      lineWithoutPrefix = lineWithPrefix.line;
    }

    return hoganUtils.render(genericTemplatesPath, 'line',
      {
        type: type,
        lineClass: 'd2h-code-linenumber',
        contentClass: 'd2h-code-line',
        prefix: prefix,
        content: lineWithoutPrefix,
        lineNumber: lineNumberTemplate
      });
  };

  LineByLinePrinter.prototype._generateEmptyDiff = function() {
    return hoganUtils.render(genericTemplatesPath, 'empty-diff', {
      contentClass: 'd2h-code-line',
      diffParser: diffParser
    });
  };

  module.exports.LineByLinePrinter = LineByLinePrinter;
})();
