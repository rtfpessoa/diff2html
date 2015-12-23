var assert = require('assert');

var Diff2Html = require('../src/diff2html.js').Diff2Html;

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
  });
});
