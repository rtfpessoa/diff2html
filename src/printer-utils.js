/*
 *
 * PrinterUtils (printer-utils.js)
 * Author: rtfpessoa
 *
 */

(function (global, undefined) {

  // dirty hack for browser compatibility
  var jsDiff = (typeof JsDiff !== "undefined" && JsDiff) || require("../lib/diff.js");

  function PrinterUtils() {
  }

  PrinterUtils.prototype.getDiffName = function (oldFilename, newFilename) {
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

  PrinterUtils.prototype.diffHighlight = function (diffLine1, diffLine2, config) {
    var lineStart1, lineStart2;

    var prefixSize = 1;

    if (config.isTripleDiff) prefixSize = 2;

    lineStart1 = diffLine1.substr(0, prefixSize);
    lineStart2 = diffLine2.substr(0, prefixSize);

    diffLine1 = diffLine1.substr(prefixSize);
    diffLine2 = diffLine2.substr(prefixSize);

    var diff;
    if (config.charByChar) diff = jsDiff.diffChars(diffLine1, diffLine2);
    else diff = jsDiff.diffWordsWithSpace(diffLine1, diffLine2);

    //var diff = jsDiff.diffChars(diffLine1, diffLine2);
    //var diff = jsDiff.diffWordsWithSpace(diffLine1, diffLine2);

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
  };

  function removeIns(line) {
    return line.replace(/(<ins>((.|\n)*?)<\/ins>)/g, "");
  }

  function removeDel(line) {
    return line.replace(/(<del>((.|\n)*?)<\/del>)/g, "");
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports.PrinterUtils = new PrinterUtils();
  } else if (typeof global.PrinterUtils === 'undefined') {
    global.PrinterUtils = new PrinterUtils();
  }

})(this);
