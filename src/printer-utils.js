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

  var separator = '/';

  function PrinterUtils() {
  }

  PrinterUtils.prototype.separatePrefix = function(isCombined, line) {
    var prefix;
    var lineWithoutPrefix;

    if (isCombined) {
      prefix = line.substring(0, 2);
      lineWithoutPrefix = line.substring(2);
    } else {
      prefix = line.substring(0, 1);
      lineWithoutPrefix = line.substring(1);
    }

    return {
      'prefix': prefix,
      'line': lineWithoutPrefix
    };
  };

  PrinterUtils.prototype.getHtmlId = function(file) {
    var hashCode = function(text) {
      var i, chr, len;
      var hash = 0;

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
    var oldFilename = unifyPath(file.oldName);
    var newFilename = unifyPath(file.newName);

    if (oldFilename && newFilename && oldFilename !== newFilename && !isDevNullName(oldFilename) && !isDevNullName(newFilename)) {
      var prefixPaths = [];
      var suffixPaths = [];

      var oldFilenameParts = oldFilename.split(separator);
      var newFilenameParts = newFilename.split(separator);

      var oldFilenamePartsSize = oldFilenameParts.length;
      var newFilenamePartsSize = newFilenameParts.length;

      var i = 0;
      var j = oldFilenamePartsSize - 1;
      var k = newFilenamePartsSize - 1;

      while (i < j && i < k) {
        if (oldFilenameParts[i] === newFilenameParts[i]) {
          prefixPaths.push(newFilenameParts[i]);
          i += 1;
        } else {
          break;
        }
      }

      while (j > i && k > i) {
        if (oldFilenameParts[j] === newFilenameParts[k]) {
          suffixPaths.unshift(newFilenameParts[k]);
          j -= 1;
          k -= 1;
        } else {
          break;
        }
      }

      var finalPrefix = prefixPaths.join(separator);
      var finalSuffix = suffixPaths.join(separator);

      var oldRemainingPath = oldFilenameParts.slice(i, j + 1).join(separator);
      var newRemainingPath = newFilenameParts.slice(i, k + 1).join(separator);

      if (finalPrefix.length && finalSuffix.length) {
        return finalPrefix + separator + '{' + oldRemainingPath + ' → ' + newRemainingPath + '}' + separator + finalSuffix;
      } else if (finalPrefix.length) {
        return finalPrefix + separator + '{' + oldRemainingPath + ' → ' + newRemainingPath + '}';
      } else if (finalSuffix.length) {
        return '{' + oldRemainingPath + ' → ' + newRemainingPath + '}' + separator + finalSuffix;
      }

      return oldFilename + ' → ' + newFilename;
    } else if (newFilename && !isDevNullName(newFilename)) {
      return newFilename;
    } else if (oldFilename) {
      return oldFilename;
    }

    return 'unknown/file/path';
  };

  PrinterUtils.prototype.getFileTypeIcon = function(file) {
    var templateName = 'file-changed';

    if (file.isRename) {
      templateName = 'file-renamed';
    } else if (file.isCopy) {
      templateName = 'file-renamed';
    } else if (file.isNew) {
      templateName = 'file-added';
    } else if (file.isDeleted) {
      templateName = 'file-deleted';
    } else if (file.newName !== file.oldName) {
      // If file is not Added, not Deleted and the names changed it must be a rename :)
      templateName = 'file-renamed';
    }

    return templateName;
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

    if (unprefixedLine1.length > config.maxLineLengthHighlight ||
      unprefixedLine2.length > config.maxLineLengthHighlight) {
      return {
        first: {
          prefix: linePrefix1,
          line: utils.escape(unprefixedLine1)
        },
        second: {
          prefix: linePrefix2,
          line: utils.escape(unprefixedLine2)
        }
      };
    }

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

  function unifyPath(path) {
    if (path) {
      return path.replace('\\', '/');
    }

    return path;
  }

  function isDevNullName(name) {
    return name.indexOf('dev/null') !== -1;
  }

  function removeIns(line) {
    return line.replace(/(<ins[^>]*>((.|\n)*?)<\/ins>)/g, '');
  }

  function removeDel(line) {
    return line.replace(/(<del[^>]*>((.|\n)*?)<\/del>)/g, '');
  }

  module.exports.PrinterUtils = new PrinterUtils();
})();
