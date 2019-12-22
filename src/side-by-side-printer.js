/*
 *
 * HtmlPrinter (html-printer.js)
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
  var baseTemplatesPath = 'side-by-side';
  var iconsBaseTemplatesPath = 'icon';
  var tagsBaseTemplatesPath = 'tag';

  var matcher = Rematch.rematch(function(a, b) {
    var amod = a.content.substr(1);
    var bmod = b.content.substr(1);

    return Rematch.distance(amod, bmod);
  });

  function SideBySidePrinter(config) {
    this.config = config;

    var HoganJsUtils = require('./hoganjs-utils.js').HoganJsUtils;
    hoganUtils = new HoganJsUtils(config);
  }

  SideBySidePrinter.prototype.makeDiffHtml = function(file, diffs) {
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

  SideBySidePrinter.prototype.generateSideBySideJsonHtml = function(diffFiles) {
    var that = this;

    var content = diffFiles.map(function(file) {
      var diffs;
      if (file.blocks.length) {
        diffs = that.generateSideBySideFileHtml(file);
      } else {
        diffs = that.generateEmptyDiff();
      }

      return that.makeDiffHtml(file, diffs);
    }).join('\n');

    return hoganUtils.render(genericTemplatesPath, 'wrapper', {'content': content});
  };

  SideBySidePrinter.prototype.makeSideHtml = function(blockHeader) {
    return hoganUtils.render(genericTemplatesPath, 'column-line-number', {
      diffParser: diffParser,
      blockHeader: utils.escape(blockHeader),
      lineClass: 'd2h-code-side-linenumber',
      contentClass: 'd2h-code-side-line'
    });
  };

  SideBySidePrinter.prototype.generateSideBySideFileHtml = function(file) {
    var that = this;
    var fileHtml = {};
    fileHtml.left = '';
    fileHtml.right = '';

    file.blocks.forEach(function(block) {
      fileHtml.left += that.makeSideHtml(block.header);
      fileHtml.right += that.makeSideHtml('');

      var oldLines = [];
      var newLines = [];

      function processChangeBlock() {
        var matches;
        var insertType;
        var deleteType;

        var comparisons = oldLines.length * newLines.length;

        var maxLineSizeInBlock = Math.max.apply(null, (oldLines.concat(newLines)).map(function(elem) {
          return elem.length;
        }));

        var doMatching = comparisons < that.config.matchingMaxComparisons &&
          maxLineSizeInBlock < that.config.maxLineSizeInBlockForComparison &&
          (that.config.matching === 'lines' || that.config.matching === 'words');

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

          var common = Math.min(oldLines.length, newLines.length);
          var max = Math.max(oldLines.length, newLines.length);

          for (var j = 0; j < common; j++) {
            var oldLine = oldLines[j];
            var newLine = newLines[j];

            that.config.isCombined = file.isCombined;

            var diff = printerUtils.diffHighlight(oldLine.content, newLine.content, that.config);

            fileHtml.left +=
              that.generateSingleLineHtml(file.isCombined, deleteType, oldLine.oldNumber,
                diff.first.line, diff.first.prefix);
            fileHtml.right +=
              that.generateSingleLineHtml(file.isCombined, insertType, newLine.newNumber,
                diff.second.line, diff.second.prefix);
          }

          if (max > common) {
            var oldSlice = oldLines.slice(common);
            var newSlice = newLines.slice(common);

            var tmpHtml = that.processLines(file.isCombined, oldSlice, newSlice);
            fileHtml.left += tmpHtml.left;
            fileHtml.right += tmpHtml.right;
          }
        });

        oldLines = [];
        newLines = [];
      }

      for (var i = 0; i < block.lines.length; i++) {
        var line = block.lines[i];
        var prefix = line.content[0];
        var escapedLine = utils.escape(line.content.substr(1));

        if (line.type !== diffParser.LINE_TYPE.INSERTS &&
          (newLines.length > 0 || (line.type !== diffParser.LINE_TYPE.DELETES && oldLines.length > 0))) {
          processChangeBlock();
        }

        if (line.type === diffParser.LINE_TYPE.CONTEXT) {
          fileHtml.left += that.generateSingleLineHtml(file.isCombined, line.type, line.oldNumber, escapedLine, prefix);
          fileHtml.right += that.generateSingleLineHtml(file.isCombined, line.type, line.newNumber, escapedLine, prefix);
        } else if (line.type === diffParser.LINE_TYPE.INSERTS && !oldLines.length) {
          fileHtml.left += that.generateSingleLineHtml(file.isCombined, diffParser.LINE_TYPE.CONTEXT, '', '', '');
          fileHtml.right += that.generateSingleLineHtml(file.isCombined, line.type, line.newNumber, escapedLine, prefix);
        } else if (line.type === diffParser.LINE_TYPE.DELETES) {
          oldLines.push(line);
        } else if (line.type === diffParser.LINE_TYPE.INSERTS && Boolean(oldLines.length)) {
          newLines.push(line);
        } else {
          console.error('unknown state in html side-by-side generator');
          processChangeBlock();
        }
      }

      processChangeBlock();
    });

    return fileHtml;
  };

  SideBySidePrinter.prototype.processLines = function(isCombined, oldLines, newLines) {
    var that = this;
    var fileHtml = {};
    fileHtml.left = '';
    fileHtml.right = '';

    var maxLinesNumber = Math.max(oldLines.length, newLines.length);
    for (var i = 0; i < maxLinesNumber; i++) {
      var oldLine = oldLines[i];
      var newLine = newLines[i];
      var oldContent;
      var newContent;
      var oldPrefix;
      var newPrefix;

      if (oldLine) {
        oldContent = utils.escape(oldLine.content.substr(1));
        oldPrefix = oldLine.content[0];
      }

      if (newLine) {
        newContent = utils.escape(newLine.content.substr(1));
        newPrefix = newLine.content[0];
      }

      if (oldLine && newLine) {
        fileHtml.left += that.generateSingleLineHtml(isCombined, oldLine.type, oldLine.oldNumber, oldContent, oldPrefix);
        fileHtml.right += that.generateSingleLineHtml(isCombined, newLine.type, newLine.newNumber, newContent, newPrefix);
      } else if (oldLine) {
        fileHtml.left += that.generateSingleLineHtml(isCombined, oldLine.type, oldLine.oldNumber, oldContent, oldPrefix);
        fileHtml.right += that.generateSingleLineHtml(isCombined, diffParser.LINE_TYPE.CONTEXT, '', '', '');
      } else if (newLine) {
        fileHtml.left += that.generateSingleLineHtml(isCombined, diffParser.LINE_TYPE.CONTEXT, '', '', '');
        fileHtml.right += that.generateSingleLineHtml(isCombined, newLine.type, newLine.newNumber, newContent, newPrefix);
      } else {
        console.error('How did it get here?');
      }
    }

    return fileHtml;
  };

  SideBySidePrinter.prototype.generateSingleLineHtml = function(isCombined, type, number, content, possiblePrefix) {
    var lineWithoutPrefix = content;
    var prefix = possiblePrefix;
    var lineClass = 'd2h-code-side-linenumber';
    var contentClass = 'd2h-code-side-line';

    if (!number && !content) {
      lineClass += ' d2h-code-side-emptyplaceholder';
      contentClass += ' d2h-code-side-emptyplaceholder';
      type += ' d2h-emptyplaceholder';
      prefix = '&nbsp;';
      lineWithoutPrefix = '&nbsp;';
    } else if (!prefix) {
      var lineWithPrefix = printerUtils.separatePrefix(isCombined, content);
      prefix = lineWithPrefix.prefix;
      lineWithoutPrefix = lineWithPrefix.line;
    }

    if (prefix === ' ') {
      prefix = '&nbsp;';
    }

    return hoganUtils.render(genericTemplatesPath, 'line',
      {
        type: type,
        lineClass: lineClass,
        contentClass: contentClass,
        prefix: prefix,
        content: lineWithoutPrefix,
        lineNumber: number
      });
  };

  SideBySidePrinter.prototype.generateEmptyDiff = function() {
    var fileHtml = {};
    fileHtml.right = '';

    fileHtml.left = hoganUtils.render(genericTemplatesPath, 'empty-diff', {
      contentClass: 'd2h-code-side-line',
      diffParser: diffParser
    });

    return fileHtml;
  };

  module.exports.SideBySidePrinter = SideBySidePrinter;
})();
