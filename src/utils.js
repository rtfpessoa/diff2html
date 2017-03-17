/*
 *
 * Utils (utils.js)
 * Author: rtfpessoa
 *
 */

(function() {
  function Utils() {
  }

  Utils.prototype.escape = function(str) {
    return str.slice(0)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\t/g, '    ');
  };

  Utils.prototype.startsWith = function(str, start) {
    if (typeof start === 'object') {
      var result = false;
      start.forEach(function(s) {
        if (str.indexOf(s) === 0) {
          result = true;
        }
      });

      return result;
    }

    return str && str.indexOf(start) === 0;
  };

  Utils.prototype.valueOrEmpty = function(value) {
    return value || '';
  };

  module.exports.Utils = new Utils();
})();
