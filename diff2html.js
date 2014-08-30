/*
 *
 * Diff to HTML (diff2html.js)
 * Author: rtfpessoa
 * Date: Friday 29 August 2014
 *
 */

(function($, window) {
  var ClassVariable;

  ClassVariable = (function() {

    var CSS_STYLES = {
      INFO: "info",
      CONTEXT: "context",
      NEW: "insert",
      DELETED: "delete"
    };

    var BLOCK_HEADER_LINE = "..."

      function Diff2Html() {}

    Diff2Html.prototype.generatePrettyDiff = function(diffInput) {
      var diffFiles = splitByFile(diffInput);
      var html = generateHtml(diffFiles);

      return html;
    };

    var splitByFile = function(diffInput) {
      var files = [],
        currentFile = null,
        currentBlock = null,
        oldLine = null,
        newLine = null;

      diffInput.split("\n").forEach(function(line) {
        // Unmerged paths, and possibly other non-diffable files
        // https://github.com/scottgonzalez/pretty-diff/issues/11
        // Also, remove some useless lines
        if (!line || line.charAt(0) === "*" ||
          line.indexOf("new") === 0 ||
          line.indexOf("index") === 0 ||
          line.indexOf("---") === 0 ||
          line.indexOf("+++") === 0) {
          return;
        }

        if (line.indexOf("diff") === 0) {
          /* File Diff Line */

          /* add previous block(if exists) before start a new file */
          if (currentBlock) {
            currentFile.blocks.push(currentBlock);
            currentBlock = null;
          }

          /* add previous file(if exists) before start a new one */
          if (currentFile) {
            files.push(currentFile);
            currentFile = null;
          }

          /* create file structure */
          currentFile = {};
          currentFile.blocks = [];

          /* save file paths, before and after the diff */
          var values = /^diff --git a\/(\S+) b\/(\S+).*$/.exec(line);
          currentFile.oldName = values[1];
          currentFile.newName = values[2];

        } else if (line.indexOf("@@") === 0) {
          /* Diff Block Header Line */

          var values = /^(@@ -(\d+),(\d+) \+(\d+),(\d+) @@).*/.exec(line);

          /* add previous block(if exists) before start a new one */
          if (currentBlock) {
            currentFile.blocks.push(currentBlock);
            currentBlock = null;
          }

          /* create block metadata */
          currentBlock = {};
          currentBlock.lines = [];
          currentBlock.oldStartLine = oldLine = values[2];
          currentBlock.newStartLine = newLine = values[4];
          currentBlock.deletedLines = values[3];
          currentBlock.addedLines = values[5];

          /* create block header line */
          var currentLine = {};
          currentLine.type = CSS_STYLES.INFO;
          currentLine.content = line;
          currentLine.oldNumber = BLOCK_HEADER_LINE;
          currentLine.newNumber = BLOCK_HEADER_LINE;

          /* add line to block */
          currentBlock.lines.push(currentLine);

        } else {
          /* Regular Diff Line */

          var currentLine = {};
          currentLine.content = line;

          if (line.indexOf("+") === 0) {
            currentLine.type = CSS_STYLES.NEW;
            currentLine.oldNumber = null;
            currentLine.newNumber = newLine++;

          } else if (line.indexOf("-") === 0) {
            currentLine.type = CSS_STYLES.DELETED;
            currentLine.oldNumber = oldLine++;
            currentLine.newNumber = null;

          } else {
            currentLine.type = CSS_STYLES.CONTEXT;
            currentLine.oldNumber = oldLine++;
            currentLine.newNumber = newLine++;

          }

          /* add line to block */
          currentBlock.lines.push(currentLine);
        }
      });

      /* add previous block(if exists) before start a new file */
      if (currentBlock) {
        currentFile.blocks.push(currentBlock);
        currentBlock = null;
      }

      /* add previous file(if exists) before start a new one */
      if (currentFile) {
        files.push(currentFile);
        currentFile = null;
      }

      return files;
    };

    var generateHtml = function( diffFiles ) {
      return diffFiles.map(function( file ) {
        var fileHeader = file.oldName === file.newName ? file.newName : file.oldName + " -> " + file.newName

        return "<div class=\"file-wrapper\">" +
               "  <div class=\"file-header\">" +
               "    <div class=\"file-name\">" + fileHeader + "</div>" +
               "  </div>" +
               "  <div class=\"file-diff\">" +
               "    <div class=\"code-wrapper\">" +
               "      <table class=\"diff-table\">" +
               "        <tbody>" +
                          generateFileHtml(file) +
               "        </tbody>" +
               "      </table>" +
               "    </div>" +
               "  </div>" +
               "</div>";
      });
    };

    var generateFileHtml = function(file) {
      return file.blocks.map(function(block) {
        return block.lines.map(function(line) {

          var oldLine = line.oldNumber ? line.oldNumber : "",
            newLine = line.newNumber ? line.newNumber : "";

          return "<tr>" +
            "  <td class=\"code-linenumber " + line.type + "\">" + oldLine + "</td>" +
            "  <td class=\"code-linenumber " + line.type + "\">" + newLine + "</td>" +
            "  <td class=\"code-line " + line.type + "\">" + escape(line.content) + "</td>" +
            "</tr>";
        }).join("\n");
      }).join("\n");
    };

    var escape = function(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\t/g, "    ");
    };

    /* singleton pattern */
    var instance;
    return {
      getInstance: function() {
        if (instance === undefined) {
          instance = new Diff2Html();
          /* Hide the constructor so the returned objected can't be new'd */
          instance.constructor = null;
        }
        return instance;
      }
    };

  })();

  window.Diff2Html = ClassVariable;
  return window.Diff2Html;

})(jQuery, window);
