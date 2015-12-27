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

  function LineByLinePrinter(config) {
    this.config = config;
  }

  LineByLinePrinter.prototype.makeFileDiffHtml = function(file, diffs) {
    return '<div id="' + printerUtils.getHtmlId(file) + '" class="d2h-file-wrapper" data-lang="' + file.language + '">\n' +
      '     <div class="d2h-file-header">\n' +
      '       <div class="d2h-file-stats">\n' +
      '         <span class="d2h-lines-added">' +
      '           <span>+' + file.addedLines + '</span>\n' +
      '         </span>\n' +
      '         <span class="d2h-lines-deleted">' +
      '           <span>-' + file.deletedLines + '</span>\n' +
      '         </span>\n' +
      '       </div>\n' +
      '       <div class="d2h-file-name">' + printerUtils.getDiffName(file) + '</div>\n' +
      '     </div>\n' +
      '     <div class="d2h-file-diff">\n' +
      '       <div class="d2h-code-wrapper">\n' +
      '         <table class="d2h-diff-table">\n' +
      '           <tbody class="d2h-diff-tbody">\n' +
      '         ' + diffs +
      '           </tbody>\n' +
      '         </table>\n' +
      '       </div>\n' +
      '     </div>\n' +
      '   </div>\n';
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

    return '<div class="d2h-wrapper">\n' + htmlDiffs.join('\n') + '</div>\n';
  };

  var matcher = Rematch.rematch(function(a, b) {
    var amod = a.content.substr(1);
    var bmod = b.content.substr(1);

    return Rematch.distance(amod, bmod);
  });

  LineByLinePrinter.prototype.makeColumnLineNumberHtml = function(block) {
      return '<tr>\n' +
        '  <td class="d2h-code-linenumber ' + diffParser.LINE_TYPE.INFO + '"></td>\n' +
        '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
        '    <div class="d2h-code-line ' + diffParser.LINE_TYPE.INFO + '">' + utils.escape(block.header) + '</div>' +
        '  </td>\n' +
        '</tr>\n';
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

        var doMatching = that.config.matching === 'lines' || that.config.matching === 'words';

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
              that._generateLineHtml(deleteType, oldLine.oldNumber, oldLine.newNumber,
                diff.first.line, diff.first.prefix);
            processedNewLines +=
              that._generateLineHtml(insertType, newLine.oldNumber, newLine.newNumber,
                diff.second.line, diff.second.prefix);
          }

          lines += processedOldLines + processedNewLines;
          lines += that._processLines(oldLines.slice(common), newLines.slice(common));
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
          lines += that._generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
        } else if (line.type === diffParser.LINE_TYPE.INSERTS && !oldLines.length) {
          lines += that._generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
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

  LineByLinePrinter.prototype._processLines = function(oldLines, newLines) {
    var lines = '';

    for (var i = 0; i < oldLines.length; i++) {
      var oldLine = oldLines[i];
      var oldEscapedLine = utils.escape(oldLine.content);
      lines += this._generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber, oldEscapedLine);
    }

    for (var j = 0; j < newLines.length; j++) {
      var newLine = newLines[j];
      var newEscapedLine = utils.escape(newLine.content);
      lines += this._generateLineHtml(newLine.type, newLine.oldNumber, newLine.newNumber, newEscapedLine);
    }

    return lines;
  };

  LineByLinePrinter.prototype.makeLineHtml = function(type, oldNumber, newNumber, htmlPrefix, htmlContent) {
    return '<tr>\n' +
      '  <td class="d2h-code-linenumber ' + type + '">' +
      '    <div class="line-num1">' + utils.valueOrEmpty(oldNumber) + '</div>' +
      '    <div class="line-num2">' + utils.valueOrEmpty(newNumber) + '</div>' +
      '  </td>\n' +
      '  <td class="' + type + '">' +
      '    <div class="d2h-code-line ' + type + '">' + htmlPrefix + htmlContent + '</div>' +
      '  </td>\n' +
      '</tr>\n';
  };

  LineByLinePrinter.prototype._generateLineHtml = function(type, oldNumber, newNumber, content, prefix) {
    var htmlPrefix = '';
    if (prefix) {
      htmlPrefix = '<span class="d2h-code-line-prefix">' + prefix + '</span>';
    }

    var htmlContent = '';
    if (content) {
      htmlContent = '<span class="d2h-code-line-ctn">' + content + '</span>';
    }

    return this.makeLineHtml(type, oldNumber, newNumber, htmlPrefix, htmlContent);
  };

  LineByLinePrinter.prototype._generateEmptyDiff = function() {
    return '<tr>\n' +
      '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
      '    <div class="d2h-code-line ' + diffParser.LINE_TYPE.INFO + '">' +
      'File without changes' +
      '    </div>' +
      '  </td>\n' +
      '</tr>\n';
  };

  module.exports.LineByLinePrinter = LineByLinePrinter;

})();
