var SideBySidePrinter = require('../src/side-by-side-printer.js').SideBySidePrinter;

module.exports = {
  testGenerateEmptyDiff: function (test) {
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
    test.equal(expectedRight, fileHtml.right);
    test.equal(expectedLeft, fileHtml.left);
    test.done();
  }
};
