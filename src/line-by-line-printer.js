/*
 *
 * LineByLinePrinter (line-by-line-printer.js)
 * Author: rtfpessoa
 *
 */

(function(ctx, undefined) {

  var diffParser = require('./diff-parser.js').DiffParser;
  var printerUtils = require('./printer-utils.js').PrinterUtils;
  var utils = require('./utils.js').Utils;

  function LineByLinePrinter() {
  }

  LineByLinePrinter.prototype.generateLineByLineJsonHtml = function(diffFiles, config) {
    return '<div class="d2h-wrapper">\n' +
      diffFiles.map(function(file) {

        var diffs;
        if (file.blocks.length) {
          diffs = generateFileHtml(file, config);
        } else {
          diffs = generateEmptyDiff();
        }

        return '<div class="d2h-file-wrapper" data-lang="' + file.language + '">\n' +
          '     <div class="d2h-file-header">\n' +
          '       <div class="d2h-file-stats">\n' +
          '         <span class="d2h-lines-added">+' + file.addedLines + '</span>\n' +
          '         <span class="d2h-lines-deleted">-' + file.deletedLines + '</span>\n' +
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
      }).join('\n') +
      '</div>\n';
  };

  function generateFileHtml(file, config) {
    return file.blocks.map(function(block) {

      var lines = '<tr>\n' +
        '  <td class="d2h-code-linenumber ' + diffParser.LINE_TYPE.INFO + '"></td>\n' +
        '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
        '    <div class="d2h-code-line ' + diffParser.LINE_TYPE.INFO + '">' + utils.escape(block.header) + '</div>' +
        '  </td>\n' +
        '</tr>\n';

      var oldLines = [];
      var newLines = [];
      var processedOldLines = [];
      var processedNewLines = [];

      for (var i = 0; i < block.lines.length; i++) {
        var line = block.lines[i];
        var escapedLine = utils.escape(line.content);

        if (line.type == diffParser.LINE_TYPE.CONTEXT && !oldLines.length && !newLines.length) {
          lines += generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !oldLines.length && !newLines.length) {
          lines += generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
        } else if (line.type == diffParser.LINE_TYPE.DELETES && !newLines.length) {
          oldLines.push(line);
        } else if (line.type == diffParser.LINE_TYPE.INSERTS && oldLines.length > newLines.length) {
          newLines.push(line);
        } else {
          var j = 0;
          var oldLine, newLine;

          if (oldLines.length === newLines.length) {
            for (j = 0; j < oldLines.length; j++) {
              oldLine = oldLines[j];
              newLine = newLines[j];

              config.isCombined = file.isCombined;
              var diff = printerUtils.diffHighlight(oldLine.content, newLine.content, config);

              processedOldLines +=
                generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber,
                  diff.first.line, diff.first.prefix);
              processedNewLines +=
                generateLineHtml(newLine.type, newLine.oldNumber, newLine.newNumber,
                  diff.second.line, diff.second.prefix);
            }

            lines += processedOldLines + processedNewLines;
          } else {
            lines += processLines(oldLines, newLines);
          }

          oldLines = [];
          newLines = [];
          processedOldLines = [];
          processedNewLines = [];
          i--;
        }
      }

      lines += processLines(oldLines, newLines);

      return lines;
    }).join('\n');
  }

  function processLines(oldLines, newLines) {
    var lines = '';

    for (j = 0; j < oldLines.length; j++) {
      var oldLine = oldLines[j];
      var oldEscapedLine = utils.escape(oldLine.content);
      lines += generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber, oldEscapedLine);
    }

    for (j = 0; j < newLines.length; j++) {
      var newLine = newLines[j];
      var newEscapedLine = utils.escape(newLine.content);
      lines += generateLineHtml(newLine.type, newLine.oldNumber, newLine.newNumber, newEscapedLine);
    }

    return lines;
  }

  function generateLineHtml(type, oldNumber, newNumber, content, prefix) {
    var htmlPrefix = '';
    if (prefix) {
      htmlPrefix = '<span class="d2h-code-line-prefix">' + prefix + '</span>';
    }

    var htmlContent = '';
    if (content) {
      htmlContent = '<span class="d2h-code-line-ctn">' + content + '</span>';
    }

    return '<tr>\n' +
      '  <td class="d2h-code-linenumber ' + type + '">' +
      '    <div class="line-num1">' + utils.valueOrEmpty(oldNumber) + '</div>' +
      '    <div class="line-num2">' + utils.valueOrEmpty(newNumber) + '</div>' +
      '  </td>\n' +
      '  <td class="' + type + '">' +
      '    <div class="d2h-code-line ' + type + '">' + htmlPrefix + htmlContent + '</div>' +
      '  </td>\n' +
      '</tr>\n';
  }

  function generateEmptyDiff() {
    return '<tr>\n' +
      '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
      '    <div class="d2h-code-line ' + diffParser.LINE_TYPE.INFO + '">' +
      'File without changes' +
      '    </div>' +
      '  </td>\n' +
      '</tr>\n';
  }

  module.exports['LineByLinePrinter'] = new LineByLinePrinter();

})(this);
