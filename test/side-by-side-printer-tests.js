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

  describe('generateSideBySideFileHtml', function() {
    it('should generate lines with the right prefixes', function() {
      var sideBySidePrinter = new SideBySidePrinter({});

      var file = {
        "blocks": [{
          "lines": [{
            "content": " context",
            "type": "d2h-cntx",
            "oldNumber": 19,
            "newNumber": 19
          }, {"content": "-removed", "type": "d2h-del", "oldNumber": 20, "newNumber": null}, {
            "content": "+added",
            "type": "d2h-ins",
            "oldNumber": null,
            "newNumber": 20
          }], "oldStartLine": "19", "newStartLine": "19", "header": "@@ -19,7 +19,7 @@"
        }],
        "deletedLines": 1,
        "addedLines": 1,
        "checksumBefore": "fc56817",
        "checksumAfter": "e8e7e49",
        "mode": "100644",
        "oldName": "coverage.init",
        "language": "init",
        "newName": "coverage.init",
        "isCombined": false
      };

      var fileHtml = sideBySidePrinter.generateSideBySideFileHtml(file);

      var expectedRight = '<tr>' +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>' +
        '    <td class="d2h-info">' +
        '        <div class="d2h-code-side-line d2h-info"></div>' +
        '    </td>' +
        '</tr>' +
        '<tr>' +
        '    <td class="d2h-code-side-linenumber d2h-cntx">19</td>' +
        '    <td class="d2h-cntx">' +
        '        <div class="d2h-code-side-line d2h-cntx">' +
        '            <span class="d2h-code-line-prefix"> </span>' +
        '            <span class="d2h-code-line-ctn">context</span>' +
        '        </div>' +
        '    </td>' +
        '</tr>' +
        '<tr>' +
        '    <td class="d2h-code-side-linenumber d2h-ins">20</td>' +
        '    <td class="d2h-ins">' +
        '        <div class="d2h-code-side-line d2h-ins">' +
        '            <span class="d2h-code-line-prefix">+</span>' +
        '            <span class="d2h-code-line-ctn"><ins>added</ins></span>' +
        '        </div>' +
        '    </td>' +
        '</tr>';

      var expectedLeft = '<tr>' +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>' +
        '    <td class="d2h-info">' +
        '        <div class="d2h-code-side-line d2h-info"> @@ -19,7 +19,7 @@</div>' +
        '    </td>' +
        '</tr>' +
        '<tr>' +
        '    <td class="d2h-code-side-linenumber d2h-cntx">19</td>' +
        '    <td class="d2h-cntx">' +
        '        <div class="d2h-code-side-line d2h-cntx">' +
        '            <span class="d2h-code-line-prefix"> </span>' +
        '            <span class="d2h-code-line-ctn">context</span>' +
        '        </div>' +
        '    </td>' +
        '</tr>' +
        '<tr>' +
        '    <td class="d2h-code-side-linenumber d2h-del">20</td>' +
        '    <td class="d2h-del">' +
        '        <div class="d2h-code-side-line d2h-del">' +
        '            <span class="d2h-code-line-prefix">-</span>' +
        '            <span class="d2h-code-line-ctn"><del>removed</del></span>' +
        '        </div>' +
        '    </td>' +
        '</tr>';

      var HTMLParser = require('fast-html-parser');

      var prefixTag = '.d2h-code-line-prefix';

      var parsedExpectedRight = HTMLParser.parse(expectedRight);
      var parsedFileRight = HTMLParser.parse(fileHtml.right);
      assert.equal(parsedExpectedRight.querySelectorAll(prefixTag).length > 0, true);
      assert.equal(parsedExpectedRight.querySelectorAll(prefixTag).length,
        parsedFileRight.querySelectorAll(prefixTag).length);

      var parsedExpectedLeft = HTMLParser.parse(expectedLeft);
      var parsedFileLeft = HTMLParser.parse(fileHtml.left);
      assert.equal(parsedExpectedLeft.querySelectorAll(prefixTag).length > 0, true);
      assert.equal(parsedExpectedLeft.querySelectorAll(prefixTag).length,
        parsedFileLeft.querySelectorAll(prefixTag).length);
    });
  });

  describe('generateSingleLineHtml', function() {
    it('should work for insertions', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var sideBySidePrinter = new SideBySidePrinter({});
      var fileHtml = sideBySidePrinter.generateSingleLineHtml(
        diffParser.LINE_TYPE.INSERTS, 30, 'test', '+');
      var expected = '<tr>\n' +
      '    <td class="d2h-code-side-linenumber d2h-ins">30</td>\n' +
      '    <td class="d2h-ins">' +
      '      <div class="d2h-code-side-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">test</span></div>' +
      '    </td>\n' +
      '  </tr>\n';

      assert.equal(expected, fileHtml);
    });
    it('should work for deletions', function() {

      var diffParser = require('../src/diff-parser.js').DiffParser;
      var sideBySidePrinter = new SideBySidePrinter({});
      var fileHtml = sideBySidePrinter.generateSingleLineHtml(
        diffParser.LINE_TYPE.DELETES, 30, 'test', '-');
      var expected = '<tr>\n' +
      '    <td class="d2h-code-side-linenumber d2h-del">30</td>\n' +
      '    <td class="d2h-del">' +
      '      <div class="d2h-code-side-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn">test</span></div>' +
      '    </td>\n' +
      '  </tr>\n';

      assert.equal(expected, fileHtml);
    });
  });
});
