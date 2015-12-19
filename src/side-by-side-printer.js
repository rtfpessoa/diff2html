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
  var Rematch = require('./rematch.js').Rematch;

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

  var matcher=Rematch.rematch(function(a,b) {
    var amod = a.content.substr(1),
        bmod = b.content.substr(1);
    return Rematch.distance(amod, bmod);
  });

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
      function processChangeBlock() {
        var matches;
        var insertType;
        var deleteType;
        var doMatching = config.matching === "lines" || config.matching === "words";
        if (doMatching) {
          matches = matcher(oldLines, newLines);
          insertType = diffParser.LINE_TYPE.INSERT_CHANGES;
          deleteType = diffParser.LINE_TYPE.DELETE_CHANGES;
        } else {
          matches = [[oldLines,newLines]];
          insertType = diffParser.LINE_TYPE.INSERTS;
          deleteType = diffParser.LINE_TYPE.DELETES;
        }
        matches.forEach(function(match){
          var oldLines = match[0];
          var newLines = match[1];
          var tmpHtml;
          var j = 0;
          var oldLine, newLine,
              common = Math.min(oldLines.length, newLines.length),
              max = Math.max(oldLines.length, newLines.length);
          for (j = 0; j < common; j++) {
            oldLine = oldLines[j];
            newLine = newLines[j];

            config.isCombined = file.isCombined;

            var diff = printerUtils.diffHighlight(oldLine.content, newLine.content, config);

            fileHtml.left +=
              generateSingleLineHtml(deleteType, oldLine.oldNumber,
                diff.first.line, diff.first.prefix);
            fileHtml.right +=
              generateSingleLineHtml(insertType, newLine.newNumber,
                diff.second.line, diff.second.prefix);
            }
            if (max > common) {
              var oldSlice = oldLines.slice(common),
                  newSlice = newLines.slice(common);
              tmpHtml = processLines(oldLines.slice(common), newLines.slice(common));
              fileHtml.left += tmpHtml.left;
              fileHtml.right += tmpHtml.right;
            }
        });
        oldLines = [];
        newLines = [];
      }
      for (var i = 0; i < block.lines.length; i++) {
        var line = block.lines[i];
        var prefix = line[0];
        var escapedLine = utils.escape(line.content.substr(1));

        if ( line.type !== diffParser.LINE_TYPE.INSERTS &&
            (newLines.length > 0 || (line.type !== diffParser.LINE_TYPE.DELETES && oldLines.length > 0))) {
          processChangeBlock();
        }
        if (line.type == diffParser.LINE_TYPE.CONTEXT) {
          fileHtml.left += generateSingleLineHtml(line.type, line.oldNumber, escapedLine, prefix);
          fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine, prefix);
        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !oldLines.length) {
          fileHtml.left += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
          fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine, prefix);
        } else if (line.type == diffParser.LINE_TYPE.DELETES) {
          oldLines.push(line);
        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !!oldLines.length) {
          newLines.push(line);
        } else {
          console.error('unknown state in html side-by-side generator');
          processChangeBlock();
        }
      }

      processChangeBlock();
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
        fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, oldContent, oldPrefix);
        fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, newContent, newPrefix);
      } else if (oldLine) {
        fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, oldContent, oldPrefix);
        fileHtml.right += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
      } else if (newLine) {
        fileHtml.left += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
        fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, newContent, newPrefix);
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
