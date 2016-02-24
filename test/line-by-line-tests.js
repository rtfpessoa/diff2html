var assert = require('assert');
var Utils = require('../src/utils.js').Utils;

var LineByLinePrinter = require('../src/line-by-line-printer.js').LineByLinePrinter;

describe('LineByLinePrinter', function() {
  describe('_generateEmptyDiff', function() {
    it('should return an empty diff', function() {

      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter._generateEmptyDiff();
      var expected = '<tr>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-line d2h-info">\n' +
        '            File without changes\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n';

      assert.equal(expected, fileHtml);
    });
  });
  describe('makeLineHtml', function() {
    it('should work for insertions', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter.makeLineHtml(
        diffParser.LINE_TYPE.INSERTS, '', 30, '+', 'test');
      fileHtml = fileHtml.replace(/\n\n+/g, '\n');
      var expected = '<tr>\n' +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '        <div class="line-num1"></div>\n' +
        '        <div class="line-num2">30</div>\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">test</span>\n' +
        '            <span class="d2h-code-line-ctn">+</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n';

      assert.equal(expected, fileHtml);
    });
    it('should work for deletions', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter.makeLineHtml(
        diffParser.LINE_TYPE.DELETES, 30, '', '-', 'test');
      fileHtml = fileHtml.replace(/\n\n+/g, '\n');
      var expected = '<tr>\n' +
        '    <td class="d2h-code-linenumber d2h-del">\n' +
        '        <div class="line-num1">30</div>\n' +
        '        <div class="line-num2"></div>\n' +
        '    </td>\n' +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">test</span>\n' +
        '            <span class="d2h-code-line-ctn">-</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n';

      assert.equal(expected, fileHtml);
    });
    it('should convert indents into non breakin spaces (2 white spaces)', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter.makeLineHtml(
        diffParser.LINE_TYPE.INSERTS, '', 30, '+', '  test');
      fileHtml = fileHtml.replace(/\n\n+/g, '\n');
      var expected = '<tr>\n' +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '        <div class="line-num1"></div>\n' +
        '        <div class="line-num2">30</div>\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;&nbsp;test</span>\n' +
        '            <span class="d2h-code-line-ctn">+</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n';

      assert.equal(expected, fileHtml);
    });
    it('should convert indents into non breakin spaces (4 white spaces)', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter.makeLineHtml(
        diffParser.LINE_TYPE.INSERTS, '', 30, '+', '    test');
      fileHtml = fileHtml.replace(/\n\n+/g, '\n');
      var expected = '<tr>\n' +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '        <div class="line-num1"></div>\n' +
        '        <div class="line-num2">30</div>\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;&nbsp;&nbsp;&nbsp;test</span>\n' +
        '            <span class="d2h-code-line-ctn">+</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n';

      assert.equal(expected, fileHtml);
    });
    it('should convert indents into non breakin spaces (one tab)', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var lineByLinePrinter = new LineByLinePrinter({});
      var fileHtml = lineByLinePrinter.makeLineHtml(
        diffParser.LINE_TYPE.INSERTS, '', 30, '+', Utils.escape('\ttest'));
      fileHtml = fileHtml.replace(/\n\n+/g, '\n');
      var expected = '<tr>\n' +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '        <div class="line-num1"></div>\n' +
        '        <div class="line-num2">30</div>\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;&nbsp;&nbsp;&nbsp;test</span>\n' +
        '            <span class="d2h-code-line-ctn">+</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n';

      assert.equal(expected, fileHtml);
    });
  });
});
