/*
 *
 * Diff to HTML (diff2html.js)
 * Author: rtfpessoa
 *
 * Diff commands:
 *   git diff
 */

var LINE_TYPE = {
  INSERTS: "d2h-ins",
  DELETES: "d2h-del",
  CONTEXT: "d2h-cntx",
  INFO: "d2h-info"
};

function Diff2Html() {
}

/*
 * Generates pretty html from string diff input
 */
Diff2Html.prototype.getPrettyHtmlFromDiff = function (diffInput) {
  var diffJson = generateDiffJson(diffInput);
  return generateJsonHtml(diffJson);
};

/*
 * Generates json object from string diff input
 */
Diff2Html.prototype.getJsonFromDiff = function (diffInput) {
  return generateDiffJson(diffInput);
};

/*
 * Generates pretty html from a json object
 */
Diff2Html.prototype.getPrettyHtmlFromJson = function (diffJson) {
  return generateJsonHtml(diffJson);
};

/*
 * Generates pretty side by side html from string diff input
 */
Diff2Html.prototype.getPrettySideBySideHtmlFromDiff = function (diffInput) {
  var diffJson = generateDiffJson(diffInput);
  return generateSideBySideJsonHtml(diffJson);
};

/*
 * Generates pretty side by side html from a json object
 */
Diff2Html.prototype.getPrettySideBySideHtmlFromJson = function (diffJson) {
  return generateSideBySideJsonHtml(diffJson);
};

var generateDiffJson = function (diffInput) {
  var files = [],
    currentFile = null,
    currentBlock = null,
    oldLine = null,
    newLine = null;

  var saveBlock = function () {
    /* add previous block(if exists) before start a new file */
    if (currentBlock) {
      currentFile.blocks.push(currentBlock);
      currentBlock = null;
    }
  };

  var saveFile = function () {
    /*
     * add previous file(if exists) before start a new one
     * if it has name (to avoid binary files errors)
     */
    if (currentFile && currentFile.newName) {
      files.push(currentFile);
      currentFile = null;
    }
  };

  var startFile = function () {
    saveBlock();
    saveFile();

    /* create file structure */
    currentFile = {};
    currentFile.blocks = [];
    currentFile.deletedLines = 0;
    currentFile.addedLines = 0;
  };

  var startBlock = function (line) {
    saveBlock();

    var values;

    if (values = /^@@ -(\d+),\d+ \+(\d+),\d+ @@.*/.exec(line)) {
      currentFile.isTripleDiff = false;
    } else if (values = /^@@@ -(\d+),\d+ -\d+,\d+ \+(\d+),\d+ @@@.*/.exec(line)) {
      currentFile.isTripleDiff = true;
    } else {
      values = [0, 0];
      currentFile.isTripleDiff = false;
    }

    oldLine = values[1];
    newLine = values[2];

    /* create block metadata */
    currentBlock = {};
    currentBlock.lines = [];
    currentBlock.oldStartLine = oldLine;
    currentBlock.newStartLine = newLine;
    currentBlock.header = line;
  };

  var createLine = function (line) {
    var currentLine = {};
    currentLine.content = line;

    /* fill the line data */
    if (startsWith(line, "+") || startsWith(line, " +")) {
      currentFile.addedLines++;

      currentLine.type = LINE_TYPE.INSERTS;
      currentLine.oldNumber = null;
      currentLine.newNumber = newLine++;

      currentBlock.lines.push(currentLine);

    } else if (startsWith(line, "-") || startsWith(line, " -")) {
      currentFile.deletedLines++;

      currentLine.type = LINE_TYPE.DELETES;
      currentLine.oldNumber = oldLine++;
      currentLine.newNumber = null;

      currentBlock.lines.push(currentLine);

    } else {
      currentLine.type = LINE_TYPE.CONTEXT;
      currentLine.oldNumber = oldLine++;
      currentLine.newNumber = newLine++;

      currentBlock.lines.push(currentLine);
    }
  };

  var diffLines = diffInput.split("\n");
  diffLines.forEach(function (line) {
    // Unmerged paths, and possibly other non-diffable files
    // https://github.com/scottgonzalez/pretty-diff/issues/11
    // Also, remove some useless lines
    if (!line || startsWith(line, "*") ||
      startsWith(line, "new") || startsWith(line, "index")) {
      return;
    }

    var values = [];
    if (startsWith(line, "diff")) {
      startFile();
    } else if (currentFile && !currentFile.oldName && (values = /^--- a\/(\S+).*$/.exec(line))) {
      currentFile.oldName = values[1];
    } else if (currentFile && !currentFile.newName && (values = /^\+\+\+ [b]?\/(\S+).*$/.exec(line))) {
      currentFile.newName = values[1];

      var fileSplit = currentFile.newName.split(".");
      currentFile.language = fileSplit[fileSplit.length - 1];
    } else if (currentFile && startsWith(line, "@@")) {
      startBlock(line);
    } else if (currentBlock) {
      createLine(line);
    }
  });

  saveBlock();
  saveFile();

  return files;
};

/*
 * Line By Line HTML
 */

