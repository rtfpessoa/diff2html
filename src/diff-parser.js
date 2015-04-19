/*
 *
 * Diff Parser (diff-parser.js)
 * Author: rtfpessoa
 *
 */

(function (global, undefined) {

  var utils = require("./utils.js").Utils;

  var LINE_TYPE = {
    INSERTS: "d2h-ins",
    DELETES: "d2h-del",
    CONTEXT: "d2h-cntx",
    INFO: "d2h-info"
  };

  function DiffParser() {
  }

  DiffParser.prototype.LINE_TYPE = LINE_TYPE;

  DiffParser.prototype.generateDiffJson = function (diffInput) {
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
      if (utils.startsWith(line, "+") || utils.startsWith(line, " +")) {
        currentFile.addedLines++;

        currentLine.type = LINE_TYPE.INSERTS;
        currentLine.oldNumber = null;
        currentLine.newNumber = newLine++;

        currentBlock.lines.push(currentLine);

      } else if (utils.startsWith(line, "-") || utils.startsWith(line, " -")) {
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
      if (!line || utils.startsWith(line, "*") ||
        utils.startsWith(line, "new") || utils.startsWith(line, "index")) {
        return;
      }

      var values = [];
      if (utils.startsWith(line, "diff")) {
        startFile();
      } else if (currentFile && !currentFile.oldName && (values = /^--- a\/(\S+).*$/.exec(line))) {
        currentFile.oldName = values[1];
      } else if (currentFile && !currentFile.newName && (values = /^\+\+\+ [b]?\/(\S+).*$/.exec(line))) {
        currentFile.newName = values[1];

        var fileSplit = currentFile.newName.split(".");
        currentFile.language = fileSplit[fileSplit.length - 1];
      } else if (currentFile && utils.startsWith(line, "@@")) {
        startBlock(line);
      } else if (currentBlock) {
        createLine(line);
      }
    });

    saveBlock();
    saveFile();

    return files;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports.DiffParser = new DiffParser();
  } else if (typeof global.DiffParser === 'undefined') {
    global.DiffParser = new DiffParser();
  }

})(this);
