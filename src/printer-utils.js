/*
 *
 * PrinterUtils (printer-utils.js)
 * Author: rtfpessoa
 *
 */

(function() {

  var jsDiff = require('diff');
  var utils = require('./utils.js').Utils;
  var Rematch = require('./rematch.js').Rematch;

  function PrinterUtils() {
  }

  PrinterUtils.prototype.getHtmlId = function(file) {
    var hashCode = function(text) {
      var i, chr, len;
      var hash = 0;

      if (text.length === 0) {
        return hash;
      }

      for (i = 0, len = text.length; i < len; i++) {
        chr = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }

      return hash;
    };

    return 'd2h-' + hashCode(this.getDiffName(file)).toString().slice(-6);
  };

  PrinterUtils.prototype.getDiffName = function(file) {
    var oldFilename = file.oldName;
    var newFilename = file.newName;

    if (oldFilename && newFilename && oldFilename !== newFilename && !isDeletedName(newFilename)) {
      return oldFilename + ' -> ' + newFilename;
    } else if (newFilename && !isDeletedName(newFilename)) {
      return newFilename;
    } else if (oldFilename) {
      return oldFilename;
    }

    return 'Unknown filename';
  };

  PrinterUtils.prototype.diffHighlight = function(diffLine1, diffLine2, config) {
    var linePrefix1, linePrefix2, unprefixedLine1, unprefixedLine2;

    var prefixSize = 1;

    if (config.isCombined) {
      prefixSize = 2;
    }

    linePrefix1 = diffLine1.substr(0, prefixSize);
    linePrefix2 = diffLine2.substr(0, prefixSize);
    unprefixedLine1 = diffLine1.substr(prefixSize);
    unprefixedLine2 = diffLine2.substr(prefixSize);

    var diff;
    if (config.charByChar) {
      diff = jsDiff.diffChars(unprefixedLine1, unprefixedLine2);
    } else {
      diff = jsDiff.diffWordsWithSpace(unprefixedLine1, unprefixedLine2);
    }

    var highlightedLine = '';

    var changedWords = [];
    if (!config.charByChar && config.matching === 'words') {
      var treshold = 0.25;

      if (typeof (config.matchWordsThreshold) !== 'undefined') {
        treshold = config.matchWordsThreshold;
      }

      var matcher = Rematch.rematch(function(a, b) {
        var amod = a.value;
        var bmod = b.value;

        return Rematch.distance(amod, bmod);
      });

      var removed = diff.filter(function isRemoved(element) {
        return element.removed;
      });

      var added = diff.filter(function isAdded(element) {
        return element.added;
      });

      var chunks = matcher(added, removed);
      chunks.forEach(function(chunk) {
        if (chunk[0].length === 1 && chunk[1].length === 1) {
          var dist = Rematch.distance(chunk[0][0].value, chunk[1][0].value);
          if (dist < treshold) {
            changedWords.push(chunk[0][0]);
            changedWords.push(chunk[1][0]);
          }
        }
      });
    }

    diff.forEach(function(part) {
      var addClass = changedWords.indexOf(part) > -1 ? ' class="d2h-change"' : '';
      var elemType = part.added ? 'ins' : part.removed ? 'del' : null;
      var escapedValue = utils.escape(part.value);

      if (elemType !== null) {
        highlightedLine += '<' + elemType + addClass + '>' + escapedValue + '</' + elemType + '>';
      } else {
        highlightedLine += escapedValue;
      }
    });

    return {
      first: {
        prefix: linePrefix1,
        line: removeIns(highlightedLine)
      },
      second: {
        prefix: linePrefix2,
        line: removeDel(highlightedLine)
      }
    };
  };

  function isDeletedName(name) {
    return name === 'dev/null';
  }

  function removeIns(line) {
    return line.replace(/(<ins[^>]*>((.|\n)*?)<\/ins>)/g, '');
  }

  function removeDel(line) {
    return line.replace(/(<del[^>]*>((.|\n)*?)<\/del>)/g, '');
  }

  module.exports.PrinterUtils = new PrinterUtils();

})();
