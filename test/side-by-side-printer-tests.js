var assert = require('assert');

var SideBySidePrinter = require('../src/side-by-side-printer.js').SideBySidePrinter;

describe('SideBySidePrinter', function() {
  describe('generateEmptyDiff', function() {
    it('should return an empty diff', function() {

      var sideBySidePrinter = new SideBySidePrinter({});
      var fileHtml = sideBySidePrinter.generateEmptyDiff();
      var expectedRight = '';
      var expectedLeft = '<tr>\n' +
        '  <td class="d2h-info">' +
        '    <div class="d2h-code-side-line d2h-info">' +
        'File without changes' +
        '    </div>' +
        '  </td>\n' +
        '</tr>\n';

      assert.equal(expectedRight, fileHtml.right);
      assert.equal(expectedLeft, fileHtml.left);
    });
  });
});
