/*
 *
 * LineByLinePrinter (line-by-line-printer.js)
 * Author: rtfpessoa
 *
 */

(function (global, undefined) {

  var diffParser = require("./diff-parser.js").DiffParser;
  var printerUtils = require("./printer-utils.js").PrinterUtils;
  var utils = require("./utils.js").Utils;

  function LineByLinePrinter() {
  }

  LineByLinePrinter.prototype.generateLineByLineJsonHtml = function (diffFiles) {
    return "<div class=\"d2h-wrapper\">\n" +
      diffFiles.map(function (file) {
        return "<div class=\"d2h-file-wrapper\" data-lang=\"" + file.language + "\">\n" +
          "     <div class=\"d2h-file-header\">\n" +
          "       <div class=\"d2h-file-stats\">\n" +
          "         <span class=\"d2h-lines-added\">+" + file.addedLines + "</span>\n" +
          "         <span class=\"d2h-lines-deleted\">-" + file.deletedLines + "</span>\n" +
          "       </div>\n" +
          "       <div class=\"d2h-file-name\">" + printerUtils.getDiffName(file.oldName, file.newName) + "</div>\n" +
          "     </div>\n" +
          "     <div class=\"d2h-file-diff\">\n" +
          "       <div class=\"d2h-code-wrapper\">\n" +
          "         <table class=\"d2h-diff-table\">\n" +
          "           <tbody class=\"d2h-diff-tbody\">\n" +
          "         " + generateFileHtml(file) +
          "           </tbody>\n" +
          "         </table>\n" +
          "       </div>\n" +
          "     </div>\n" +
          "   </div>\n";
      }).join("\n") +
      "</div>\n";
  };

  function generateFileHtml(file) {
    return file.blocks.map(function (block) {

      var lines = "<tr>\n" +
        "  <td class=\"d2h-code-linenumber " + diffParser.LINE_TYPE.INFO + "\"></td>\n" +
        "  <td class=\"" + diffParser.LINE_TYPE.INFO + "\">" +
        "    <div class=\"d2h-code-line " + diffParser.LINE_TYPE.INFO + "\">" + utils.escape(block.header) + "</div>" +
        "  </td>\n" +
        "</tr>\n";

      var oldLines = [], newLines = [];
      var processedOldLines = [], processedNewLines = [];

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
          var oldEscapedLine, newEscapedLine;

          if (oldLines.length === newLines.length) {
            for (j = 0; j < oldLines.length; j++) {
              oldLine = oldLines[j];
              newLine = newLines[j];
              oldEscapedLine = utils.escape(oldLine.content);
              newEscapedLine = utils.escape(newLine.content);

              var diff = printerUtils.diffHighlight(oldEscapedLine, newEscapedLine, file.isTripleDiff);

              processedOldLines += generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber, diff.o);
              processedNewLines += generateLineHtml(newLine.type, newLine.oldNumber, newLine.newNumber, diff.n);
            }

            lines += processedOldLines + processedNewLines;
          } else {
            for (j = 0; j < oldLines.length; j++) {
              oldLine = oldLines[j];
              oldEscapedLine = utils.escape(oldLine.content);
              lines += generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber, oldEscapedLine);
            }

            for (j = 0; j < newLines.length; j++) {
              newLine = newLines[j];
              newEscapedLine = utils.escape(newLine.content);
              lines += generateLineHtml(newLine.type, newLine.oldNumber, newLine.newNumber, newEscapedLine);
            }
          }

          oldLines = [];
          newLines = [];
          processedOldLines = [];
          processedNewLines = [];
          i--;
        }
      }

      return lines;
    }).join("\n");
  }

  function generateLineHtml(type, oldNumber, newNumber, content) {
    return "<tr>\n" +
      "  <td class=\"d2h-code-linenumber " + type + "\">" +
      "    <div class=\"line-num1\">" + utils.valueOrEmpty(oldNumber) + "</div>" +
      "    <div class=\"line-num2\">" + utils.valueOrEmpty(newNumber) + "</div>" +
      "  </td>\n" +
      "  <td class=\"" + type + "\">" +
      "    <div class=\"d2h-code-line " + type + "\">" + content + "</div>" +
      "  </td>\n" +
      "</tr>\n";
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports.LineByLinePrinter = new LineByLinePrinter();
  } else if (typeof global.LineByLinePrinter === 'undefined') {
    global.LineByLinePrinter = new LineByLinePrinter();
  }

})(this);
