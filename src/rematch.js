/*
 *
 * Rematch (rematch.js)
 * Matching two sequences of objects by similarity
 * Author: W. Illmeyer, Nexxar GmbH
 *
 */

(function() {
  var Rematch = {};

  /*
   Copyright (c) 2011 Andrei Mackenzie
   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
   documentation files (the "Software"), to deal in the Software without restriction, including without limitation
   the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
   and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
   The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
   THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
   TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */
  function levenshtein(a, b) {
    if (a.length === 0) {
      return b.length;
    }
    if (b.length === 0) {
      return a.length;
    }

    var matrix = [];

    // Increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    // Increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // Substitution
            Math.min(matrix[i][j - 1] + 1, // Insertion
              matrix[i - 1][j] + 1)); // Deletion
        }
      }
    }

    return matrix[b.length][a.length];
  }

  Rematch.levenshtein = levenshtein;

  Rematch.distance = function distance(x, y) {
    x = x.trim();
    y = y.trim();
    var lev = levenshtein(x, y);
    var score = lev / (x.length + y.length);

    return score;
  };

  Rematch.rematch = function rematch(distanceFunction) {
    function findBestMatch(a, b, cache) {
      var bestMatchDist = Infinity;
      var bestMatch;
      for (var i = 0; i < a.length; ++i) {
        for (var j = 0; j < b.length; ++j) {
          var cacheKey = JSON.stringify([a[i], b[j]]);
          var md;
          if (cache.hasOwnProperty(cacheKey)) {
            md = cache[cacheKey];
          } else {
            md = distanceFunction(a[i], b[j]);
            cache[cacheKey] = md;
          }
          if (md < bestMatchDist) {
            bestMatchDist = md;
            bestMatch = {indexA: i, indexB: j, score: bestMatchDist};
          }
        }
      }

      return bestMatch;
    }

    function group(a, b, level, cache) {
      if (typeof (cache) === 'undefined') {
        cache = {};
      }

      var bm = findBestMatch(a, b, cache);

      if (!level) {
        level = 0;
      }

      if (!bm || (a.length + b.length < 3)) {
        return [[a, b]];
      }

      var a1 = a.slice(0, bm.indexA);
      var b1 = b.slice(0, bm.indexB);
      var aMatch = [a[bm.indexA]];
      var bMatch = [b[bm.indexB]];
      var tailA = bm.indexA + 1;
      var tailB = bm.indexB + 1;
      var a2 = a.slice(tailA);
      var b2 = b.slice(tailB);

      var group1 = group(a1, b1, level + 1, cache);
      var groupMatch = group(aMatch, bMatch, level + 1, cache);
      var group2 = group(a2, b2, level + 1, cache);
      var result = groupMatch;

      if (bm.indexA > 0 || bm.indexB > 0) {
        result = group1.concat(result);
      }

      if (a.length > tailA || b.length > tailB) {
        result = result.concat(group2);
      }

      return result;
    }

    return group;
  };

  module.exports.Rematch = Rematch;
})();
