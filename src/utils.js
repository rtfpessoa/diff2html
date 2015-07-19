/*
 *
 * Utils (utils.js)
 * Author: rtfpessoa
 *
 */

(function (ctx, undefined) {

  function Utils() {
  }

  Utils.prototype.escape = function (str) {
    return str.slice(0)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\t/g, "    ");
  };

  Utils.prototype.startsWith = function (str, start) {
    return str.indexOf(start) === 0;
  };

  Utils.prototype.valueOrEmpty = function (value) {
    return value ? value : "";
  };

  // expose this module
  ((typeof module !== 'undefined' && module.exports) ||
  (typeof exports !== 'undefined' && exports) ||
  (typeof window !== 'undefined' && window) ||
  (typeof self !== 'undefined' && self) ||
  (typeof $this !== 'undefined' && $this) ||
  Function('return this')())["Utils"] = new Utils();

})(this);
