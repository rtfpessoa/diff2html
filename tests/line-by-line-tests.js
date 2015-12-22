var LineByLinePrinter = require('../src/line-by-line-printer.js').LineByLinePrinter;

module.exports = {
  testGenerateEmptyDiff: function (test) {
    var lineByLinePrinter = new LineByLinePrinter({});
    var fileHtml = lineByLinePrinter._generateEmptyDiff();
    var expected = '<tr>\n' +
      '  <td class="d2h-info">' +
      '    <div class="d2h-code-line d2h-info">' +
      'File without changes' +
      '    </div>' +
      '  </td>\n' +
      '</tr>\n';

    test.equal(expected, fileHtml);
    test.done();
  }
};