var generateJsonHtml = function (diffFiles) {
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
      "  <td class=\"d2h-code-linenumber " + LINE_TYPE.INFO + "\"></td>\n" +
      "  <td class=\"" + LINE_TYPE.INFO + "\">" +
      "    <div class=\"d2h-code-line " + LINE_TYPE.INFO + "\">" + escape(block.header) + "</div>" +
      "  </td>\n" +
      "</tr>\n";

    var oldLines = [], newLines = [];
    var processedOldLines = [], processedNewLines = [];

    for (var i = 0; i < block.lines.length; i++) {
      var line = block.lines[i];
      var escapedLine = escape(line.content);

      if (line.type == LINE_TYPE.CONTEXT && !oldLines.length && !newLines.length) {
        lines += generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
      } else if (line.type == LINE_TYPE.INSERTS && !oldLines.length && !newLines.length) {
        lines += generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
      } else if (line.type == LINE_TYPE.DELETES && !newLines.length) {
        oldLines.push(line);
      } else if (line.type == LINE_TYPE.INSERTS && oldLines.length > newLines.length) {
        newLines.push(line);
      } else {
        var j = 0;
        var oldLine, newLine;
        var oldEscapedLine, newEscapedLine;

        if (oldLines.length === newLines.length) {
          for (j = 0; j < oldLines.length; j++) {
            oldLine = oldLines[j];
            newLine = newLines[j];
            oldEscapedLine = escape(oldLine.content);
            newEscapedLine = escape(newLine.content);

            var diff = diffHighlight(oldEscapedLine, newEscapedLine, file.isTripleDiff);

            processedOldLines += generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber, diff.o);
            processedNewLines += generateLineHtml(newLine.type, newLine.oldNumber, newLine.newNumber, diff.n);
          }

          lines += processedOldLines + processedNewLines;
        } else {
          for (j = 0; j < oldLines.length; j++) {
            oldLine = oldLines[j];
            oldEscapedLine = escape(oldLine.content);
            lines += generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber, oldEscapedLine);
          }

          for (j = 0; j < newLines.length; j++) {
            newLine = newLines[j];
            newEscapedLine = escape(newLine.content);
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
    "    <div class=\"line-num1\">" + valueOrEmpty(oldNumber) + "</div>" +
    "    <div class=\"line-num2\">" + valueOrEmpty(newNumber) + "</div>" +
    "  </td>\n" +
    "  <td class=\"" + type + "\">" +
    "    <div class=\"d2h-code-line " + type + "\">" + content + "</div>" +
    "  </td>\n" +
    "</tr>\n";
};

/*
 * Side By Side HTML (work in progress)
 */

var generateSideBySideJsonHtml = function (diffFiles) {
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
    "  <td class=\"d2h-code-side-linenumber " + LINE_TYPE.INFO + "\"></td>\n" +
    "  <td class=\"" + LINE_TYPE.INFO + "\">" +
    "    <div class=\"d2h-code-side-line " + LINE_TYPE.INFO + "\">" + escape(block.header) + "</div>" +
    "  </td>\n" +
    "</tr>\n";

    fileHtml.right += "<tr>\n" +
    "  <td class=\"d2h-code-side-linenumber " + LINE_TYPE.INFO + "\"></td>\n" +
    "  <td class=\"" + LINE_TYPE.INFO + "\">" +
    "    <div class=\"d2h-code-side-line " + LINE_TYPE.INFO + "\"></div>" +
    "  </td>\n" +
    "</tr>\n";

    var oldLines = [], newLines = [];

    for (var i = 0; i < block.lines.length; i++) {
      var line = block.lines[i];
      var escapedLine = escape(line.content);

      if (line.type == LINE_TYPE.CONTEXT && !oldLines.length && !newLines.length) {
        fileHtml.left += generateSingleLineHtml(line.type, line.oldNumber, escapedLine);
        fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine);
      } else if (line.type == LINE_TYPE.INSERTS && !oldLines.length && !newLines.length) {
        fileHtml.left += generateSingleLineHtml(LINE_TYPE.CONTEXT, "", "", "");
        fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine);
      } else if (line.type == LINE_TYPE.DELETES && !newLines.length) {
        oldLines.push(line);
      } else if (line.type == LINE_TYPE.INSERTS && oldLines.length > newLines.length) {
        newLines.push(line);
      } else {
        var j = 0;
        var oldLine, newLine;
        var oldEscapedLine, newEscapedLine;

        if (oldLines.length === newLines.length) {
          for (j = 0; j < oldLines.length; j++) {
            oldLine = oldLines[j];
            newLine = newLines[j];
            oldEscapedLine = escape(oldLine.content);
            newEscapedLine = escape(newLine.content);

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
              fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, escape(oldLine.content));
              fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, escape(newLine.content));
            } else if (oldLine) {
              fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, escape(oldLine.content));
              fileHtml.right += generateSingleLineHtml(LINE_TYPE.CONTEXT, "", "", "");
            } else if (newLine) {
              fileHtml.left += generateSingleLineHtml(LINE_TYPE.CONTEXT, "", "", "");
              fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, escape(newLine.content));
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

/*
 * Utils
 */

function escape(str) {
  return str.slice(0)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\t/g, "    ");
}

function startsWith(str, start) {
  return str.indexOf(start) === 0;
}

function valueOrEmpty(value) {
  return value ? value : "";
}

function diffHighlight(diffLine1, diffLine2, isTripleDiff) {
  var lineStart1, lineStart2;

  var prefixSize = 1;

  if (isTripleDiff) prefixSize = 2;

  lineStart1 = diffLine1.substr(0, prefixSize);
  lineStart2 = diffLine2.substr(0, prefixSize);

  diffLine1 = diffLine1.substr(prefixSize);
  diffLine2 = diffLine2.substr(prefixSize);

  var diff = JsDiff.diffChars(diffLine1, diffLine2);

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
