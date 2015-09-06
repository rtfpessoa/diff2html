/*
 *
 * PrinterUtils (printer-utils.js)
 * Author: rtfpessoa
 *
 */

(function(ctx, undefined) {

  var jsDiff = require('diff');
  var utils = require('./utils.js').Utils;

  function PrinterUtils() {
  }

  PrinterUtils.prototype.getDiffName = function(file) {
    var oldFilename = file.oldName;
    var newFilename = file.newName;

    if (oldFilename && newFilename
      && oldFilename !== newFilename
      && !isDeletedName(newFilename)) {
      return oldFilename + ' -> ' + newFilename;
    } else if (newFilename && !isDeletedName(newFilename)) {
      return newFilename;
    } else if (oldFilename) {
      return oldFilename;
    } else {
      return 'Unknown filename';
    }
  };

  PrinterUtils.prototype.diffHighlight = function(diffLine1, diffLine2, config) {
    var lineStart1, lineStart2;

    var prefixSize = 1;

    if (config.isCombined) {
      prefixSize = 2;
    }

    lineStart1 = diffLine1.substr(0, prefixSize);
    lineStart2 = diffLine2.substr(0, prefixSize);

    diffLine1 = diffLine1.substr(prefixSize);
    diffLine2 = diffLine2.substr(prefixSize);

    var diff;
    if (config.charByChar) {
      diff = jsDiff.diffChars(diffLine1, diffLine2);
    } else {
      diff = jsDiff.diffWordsWithSpace(diffLine1, diffLine2);
    }

    var highlightedLine = '';

    diff.forEach(function(part) {
      var elemType = part.added ? 'ins' : part.removed ? 'del' : null;
      var escapedValue = utils.escape(part.value);

      if (elemType !== null) {
        highlightedLine += '<' + elemType + '>' + escapedValue + '</' + elemType + '>';
      } else {
        highlightedLine += escapedValue;
      }
    });

    return {
      first: {
        prefix: lineStart1,
        line: removeIns(highlightedLine)
      },
      second: {
        prefix: lineStart2,
        line: removeDel(highlightedLine)
      }
    }
  };

  function isDeletedName(name) {
    return name === 'dev/null';
  }

  function removeIns(line) {
    return line.replace(/(<ins>((.|\n)*?)<\/ins>)/g, '');
  }

  function removeDel(line) {
    return line.replace(/(<del>((.|\n)*?)<\/del>)/g, '');
  }

  module.exports['PrinterUtils'] = new PrinterUtils();

})(this);
