/*
 *
 * HtmlPrinter (html-printer.js)
 * Author: rtfpessoa
 *
 */

var diffParser = new DiffParser();
var utils = new Utils();
var jsDiff = JsDiff;

function HtmlPrinter() {
}

HtmlPrinter.prototype.generateJsonHtml = function (diffFiles) {
  return "<div class=\"d2h-wrapper\">\n" +
    diffFiles.map(function (file) {
      return "<div class=\"d2h-file-wrapper\" data-lang=\"" + file.language + "\">\n" +
        "     <div class=\"d2h-file-header\">\n" +
        "       <div class=\"d2h-file-stats\">\n" +
        "         <span class=\"d2h-lines-added\">+" + file.addedLines + "</span>\n" +
        "         <span class=\"d2h-lines-deleted\">-" + file.deletedLines + "</span>\n" +
        "       </div>\n" +
        "       <div class=\"d2h-file-name\">" + getDiffName(file.oldName, file.newName) + "</div>\n" +
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

var generateFileHtml = function (file) {
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

            var diff = diffHighlight(oldEscapedLine, newEscapedLine, file.isTripleDiff);

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
};

var generateLineHtml = function (type, oldNumber, newNumber, content) {
  return "<tr>\n" +
    "  <td class=\"d2h-code-linenumber " + type + "\">" +
    "    <div class=\"line-num1\">" + utils.valueOrEmpty(oldNumber) + "</div>" +
    "    <div class=\"line-num2\">" + utils.valueOrEmpty(newNumber) + "</div>" +
    "  </td>\n" +
    "  <td class=\"" + type + "\">" +
    "    <div class=\"d2h-code-line " + type + "\">" + content + "</div>" +
    "  </td>\n" +
    "</tr>\n";
};

/*
 * Side By Side HTML
 */

HtmlPrinter.prototype.generateSideBySideJsonHtml = function (diffFiles) {
  return "<div class=\"d2h-wrapper\">\n" +
    diffFiles.map(function (file) {
      var diffs = generateSideBySideFileHtml(file);

      return "<div class=\"d2h-file-wrapper\" data-lang=\"" + file.language + "\">\n" +
        "     <div class=\"d2h-file-header\">\n" +
        "       <div class=\"d2h-file-stats\">\n" +
        "         <span class=\"d2h-lines-added\">+" + file.addedLines + "</span>\n" +
        "         <span class=\"d2h-lines-deleted\">-" + file.deletedLines + "</span>\n" +
        "       </div>\n" +
        "       <div class=\"d2h-file-name\">" + getDiffName(file.oldName, file.newName) + "</div>\n" +
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

var generateSideBySideFileHtml = function (file) {
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

            var diff = diffHighlight(oldEscapedLine, newEscapedLine, file.isTripleDiff);

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
};

var generateSingleLineHtml = function (type, number, content) {
  return "<tr>\n" +
    "    <td class=\"d2h-code-side-linenumber " + type + "\">" + number + "</td>\n" +
    "    <td class=\"" + type + "\">" +
    "      <div class=\"d2h-code-side-line " + type + "\">" + content + "</div>" +
    "    </td>\n" +
    "  </tr>\n";
};

/*
 * HTML Helpers
 */

var getDiffName = function (oldFilename, newFilename) {
  if (oldFilename && newFilename && oldFilename !== newFilename) {
    return oldFilename + " -> " + newFilename;
  } else if (newFilename) {
    return newFilename;
  } else if (oldFilename) {
    return oldFilename;
  } else {
    return "Unknown filename";
  }
};

var removeIns = function (line) {
  return line.replace(/(<ins>((.|\n)*?)<\/ins>)/g, "");
};

var removeDel = function (line) {
  return line.replace(/(<del>((.|\n)*?)<\/del>)/g, "");
};

function diffHighlight(diffLine1, diffLine2, isTripleDiff) {
  var lineStart1, lineStart2;

  var prefixSize = 1;

  if (isTripleDiff) prefixSize = 2;

  lineStart1 = diffLine1.substr(0, prefixSize);
  lineStart2 = diffLine2.substr(0, prefixSize);

  diffLine1 = diffLine1.substr(prefixSize);
  diffLine2 = diffLine2.substr(prefixSize);

  var diff = jsDiff.diffChars(diffLine1, diffLine2);

  var highlightedLine = "";

  diff.forEach(function (part) {
    var elemType = part.added ? 'ins' : part.removed ? 'del' : null;

    if (elemType !== null) highlightedLine += "<" + elemType + ">" + part.value + "</" + elemType + ">";
    else highlightedLine += part.value;
  });

  return {
    o: lineStart1 + removeIns(highlightedLine),
    n: lineStart2 + removeDel(highlightedLine)
  }
}
