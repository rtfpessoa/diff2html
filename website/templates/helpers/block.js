'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const Handlebars = require('handlebars');

/** @typedef {import('handlebars').HelperOptions} HelperOptions */

/**
 * @param {string} name
 * @param {HelperOptions}
 * @return {string}
 */
module.exports = function (name, options) {
  // eslint-disable-next-line
  const context = this;
  let partial = context._blocks[name] || options.fn;

  if (typeof partial === 'string') {
    partial = Handlebars.compile(partial);
    context._blocks[name] = partial;
  }

  return partial(context, { data: options.hash });
};
