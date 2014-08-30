/*
 *
 * Word Diff Parser (word-diff-parser.js)
 * Author: rtfpessoa
 * Date: Saturday 30 August 2014
 *
 */

(function($, window) {
  var ClassVariable;

  ClassVariable = (function() {

    function WordDiffParser() {}

    WordDiffParser.prototype.generateChangedWords = function(wordDiffInput) {
      return wordDiffInput ? parseChangedWords(wordDiffInput) : null;
    };

    var parseChangedWords = function(wordDiffInput) {
      var files = [],
        currentFile = null,
        oldLine = null,
        newLine = null;

      wordDiffInput.split("\n").forEach(function(line) {
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

          /* add previous file(if exists) before start a new one */
          if (currentFile &&
            (currentFile.addedWords.length || currentFile.deletedWords.length)) {
            files.push(currentFile);
            currentFile = null;
          }

          /* create file structure */
          currentFile = {};
          currentFile.addedWords = [];
          currentFile.deletedWords = [];

          /* save file paths, before and after the diff */
          var values = /^diff --git a\/(\S+) b\/(\S+).*$/.exec(line);
          currentFile.oldName = values[1];
          currentFile.newName = values[2];

        } else if (line.indexOf("@@") === 0) {
          /* Diff Block Header Line */

          var values = /^(@@ -(\d+),(\d+) \+(\d+),(\d+) @@).*/.exec(line);

          oldLine = values[2];
          newLine = values[4];

        } else {
          /* Regular Diff Line */

          var addedWords = [];
          if (addedWords = line.match(/\{\+(.+?)\+\}/g)) {
            addedWords = addedWords.map(function(word) {
              return cleanWordMatch(word);
            });
          } else {
            addedWords = [];
          }

          var deletedWords = [];
          if (deletedWords = line.match(/\[-(.+?)-\]/g)) {
            deletedWords = deletedWords.map(function(word) {
              return cleanWordMatch(word);
            });
          } else {
            deletedWords = [];
          }

          if (!addedWords.length && !deletedWords.length) {
            oldLine++;
            newLine++;
          } else {
            if (addedWords.length) {
              currentFile.addedWords[newLine] = addedWords;
              newLine++;
            }

            if (deletedWords.length) {
              currentFile.deletedWords[oldLine] = deletedWords;
              oldLine++;
            }
          }
        }
      });

      /* add previous file(if exists) before start a new one */
      if (currentFile &&
        (currentFile.addedWords.length || currentFile.deletedWords.length)) {
        files.push(currentFile);
        currentFile = null;
      }

      return files;
    };

    var cleanWordMatch = function(str) {
      return str.substr(2, str.length - 4);
    };

    /* singleton pattern */
    var instance;
    return {
      getInstance: function() {
        if (instance === undefined) {
          instance = new WordDiffParser();
          /* Hide the constructor so the returned objected can't be new'd */
          instance.constructor = null;
        }
        return instance;
      }
    };

  })();

  window.WordDiffParser = ClassVariable;
  return window.WordDiffParser;

})(jQuery, window);
