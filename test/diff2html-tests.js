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
  });
});
