/*
 * Hack to allow nodejs require("package/file") in the browser
 *  How?
 *    Since every require is used as an object:
 *      `require("./utils.js").Utils` // (notice the `.Utils`)
 *
 *    We can say that when there is no require method
 *    we use the global object in which the `Utils`
 *    object was already injected.
 */

var $globalHolder = (typeof module !== 'undefined' && module.exports) ||
  (typeof exports !== 'undefined' && exports) ||
  (typeof window !== 'undefined' && window) ||
  (typeof self !== 'undefined' && self) ||
  (typeof this !== 'undefined' && this) ||
  Function('return this')();
function require() {
  return $globalHolder;
}
