/*
 *
 * HtmlPrinter (html-printer.js)
 * Author: rtfpessoa
 *
 */

(function(ctx, undefined) {

  var diffParser = require('./diff-parser.js').DiffParser;
  var printerUtils = require('./printer-utils.js').PrinterUtils;
  var utils = require('./utils.js').Utils;

  function SideBySidePrinter() {
  }

  SideBySidePrinter.prototype.generateSideBySideJsonHtml = function(diffFiles, config) {
    return '<div class="d2h-wrapper">\n' +
      diffFiles.map(function(file) {

        var diffs;
        if (file.blocks.length) {
          diffs = generateSideBySideFileHtml(file, config);
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
          '     <div class="d2h-files-diff">\n' +
          '       <div class="d2h-file-side-diff">\n' +
          '         <div class="d2h-code-wrapper">\n' +
          '           <table class="d2h-diff-table">\n' +
          '             <tbody class="d2h-diff-tbody">\n' +
          '           ' + diffs.left +
          '             </tbody>\n' +
          '           </table>\n' +
          '         </div>\n' +
          '       </div>\n' +
          '       <div class="d2h-file-side-diff">\n' +
          '         <div class="d2h-code-wrapper">\n' +
          '           <table class="d2h-diff-table">\n' +
          '             <tbody class="d2h-diff-tbody">\n' +
          '           ' + diffs.right +
          '             </tbody>\n' +
          '           </table>\n' +
          '         </div>\n' +
          '       </div>\n' +
          '     </div>\n' +
          '   </div>\n';
      }).join('\n') +
      '</div>\n';
  };

  function generateSideBySideFileHtml(file, config) {
    var fileHtml = {};
    fileHtml.left = '';
    fileHtml.right = '';

    file.blocks.forEach(function(block) {

      fileHtml.left += '<tr>\n' +
        '  <td class="d2h-code-side-linenumber ' + diffParser.LINE_TYPE.INFO + '"></td>\n' +
        '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
        '    <div class="d2h-code-side-line ' + diffParser.LINE_TYPE.INFO + '">' +
        '      ' + utils.escape(block.header) +
        '    </div>' +
        '  </td>\n' +
        '</tr>\n';

      fileHtml.right += '<tr>\n' +
        '  <td class="d2h-code-side-linenumber ' + diffParser.LINE_TYPE.INFO + '"></td>\n' +
        '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
        '    <div class="d2h-code-side-line ' + diffParser.LINE_TYPE.INFO + '"></div>' +
        '  </td>\n' +
        '</tr>\n';

      var oldLines = [];
      var newLines = [];
      var tmpHtml = '';

      for (var i = 0; i < block.lines.length; i++) {
        var line = block.lines[i];
        var escapedLine = utils.escape(line.content);

        if (line.type == diffParser.LINE_TYPE.CONTEXT && !oldLines.length && !newLines.length) {
          fileHtml.left += generateSingleLineHtml(line.type, line.oldNumber, escapedLine);
          fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine);
        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !oldLines.length && !newLines.length) {
          fileHtml.left += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
          fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine);
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

              fileHtml.left +=
                generateSingleLineHtml(oldLine.type, oldLine.oldNumber,
                  diff.first.line, diff.first.prefix);
              fileHtml.right +=
                generateSingleLineHtml(newLine.type, newLine.newNumber,
                  diff.second.line, diff.second.prefix);
            }
          } else {
            tmpHtml = processLines(oldLines, newLines);
            fileHtml.left += tmpHtml.left;
            fileHtml.right += tmpHtml.right;
          }

          oldLines = [];
          newLines = [];
          i--;
        }
      }

      tmpHtml = processLines(oldLines, newLines);
      fileHtml.left += tmpHtml.left;
      fileHtml.right += tmpHtml.right;
    });

    return fileHtml;
  }

  function processLines(oldLines, newLines) {
    var fileHtml = {};
    fileHtml.left = '';
    fileHtml.right = '';

    var maxLinesNumber = Math.max(oldLines.length, newLines.length);
    for (j = 0; j < maxLinesNumber; j++) {
      var oldLine = oldLines[j];
      var newLine = newLines[j];

      if (oldLine && newLine) {
        fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, utils.escape(oldLine.content));
        fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, utils.escape(newLine.content));
      } else if (oldLine) {
        fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, utils.escape(oldLine.content));
        fileHtml.right += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
      } else if (newLine) {
        fileHtml.left += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
        fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, utils.escape(newLine.content));
      } else {
        console.error('How did it get here?');
      }
    }

    return fileHtml;
  }

  function generateSingleLineHtml(type, number, content, prefix) {
    var htmlPrefix = '';
    if (prefix) {
      htmlPrefix = '<span class="d2h-code-line-prefix">' + prefix + '</span>';
    }

    var htmlContent = '';
    if (content) {
      htmlContent = '<span class="d2h-code-line-ctn">' + content + '</span>';
    }

    return '<tr>\n' +
      '    <td class="d2h-code-side-linenumber ' + type + '">' + number + '</td>\n' +
      '    <td class="' + type + '">' +
      '      <div class="d2h-code-side-line ' + type + '">' + htmlPrefix + htmlContent + '</div>' +
      '    </td>\n' +
      '  </tr>\n';
  }

  function generateEmptyDiff() {
    var fileHtml = {};
    fileHtml.right = '';

    fileHtml.left = '<tr>\n' +
      '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
      '    <div class="d2h-code-side-line ' + diffParser.LINE_TYPE.INFO + '">' +
      'File without changes' +
      '    </div>' +
      '  </td>\n' +
      '</tr>\n';

    return fileHtml;
  }

  module.exports['SideBySidePrinter'] = new SideBySidePrinter();

})(this);
