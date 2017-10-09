/*
 *
 * Diff Parser (diff-parser.js)
 * Author: rtfpessoa
 *
 */

(function() {
  var utils = require('./utils.js').Utils;

  var LINE_TYPE = {
    INSERTS: 'd2h-ins',
    DELETES: 'd2h-del',
    INSERT_CHANGES: 'd2h-ins d2h-change',
    DELETE_CHANGES: 'd2h-del d2h-change',
    CONTEXT: 'd2h-cntx',
    INFO: 'd2h-info'
  };

  function DiffParser() {
  }

  DiffParser.prototype.LINE_TYPE = LINE_TYPE;

  DiffParser.prototype.generateDiffJson = function(diffInput, configuration) {
    var config = configuration || {};

    var files = [];
    var currentFile = null;
    var currentBlock = null;
    var oldLine = null;
    var oldLine2 = null; // Used for combined diff
    var newLine = null;

    var possibleOldName;
    var possibleNewName;

    /* Diff Header */
    var oldFileNameHeader = '--- ';
    var newFileNameHeader = '+++ ';
    var hunkHeaderPrefix = '@@';

    /* Add previous block(if exists) before start a new file */
    function saveBlock() {
      if (currentBlock) {
        currentFile.blocks.push(currentBlock);
        currentBlock = null;
      }
    }

    /*
     * Add previous file(if exists) before start a new one
     * if it has name (to avoid binary files errors)
     */
    function saveFile() {
      if (currentFile) {
        if (!currentFile.oldName) {
          currentFile.oldName = possibleOldName;
        }

        if (!currentFile.newName) {
          currentFile.newName = possibleNewName;
        }

        if (currentFile.newName) {
          files.push(currentFile);
          currentFile = null;
        }
      }

      possibleOldName = undefined;
      possibleNewName = undefined;
    }

    /* Create file structure */
    function startFile() {
      saveBlock();
      saveFile();

      currentFile = {};
      currentFile.blocks = [];
      currentFile.deletedLines = 0;
      currentFile.addedLines = 0;
    }

    function startBlock(line) {
      saveBlock();

      var values;

      /**
       * From Range:
       * -<start line>[,<number of lines>]
       *
       * To Range:
       * +<start line>[,<number of lines>]
       *
       * @@ from-file-range to-file-range @@
       *
       * @@@ from-file-range from-file-range to-file-range @@@
       *
       * number of lines is optional, if omited consider 0
       */

      if ((values = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@.*/.exec(line))) {
        currentFile.isCombined = false;
        oldLine = values[1];
        newLine = values[2];
      } else if ((values = /^@@@ -(\d+)(?:,\d+)? -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@@.*/.exec(line))) {
        currentFile.isCombined = true;
        oldLine = values[1];
        oldLine2 = values[2];
        newLine = values[3];
      } else {
        if (utils.startsWith(line, hunkHeaderPrefix)) {
          console.error('Failed to parse lines, starting in 0!');
        }

        oldLine = 0;
        newLine = 0;
        currentFile.isCombined = false;
      }

      /* Create block metadata */
      currentBlock = {};
      currentBlock.lines = [];
      currentBlock.oldStartLine = oldLine;
      currentBlock.oldStartLine2 = oldLine2;
      currentBlock.newStartLine = newLine;
      currentBlock.header = line;
    }

    function createLine(line) {
      var currentLine = {};
      currentLine.content = line;

      var newLinePrefixes = !currentFile.isCombined ? ['+'] : ['+', ' +'];
      var delLinePrefixes = !currentFile.isCombined ? ['-'] : ['-', ' -'];

      /* Fill the line data */
      if (utils.startsWith(line, newLinePrefixes)) {
        currentFile.addedLines++;

        currentLine.type = LINE_TYPE.INSERTS;
        currentLine.oldNumber = null;
        currentLine.newNumber = newLine++;

        currentBlock.lines.push(currentLine);
      } else if (utils.startsWith(line, delLinePrefixes)) {
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
    }

    /*
     * Checks if there is a hunk header coming before a new file starts
     *
     * Hunk header is a group of three lines started by ( `--- ` , `+++ ` , `@@` )
     */
    function existHunkHeader(line, lineIdx) {
      var idx = lineIdx;

      while (idx < diffLines.length - 3) {
        if (utils.startsWith(line, 'diff')) {
          return false;
        }

        if (
          utils.startsWith(diffLines[idx], oldFileNameHeader) &&
          utils.startsWith(diffLines[idx + 1], newFileNameHeader) &&
          utils.startsWith(diffLines[idx + 2], hunkHeaderPrefix)
        ) {
          return true;
        }

        idx++;
      }

      return false;
    }

    var diffLines =
      diffInput.replace(/\\ No newline at end of file/g, '')
        .replace(/\r\n?/g, '\n')
        .split('\n');

    /* Diff */
    var oldMode = /^old mode (\d{6})/;
    var newMode = /^new mode (\d{6})/;
    var deletedFileMode = /^deleted file mode (\d{6})/;
    var newFileMode = /^new file mode (\d{6})/;

    var copyFrom = /^copy from "?(.+)"?/;
    var copyTo = /^copy to "?(.+)"?/;

    var renameFrom = /^rename from "?(.+)"?/;
    var renameTo = /^rename to "?(.+)"?/;

    var similarityIndex = /^similarity index (\d+)%/;
    var dissimilarityIndex = /^dissimilarity index (\d+)%/;
    var index = /^index ([0-9a-z]+)\.\.([0-9a-z]+)\s*(\d{6})?/;

    var binaryFiles = /^Binary files (.*) and (.*) differ/;
    var binaryDiff = /^GIT binary patch/;

    /* Combined Diff */
    var combinedIndex = /^index ([0-9a-z]+),([0-9a-z]+)\.\.([0-9a-z]+)/;
    var combinedMode = /^mode (\d{6}),(\d{6})\.\.(\d{6})/;
    var combinedNewFile = /^new file mode (\d{6})/;
    var combinedDeletedFile = /^deleted file mode (\d{6}),(\d{6})/;

    diffLines.forEach(function(line, lineIndex) {
      // Unmerged paths, and possibly other non-diffable files
      // https://github.com/scottgonzalez/pretty-diff/issues/11
      // Also, remove some useless lines
      if (!line || utils.startsWith(line, '*')) {
        return;
      }

      // Used to store regex capture groups
      var values;

      var prevLine = diffLines[lineIndex - 1];
      var nxtLine = diffLines[lineIndex + 1];
      var afterNxtLine = diffLines[lineIndex + 2];

      if (utils.startsWith(line, 'diff')) {
        startFile();

        // diff --git a/blocked_delta_results.png b/blocked_delta_results.png
        var gitDiffStart = /^diff --git "?(.+)"? "?(.+)"?/;
        if ((values = gitDiffStart.exec(line))) {
          possibleOldName = _getFilename(null, values[1], config.dstPrefix);
          possibleNewName = _getFilename(null, values[2], config.srcPrefix);
        }

        currentFile.isGitDiff = true;
        return;
      }

      if (!currentFile || // If we do not have a file yet, we should crete one
        (
          !currentFile.isGitDiff && currentFile && // If we already have some file in progress and
          (
            utils.startsWith(line, oldFileNameHeader) && // If we get to an old file path header line
            // And is followed by the new file path header line and the hunk header line
            utils.startsWith(nxtLine, newFileNameHeader) && utils.startsWith(afterNxtLine, hunkHeaderPrefix)
          )
        )
      ) {
        startFile();
      }

      /*
       * We need to make sure that we have the three lines of the header.
       * This avoids cases like the ones described in:
       *   - https://github.com/rtfpessoa/diff2html/issues/87
       */
      if (
        (utils.startsWith(line, oldFileNameHeader) &&
        utils.startsWith(nxtLine, newFileNameHeader)) ||

        (utils.startsWith(line, newFileNameHeader) &&
        utils.startsWith(prevLine, oldFileNameHeader))
      ) {
        /*
         * --- Date Timestamp[FractionalSeconds] TimeZone
         * --- 2002-02-21 23:30:39.942229878 -0800
         */
        if (currentFile && !currentFile.oldName &&
          utils.startsWith(line, '--- ') && (values = getSrcFilename(line, config))) {
          currentFile.oldName = values;
          currentFile.language = getExtension(currentFile.oldName, currentFile.language);
          return;
        }

        /*
         * +++ Date Timestamp[FractionalSeconds] TimeZone
         * +++ 2002-02-21 23:30:39.942229878 -0800
         */
        if (currentFile && !currentFile.newName &&
          utils.startsWith(line, '+++ ') && (values = getDstFilename(line, config))) {
          currentFile.newName = values;
          currentFile.language = getExtension(currentFile.newName, currentFile.language);
          return;
        }
      }

      if (
        (currentFile && utils.startsWith(line, hunkHeaderPrefix)) ||
        (currentFile.isGitDiff && currentFile && currentFile.oldName && currentFile.newName && !currentBlock)
      ) {
        startBlock(line);
        return;
      }

      /*
       * There are three types of diff lines. These lines are defined by the way they start.
       * 1. New line     starts with: +
       * 2. Old line     starts with: -
       * 3. Context line starts with: <SPACE>
       */
      if (currentBlock && (utils.startsWith(line, '+') || utils.startsWith(line, '-') || utils.startsWith(line, ' '))) {
        createLine(line);
        return;
      }

      var doesNotExistHunkHeader = !existHunkHeader(line, lineIndex);

      /*
       * Git diffs provide more information regarding files modes, renames, copies,
       * commits between changes and similarity indexes
       */
      if ((values = oldMode.exec(line))) {
        currentFile.oldMode = values[1];
      } else if ((values = newMode.exec(line))) {
        currentFile.newMode = values[1];
      } else if ((values = deletedFileMode.exec(line))) {
        currentFile.deletedFileMode = values[1];
        currentFile.isDeleted = true;
      } else if ((values = newFileMode.exec(line))) {
        currentFile.newFileMode = values[1];
        currentFile.isNew = true;
      } else if ((values = copyFrom.exec(line))) {
        if (doesNotExistHunkHeader) {
          currentFile.oldName = values[1];
        }
        currentFile.isCopy = true;
      } else if ((values = copyTo.exec(line))) {
        if (doesNotExistHunkHeader) {
          currentFile.newName = values[1];
        }
        currentFile.isCopy = true;
      } else if ((values = renameFrom.exec(line))) {
        if (doesNotExistHunkHeader) {
          currentFile.oldName = values[1];
        }
        currentFile.isRename = true;
      } else if ((values = renameTo.exec(line))) {
        if (doesNotExistHunkHeader) {
          currentFile.newName = values[1];
        }
        currentFile.isRename = true;
      } else if ((values = binaryFiles.exec(line))) {
        currentFile.isBinary = true;
        currentFile.oldName = _getFilename(null, values[1], config.srcPrefix);
        currentFile.newName = _getFilename(null, values[2], config.dstPrefix);
        startBlock('Binary file');
      } else if ((values = binaryDiff.exec(line))) {
        currentFile.isBinary = true;
        startBlock(line);
      } else if ((values = similarityIndex.exec(line))) {
        currentFile.unchangedPercentage = values[1];
      } else if ((values = dissimilarityIndex.exec(line))) {
        currentFile.changedPercentage = values[1];
      } else if ((values = index.exec(line))) {
        currentFile.checksumBefore = values[1];
        currentFile.checksumAfter = values[2];
        values[3] && (currentFile.mode = values[3]);
      } else if ((values = combinedIndex.exec(line))) {
        currentFile.checksumBefore = [values[2], values[3]];
        currentFile.checksumAfter = values[1];
      } else if ((values = combinedMode.exec(line))) {
        currentFile.oldMode = [values[2], values[3]];
        currentFile.newMode = values[1];
      } else if ((values = combinedNewFile.exec(line))) {
        currentFile.newFileMode = values[1];
        currentFile.isNew = true;
      } else if ((values = combinedDeletedFile.exec(line))) {
        currentFile.deletedFileMode = values[1];
        currentFile.isDeleted = true;
      }
    });

    saveBlock();
    saveFile();

    return files;
  };

  function getExtension(filename, language) {
    var nameSplit = filename.split('.');
    if (nameSplit.length > 1) {
      return nameSplit[nameSplit.length - 1];
    }

    return language;
  }

  function getSrcFilename(line, cfg) {
    return _getFilename('---', line, cfg.srcPrefix);
  }

  function getDstFilename(line, cfg) {
    return _getFilename('\\+\\+\\+', line, cfg.dstPrefix);
  }

  function _getFilename(linePrefix, line, extraPrefix) {
    var prefixes = ['a/', 'b/', 'i/', 'w/', 'c/', 'o/'];
    if (extraPrefix) {
      prefixes.push(extraPrefix);
    }

    var FilenameRegExp;
    if (linePrefix) {
      FilenameRegExp = new RegExp('^' + linePrefix + ' "?(.+?)"?$');
    } else {
      FilenameRegExp = new RegExp('^"?(.+?)"?$');
    }

    var filename;
    var values = FilenameRegExp.exec(line);
    if (values && values[1]) {
      filename = values[1];
      var matchingPrefixes = prefixes.filter(function(p) {
        return filename.indexOf(p) === 0;
      });

      if (matchingPrefixes[0]) {
        // Remove prefix if exists
        filename = filename.slice(matchingPrefixes[0].length);
      }

      // Cleanup timestamps generated by the unified diff (diff command) as specified in
      // https://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html
      // Ie: 2016-10-25 11:37:14.000000000 +0200
      filename = filename.replace(/\s+\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? [-+]\d{4}.*$/, '');
    }

    return filename;
  }

  module.exports.DiffParser = new DiffParser();
})();
