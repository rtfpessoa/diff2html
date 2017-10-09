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
      checkDiffSample(diff);
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
      checkDiffSample(diff);
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
      checkDiffSample(diff);
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
      checkDiffSample(diff);
    });

    function checkDiffSample(diff) {
      var result = DiffParser.generateDiffJson(diff);
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(1, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('sample', file1.oldName);
      assert.equal('sample', file1.newName);
      assert.equal(1, file1.blocks.length);
    }

    it('should parse diff with special characters', function() {
      var diff =
        'diff --git "a/bla with \ttab.scala" "b/bla with \ttab.scala"\n' +
        'index 4c679d7..e9bd385 100644\n' +
        '--- "a/bla with \ttab.scala"\n' +
        '+++ "b/bla with \ttab.scala"\n' +
        '@@ -1 +1,2 @@\n' +
        '-cenas\n' +
        '+cenas com ananas\n' +
        '+bananas';

      var result = DiffParser.generateDiffJson(diff);
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(2, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('bla with \ttab.scala', file1.oldName);
      assert.equal('bla with \ttab.scala', file1.newName);
      assert.equal(1, file1.blocks.length);
    });

    it('should parse diff with prefix', function() {
      var diff =
        'diff --git "\tbla with \ttab.scala" "\tbla with \ttab.scala"\n' +
        'index 4c679d7..e9bd385 100644\n' +
        '--- "\tbla with \ttab.scala"\n' +
        '+++ "\tbla with \ttab.scala"\n' +
        '@@ -1 +1,2 @@\n' +
        '-cenas\n' +
        '+cenas com ananas\n' +
        '+bananas';

      var result = DiffParser.generateDiffJson(diff, {'srcPrefix': '\t', 'dstPrefix': '\t'});
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(2, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('bla with \ttab.scala', file1.oldName);
      assert.equal('bla with \ttab.scala', file1.newName);
      assert.equal(1, file1.blocks.length);
    });

    it('should parse diff with deleted file', function() {
      var diff =
        'diff --git a/src/var/strundefined.js b/src/var/strundefined.js\n' +
        'deleted file mode 100644\n' +
        'index 04e16b0..0000000\n' +
        '--- a/src/var/strundefined.js\n' +
        '+++ /dev/null\n' +
        '@@ -1,3 +0,0 @@\n' +
        '-define(function() {\n' +
        '-  return typeof undefined;\n' +
        '-});\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(1, result.length);

      var file1 = result[0];
      assert.equal(false, file1.isCombined);
      assert.equal(0, file1.addedLines);
      assert.equal(3, file1.deletedLines);
      assert.equal('src/var/strundefined.js', file1.oldName);
      assert.equal('/dev/null', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(true, file1.isDeleted);
      assert.equal('04e16b0', file1.checksumBefore);
      assert.equal('0000000', file1.checksumAfter);
    });

    it('should parse diff with new file', function() {
      var diff =
        'diff --git a/test.js b/test.js\n' +
        'new file mode 100644\n' +
        'index 0000000..e1e22ec\n' +
        '--- /dev/null\n' +
        '+++ b/test.js\n' +
        '@@ -0,0 +1,5 @@\n' +
        "+var parser = require('./source/git-parser');\n" +
        '+\n' +
        '+var patchLineList = [ false, false, false, false ];\n' +
        '+\n' +
        '+console.log(parser.parsePatchDiffResult(text, patchLineList));\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(1, result.length);

      var file1 = result[0];
      assert.equal(false, file1.isCombined);
      assert.equal(5, file1.addedLines);
      assert.equal(0, file1.deletedLines);
      assert.equal('/dev/null', file1.oldName);
      assert.equal('test.js', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(true, file1.isNew);
      assert.equal(100644, file1.newFileMode);
      assert.equal('0000000', file1.checksumBefore);
      assert.equal('e1e22ec', file1.checksumAfter);
    });

    it('should parse diff with nested diff', function() {
      var diff =
        'diff --git a/src/offset.js b/src/offset.js\n' +
        'index cc6ffb4..fa51f18 100644\n' +
        '--- a/src/offset.js\n' +
        '+++ b/src/offset.js\n' +
        '@@ -1,6 +1,5 @@\n' +
        "+var parser = require('./source/git-parser');\n" +
        '+\n' +
        "+var text = 'diff --git a/components/app/app.html b/components/app/app.html\\nindex ecb7a95..027bd9b 100644\\n--- a/components/app/app.html\\n+++ b/components/app/app.html\\n@@ -52,0 +53,3 @@\\n+\\n+\\n+\\n@@ -56,0 +60,3 @@\\n+\\n+\\n+\\n'\n" +
        '+var patchLineList = [ false, false, false, false ];\n' +
        '+\n' +
        '+console.log(parser.parsePatchDiffResult(text, patchLineList));\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(1, result.length);

      var file1 = result[0];
      assert.equal(false, file1.isCombined);
      assert.equal(6, file1.addedLines);
      assert.equal(0, file1.deletedLines);
      assert.equal('src/offset.js', file1.oldName);
      assert.equal('src/offset.js', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(6, file1.blocks[0].lines.length);
      assert.equal('cc6ffb4', file1.checksumBefore);
      assert.equal('fa51f18', file1.checksumAfter);
    });

    it('should parse diff with multiple blocks', function() {
      var diff =
        'diff --git a/src/attributes/classes.js b/src/attributes/classes.js\n' +
        'index c617824..c8d1393 100644\n' +
        '--- a/src/attributes/classes.js\n' +
        '+++ b/src/attributes/classes.js\n' +
        '@@ -1,10 +1,9 @@\n' +
        ' define([\n' +
        '   "../core",\n' +
        '   "../var/rnotwhite",\n' +
        '-  "../var/strundefined",\n' +
        '   "../data/var/dataPriv",\n' +
        '   "../core/init"\n' +
        '-], function( jQuery, rnotwhite, strundefined, dataPriv ) {\n' +
        '+], function( jQuery, rnotwhite, dataPriv ) {\n' +
        ' \n' +
        ' var rclass = /[\\t\\r\\n\\f]/g;\n' +
        ' \n' +
        '@@ -128,7 +127,7 @@ jQuery.fn.extend({\n' +
        '         }\n' +
        ' \n' +
        '       // Toggle whole class name\n' +
        '-      } else if ( type === strundefined || type === "boolean" ) {\n' +
        '+      } else if ( value === undefined || type === "boolean" ) {\n' +
        '         if ( this.className ) {\n' +
        '           // store className if set\n' +
        '           dataPriv.set( this, "__className__", this.className );\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(1, result.length);

      var file1 = result[0];
      assert.equal(false, file1.isCombined);
      assert.equal(2, file1.addedLines);
      assert.equal(3, file1.deletedLines);
      assert.equal('src/attributes/classes.js', file1.oldName);
      assert.equal('src/attributes/classes.js', file1.newName);
      assert.equal(2, file1.blocks.length);
      assert.equal(11, file1.blocks[0].lines.length);
      assert.equal(8, file1.blocks[1].lines.length);
      assert.equal('c617824', file1.checksumBefore);
      assert.equal('c8d1393', file1.checksumAfter);
    });

    it('should parse diff with multiple files', function() {
      var diff =
        'diff --git a/src/core/init.js b/src/core/init.js\n' +
        'index e49196a..50f310c 100644\n' +
        '--- a/src/core/init.js\n' +
        '+++ b/src/core/init.js\n' +
        '@@ -101,7 +101,7 @@ var rootjQuery,\n' +
        '     // HANDLE: $(function)\n' +
        '     // Shortcut for document ready\n' +
        '     } else if ( jQuery.isFunction( selector ) ) {\n' +
        '-      return typeof rootjQuery.ready !== "undefined" ?\n' +
        '+      return rootjQuery.ready !== undefined ?\n' +
        '         rootjQuery.ready( selector ) :\n' +
        '         // Execute immediately if ready is not present\n' +
        '         selector( jQuery );\n' +
        'diff --git a/src/event.js b/src/event.js\n' +
        'index 7336f4d..6183f70 100644\n' +
        '--- a/src/event.js\n' +
        '+++ b/src/event.js\n' +
        '@@ -1,6 +1,5 @@\n' +
        ' define([\n' +
        '   "./core",\n' +
        '-  "./var/strundefined",\n' +
        '   "./var/rnotwhite",\n' +
        '   "./var/hasOwn",\n' +
        '   "./var/slice",\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(2, result.length);

      var file1 = result[0];
      assert.equal(false, file1.isCombined);
      assert.equal(1, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('src/core/init.js', file1.oldName);
      assert.equal('src/core/init.js', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(8, file1.blocks[0].lines.length);
      assert.equal('e49196a', file1.checksumBefore);
      assert.equal('50f310c', file1.checksumAfter);

      var file2 = result[1];
      assert.equal(false, file2.isCombined);
      assert.equal(0, file2.addedLines);
      assert.equal(1, file2.deletedLines);
      assert.equal('src/event.js', file2.oldName);
      assert.equal('src/event.js', file2.newName);
      assert.equal(1, file2.blocks.length);
      assert.equal(6, file2.blocks[0].lines.length);
      assert.equal('7336f4d', file2.checksumBefore);
      assert.equal('6183f70', file2.checksumAfter);
    });

    it('should parse combined diff', function() {
      var diff =
        'diff --combined describe.c\n' +
        'index fabadb8,cc95eb0..4866510\n' +
        '--- a/describe.c\n' +
        '+++ b/describe.c\n' +
        '@@@ -98,20 -98,12 +98,20 @@@\n' +
        '   return (a_date > b_date) ? -1 : (a_date == b_date) ? 0 : 1;\n' +
        '  }\n' +
        '  \n' +
        '- static void describe(char *arg)\n' +
        ' -static void describe(struct commit *cmit, int last_one)\n' +
        '++static void describe(char *arg, int last_one)\n' +
        '  {\n' +
        ' + unsigned char sha1[20];\n' +
        ' + struct commit *cmit;\n' +
        '   struct commit_list *list;\n' +
        '   static int initialized = 0;\n' +
        '   struct commit_name *n;\n' +
        '  \n' +
        ' + if (get_sha1(arg, sha1) < 0)\n' +
        ' +     usage(describe_usage);\n' +
        ' + cmit = lookup_commit_reference(sha1);\n' +
        ' + if (!cmit)\n' +
        ' +     usage(describe_usage);\n' +
        ' +\n' +
        '   if (!initialized) {\n' +
        '       initialized = 1;\n' +
        '       for_each_ref(get_name);\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(1, result.length);

      var file1 = result[0];
      assert.equal(true, file1.isCombined);
      assert.equal(9, file1.addedLines);
      assert.equal(2, file1.deletedLines);
      assert.equal('describe.c', file1.oldName);
      assert.equal('describe.c', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(22, file1.blocks[0].lines.length);
      assert.deepEqual(['4866510', 'cc95eb0'].sort(), file1.checksumBefore.sort());
      assert.equal('fabadb8', file1.checksumAfter);
    });

    it('should parse diffs with copied files', function() {
      var diff =
        'diff --git a/index.js b/more-index.js\n' +
        'dissimilarity index 5%\n' +
        'copy from index.js\n' +
        'copy to more-index.js\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(1, result.length);

      var file1 = result[0];
      assert.equal(0, file1.addedLines);
      assert.equal(0, file1.deletedLines);
      assert.equal('index.js', file1.oldName);
      assert.equal('more-index.js', file1.newName);
      assert.equal(0, file1.blocks.length);
      assert.equal(true, file1.isCopy);
      assert.equal(5, file1.changedPercentage);
    });

    it('should parse diffs with moved files', function() {
      var diff =
        'diff --git a/more-index.js b/other-index.js\n' +
        'similarity index 86%\n' +
        'rename from more-index.js\n' +
        'rename to other-index.js\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(1, result.length);

      var file1 = result[0];
      assert.equal(0, file1.addedLines);
      assert.equal(0, file1.deletedLines);
      assert.equal('more-index.js', file1.oldName);
      assert.equal('other-index.js', file1.newName);
      assert.equal(0, file1.blocks.length);
      assert.equal(true, file1.isRename);
      assert.equal(86, file1.unchangedPercentage);
    });

    it('should parse diffs correct line numbers', function() {
      var diff =
        'diff --git a/sample b/sample\n' +
        'index 0000001..0ddf2ba\n' +
        '--- a/sample\n' +
        '+++ b/sample\n' +
        '@@ -1 +1,2 @@\n' +
        '-test\n' +
        '+test1r\n';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(1, result.length);

      var file1 = result[0];
      assert.equal(1, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('sample', file1.oldName);
      assert.equal('sample', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(2, file1.blocks[0].lines.length);
      assert.equal(1, file1.blocks[0].lines[0].oldNumber);
      assert.equal(null, file1.blocks[0].lines[0].newNumber);
      assert.equal(null, file1.blocks[0].lines[1].oldNumber);
      assert.equal(1, file1.blocks[0].lines[1].newNumber);
    });

    it('should parse unified non git diff and strip timestamps off the headers', function() {
      var diffs = [
        // 2 hours ahead of GMT
        '--- a/sample.js  2016-10-25 11:37:14.000000000 +0200\n' +
          '+++ b/sample.js  2016-10-25 11:37:14.000000000 +0200\n' +
          '@@ -1 +1,2 @@\n' +
          '-test\n' +
          '+test1r\n' +
          '+test2r\n',
        // 2 hours behind GMT
        '--- a/sample.js 2016-10-25 11:37:14.000000000 -0200\n' +
          '+++ b/sample.js  2016-10-25 11:37:14.000000000 -0200\n' +
          '@@ -1 +1,2 @@\n' +
          '-test\n' +
          '+test1r\n' +
          '+test2r\n'
      ];

      diffs.forEach(function(diff) {
        var result = DiffParser.generateDiffJson(diff);
        var file1 = result[0];
        assert.equal(1, result.length);
        assert.equal(2, file1.addedLines);
        assert.equal(1, file1.deletedLines);
        assert.equal('sample.js', file1.oldName);
        assert.equal('sample.js', file1.newName);
        assert.equal(1, file1.blocks.length);

        var linesContent = file1.blocks[0].lines.map(function(line) {
          return line.content;
        });
        assert.deepEqual(linesContent, ['-test', '+test1r', '+test2r']);
      });
    });

    it('should parse unified non git diff', function() {
      var diff =
        '--- a/sample.js\n' +
        '+++ b/sample.js\n' +
        '@@ -1 +1,2 @@\n' +
        '-test\n' +
        '+test1r\n' +
        '+test2r\n';

      var result = DiffParser.generateDiffJson(diff);
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(2, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('sample.js', file1.oldName);
      assert.equal('sample.js', file1.newName);
      assert.equal(1, file1.blocks.length);

      var linesContent = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent, ['-test', '+test1r', '+test2r']);
    });

    it('should parse unified diff with multiple hunks and files', function() {
      var diff =
        '--- sample.js\n' +
        '+++ sample.js\n' +
        '@@ -1 +1,2 @@\n' +
        '-test\n' +
        '@@ -10 +20,2 @@\n' +
        '+test\n' +
        '--- sample1.js\n' +
        '+++ sample1.js\n' +
        '@@ -1 +1,2 @@\n' +
        '+test1';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(2, result.length);

      var file1 = result[0];
      assert.equal(1, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('sample.js', file1.oldName);
      assert.equal('sample.js', file1.newName);
      assert.equal(2, file1.blocks.length);

      var linesContent1 = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent1, ['-test']);

      var linesContent2 = file1.blocks[1].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent2, ['+test']);

      var file2 = result[1];
      assert.equal(1, file2.addedLines);
      assert.equal(0, file2.deletedLines);
      assert.equal('sample1.js', file2.oldName);
      assert.equal('sample1.js', file2.newName);
      assert.equal(1, file2.blocks.length);

      var linesContent = file2.blocks[0].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent, ['+test1']);
    });

    it('should parse diff with --- and +++ in the context lines', function() {
      var diff =
        '--- sample.js\n' +
        '+++ sample.js\n' +
        '@@ -1,8 +1,8 @@\n' +
        ' test\n' +
        ' \n' +
        '-- 1\n' +
        '--- 1\n' +
        '---- 1\n' +
        ' \n' +
        '++ 2\n' +
        '+++ 2\n' +
        '++++ 2';

      var result = DiffParser.generateDiffJson(diff);
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(3, file1.addedLines);
      assert.equal(3, file1.deletedLines);
      assert.equal('sample.js', file1.oldName);
      assert.equal('sample.js', file1.newName);
      assert.equal(1, file1.blocks.length);

      var linesContent = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent,
        [' test', ' ', '-- 1', '--- 1', '---- 1', ' ', '++ 2', '+++ 2', '++++ 2']);
    });

    it('should parse diff without proper hunk headers', function() {
      var diff =
        '--- sample.js\n' +
        '+++ sample.js\n' +
        '@@ @@\n' +
        ' test';

      var result = DiffParser.generateDiffJson(diff);
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(0, file1.addedLines);
      assert.equal(0, file1.deletedLines);
      assert.equal('sample.js', file1.oldName);
      assert.equal('sample.js', file1.newName);
      assert.equal(1, file1.blocks.length);

      var linesContent = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent, [' test']);
    });

    it('should parse binary file diff', function() {
      var diff =
        'diff --git a/last-changes-config.png b/last-changes-config.png\n' +
        'index 322248b..56fc1f2 100644\n' +
        '--- a/last-changes-config.png\n' +
        '+++ b/last-changes-config.png\n' +
        'Binary files differ';

      var result = DiffParser.generateDiffJson(diff);
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(0, file1.addedLines);
      assert.equal(0, file1.deletedLines);
      assert.equal('last-changes-config.png', file1.oldName);
      assert.equal('last-changes-config.png', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(0, file1.blocks[0].lines.length);
      assert.equal('Binary files differ', file1.blocks[0].header);
    });

    it('should parse diff with --find-renames', function() {
      var diff =
        'diff --git a/src/test-bar.js b/src/test-baz.js\n' +
        'similarity index 98%\n' +
        'rename from src/test-bar.js\n' +
        'rename to src/test-baz.js\n' +
        'index e01513b..f14a870 100644\n' +
        '--- a/src/test-bar.js\n' +
        '+++ b/src/test-baz.js\n' +
        '@@ -1,4 +1,32 @@\n' +
        ' function foo() {\n' +
        '-var bar = "Whoops!";\n' +
        '+var baz = "Whoops!";\n' +
        ' }\n' +
        ' ';

      var result = DiffParser.generateDiffJson(diff);
      var file1 = result[0];
      assert.equal(1, result.length);
      assert.equal(1, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('src/test-bar.js', file1.oldName);
      assert.equal('src/test-baz.js', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(5, file1.blocks[0].lines.length);
      var linesContent = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent,
        [' function foo() {', '-var bar = "Whoops!";', '+var baz = "Whoops!";', ' }', ' ']);
    });

    it('should parse diff with prefix', function() {
      var diff =
        'diff --git "\tTest.scala" "\tScalaTest.scala"\n' +
        'similarity index 88%\n' +
        'rename from Test.scala\n' +
        'rename to ScalaTest.scala\n' +
        'index 7d1f9bf..8b13271 100644\n' +
        '--- "\tTest.scala"\n' +
        '+++ "\tScalaTest.scala"\n' +
        '@@ -1,6 +1,8 @@\n' +
        ' class Test {\n' +
        ' \n' +
        '   def method1 = ???\n' +
        '+\n' +
        '+  def method2 = ???\n' +
        ' \n' +
        '   def myMethod = ???\n' +
        ' \n' +
        '@@ -10,7 +12,6 @@ class Test {\n' +
        ' \n' +
        '   def + = ???\n' +
        ' \n' +
        '-  def |> = ???\n' +
        ' \n' +
        ' }\n' +
        ' \n' +
        'diff --git "\ttardis.png" "\ttardis.png"\n' +
        'new file mode 100644\n' +
        'index 0000000..d503a29\n' +
        'Binary files /dev/null and "\ttardis.png" differ\n' +
        'diff --git a/src/test-bar.js b/src/test-baz.js\n' +
        'similarity index 98%\n' +
        'rename from src/test-bar.js\n' +
        'rename to src/test-baz.js\n' +
        'index e01513b..f14a870 100644\n' +
        '--- a/src/test-bar.js\n' +
        '+++ b/src/test-baz.js\n' +
        '@@ -1,4 +1,32 @@\n' +
        ' function foo() {\n' +
        '-var bar = "Whoops!";\n' +
        '+var baz = "Whoops!";\n' +
        ' }\n' +
        ' ';

      var result = DiffParser.generateDiffJson(diff, {'srcPrefix': '\t', 'dstPrefix': '\t'});
      assert.equal(3, result.length);

      var file1 = result[0];
      assert.equal(2, file1.addedLines);
      assert.equal(1, file1.deletedLines);
      assert.equal('Test.scala', file1.oldName);
      assert.equal('ScalaTest.scala', file1.newName);
      assert.equal(2, file1.blocks.length);
      assert.equal(8, file1.blocks[0].lines.length);
      assert.equal(7, file1.blocks[1].lines.length);

      var file2 = result[1];
      assert.equal('/dev/null', file2.oldName);
      assert.equal('tardis.png', file2.newName);

      var file3 = result[2];
      assert.equal(1, file3.addedLines);
      assert.equal(1, file3.deletedLines);
      assert.equal('src/test-bar.js', file3.oldName);
      assert.equal('src/test-baz.js', file3.newName);
      assert.equal(1, file3.blocks.length);
      assert.equal(5, file3.blocks[0].lines.length);
      var linesContent = file3.blocks[0].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent,
        [' function foo() {', '-var bar = "Whoops!";', '+var baz = "Whoops!";', ' }', ' ']);
    });

    it('should parse binary with content', function() {
      var diff =
        'diff --git a/favicon.png b/favicon.png\n' +
        'deleted file mode 100644\n' +
        'index 2a9d516a5647205d7be510dd0dff93a3663eff6f..0000000000000000000000000000000000000000\n' +
        'GIT binary patch\n' +
        'literal 0\n' +
        'HcmV?d00001\n' +
        '\n' +
        'literal 471\n' +
        'zcmeAS@N?(olHy`uVBq!ia0vp^0wB!61|;P_|4#%`EX7WqAsj$Z!;#Vf<Z~8yL>4nJ\n' +
        'za0`Jj<E6WGe}IBwC9V-A&PAz-C7Jno3L%-fsSJk3`UaNzMkcGzh!g=;$beJ?=ckpF\n' +
        'zCl;kLIHu$$r7E~(7NwTw7iAYKI0u`(*t4mJfq_xq)5S5wqIc=!hrWj$cv|<b{x!c(\n' +
        'z;3r#y;31Y&=1q>qPVOAS4ANVKzqmCp=Cty@U^(7zk!jHsvT~YI{F^=Ex6g|gox78w\n' +
        'z+Sn2Du3GS9U7qU`1*NYYlJi3u-!<?H-eky}wyIIL;8VU@wCDrb0``&v(jQ*DWSR4K\n' +
        'zPq(3;isEyho{emNa=%%!jDPE`l3u;5d=q=<+v8kO-=C`*G#t-*AiE-D>-_B#8k9H0\n' +
        'zGl{FnZs<2$wz5^=Q2h-1XI^s{LQL1#T4epqNPC%Orl(tD_@!*EY++~^Lt2<2&!&%=\n' +
        'z`m>(TYj6uS7jDdt=eH>iOyQg(QMR<-Fw8)Dk^ZG)XQTuzEgl{`GpS?Cfq9818R9~=\n' +
        'z{&h9@9n8F^?|qusoPy{k#%tVHzu7H$t26CR`BJZk*Ixf&u36WuS=?6m2^ho-p00i_\n' +
        'I>zopr0Nz-&lmGw#\n' +
        'diff --git a/src/test-bar.js b/src/test-baz.js\n' +
        'similarity index 98%\n' +
        'rename from src/test-bar.js\n' +
        'rename to src/test-baz.js\n' +
        'index e01513b..f14a870 100644\n' +
        '--- a/src/test-bar.js\n' +
        '+++ b/src/test-baz.js\n' +
        '@@ -1,4 +1,32 @@\n' +
        ' function foo() {\n' +
        '-var bar = "Whoops!";\n' +
        '+var baz = "Whoops!";\n' +
        ' }\n' +
        ' ';

      var result = DiffParser.generateDiffJson(diff);
      assert.equal(2, result.length);

      var file1 = result[0];
      assert.equal('favicon.png', file1.oldName);
      assert.equal('favicon.png', file1.newName);
      assert.equal(1, file1.blocks.length);
      assert.equal(0, file1.blocks[0].lines.length);

      var file2 = result[1];
      assert.equal(1, file2.addedLines);
      assert.equal(1, file2.deletedLines);
      assert.equal('src/test-bar.js', file2.oldName);
      assert.equal('src/test-baz.js', file2.newName);
      assert.equal(1, file2.blocks.length);
      assert.equal(5, file2.blocks[0].lines.length);
      var linesContent = file2.blocks[0].lines.map(function(line) {
        return line.content;
      });
      assert.deepEqual(linesContent,
        [' function foo() {', '-var bar = "Whoops!";', '+var baz = "Whoops!";', ' }', ' ']);
    });
  });
});
