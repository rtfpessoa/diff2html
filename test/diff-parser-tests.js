var assert = require('assert');

var DiffParser = require('../src/diff-parser.js').DiffParser;

describe('DiffParser', function() {
  describe('generateDiffJson', function() {

    it('should parse unix with \n diff', function() {
      var diff =
        'diff --git a/sample b/sample\n' +
        'index 0000001..0ddf2ba\n' +
        '--- a/sample\n' +
        '+++ b/sample\n' +
        '@@ -1 +1 @@\n' +
        '-test\n' +
        '+test1r\n';
      checkDiffSample(diff)
    });

    it('should parse windows with \r\n diff', function() {
      var diff =
        'diff --git a/sample b/sample\r\n' +
        'index 0000001..0ddf2ba\r\n' +
        '--- a/sample\r\n' +
        '+++ b/sample\r\n' +
        '@@ -1 +1 @@\r\n' +
        '-test\r\n' +
        '+test1r\r\n';
      checkDiffSample(diff)
    });

    it('should parse old os x with \r diff', function() {
      var diff =
        'diff --git a/sample b/sample\r' +
        'index 0000001..0ddf2ba\r' +
        '--- a/sample\r' +
        '+++ b/sample\r' +
        '@@ -1 +1 @@\r' +
        '-test\r' +
        '+test1r\r';
      checkDiffSample(diff)
    });

    it('should parse mixed eols diff', function() {
      var diff =
        'diff --git a/sample b/sample\n' +
        'index 0000001..0ddf2ba\r\n' +
        '--- a/sample\r' +
        '+++ b/sample\r\n' +
        '@@ -1 +1 @@\n' +
        '-test\r' +
        '+test1r\n';
      checkDiffSample(diff)
    });

    function checkDiffSample(diff) {
      var result = Diff2Html.getJsonFromDiff(diff);
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(1, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('sample', file1.oldName);
      assert.equal('sample', file1.newName);
      assert.equal(1, file1.blocks.length);
    }

  });
});
