'use strict';

/** @typedef {import('handlebars').HelperOptions} HelperOptions */

/**
 * @param {string} name
 * @param {HelperOptions} options
 * @return {void}
 */
module.exports = function (name, options) {
  // don't modify `this` in code directly, because it will be compiled in `exports` as an immutable object
  // eslint-disable-next-line
  const context = this;

  if (!context._blocks) {
    context._blocks = {};
  }

  context._blocks[name] = options.fn;
};
