/*
 *
 * HtmlPrinter (html-printer.js)
 * Author: rtfpessoa
 *
 */

(function (global, undefined) {

  var diffParser = require("./diff-parser.js").DiffParser;
  var printerUtils = require("./printer-utils.js").PrinterUtils;
  var utils = require("./utils.js").Utils;

  function SideBySidePrinter() {
  }

  SideBySidePrinter.prototype.generateSideBySideJsonHtml = function (diffFiles) {
    return "<div class=\"d2h-wrapper\">\n" +
      diffFiles.map(function (file) {
        var diffs = generateSideBySideFileHtml(file);

        return "<div class=\"d2h-file-wrapper\" data-lang=\"" + file.language + "\">\n" +
          "     <div class=\"d2h-file-header\">\n" +
          "       <div class=\"d2h-file-stats\">\n" +
          "         <span class=\"d2h-lines-added\">+" + file.addedLines + "</span>\n" +
          "         <span class=\"d2h-lines-deleted\">-" + file.deletedLines + "</span>\n" +
          "       </div>\n" +
          "       <div class=\"d2h-file-name\">" + printerUtils.getDiffName(file.oldName, file.newName) + "</div>\n" +
          "     </div>\n" +
          "     <div class=\"d2h-files-diff\">\n" +
          "       <div class=\"d2h-file-side-diff\">\n" +
          "         <div class=\"d2h-code-wrapper\">\n" +
          "           <table class=\"d2h-diff-table\">\n" +
          "             <tbody class=\"d2h-diff-tbody\">\n" +
          "           " + diffs.left +
          "             </tbody>\n" +
          "           </table>\n" +
          "         </div>\n" +
          "       </div>\n" +
          "       <div class=\"d2h-file-side-diff\">\n" +
          "         <div class=\"d2h-code-wrapper\">\n" +
          "           <table class=\"d2h-diff-table\">\n" +
          "             <tbody class=\"d2h-diff-tbody\">\n" +
          "           " + diffs.right +
          "             </tbody>\n" +
          "           </table>\n" +
          "         </div>\n" +
          "       </div>\n" +
          "     </div>\n" +
          "   </div>\n";
      }).join("\n") +
      "</div>\n";
  };

  function generateSideBySideFileHtml(file) {
    var fileHtml = {};
    fileHtml.left = "";
    fileHtml.right = "";

    file.blocks.forEach(function (block) {

      fileHtml.left += "<tr>\n" +
      "  <td class=\"d2h-code-side-linenumber " + diffParser.LINE_TYPE.INFO + "\"></td>\n" +
      "  <td class=\"" + diffParser.LINE_TYPE.INFO + "\">" +
      "    <div class=\"d2h-code-side-line " + diffParser.LINE_TYPE.INFO + "\">" + utils.escape(block.header) + "</div>" +
      "  </td>\n" +
      "</tr>\n";

      fileHtml.right += "<tr>\n" +
      "  <td class=\"d2h-code-side-linenumber " + diffParser.LINE_TYPE.INFO + "\"></td>\n" +
      "  <td class=\"" + diffParser.LINE_TYPE.INFO + "\">" +
      "    <div class=\"d2h-code-side-line " + diffParser.LINE_TYPE.INFO + "\"></div>" +
      "  </td>\n" +
      "</tr>\n";

      var oldLines = [], newLines = [];

      for (var i = 0; i < block.lines.length; i++) {
        var line = block.lines[i];
        var escapedLine = utils.escape(line.content);

        if (line.type == diffParser.LINE_TYPE.CONTEXT && !oldLines.length && !newLines.length) {
          fileHtml.left += generateSingleLineHtml(line.type, line.oldNumber, escapedLine);
          fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine);
        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !oldLines.length && !newLines.length) {
          fileHtml.left += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, "", "", "");
          fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine);
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

              fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, diff.o);
              fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, diff.n);
            }
          } else {
            var maxLinesNumber = Math.max(oldLines.length, newLines.length);
            for (j = 0; j < maxLinesNumber; j++) {
              oldLine = oldLines[j];
              newLine = newLines[j];

              if (oldLine && newLine) {
                fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, utils.escape(oldLine.content));
                fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, utils.escape(newLine.content));
              } else if (oldLine) {
                fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, utils.escape(oldLine.content));
                fileHtml.right += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, "", "", "");
              } else if (newLine) {
                fileHtml.left += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, "", "", "");
                fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, utils.escape(newLine.content));
              } else {
                console.error("How did it get here?");
              }
            }
          }

          oldLines = [];
          newLines = [];
          i--;
        }
      }
    });

    return fileHtml;
  }

  function generateSingleLineHtml(type, number, content) {
    return "<tr>\n" +
      "    <td class=\"d2h-code-side-linenumber " + type + "\">" + number + "</td>\n" +
      "    <td class=\"" + type + "\">" +
      "      <div class=\"d2h-code-side-line " + type + "\">" + content + "</div>" +
      "    </td>\n" +
      "  </tr>\n";
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports.SideBySidePrinter = new SideBySidePrinter();
  } else if (typeof global.SideBySidePrinter === 'undefined') {
    global.SideBySidePrinter = new SideBySidePrinter();
  }

})(this);
