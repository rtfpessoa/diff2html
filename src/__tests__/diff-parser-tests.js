const DiffParser = require("../diff-parser.js").DiffParser;

function checkDiffSample(diff) {
  const result = DiffParser.generateDiffJson(diff);
  const file1 = result[0];
  expect(1).toEqual(result.length);
  expect(1).toEqual(file1.addedLines);
  expect(1).toEqual(file1.deletedLines);
  expect("sample").toEqual(file1.oldName);
  expect("sample").toEqual(file1.newName);
  expect(1).toEqual(file1.blocks.length);
}

describe("DiffParser", function() {
  describe("generateDiffJson", function() {
    it("should parse unix with \n diff", function() {
      const diff =
        "diff --git a/sample b/sample\n" +
        "index 0000001..0ddf2ba\n" +
        "--- a/sample\n" +
        "+++ b/sample\n" +
        "@@ -1 +1 @@\n" +
        "-test\n" +
        "+test1r\n";
      checkDiffSample(diff);
    });

    it("should parse windows with \r\n diff", function() {
      const diff =
        "diff --git a/sample b/sample\r\n" +
        "index 0000001..0ddf2ba\r\n" +
        "--- a/sample\r\n" +
        "+++ b/sample\r\n" +
        "@@ -1 +1 @@\r\n" +
        "-test\r\n" +
        "+test1r\r\n";
      checkDiffSample(diff);
    });

    it("should parse old os x with \r diff", function() {
      const diff =
        "diff --git a/sample b/sample\r" +
        "index 0000001..0ddf2ba\r" +
        "--- a/sample\r" +
        "+++ b/sample\r" +
        "@@ -1 +1 @@\r" +
        "-test\r" +
        "+test1r\r";
      checkDiffSample(diff);
    });

    it("should parse mixed eols diff", function() {
      const diff =
        "diff --git a/sample b/sample\n" +
        "index 0000001..0ddf2ba\r\n" +
        "--- a/sample\r" +
        "+++ b/sample\r\n" +
        "@@ -1 +1 @@\n" +
        "-test\r" +
        "+test1r\n";
      checkDiffSample(diff);
    });

    it("should parse diff with special characters", function() {
      const diff =
        'diff --git "a/bla with \ttab.scala" "b/bla with \ttab.scala"\n' +
        "index 4c679d7..e9bd385 100644\n" +
        '--- "a/bla with \ttab.scala"\n' +
        '+++ "b/bla with \ttab.scala"\n' +
        "@@ -1 +1,2 @@\n" +
        "-cenas\n" +
        "+cenas com ananas\n" +
        "+bananas";

      const result = DiffParser.generateDiffJson(diff);
      const file1 = result[0];
      expect(1).toEqual(result.length);
      expect(2).toEqual(file1.addedLines);
      expect(1).toEqual(file1.deletedLines);
      expect("bla with \ttab.scala").toEqual(file1.oldName);
      expect("bla with \ttab.scala").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
    });

    it("should parse diff with prefix", function() {
      const diff =
        'diff --git "\tbla with \ttab.scala" "\tbla with \ttab.scala"\n' +
        "index 4c679d7..e9bd385 100644\n" +
        '--- "\tbla with \ttab.scala"\n' +
        '+++ "\tbla with \ttab.scala"\n' +
        "@@ -1 +1,2 @@\n" +
        "-cenas\n" +
        "+cenas com ananas\n" +
        "+bananas";

      const result = DiffParser.generateDiffJson(diff, { srcPrefix: "\t", dstPrefix: "\t" });
      const file1 = result[0];
      expect(1).toEqual(result.length);
      expect(2).toEqual(file1.addedLines);
      expect(1).toEqual(file1.deletedLines);
      expect("bla with \ttab.scala").toEqual(file1.oldName);
      expect("bla with \ttab.scala").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
    });

    it("should parse diff with deleted file", function() {
      const diff =
        "diff --git a/src/var/strundefined.js b/src/var/strundefined.js\n" +
        "deleted file mode 100644\n" +
        "index 04e16b0..0000000\n" +
        "--- a/src/var/strundefined.js\n" +
        "+++ /dev/null\n" +
        "@@ -1,3 +0,0 @@\n" +
        "-define(function() {\n" +
        "-  return typeof undefined;\n" +
        "-});\n";

      const result = DiffParser.generateDiffJson(diff);
      expect(1).toEqual(result.length);

      const file1 = result[0];
      expect(false).toEqual(file1.isCombined);
      expect(0).toEqual(file1.addedLines);
      expect(3).toEqual(file1.deletedLines);
      expect("src/var/strundefined.js").toEqual(file1.oldName);
      expect("/dev/null").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(true).toEqual(file1.isDeleted);
      expect("04e16b0").toEqual(file1.checksumBefore);
      expect("0000000").toEqual(file1.checksumAfter);
    });

    it("should parse diff with new file", function() {
      const diff =
        "diff --git a/test.js b/test.js\n" +
        "new file mode 100644\n" +
        "index 0000000..e1e22ec\n" +
        "--- /dev/null\n" +
        "+++ b/test.js\n" +
        "@@ -0,0 +1,5 @@\n" +
        "+var parser = require('./source/git-parser');\n" +
        "+\n" +
        "+var patchLineList = [ false, false, false, false ];\n" +
        "+\n" +
        "+console.log(parser.parsePatchDiffResult(text, patchLineList));\n";

      const result = DiffParser.generateDiffJson(diff);
      expect(1).toEqual(result.length);

      const file1 = result[0];
      expect(false).toEqual(file1.isCombined);
      expect(5).toEqual(file1.addedLines);
      expect(0).toEqual(file1.deletedLines);
      expect("/dev/null").toEqual(file1.oldName);
      expect("test.js").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(true).toEqual(file1.isNew);
      expect("100644").toEqual(file1.newFileMode);
      expect("0000000").toEqual(file1.checksumBefore);
      expect("e1e22ec").toEqual(file1.checksumAfter);
    });

    it("should parse diff with nested diff", function() {
      const diff =
        "diff --git a/src/offset.js b/src/offset.js\n" +
        "index cc6ffb4..fa51f18 100644\n" +
        "--- a/src/offset.js\n" +
        "+++ b/src/offset.js\n" +
        "@@ -1,6 +1,5 @@\n" +
        "+var parser = require('./source/git-parser');\n" +
        "+\n" +
        "+var text = 'diff --git a/components/app/app.html b/components/app/app.html\\nindex ecb7a95..027bd9b 100644\\n--- a/components/app/app.html\\n+++ b/components/app/app.html\\n@@ -52,0 +53,3 @@\\n+\\n+\\n+\\n@@ -56,0 +60,3 @@\\n+\\n+\\n+\\n'\n" +
        "+var patchLineList = [ false, false, false, false ];\n" +
        "+\n" +
        "+console.log(parser.parsePatchDiffResult(text, patchLineList));\n";

      const result = DiffParser.generateDiffJson(diff);
      expect(1).toEqual(result.length);

      const file1 = result[0];
      expect(false).toEqual(file1.isCombined);
      expect(6).toEqual(file1.addedLines);
      expect(0).toEqual(file1.deletedLines);
      expect("src/offset.js").toEqual(file1.oldName);
      expect("src/offset.js").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(6).toEqual(file1.blocks[0].lines.length);
      expect("cc6ffb4").toEqual(file1.checksumBefore);
      expect("fa51f18").toEqual(file1.checksumAfter);
    });

    it("should parse diff with multiple blocks", function() {
      const diff =
        "diff --git a/src/attributes/classes.js b/src/attributes/classes.js\n" +
        "index c617824..c8d1393 100644\n" +
        "--- a/src/attributes/classes.js\n" +
        "+++ b/src/attributes/classes.js\n" +
        "@@ -1,10 +1,9 @@\n" +
        " define([\n" +
        '   "../core",\n' +
        '   "../var/rnotwhite",\n' +
        '-  "../var/strundefined",\n' +
        '   "../data/var/dataPriv",\n' +
        '   "../core/init"\n' +
        "-], function( jQuery, rnotwhite, strundefined, dataPriv ) {\n" +
        "+], function( jQuery, rnotwhite, dataPriv ) {\n" +
        " \n" +
        " var rclass = /[\\t\\r\\n\\f]/g;\n" +
        " \n" +
        "@@ -128,7 +127,7 @@ jQuery.fn.extend({\n" +
        "         }\n" +
        " \n" +
        "       // Toggle whole class name\n" +
        '-      } else if ( type === strundefined || type === "boolean" ) {\n' +
        '+      } else if ( value === undefined || type === "boolean" ) {\n' +
        "         if ( this.className ) {\n" +
        "           // store className if set\n" +
        '           dataPriv.set( this, "__className__", this.className );\n';

      const result = DiffParser.generateDiffJson(diff);
      expect(1).toEqual(result.length);

      const file1 = result[0];
      expect(false).toEqual(file1.isCombined);
      expect(2).toEqual(file1.addedLines);
      expect(3).toEqual(file1.deletedLines);
      expect("src/attributes/classes.js").toEqual(file1.oldName);
      expect("src/attributes/classes.js").toEqual(file1.newName);
      expect(2).toEqual(file1.blocks.length);
      expect(11).toEqual(file1.blocks[0].lines.length);
      expect(8).toEqual(file1.blocks[1].lines.length);
      expect("c617824").toEqual(file1.checksumBefore);
      expect("c8d1393").toEqual(file1.checksumAfter);
    });

    it("should parse diff with multiple files", function() {
      const diff =
        "diff --git a/src/core/init.js b/src/core/init.js\n" +
        "index e49196a..50f310c 100644\n" +
        "--- a/src/core/init.js\n" +
        "+++ b/src/core/init.js\n" +
        "@@ -101,7 +101,7 @@ var rootjQuery,\n" +
        "     // HANDLE: $(function)\n" +
        "     // Shortcut for document ready\n" +
        "     } else if ( jQuery.isFunction( selector ) ) {\n" +
        '-      return typeof rootjQuery.ready !== "undefined" ?\n' +
        "+      return rootjQuery.ready !== undefined ?\n" +
        "         rootjQuery.ready( selector ) :\n" +
        "         // Execute immediately if ready is not present\n" +
        "         selector( jQuery );\n" +
        "diff --git a/src/event.js b/src/event.js\n" +
        "index 7336f4d..6183f70 100644\n" +
        "--- a/src/event.js\n" +
        "+++ b/src/event.js\n" +
        "@@ -1,6 +1,5 @@\n" +
        " define([\n" +
        '   "./core",\n' +
        '-  "./var/strundefined",\n' +
        '   "./var/rnotwhite",\n' +
        '   "./var/hasOwn",\n' +
        '   "./var/slice",\n';

      const result = DiffParser.generateDiffJson(diff);
      expect(2).toEqual(result.length);

      const file1 = result[0];
      expect(false).toEqual(file1.isCombined);
      expect(1).toEqual(file1.addedLines);
      expect(1).toEqual(file1.deletedLines);
      expect("src/core/init.js").toEqual(file1.oldName);
      expect("src/core/init.js").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(8).toEqual(file1.blocks[0].lines.length);
      expect("e49196a").toEqual(file1.checksumBefore);
      expect("50f310c").toEqual(file1.checksumAfter);

      const file2 = result[1];
      expect(false).toEqual(file2.isCombined);
      expect(0).toEqual(file2.addedLines);
      expect(1).toEqual(file2.deletedLines);
      expect("src/event.js").toEqual(file2.oldName);
      expect("src/event.js").toEqual(file2.newName);
      expect(1).toEqual(file2.blocks.length);
      expect(6).toEqual(file2.blocks[0].lines.length);
      expect("7336f4d").toEqual(file2.checksumBefore);
      expect("6183f70").toEqual(file2.checksumAfter);
    });

    it("should parse combined diff", function() {
      const diff =
        "diff --combined describe.c\n" +
        "index fabadb8,cc95eb0..4866510\n" +
        "--- a/describe.c\n" +
        "+++ b/describe.c\n" +
        "@@@ -98,20 -98,12 +98,20 @@@\n" +
        "   return (a_date > b_date) ? -1 : (a_date == b_date) ? 0 : 1;\n" +
        "  }\n" +
        "  \n" +
        "- static void describe(char *arg)\n" +
        " -static void describe(struct commit *cmit, int last_one)\n" +
        "++static void describe(char *arg, int last_one)\n" +
        "  {\n" +
        " + unsigned char sha1[20];\n" +
        " + struct commit *cmit;\n" +
        "   struct commit_list *list;\n" +
        "   static int initialized = 0;\n" +
        "   struct commit_name *n;\n" +
        "  \n" +
        " + if (get_sha1(arg, sha1) < 0)\n" +
        " +     usage(describe_usage);\n" +
        " + cmit = lookup_commit_reference(sha1);\n" +
        " + if (!cmit)\n" +
        " +     usage(describe_usage);\n" +
        " +\n" +
        "   if (!initialized) {\n" +
        "       initialized = 1;\n" +
        "       for_each_ref(get_name);\n";

      const result = DiffParser.generateDiffJson(diff);
      expect(1).toEqual(result.length);

      const file1 = result[0];
      expect(true).toEqual(file1.isCombined);
      expect(9).toEqual(file1.addedLines);
      expect(2).toEqual(file1.deletedLines);
      expect("describe.c").toEqual(file1.oldName);
      expect("describe.c").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(22).toEqual(file1.blocks[0].lines.length);
      expect(["4866510", "cc95eb0"].sort()).toEqual(file1.checksumBefore.sort());
      expect("fabadb8").toEqual(file1.checksumAfter);
    });

    it("should parse diffs with copied files", function() {
      const diff =
        "diff --git a/index.js b/more-index.js\n" +
        "dissimilarity index 5%\n" +
        "copy from index.js\n" +
        "copy to more-index.js\n";

      const result = DiffParser.generateDiffJson(diff);
      expect(1).toEqual(result.length);

      const file1 = result[0];
      expect(0).toEqual(file1.addedLines);
      expect(0).toEqual(file1.deletedLines);
      expect("index.js").toEqual(file1.oldName);
      expect("more-index.js").toEqual(file1.newName);
      expect(0).toEqual(file1.blocks.length);
      expect(true).toEqual(file1.isCopy);
      expect("5").toEqual(file1.changedPercentage);
    });

    it("should parse diffs with moved files", function() {
      const diff =
        "diff --git a/more-index.js b/other-index.js\n" +
        "similarity index 86%\n" +
        "rename from more-index.js\n" +
        "rename to other-index.js\n";

      const result = DiffParser.generateDiffJson(diff);
      expect(1).toEqual(result.length);

      const file1 = result[0];
      expect(0).toEqual(file1.addedLines);
      expect(0).toEqual(file1.deletedLines);
      expect("more-index.js").toEqual(file1.oldName);
      expect("other-index.js").toEqual(file1.newName);
      expect(0).toEqual(file1.blocks.length);
      expect(true).toEqual(file1.isRename);
      expect("86").toEqual(file1.unchangedPercentage);
    });

    it("should parse diffs correct line numbers", function() {
      const diff =
        "diff --git a/sample b/sample\n" +
        "index 0000001..0ddf2ba\n" +
        "--- a/sample\n" +
        "+++ b/sample\n" +
        "@@ -1 +1,2 @@\n" +
        "-test\n" +
        "+test1r\n";

      const result = DiffParser.generateDiffJson(diff);
      expect(1).toEqual(result.length);

      const file1 = result[0];
      expect(1).toEqual(file1.addedLines);
      expect(1).toEqual(file1.deletedLines);
      expect("sample").toEqual(file1.oldName);
      expect("sample").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(2).toEqual(file1.blocks[0].lines.length);
      expect(1).toEqual(file1.blocks[0].lines[0].oldNumber);
      expect(null).toEqual(file1.blocks[0].lines[0].newNumber);
      expect(null).toEqual(file1.blocks[0].lines[1].oldNumber);
      expect(1).toEqual(file1.blocks[0].lines[1].newNumber);
    });

    it("should parse unified non git diff and strip timestamps off the headers", function() {
      const diffs = [
        // 2 hours ahead of GMT
        "--- a/sample.js  2016-10-25 11:37:14.000000000 +0200\n" +
          "+++ b/sample.js  2016-10-25 11:37:14.000000000 +0200\n" +
          "@@ -1 +1,2 @@\n" +
          "-test\n" +
          "+test1r\n" +
          "+test2r\n",
        // 2 hours behind GMT
        "--- a/sample.js 2016-10-25 11:37:14.000000000 -0200\n" +
          "+++ b/sample.js  2016-10-25 11:37:14.000000000 -0200\n" +
          "@@ -1 +1,2 @@\n" +
          "-test\n" +
          "+test1r\n" +
          "+test2r\n"
      ];

      diffs.forEach(function(diff) {
        const result = DiffParser.generateDiffJson(diff);
        const file1 = result[0];
        expect(1).toEqual(result.length);
        expect(2).toEqual(file1.addedLines);
        expect(1).toEqual(file1.deletedLines);
        expect("sample.js").toEqual(file1.oldName);
        expect("sample.js").toEqual(file1.newName);
        expect(1).toEqual(file1.blocks.length);

        const linesContent = file1.blocks[0].lines.map(function(line) {
          return line.content;
        });
        expect(linesContent).toEqual(["-test", "+test1r", "+test2r"]);
      });
    });

    it("should parse unified non git diff", function() {
      const diff =
        "--- a/sample.js\n" + "+++ b/sample.js\n" + "@@ -1 +1,2 @@\n" + "-test\n" + "+test1r\n" + "+test2r\n";

      const result = DiffParser.generateDiffJson(diff);
      const file1 = result[0];
      expect(1).toEqual(result.length);
      expect(2).toEqual(file1.addedLines);
      expect(1).toEqual(file1.deletedLines);
      expect("sample.js").toEqual(file1.oldName);
      expect("sample.js").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);

      const linesContent = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent).toEqual(["-test", "+test1r", "+test2r"]);
    });

    it("should parse unified diff with multiple hunks and files", function() {
      const diff =
        "--- sample.js\n" +
        "+++ sample.js\n" +
        "@@ -1 +1,2 @@\n" +
        "-test\n" +
        "@@ -10 +20,2 @@\n" +
        "+test\n" +
        "--- sample1.js\n" +
        "+++ sample1.js\n" +
        "@@ -1 +1,2 @@\n" +
        "+test1";

      const result = DiffParser.generateDiffJson(diff);
      expect(2).toEqual(result.length);

      const file1 = result[0];
      expect(1).toEqual(file1.addedLines);
      expect(1).toEqual(file1.deletedLines);
      expect("sample.js").toEqual(file1.oldName);
      expect("sample.js").toEqual(file1.newName);
      expect(2).toEqual(file1.blocks.length);

      const linesContent1 = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent1).toEqual(["-test"]);

      const linesContent2 = file1.blocks[1].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent2).toEqual(["+test"]);

      const file2 = result[1];
      expect(1).toEqual(file2.addedLines);
      expect(0).toEqual(file2.deletedLines);
      expect("sample1.js").toEqual(file2.oldName);
      expect("sample1.js").toEqual(file2.newName);
      expect(1).toEqual(file2.blocks.length);

      const linesContent = file2.blocks[0].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent).toEqual(["+test1"]);
    });

    it("should parse diff with --- and +++ in the context lines", function() {
      const diff =
        "--- sample.js\n" +
        "+++ sample.js\n" +
        "@@ -1,8 +1,8 @@\n" +
        " test\n" +
        " \n" +
        "-- 1\n" +
        "--- 1\n" +
        "---- 1\n" +
        " \n" +
        "++ 2\n" +
        "+++ 2\n" +
        "++++ 2";

      const result = DiffParser.generateDiffJson(diff);
      const file1 = result[0];
      expect(1).toEqual(result.length);
      expect(3).toEqual(file1.addedLines);
      expect(3).toEqual(file1.deletedLines);
      expect("sample.js").toEqual(file1.oldName);
      expect("sample.js").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);

      const linesContent = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent).toEqual([" test", " ", "-- 1", "--- 1", "---- 1", " ", "++ 2", "+++ 2", "++++ 2"]);
    });

    it("should parse diff without proper hunk headers", function() {
      const diff = "--- sample.js\n" + "+++ sample.js\n" + "@@ @@\n" + " test";

      const result = DiffParser.generateDiffJson(diff);
      const file1 = result[0];
      expect(1).toEqual(result.length);
      expect(0).toEqual(file1.addedLines);
      expect(0).toEqual(file1.deletedLines);
      expect("sample.js").toEqual(file1.oldName);
      expect("sample.js").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);

      const linesContent = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent).toEqual([" test"]);
    });

    it("should parse binary file diff", function() {
      const diff =
        "diff --git a/last-changes-config.png b/last-changes-config.png\n" +
        "index 322248b..56fc1f2 100644\n" +
        "--- a/last-changes-config.png\n" +
        "+++ b/last-changes-config.png\n" +
        "Binary files differ";

      const result = DiffParser.generateDiffJson(diff);
      const file1 = result[0];
      expect(1).toEqual(result.length);
      expect(0).toEqual(file1.addedLines);
      expect(0).toEqual(file1.deletedLines);
      expect("last-changes-config.png").toEqual(file1.oldName);
      expect("last-changes-config.png").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(0).toEqual(file1.blocks[0].lines.length);
      expect("Binary files differ").toEqual(file1.blocks[0].header);
    });

    it("should parse diff with --find-renames", function() {
      const diff =
        "diff --git a/src/test-bar.js b/src/test-baz.js\n" +
        "similarity index 98%\n" +
        "rename from src/test-bar.js\n" +
        "rename to src/test-baz.js\n" +
        "index e01513b..f14a870 100644\n" +
        "--- a/src/test-bar.js\n" +
        "+++ b/src/test-baz.js\n" +
        "@@ -1,4 +1,32 @@\n" +
        " function foo() {\n" +
        '-var bar = "Whoops!";\n' +
        '+var baz = "Whoops!";\n' +
        " }\n" +
        " ";

      const result = DiffParser.generateDiffJson(diff);
      const file1 = result[0];
      expect(1).toEqual(result.length);
      expect(1).toEqual(file1.addedLines);
      expect(1).toEqual(file1.deletedLines);
      expect("src/test-bar.js").toEqual(file1.oldName);
      expect("src/test-baz.js").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(5).toEqual(file1.blocks[0].lines.length);
      const linesContent = file1.blocks[0].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent).toEqual([" function foo() {", '-var bar = "Whoops!";', '+var baz = "Whoops!";', " }", " "]);
    });

    it("should parse diff with prefix 2", function() {
      const diff =
        'diff --git "\tTest.scala" "\tScalaTest.scala"\n' +
        "similarity index 88%\n" +
        "rename from Test.scala\n" +
        "rename to ScalaTest.scala\n" +
        "index 7d1f9bf..8b13271 100644\n" +
        '--- "\tTest.scala"\n' +
        '+++ "\tScalaTest.scala"\n' +
        "@@ -1,6 +1,8 @@\n" +
        " class Test {\n" +
        " \n" +
        "   def method1 = ???\n" +
        "+\n" +
        "+  def method2 = ???\n" +
        " \n" +
        "   def myMethod = ???\n" +
        " \n" +
        "@@ -10,7 +12,6 @@ class Test {\n" +
        " \n" +
        "   def + = ???\n" +
        " \n" +
        "-  def |> = ???\n" +
        " \n" +
        " }\n" +
        " \n" +
        'diff --git "\ttardis.png" "\ttardis.png"\n' +
        "new file mode 100644\n" +
        "index 0000000..d503a29\n" +
        'Binary files /dev/null and "\ttardis.png" differ\n' +
        "diff --git a/src/test-bar.js b/src/test-baz.js\n" +
        "similarity index 98%\n" +
        "rename from src/test-bar.js\n" +
        "rename to src/test-baz.js\n" +
        "index e01513b..f14a870 100644\n" +
        "--- a/src/test-bar.js\n" +
        "+++ b/src/test-baz.js\n" +
        "@@ -1,4 +1,32 @@\n" +
        " function foo() {\n" +
        '-var bar = "Whoops!";\n' +
        '+var baz = "Whoops!";\n' +
        " }\n" +
        " ";

      const result = DiffParser.generateDiffJson(diff, { srcPrefix: "\t", dstPrefix: "\t" });
      expect(3).toEqual(result.length);

      const file1 = result[0];
      expect(2).toEqual(file1.addedLines);
      expect(1).toEqual(file1.deletedLines);
      expect("Test.scala").toEqual(file1.oldName);
      expect("ScalaTest.scala").toEqual(file1.newName);
      expect(2).toEqual(file1.blocks.length);
      expect(8).toEqual(file1.blocks[0].lines.length);
      expect(7).toEqual(file1.blocks[1].lines.length);

      const file2 = result[1];
      expect("/dev/null").toEqual(file2.oldName);
      expect("tardis.png").toEqual(file2.newName);

      const file3 = result[2];
      expect(1).toEqual(file3.addedLines);
      expect(1).toEqual(file3.deletedLines);
      expect("src/test-bar.js").toEqual(file3.oldName);
      expect("src/test-baz.js").toEqual(file3.newName);
      expect(1).toEqual(file3.blocks.length);
      expect(5).toEqual(file3.blocks[0].lines.length);
      const linesContent = file3.blocks[0].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent).toEqual([" function foo() {", '-var bar = "Whoops!";', '+var baz = "Whoops!";', " }", " "]);
    });

    it("should parse binary with content", function() {
      const diff =
        "diff --git a/favicon.png b/favicon.png\n" +
        "deleted file mode 100644\n" +
        "index 2a9d516a5647205d7be510dd0dff93a3663eff6f..0000000000000000000000000000000000000000\n" +
        "GIT binary patch\n" +
        "literal 0\n" +
        "HcmV?d00001\n" +
        "\n" +
        "literal 471\n" +
        "zcmeAS@N?(olHy`uVBq!ia0vp^0wB!61|;P_|4#%`EX7WqAsj$Z!;#Vf<Z~8yL>4nJ\n" +
        "za0`Jj<E6WGe}IBwC9V-A&PAz-C7Jno3L%-fsSJk3`UaNzMkcGzh!g=;$beJ?=ckpF\n" +
        "zCl;kLIHu$$r7E~(7NwTw7iAYKI0u`(*t4mJfq_xq)5S5wqIc=!hrWj$cv|<b{x!c(\n" +
        "z;3r#y;31Y&=1q>qPVOAS4ANVKzqmCp=Cty@U^(7zk!jHsvT~YI{F^=Ex6g|gox78w\n" +
        "z+Sn2Du3GS9U7qU`1*NYYlJi3u-!<?H-eky}wyIIL;8VU@wCDrb0``&v(jQ*DWSR4K\n" +
        "zPq(3;isEyho{emNa=%%!jDPE`l3u;5d=q=<+v8kO-=C`*G#t-*AiE-D>-_B#8k9H0\n" +
        "zGl{FnZs<2$wz5^=Q2h-1XI^s{LQL1#T4epqNPC%Orl(tD_@!*EY++~^Lt2<2&!&%=\n" +
        "z`m>(TYj6uS7jDdt=eH>iOyQg(QMR<-Fw8)Dk^ZG)XQTuzEgl{`GpS?Cfq9818R9~=\n" +
        "z{&h9@9n8F^?|qusoPy{k#%tVHzu7H$t26CR`BJZk*Ixf&u36WuS=?6m2^ho-p00i_\n" +
        "I>zopr0Nz-&lmGw#\n" +
        "diff --git a/src/test-bar.js b/src/test-baz.js\n" +
        "similarity index 98%\n" +
        "rename from src/test-bar.js\n" +
        "rename to src/test-baz.js\n" +
        "index e01513b..f14a870 100644\n" +
        "--- a/src/test-bar.js\n" +
        "+++ b/src/test-baz.js\n" +
        "@@ -1,4 +1,32 @@\n" +
        " function foo() {\n" +
        '-var bar = "Whoops!";\n' +
        '+var baz = "Whoops!";\n' +
        " }\n" +
        " ";

      const result = DiffParser.generateDiffJson(diff);
      expect(2).toEqual(result.length);

      const file1 = result[0];
      expect("favicon.png").toEqual(file1.oldName);
      expect("favicon.png").toEqual(file1.newName);
      expect(1).toEqual(file1.blocks.length);
      expect(0).toEqual(file1.blocks[0].lines.length);

      const file2 = result[1];
      expect(1).toEqual(file2.addedLines);
      expect(1).toEqual(file2.deletedLines);
      expect("src/test-bar.js").toEqual(file2.oldName);
      expect("src/test-baz.js").toEqual(file2.newName);
      expect(1).toEqual(file2.blocks.length);
      expect(5).toEqual(file2.blocks[0].lines.length);
      const linesContent = file2.blocks[0].lines.map(function(line) {
        return line.content;
      });
      expect(linesContent).toEqual([" function foo() {", '-var bar = "Whoops!";', '+var baz = "Whoops!";', " }", " "]);
    });
  });
});
