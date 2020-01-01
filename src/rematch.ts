/*
 * Matching two sequences of objects by similarity
 * Author: W. Illmeyer, Nexxar GmbH
 */

export type BestMatch = {
  indexA: number;
  indexB: number;
  score: number;
};

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
export function levenshtein(a: string, b: string): number {
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const matrix = [];

  // Increment along the first column of each row
  let i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  let j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          Math.min(
            matrix[i][j - 1] + 1, // Insertion
            matrix[i - 1][j] + 1,
          ),
        ); // Deletion
      }
    }
  }

  return matrix[b.length][a.length];
}

export type DistanceFn<T> = (x: T, y: T) => number;

export function newDistanceFn<T>(str: (value: T) => string): DistanceFn<T> {
  return (x: T, y: T): number => {
    const xValue = str(x).trim();
    const yValue = str(y).trim();
    const lev = levenshtein(xValue, yValue);
    return lev / (xValue.length + yValue.length);
  };
}

export type MatcherFn<T> = (a: T[], b: T[], level?: number, cache?: Map<string, number>) => T[][][];

export function newMatcherFn<T>(distance: (x: T, y: T) => number): MatcherFn<T> {
  function findBestMatch(a: T[], b: T[], cache: Map<string, number> = new Map()): BestMatch | undefined {
    let bestMatchDist = Infinity;
    let bestMatch;

    for (let i = 0; i < a.length; ++i) {
      for (let j = 0; j < b.length; ++j) {
        const cacheKey = JSON.stringify([a[i], b[j]]);
        let md;
        if (!(cache.has(cacheKey) && (md = cache.get(cacheKey)))) {
          md = distance(a[i], b[j]);
          cache.set(cacheKey, md);
        }
        if (md < bestMatchDist) {
          bestMatchDist = md;
          bestMatch = { indexA: i, indexB: j, score: bestMatchDist };
        }
      }
    }

    return bestMatch;
  }

  function group(a: T[], b: T[], level = 0, cache: Map<string, number> = new Map()): T[][][] {
    const bm = findBestMatch(a, b, cache);

    if (!bm || a.length + b.length < 3) {
      return [[a, b]];
    }

    const a1 = a.slice(0, bm.indexA);
    const b1 = b.slice(0, bm.indexB);
    const aMatch = [a[bm.indexA]];
    const bMatch = [b[bm.indexB]];
    const tailA = bm.indexA + 1;
    const tailB = bm.indexB + 1;
    const a2 = a.slice(tailA);
    const b2 = b.slice(tailB);

    const group1 = group(a1, b1, level + 1, cache);
    const groupMatch = group(aMatch, bMatch, level + 1, cache);
    const group2 = group(a2, b2, level + 1, cache);
    let result = groupMatch;

    if (bm.indexA > 0 || bm.indexB > 0) {
      result = group1.concat(result);
    }

    if (a.length > tailA || b.length > tailB) {
      result = result.concat(group2);
    }

    return result;
  }

  return group;
}
