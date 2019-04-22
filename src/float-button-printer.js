/*
 *
 * FloatButtonPrinter (float-button-printer.js)
 * Author: PhoebeWho
 *
 */

(function() {
  var hoganUtils;

  var genericTemplatesPath = 'generic';

  function FloatButtonPrinter(config) {
    this.config = config;

    var HoganJsUtils = require('./hoganjs-utils.js').HoganJsUtils;
    hoganUtils = new HoganJsUtils(config);
  }

  FloatButtonPrinter.prototype.generateFloatButton = function() {
    return hoganUtils.render(genericTemplatesPath, 'float-button', {});
  };

  module.exports.FloatButtonPrinter = FloatButtonPrinter;
})();
