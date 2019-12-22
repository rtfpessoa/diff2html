var assert = require('assert');

var SideBySidePrinter = require('../src/side-by-side-printer.js').SideBySidePrinter;

describe('SideBySidePrinter', function() {
  describe('generateEmptyDiff', function() {
    it('should return an empty diff', function() {
      var sideBySidePrinter = new SideBySidePrinter({});
      var fileHtml = sideBySidePrinter.generateEmptyDiff();
      var expectedRight = '';
      var expectedLeft = '<tr>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">\n' +
        '            File without changes\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>';

      assert.equal(expectedRight, fileHtml.right);
      assert.equal(expectedLeft, fileHtml.left);
    });
  });

  describe('generateSideBySideFileHtml', function() {
    it('should generate lines with the right prefixes', function() {
      var sideBySidePrinter = new SideBySidePrinter({});

      var file = {
        'blocks': [
          {
            'lines': [
              {
                'content': ' context',
                'type': 'd2h-cntx',
                'oldNumber': 19,
                'newNumber': 19
              },
              {
                'content': '-removed',
                'type': 'd2h-del',
                'oldNumber': 20,
                'newNumber': null
              },
              {
                'content': '+added',
                'type': 'd2h-ins',
                'oldNumber': null,
                'newNumber': 20
              },
              {
                'content': '+another added',
                'type': 'd2h-ins',
                'oldNumber': null,
                'newNumber': 21
              }
            ],
            'oldStartLine': '19',
            'newStartLine': '19',
            'header': '@@ -19,7 +19,7 @@'
          }
        ],
        'deletedLines': 1,
        'addedLines': 1,
        'checksumBefore': 'fc56817',
        'checksumAfter': 'e8e7e49',
        'mode': '100644',
        'oldName': 'coverage.init',
        'language': 'init',
        'newName': 'coverage.init',
        'isCombined': false
      };

      var fileHtml = sideBySidePrinter.generateSideBySideFileHtml(file);

      var expectedLeft =
        '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">@@ -19,7 +19,7 @@</div>\n' +
        '    </td>\n' +
        '</tr><tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-cntx">\n' +
        '      19\n' +
        '    </td>\n' +
        '    <td class="d2h-cntx">\n' +
        '        <div class="d2h-code-side-line d2h-cntx">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;</span>\n' +
        '            <span class="d2h-code-line-ctn">context</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr><tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-del">\n' +
        '      20\n' +
        '    </td>\n' +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-side-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn"><del>removed</del></span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr><tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">\n' +
        '      ' +
        '\n' +
        '    </td>\n' +
        '    <td class="d2h-cntx d2h-emptyplaceholder">\n' +
        '        <div class="d2h-code-side-line d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;</span>\n' +
        '            <span class="d2h-code-line-ctn">&nbsp;</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>';

      var expectedRight =
        '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info"></div>\n' +
        '    </td>\n' +
        '</tr><tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-cntx">\n' +
        '      19\n' +
        '    </td>\n' +
        '    <td class="d2h-cntx">\n' +
        '        <div class="d2h-code-side-line d2h-cntx">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;</span>\n' +
        '            <span class="d2h-code-line-ctn">context</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr><tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        '      20\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn"><ins>added</ins></span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr><tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        '      21\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">another added</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>';

      assert.equal(expectedLeft, fileHtml.left);
      assert.equal(expectedRight, fileHtml.right);
    });
  });

  describe('generateSingleLineHtml', function() {
    it('should work for insertions', function() {
      var diffParser = require('../src/diff-parser.js').DiffParser;
      var sideBySidePrinter = new SideBySidePrinter({});
      var fileHtml = sideBySidePrinter.generateSingleLineHtml(false,
        diffParser.LINE_TYPE.INSERTS, 30, 'test', '+');
      var expected = '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        '      30\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>';

      assert.equal(expected, fileHtml);
    });
    it('should work for deletions', function() {
      var diffParser = require('../src/diff-parser.js').DiffParser;
      var sideBySidePrinter = new SideBySidePrinter({});
      var fileHtml = sideBySidePrinter.generateSingleLineHtml(false,
        diffParser.LINE_TYPE.DELETES, 30, 'test', '-');
      var expected = '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-del">\n' +
        '      30\n' +
        '    </td>\n' +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-side-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>';

      assert.equal(expected, fileHtml);
    });
  });

  describe('generateSideBySideJsonHtml', function() {
    it('should work for list of files', function() {
      var exampleJson = [
        {
          blocks: [
            {
              lines: [
                {
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
                }
              ],
              oldStartLine: '1',
              oldStartLine2: null,
              newStartLine: '1',
              header: '@@ -1 +1 @@'
            }
          ],
          deletedLines: 1,
          addedLines: 1,
          checksumBefore: '0000001',
          checksumAfter: '0ddf2ba',
          oldName: 'sample',
          language: undefined,
          newName: 'sample',
          isCombined: false
        }
      ];

      var sideBySidePrinter = new SideBySidePrinter({matching: 'lines'});
      var html = sideBySidePrinter.generateSideBySideJsonHtml(exampleJson);
      var expected =
        '<div class="d2h-wrapper">\n' +
        '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">\n' +
        '    <div class="d2h-file-header">\n' +
        '      <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">sample</span>\n' +
        '    <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>\n' +
        '    </div>\n' +
        '    <div class="d2h-files-diff">\n' +
        '        <div class="d2h-file-side-diff">\n' +
        '            <div class="d2h-code-wrapper">\n' +
        '                <table class="d2h-diff-table">\n' +
        '                    <tbody class="d2h-diff-tbody">\n' +
        '                    <tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">@@ -1 +1 @@</div>\n' +
        '    </td>\n' +
        '</tr><tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-del">\n' +
        '      1\n' +
        '    </td>\n' +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-side-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn"><del>test</del></span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n' +
        '                    </tbody>\n' +
        '                </table>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="d2h-file-side-diff">\n' +
        '            <div class="d2h-code-wrapper">\n' +
        '                <table class="d2h-diff-table">\n' +
        '                    <tbody class="d2h-diff-tbody">\n' +
        '                    <tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info"></div>\n' +
        '    </td>\n' +
        '</tr><tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        '      1\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn"><ins>test1r</ins></span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n' +
        '                    </tbody>\n' +
        '                </table>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>\n' +
        '</div>';

      assert.equal(expected, html);
    });
    it('should work for files without blocks', function() {
      var exampleJson = [{
        blocks: [],
        oldName: 'sample',
        language: 'js',
        newName: 'sample',
        isCombined: false
      }];

      var sideBySidePrinter = new SideBySidePrinter();
      var html = sideBySidePrinter.generateSideBySideJsonHtml(exampleJson);
      var expected =
        '<div class="d2h-wrapper">\n' +
        '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="js">\n' +
        '    <div class="d2h-file-header">\n' +
        '      <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">sample</span>\n' +
        '    <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>\n' +
        '    </div>\n' +
        '    <div class="d2h-files-diff">\n' +
        '        <div class="d2h-file-side-diff">\n' +
        '            <div class="d2h-code-wrapper">\n' +
        '                <table class="d2h-diff-table">\n' +
        '                    <tbody class="d2h-diff-tbody">\n' +
        '                    <tr>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">\n' +
        '            File without changes\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>\n' +
        '                    </tbody>\n' +
        '                </table>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="d2h-file-side-diff">\n' +
        '            <div class="d2h-code-wrapper">\n' +
        '                <table class="d2h-diff-table">\n' +
        '                    <tbody class="d2h-diff-tbody">\n' +
        '                    \n' +
        '                    </tbody>\n' +
        '                </table>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>\n' +
        '</div>';

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
      var html = sideBySidePrinter.processLines(false, oldLines, newLines);
      var expectedLeft =
        '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-del">\n' +
        '      1\n' +
        '    </td>\n' +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-side-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>';

      var expectedRight =
        '<tr>\n' +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        '      1\n' +
        '    </td>\n' +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">test1r</span>\n' +
        '        </div>\n' +
        '    </td>\n' +
        '</tr>';

      assert.equal(expectedLeft, html.left);
      assert.equal(expectedRight, html.right);
    });
  });
});
