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

  describe('generateSideBySideJsonHtml', function() {
    it('should work for list of files', function() {
      var exampleJson = [{
        blocks: [{
          lines: [{
            content: '-test',
            type: 'd2h-del',
            oldNumber: 1,
            newNumber: null
          },
            {
              content: '+test1r',
              type: 'd2h-ins',
              oldNumber: null,
              newNumber: 1
            }],
          oldStartLine: '1',
          oldStartLine2: null,
          newStartLine: '1',
          header: '@@ -1 +1 @@'
        }],
        deletedLines: 1,
        addedLines: 1,
        checksumBefore: '0000001',
        checksumAfter: '0ddf2ba',
        oldName: 'sample',
        language: undefined,
        newName: 'sample',
        isCombined: false
      }];

      var sideBySidePrinter = new SideBySidePrinter({matching: 'lines'});
      var html = sideBySidePrinter.generateSideBySideJsonHtml(exampleJson);
      var expected =
        '<div class="d2h-wrapper">\n' +
        '<div id="d2h-675094" class="d2h-file-wrapper" data-lang="undefined">\n' +
        '     <div class="d2h-file-header">\n' +
        '       <span class="d2h-file-stats">\n' +
        '         <span class="d2h-lines-added">\n' +
        '           <span>+1</span>\n' +
        '         </span>\n' +
        '         <span class="d2h-lines-deleted">\n' +
        '           <span>-1</span>\n' +
        '         </span>\n' +
        '       </span>\n' +
        '       <span class="d2h-file-name-wrapper">\n' +
        '         <span class="d2h-file-name">sample</span>\n' +
        '       </span>\n' +
        '     </div>\n' +
        '     <div class="d2h-files-diff">\n' +
        '       <div class="d2h-file-side-diff">\n' +
        '         <div class="d2h-code-wrapper">\n' +
        '           <table class="d2h-diff-table">\n' +
        '             <tbody class="d2h-diff-tbody">\n' +
        '           <tr>\n' +
        '  <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '  <td class="d2h-info">\n' +
        '    <div class="d2h-code-side-line d2h-info">@@ -1 +1 @@</div>\n' +
        '  </td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-del d2h-change">1</td>\n' +
        '    <td class="d2h-del d2h-change">      <div class="d2h-code-side-line d2h-del d2h-change"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn"><del>test</del></span></div>    </td>\n' +
        '  </tr>\n' +
        '             </tbody>\n' +
        '           </table>\n' +
        '         </div>\n' +
        '       </div>\n' +
        '       <div class="d2h-file-side-diff">\n' +
        '         <div class="d2h-code-wrapper">\n' +
        '           <table class="d2h-diff-table">\n' +
        '             <tbody class="d2h-diff-tbody">\n' +
        '           <tr>\n' +
        '  <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '  <td class="d2h-info">\n' +
        '    <div class="d2h-code-side-line d2h-info"></div>\n' +
        '  </td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-ins d2h-change">1</td>\n' +
        '    <td class="d2h-ins d2h-change">      <div class="d2h-code-side-line d2h-ins d2h-change"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn"><ins>test1r</ins></span></div>    </td>\n' +
        '  </tr>\n' +
        '             </tbody>\n' +
        '           </table>\n' +
        '         </div>\n' +
        '       </div>\n' +
        '     </div>\n' +
        '   </div>\n' +
        '</div>\n';

      assert.equal(expected, html);
    });
  });

  describe('processLines', function() {
    it('should process file lines', function() {
      var oldLines = [{
        content: '-test',
        type: 'd2h-del',
        oldNumber: 1,
        newNumber: null
      }];

      var newLines = [{
        content: '+test1r',
        type: 'd2h-ins',
        oldNumber: null,
        newNumber: 1
      }];

      var sideBySidePrinter = new SideBySidePrinter({matching: 'lines'});
      var html = sideBySidePrinter.processLines(oldLines, newLines);
      var expectedLeft =
        '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-del">1</td>\n' +
        '    <td class="d2h-del">' +
        '      <div class="d2h-code-side-line d2h-del">' +
        '<span class="d2h-code-line-prefix">-</span>' +
        '<span class="d2h-code-line-ctn">test</span></div>' +
        '    </td>\n' +
        '  </tr>\n';

      var expectedRight =
        '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-ins">1</td>\n' +
        '    <td class="d2h-ins">' +
        '      <div class="d2h-code-side-line d2h-ins">' +
        '<span class="d2h-code-line-prefix">+</span>' +
        '<span class="d2h-code-line-ctn">test1r</span>' +
        '</div>' +
        '    </td>\n' +
        '  </tr>\n';

      assert.equal(expectedLeft, html.left);
      assert.equal(expectedRight, html.right);
    });
  });
});
