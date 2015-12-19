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
  var Rematch = require('./rematch.js').Rematch;

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
      }).join('\n') +
      '</div>\n';
  };

  var matcher=Rematch.rematch(function(a,b) {
    var amod = a.content.substr(1),
        bmod = b.content.substr(1);
    return Rematch.distance(amod, bmod);
  });

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
          var processedOldLines = [];
          var processedNewLines = [];
          var j = 0;
            var oldLine, newLine,
              common = Math.min(oldLines.length, newLines.length),
              max = Math.max(oldLines.length, newLines.length);
            for (j = 0; j < common; j++) {
              oldLine = oldLines[j];
              newLine = newLines[j];

              config.isCombined = file.isCombined;
              var diff = printerUtils.diffHighlight(oldLine.content, newLine.content, config);

              processedOldLines +=
                generateLineHtml(deleteType, oldLine.oldNumber, oldLine.newNumber,
                  diff.first.line, diff.first.prefix);
              processedNewLines +=
                generateLineHtml(insertType, newLine.oldNumber, newLine.newNumber,
                  diff.second.line, diff.second.prefix);
            }

            lines += processedOldLines + processedNewLines;
            lines += processLines(oldLines.slice(common), newLines.slice(common));

            processedOldLines = [];
            processedNewLines = [];
        });
        oldLines = [];
        newLines = [];
      }

      for (var i = 0; i < block.lines.length; i++) {
        var line = block.lines[i];
        var escapedLine = utils.escape(line.content);

        if ( line.type !== diffParser.LINE_TYPE.INSERTS &&
            (newLines.length > 0 || (line.type !== diffParser.LINE_TYPE.DELETES && oldLines.length > 0))) {
          processChangeBlock();
        }
        if (line.type == diffParser.LINE_TYPE.CONTEXT) {
          lines += generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !oldLines.length) {
          lines += generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
        } else if (line.type == diffParser.LINE_TYPE.DELETES) {
          oldLines.push(line);
        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !!oldLines.length) {
          newLines.push(line);
        } else {
          console.error('unknown state in html line-by-line generator');
          processChangeBlock();
        }
      }

      processChangeBlock();

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
