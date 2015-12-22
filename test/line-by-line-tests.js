var assert = require('assert');

var LineByLinePrinter = require('../src/line-by-line-printer.js').LineByLinePrinter;

describe('LineByLinePrinter', function() {
  describe('_generateEmptyDiff', function() {
    it('should return an empty diff', function() {

      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter._generateEmptyDiff();
      var expected = '<tr>\n' +
        '  <td class="d2h-info">' +
        '    <div class="d2h-code-line d2h-info">' +
        'File without changes' +
        '    </div>' +
        '  </td>\n' +
        '</tr>\n';

      assert.equal(expected, fileHtml);
    });
  });
});
