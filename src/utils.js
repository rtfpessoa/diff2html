/*
 *
 * Utils (utils.js)
 * Author: rtfpessoa
 *
 */

(function (global, undefined) {

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

  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Utils = new Utils();
  } else if (typeof global.Utils === 'undefined') {
    global.Utils = new Utils();
  }

})(this);
