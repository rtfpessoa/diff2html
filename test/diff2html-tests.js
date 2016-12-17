var assert = require('assert');

var Diff2Html = require('../src/diff2html.js').Diff2Html;

var diffExample1 =
  'diff --git a/sample b/sample\n' +
  'index 0000001..0ddf2ba\n' +
  '--- a/sample\n' +
  '+++ b/sample\n' +
  '@@ -1 +1 @@\n' +
  '-test\n' +
  '+test1\n';

var jsonExample1 =
  [
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
              content: '+test1',
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

var filesExample1 =
  '<div class="d2h-file-list-wrapper">\n' +
  '    <div class="d2h-file-list-header">\n' +
  '        <span class="d2h-file-list-title">Files changed (1)</span>\n' +
  '        <a class="d2h-file-switch d2h-hide">hide</a>\n' +
  '        <a class="d2h-file-switch d2h-show">show</a>\n' +
  '    </div>\n' +
  '    <ol class="d2h-file-list">\n' +
  '    <li class="d2h-file-list-line">\n' +
  '    <span class="d2h-file-name-wrapper">\n' +
  '      <span><svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"\n' +
  '     viewBox="0 0 14 16" width="14">\n' +
  '    <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>\n' +
  '</svg></span>\n' +
  '      <a href="#d2h-675094" class="d2h-file-name">sample</a>\n' +
  '      <span class="d2h-file-stats">\n' +
  '          <span class="d2h-lines-added">+1</span>\n' +
  '          <span class="d2h-lines-deleted">-1</span>\n' +
  '      </span>\n' +
  '    </span>\n' +
  '</li>\n' +
  '    </ol>\n' +
  '</div>';

var htmlLineExample1 =
  '<div class="d2h-wrapper">\n' +
  '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">\n' +
  '    <div class="d2h-file-header">\n' +
  '    <span class="d2h-file-name-wrapper">\n' +
  '    <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
  '    <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
  '</svg></span>\n' +
  '    <span class="d2h-file-name">sample</span>\n' +
  '    <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>\n' +
  '    </div>\n' +
  '    <div class="d2h-file-diff">\n' +
  '        <div class="d2h-code-wrapper">\n' +
  '            <table class="d2h-diff-table">\n' +
  '                <tbody class="d2h-diff-tbody">\n' +
  '                <tr>\n' +
  '    <td class="d2h-code-linenumber d2h-info"></td>\n' +
  '    <td class="d2h-info">\n' +
  '        <div class="d2h-code-line d2h-info">@@ -1 +1 @@</div>\n' +
  '    </td>\n' +
  '</tr><tr>\n' +
  '    <td class="d2h-code-linenumber d2h-del">\n' +
  '      <div class="line-num1">1</div>\n' +
  '<div class="line-num2"></div>\n' +
  '    </td>\n' +
  '    <td class="d2h-del">\n' +
  '        <div class="d2h-code-line d2h-del">\n' +
  '            <span class="d2h-code-line-prefix">-</span>\n' +
  '            <span class="d2h-code-line-ctn"><del>test</del></span>\n' +
  '        </div>\n' +
  '    </td>\n' +
  '</tr><tr>\n' +
  '    <td class="d2h-code-linenumber d2h-ins">\n' +
  '      <div class="line-num1"></div>\n' +
  '<div class="line-num2">1</div>\n' +
  '    </td>\n' +
  '    <td class="d2h-ins">\n' +
  '        <div class="d2h-code-line d2h-ins">\n' +
  '            <span class="d2h-code-line-prefix">+</span>\n' +
  '            <span class="d2h-code-line-ctn"><ins>test1</ins></span>\n' +
  '        </div>\n' +
  '    </td>\n' +
  '</tr>\n' +
  '                </tbody>\n' +
  '            </table>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</div>\n' +
  '</div>';

var htmlLineExample1WithFilesSummary = filesExample1 + htmlLineExample1;

var htmlSideExample1 =
  '<div class="d2h-wrapper">\n' +
  '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">\n' +
  '    <div class="d2h-file-header">\n' +
  '      <span class="d2h-file-name-wrapper">\n' +
  '    <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
  '    <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
  '</svg></span>\n' +
  '    <span class="d2h-file-name">sample</span>\n' +
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
  '            <span class="d2h-code-line-ctn"><ins>test1</ins></span>\n' +
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

var htmlSideExample1WithFilesSummary = filesExample1 + htmlSideExample1;

describe('Diff2Html', function() {
  describe('getJsonFromDiff', function() {
    it('should parse simple diff to json', function() {
      var diff =
        'diff --git a/sample b/sample\n' +
        'index 0000001..0ddf2ba\n' +
        '--- a/sample\n' +
        '+++ b/sample\n' +
        '@@ -1 +1 @@\n' +
        '-test\n' +
        '+test1\n';
      var result = Diff2Html.getJsonFromDiff(diff);

      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(1, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('sample', file1.oldName);
      assert.equal('sample', file1.newName);
      assert.equal(1, file1.blocks.length);
    });

    // Test case for issue #49
    it('should parse diff with added EOF', function() {
      var diff =
        'diff --git a/sample.scala b/sample.scala\n' +
        'index b583263..8b2fc3e 100644\n' +
        '--- a/b583263..8b2fc3e\n' +
        '+++ b/8b2fc3e\n' +
        '@@ -50,5 +50,7 @@ case class Response[+A](value: Option[A],\n' +
        ' object ResponseErrorCode extends JsonEnumeration {\n' +
        '  val NoError, ServiceError, JsonError,\n' +
        '  InvalidPermissions, MissingPermissions, GenericError,\n' +
        '-  TokenRevoked, MissingToken = Value\n' +
        '-}\n' +
        '\\ No newline at end of file\n' +
        '+  TokenRevoked, MissingToken,\n' +
        '+  IndexLock, RepositoryError, NotValidRepo, PullRequestNotMergeable, BranchError,\n' +
        '+  PluginError, CodeParserError, EngineError = Value\n' +
        '+}\n';
      var result = Diff2Html.getJsonFromDiff(diff);

      assert.equal(50, result[0].blocks[0].lines[0].oldNumber);
      assert.equal(50, result[0].blocks[0].lines[0].newNumber);

      assert.equal(51, result[0].blocks[0].lines[1].oldNumber);
      assert.equal(51, result[0].blocks[0].lines[1].newNumber);

      assert.equal(52, result[0].blocks[0].lines[2].oldNumber);
      assert.equal(52, result[0].blocks[0].lines[2].newNumber);

      assert.equal(53, result[0].blocks[0].lines[3].oldNumber);
      assert.equal(null, result[0].blocks[0].lines[3].newNumber);

      assert.equal(54, result[0].blocks[0].lines[4].oldNumber);
      assert.equal(null, result[0].blocks[0].lines[4].newNumber);

      assert.equal(null, result[0].blocks[0].lines[5].oldNumber);
      assert.equal(53, result[0].blocks[0].lines[5].newNumber);

      assert.equal(null, result[0].blocks[0].lines[6].oldNumber);
      assert.equal(54, result[0].blocks[0].lines[6].newNumber);

      assert.equal(null, result[0].blocks[0].lines[7].oldNumber);
      assert.equal(55, result[0].blocks[0].lines[7].newNumber);

      assert.equal(null, result[0].blocks[0].lines[8].oldNumber);
      assert.equal(56, result[0].blocks[0].lines[8].newNumber);
    });

    it('should generate pretty line by line html from diff', function() {
      var result = Diff2Html.getPrettyHtmlFromDiff(diffExample1);
      assert.equal(htmlLineExample1, result);
    });

    it('should generate pretty line by line html from json', function() {
      var result = Diff2Html.getPrettyHtmlFromJson(jsonExample1);
      assert.equal(htmlLineExample1, result);
    });

    it('should generate pretty diff with files summary', function() {
      var result = Diff2Html.getPrettyHtmlFromDiff(diffExample1, {showFiles: true});
      assert.equal(htmlLineExample1WithFilesSummary, result);
    });

    it('should generate pretty side by side html from diff', function() {
      var result = Diff2Html.getPrettySideBySideHtmlFromDiff(diffExample1);
      assert.equal(htmlSideExample1, result);
    });

    it('should generate pretty side by side html from json', function() {
      var result = Diff2Html.getPrettySideBySideHtmlFromJson(jsonExample1);
      assert.equal(htmlSideExample1, result);
    });

    it('should generate pretty side by side html from diff', function() {
      var result = Diff2Html.getPrettySideBySideHtmlFromDiff(diffExample1, {showFiles: true});
      assert.equal(htmlSideExample1WithFilesSummary, result);
    });
  });
});
