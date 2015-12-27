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
  describe('_generateLineHtml', function() {
    it('should work for insertions', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter._generateLineHtml(
        diffParser.LINE_TYPE.INSERTS, '', 30, '+', 'test');
      var expected = '<tr>\n' +
      '  <td class="d2h-code-linenumber d2h-ins">' +
      '    <div class="line-num1"></div>' +
      '    <div class="line-num2">30</div>' +
      '  </td>\n' +
      '  <td class="d2h-ins">' +
      '    <div class="d2h-code-line d2h-ins">' +
      '<span class="d2h-code-line-prefix">test</span>' +
      '<span class="d2h-code-line-ctn">+</span></div>' +
      '  </td>\n' +
      '</tr>\n';

      assert.equal(expected, fileHtml);
    });
    it('should work for deletions', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter._generateLineHtml(
        diffParser.LINE_TYPE.DELETES, 30, '', '-', 'test');
      var expected = '<tr>\n' +
      '  <td class="d2h-code-linenumber d2h-del">' +
      '    <div class="line-num1">30</div>' +
      '    <div class="line-num2"></div>' +
      '  </td>\n' +
      '  <td class="d2h-del">' +
      '    <div class="d2h-code-line d2h-del">' +
      '<span class="d2h-code-line-prefix">test</span>' +
      '<span class="d2h-code-line-ctn">-</span></div>' +
      '  </td>\n' +
      '</tr>\n';

      assert.equal(expected, fileHtml);
    });
  });
});
