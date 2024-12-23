import { parse } from '../diff-parser';

describe('DiffParser', () => {
  describe('generateDiffJson', () => {
    it('should parse unix with \n diff', () => {
      const diff =
        'diff --git a/sample b/sample\n' +
        'index 0000001..0ddf2ba\n' +
        '--- a/sample\n' +
        '+++ b/sample\n' +
        '@@ -1 +1 @@\n' +
        '-test\n' +
        '+test1r\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+test1r",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "0ddf2ba",
            "checksumBefore": "0000001",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": undefined,
            "newName": "sample",
            "oldName": "sample",
          },
        ]
      `);
    });

    it('should parse windows with \r\n diff', () => {
      const diff =
        'diff --git a/sample b/sample\r\n' +
        'index 0000001..0ddf2ba\r\n' +
        '--- a/sample\r\n' +
        '+++ b/sample\r\n' +
        '@@ -1 +1 @@\r\n' +
        '-test\r\n' +
        '+test1r\r\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+test1r",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "0ddf2ba",
            "checksumBefore": "0000001",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": undefined,
            "newName": "sample",
            "oldName": "sample",
          },
        ]
      `);
    });

    it('should parse old os x with \r diff', () => {
      const diff =
        'diff --git a/sample b/sample\r' +
        'index 0000001..0ddf2ba\r' +
        '--- a/sample\r' +
        '+++ b/sample\r' +
        '@@ -1 +1 @@\r' +
        '-test\r' +
        '+test1r\r';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+test1r",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "0ddf2ba",
            "checksumBefore": "0000001",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": undefined,
            "newName": "sample",
            "oldName": "sample",
          },
        ]
      `);
    });

    it('should parse mixed eols diff', () => {
      const diff =
        'diff --git a/sample b/sample\n' +
        'index 0000001..0ddf2ba\r\n' +
        '--- a/sample\r' +
        '+++ b/sample\r\n' +
        '@@ -1 +1 @@\n' +
        '-test\r' +
        '+test1r\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+test1r",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "0ddf2ba",
            "checksumBefore": "0000001",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": undefined,
            "newName": "sample",
            "oldName": "sample",
          },
        ]
      `);
    });

    it('should parse diff with special characters', () => {
      const diff =
        'diff --git "a/bla with \ttab.scala" "b/bla with \ttab.scala"\n' +
        'index 4c679d7..e9bd385 100644\n' +
        '--- "a/bla with \ttab.scala"\n' +
        '+++ "b/bla with \ttab.scala"\n' +
        '@@ -1 +1,2 @@\n' +
        '-cenas\n' +
        '+cenas com ananas\n' +
        '+bananas';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 2,
            "blocks": [
              {
                "header": "@@ -1 +1,2 @@",
                "lines": [
                  {
                    "content": "-cenas",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+cenas com ananas",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+bananas",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "e9bd385",
            "checksumBefore": "4c679d7",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": "scala",
            "mode": "100644",
            "newName": "bla with 	tab.scala",
            "oldName": "bla with 	tab.scala",
          },
        ]
      `);
    });

    it('should parse diff with prefix', () => {
      const diff =
        'diff --git "\tbla with \ttab.scala" "\tbla with \ttab.scala"\n' +
        'index 4c679d7..e9bd385 100644\n' +
        '--- "\tbla with \ttab.scala"\n' +
        '+++ "\tbla with \ttab.scala"\n' +
        '@@ -1 +1,2 @@\n' +
        '-cenas\n' +
        '+cenas com ananas\n' +
        '+bananas';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 2,
            "blocks": [
              {
                "header": "@@ -1 +1,2 @@",
                "lines": [
                  {
                    "content": "-cenas",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+cenas com ananas",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+bananas",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "e9bd385",
            "checksumBefore": "4c679d7",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": "scala",
            "mode": "100644",
            "newName": "	bla with 	tab.scala",
            "oldName": "	bla with 	tab.scala",
          },
        ]
      `);
    });

    it('should parse diff with deleted file', () => {
      const diff =
        'diff --git a/src/var/strundefined.js b/src/var/strundefined.js\n' +
        'deleted file mode 100644\n' +
        'index 04e16b0..0000000\n' +
        '--- a/src/var/strundefined.js\n' +
        '+++ /dev/null\n' +
        '@@ -1,3 +0,0 @@\n' +
        '-define(() => {\n' +
        '-  return typeof undefined;\n' +
        '-});\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "@@ -1,3 +0,0 @@",
                "lines": [
                  {
                    "content": "-define(() => {",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "-  return typeof undefined;",
                    "newNumber": undefined,
                    "oldNumber": 2,
                    "type": "delete",
                  },
                  {
                    "content": "-});",
                    "newNumber": undefined,
                    "oldNumber": 3,
                    "type": "delete",
                  },
                ],
                "newStartLine": 0,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "0000000",
            "checksumBefore": "04e16b0",
            "deletedFileMode": "100644",
            "deletedLines": 3,
            "isCombined": false,
            "isDeleted": true,
            "isGitDiff": true,
            "language": "js",
            "newName": "/dev/null",
            "oldName": "src/var/strundefined.js",
          },
        ]
      `);
    });

    it('should parse diff with new file', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 5,
            "blocks": [
              {
                "header": "@@ -0,0 +1,5 @@",
                "lines": [
                  {
                    "content": "+var parser = require('./source/git-parser');",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+var patchLineList = [ false, false, false, false ];",
                    "newNumber": 3,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+",
                    "newNumber": 4,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+console.log(parser.parsePatchDiffResult(text, patchLineList));",
                    "newNumber": 5,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "e1e22ec",
            "checksumBefore": "0000000",
            "deletedLines": 0,
            "isCombined": false,
            "isGitDiff": true,
            "isNew": true,
            "language": "js",
            "newFileMode": "100644",
            "newName": "test.js",
            "oldName": "/dev/null",
          },
        ]
      `);
    });

    it('should parse diff with nested diff', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 6,
            "blocks": [
              {
                "header": "@@ -1,6 +1,5 @@",
                "lines": [
                  {
                    "content": "+var parser = require('./source/git-parser');",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+var text = 'diff --git a/components/app/app.html b/components/app/app.html\\nindex ecb7a95..027bd9b 100644\\n--- a/components/app/app.html\\n+++ b/components/app/app.html\\n@@ -52,0 +53,3 @@\\n+\\n+\\n+\\n@@ -56,0 +60,3 @@\\n+\\n+\\n+\\n'",
                    "newNumber": 3,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+var patchLineList = [ false, false, false, false ];",
                    "newNumber": 4,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+",
                    "newNumber": 5,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+console.log(parser.parsePatchDiffResult(text, patchLineList));",
                    "newNumber": 6,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "fa51f18",
            "checksumBefore": "cc6ffb4",
            "deletedLines": 0,
            "isCombined": false,
            "isGitDiff": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/offset.js",
            "oldName": "src/offset.js",
          },
        ]
      `);
    });

    it('should parse diff with multiple blocks', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 2,
            "blocks": [
              {
                "header": "@@ -1,10 +1,9 @@",
                "lines": [
                  {
                    "content": " define([",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "   "../core",",
                    "newNumber": 2,
                    "oldNumber": 2,
                    "type": "context",
                  },
                  {
                    "content": "   "../var/rnotwhite",",
                    "newNumber": 3,
                    "oldNumber": 3,
                    "type": "context",
                  },
                  {
                    "content": "-  "../var/strundefined",",
                    "newNumber": undefined,
                    "oldNumber": 4,
                    "type": "delete",
                  },
                  {
                    "content": "   "../data/var/dataPriv",",
                    "newNumber": 4,
                    "oldNumber": 5,
                    "type": "context",
                  },
                  {
                    "content": "   "../core/init"",
                    "newNumber": 5,
                    "oldNumber": 6,
                    "type": "context",
                  },
                  {
                    "content": "-], function( jQuery, rnotwhite, strundefined, dataPriv ) {",
                    "newNumber": undefined,
                    "oldNumber": 7,
                    "type": "delete",
                  },
                  {
                    "content": "+], function( jQuery, rnotwhite, dataPriv ) {",
                    "newNumber": 6,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " ",
                    "newNumber": 7,
                    "oldNumber": 8,
                    "type": "context",
                  },
                  {
                    "content": " var rclass = /[\\t\\r\\n\\f]/g;",
                    "newNumber": 8,
                    "oldNumber": 9,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 9,
                    "oldNumber": 10,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
              {
                "header": "@@ -128,7 +127,7 @@ jQuery.fn.extend({",
                "lines": [
                  {
                    "content": "         }",
                    "newNumber": 127,
                    "oldNumber": 128,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 128,
                    "oldNumber": 129,
                    "type": "context",
                  },
                  {
                    "content": "       // Toggle whole class name",
                    "newNumber": 129,
                    "oldNumber": 130,
                    "type": "context",
                  },
                  {
                    "content": "-      } else if ( type === strundefined || type === "boolean" ) {",
                    "newNumber": undefined,
                    "oldNumber": 131,
                    "type": "delete",
                  },
                  {
                    "content": "+      } else if ( value === undefined || type === "boolean" ) {",
                    "newNumber": 130,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "         if ( this.className ) {",
                    "newNumber": 131,
                    "oldNumber": 132,
                    "type": "context",
                  },
                  {
                    "content": "           // store className if set",
                    "newNumber": 132,
                    "oldNumber": 133,
                    "type": "context",
                  },
                  {
                    "content": "           dataPriv.set( this, "__className__", this.className );",
                    "newNumber": 133,
                    "oldNumber": 134,
                    "type": "context",
                  },
                ],
                "newStartLine": 127,
                "oldStartLine": 128,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "c8d1393",
            "checksumBefore": "c617824",
            "deletedLines": 3,
            "isCombined": false,
            "isGitDiff": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/attributes/classes.js",
            "oldName": "src/attributes/classes.js",
          },
        ]
      `);
    });

    it('should parse diff with multiple files', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -101,7 +101,7 @@ var rootjQuery,",
                "lines": [
                  {
                    "content": "     // HANDLE: $(function)",
                    "newNumber": 101,
                    "oldNumber": 101,
                    "type": "context",
                  },
                  {
                    "content": "     // Shortcut for document ready",
                    "newNumber": 102,
                    "oldNumber": 102,
                    "type": "context",
                  },
                  {
                    "content": "     } else if ( jQuery.isFunction( selector ) ) {",
                    "newNumber": 103,
                    "oldNumber": 103,
                    "type": "context",
                  },
                  {
                    "content": "-      return typeof rootjQuery.ready !== "undefined" ?",
                    "newNumber": undefined,
                    "oldNumber": 104,
                    "type": "delete",
                  },
                  {
                    "content": "+      return rootjQuery.ready !== undefined ?",
                    "newNumber": 104,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "         rootjQuery.ready( selector ) :",
                    "newNumber": 105,
                    "oldNumber": 105,
                    "type": "context",
                  },
                  {
                    "content": "         // Execute immediately if ready is not present",
                    "newNumber": 106,
                    "oldNumber": 106,
                    "type": "context",
                  },
                  {
                    "content": "         selector( jQuery );",
                    "newNumber": 107,
                    "oldNumber": 107,
                    "type": "context",
                  },
                ],
                "newStartLine": 101,
                "oldStartLine": 101,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "50f310c",
            "checksumBefore": "e49196a",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/core/init.js",
            "oldName": "src/core/init.js",
          },
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "@@ -1,6 +1,5 @@",
                "lines": [
                  {
                    "content": " define([",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "   "./core",",
                    "newNumber": 2,
                    "oldNumber": 2,
                    "type": "context",
                  },
                  {
                    "content": "-  "./var/strundefined",",
                    "newNumber": undefined,
                    "oldNumber": 3,
                    "type": "delete",
                  },
                  {
                    "content": "   "./var/rnotwhite",",
                    "newNumber": 3,
                    "oldNumber": 4,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/hasOwn",",
                    "newNumber": 4,
                    "oldNumber": 5,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/slice",",
                    "newNumber": 5,
                    "oldNumber": 6,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "6183f70",
            "checksumBefore": "7336f4d",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/event.js",
            "oldName": "src/event.js",
          },
        ]
      `);
    });

    it('should parse combined diff', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 9,
            "blocks": [
              {
                "header": "@@@ -98,20 -98,12 +98,20 @@@",
                "lines": [
                  {
                    "content": "   return (a_date > b_date) ? -1 : (a_date == b_date) ? 0 : 1;",
                    "newNumber": 98,
                    "oldNumber": 98,
                    "type": "context",
                  },
                  {
                    "content": "  }",
                    "newNumber": 99,
                    "oldNumber": 99,
                    "type": "context",
                  },
                  {
                    "content": "  ",
                    "newNumber": 100,
                    "oldNumber": 100,
                    "type": "context",
                  },
                  {
                    "content": "- static void describe(char *arg)",
                    "newNumber": undefined,
                    "oldNumber": 101,
                    "type": "delete",
                  },
                  {
                    "content": " -static void describe(struct commit *cmit, int last_one)",
                    "newNumber": undefined,
                    "oldNumber": 102,
                    "type": "delete",
                  },
                  {
                    "content": "++static void describe(char *arg, int last_one)",
                    "newNumber": 101,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "  {",
                    "newNumber": 102,
                    "oldNumber": 103,
                    "type": "context",
                  },
                  {
                    "content": " + unsigned char sha1[20];",
                    "newNumber": 103,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " + struct commit *cmit;",
                    "newNumber": 104,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "   struct commit_list *list;",
                    "newNumber": 105,
                    "oldNumber": 104,
                    "type": "context",
                  },
                  {
                    "content": "   static int initialized = 0;",
                    "newNumber": 106,
                    "oldNumber": 105,
                    "type": "context",
                  },
                  {
                    "content": "   struct commit_name *n;",
                    "newNumber": 107,
                    "oldNumber": 106,
                    "type": "context",
                  },
                  {
                    "content": "  ",
                    "newNumber": 108,
                    "oldNumber": 107,
                    "type": "context",
                  },
                  {
                    "content": " + if (get_sha1(arg, sha1) < 0)",
                    "newNumber": 109,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " +     usage(describe_usage);",
                    "newNumber": 110,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " + cmit = lookup_commit_reference(sha1);",
                    "newNumber": 111,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " + if (!cmit)",
                    "newNumber": 112,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " +     usage(describe_usage);",
                    "newNumber": 113,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " +",
                    "newNumber": 114,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "   if (!initialized) {",
                    "newNumber": 115,
                    "oldNumber": 108,
                    "type": "context",
                  },
                  {
                    "content": "       initialized = 1;",
                    "newNumber": 116,
                    "oldNumber": 109,
                    "type": "context",
                  },
                  {
                    "content": "       for_each_ref(get_name);",
                    "newNumber": 117,
                    "oldNumber": 110,
                    "type": "context",
                  },
                ],
                "newStartLine": 98,
                "oldStartLine": 98,
                "oldStartLine2": 98,
              },
            ],
            "checksumAfter": "fabadb8",
            "checksumBefore": [
              "cc95eb0",
              "4866510",
            ],
            "deletedLines": 2,
            "isCombined": true,
            "isGitDiff": true,
            "language": "c",
            "newName": "describe.c",
            "oldName": "describe.c",
          },
        ]
      `);
    });

    it('should parse diffs with copied files', () => {
      const diff =
        'diff --git a/index.js b/more-index.js\n' +
        'dissimilarity index 5%\n' +
        'copy from index.js\n' +
        'copy to more-index.js\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [],
            "changedPercentage": 5,
            "deletedLines": 0,
            "isCopy": true,
            "isGitDiff": true,
            "newName": "more-index.js",
            "oldName": "index.js",
          },
        ]
      `);
    });

    it('should parse diffs with moved files', () => {
      const diff =
        'diff --git a/more-index.js b/other-index.js\n' +
        'similarity index 86%\n' +
        'rename from more-index.js\n' +
        'rename to other-index.js\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [],
            "deletedLines": 0,
            "isGitDiff": true,
            "isRename": true,
            "newName": "other-index.js",
            "oldName": "more-index.js",
            "unchangedPercentage": 86,
          },
        ]
      `);
    });

    it('should parse diffs correct line numbers', () => {
      const diff =
        'diff --git a/sample b/sample\n' +
        'index 0000001..0ddf2ba\n' +
        '--- a/sample\n' +
        '+++ b/sample\n' +
        '@@ -1 +1,2 @@\n' +
        '-test\n' +
        '+test1r\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1,2 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+test1r",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "0ddf2ba",
            "checksumBefore": "0000001",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": undefined,
            "newName": "sample",
            "oldName": "sample",
          },
        ]
      `);
    });

    it('should parse unified non git diff and strip timestamps off the headers', () => {
      const diffs = [
        // 2 hours ahead of GMT
        '--- a/sample.js  2016-10-25 11:37:14.000000000 +0200\n' +
          '+++ b/sample.js  2016-10-25 11:37:14.000000000 +0200\n' +
          '@@ -1 +1,2 @@\n' +
          '-test\n' +
          '+test1r\n' +
          '+test2r',
        // 2 hours behind GMT
        '--- a/sample.js 2016-10-25 11:37:14.000000000 -0200\n' +
          '+++ b/sample.js  2016-10-25 11:37:14.000000000 -0200\n' +
          '@@ -1 +1,2 @@\n' +
          '-test\n' +
          '+test1r\n' +
          '+test2r',
      ].join('\n');
      const result = parse(diffs);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 2,
            "blocks": [
              {
                "header": "@@ -1 +1,2 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+test1r",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+test2r",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 1,
            "isCombined": false,
            "language": "js",
            "newName": "sample.js",
            "oldName": "sample.js",
          },
          {
            "addedLines": 2,
            "blocks": [
              {
                "header": "@@ -1 +1,2 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+test1r",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+test2r",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 1,
            "isCombined": false,
            "language": "js",
            "newName": "sample.js",
            "oldName": "sample.js",
          },
        ]
      `);
    });

    it('should parse unified non git diff', () => {
      const diff =
        '--- a/sample.js\n' + '+++ b/sample.js\n' + '@@ -1 +1,2 @@\n' + '-test\n' + '+test1r\n' + '+test2r\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 2,
            "blocks": [
              {
                "header": "@@ -1 +1,2 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+test1r",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+test2r",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 1,
            "isCombined": false,
            "language": "js",
            "newName": "sample.js",
            "oldName": "sample.js",
          },
        ]
      `);
    });

    it('should parse unified diff with multiple hunks and files', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1,2 @@",
                "lines": [
                  {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
              {
                "header": "@@ -10 +20,2 @@",
                "lines": [
                  {
                    "content": "+test",
                    "newNumber": 20,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 20,
                "oldStartLine": 10,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 1,
            "isCombined": false,
            "language": "js",
            "newName": "sample.js",
            "oldName": "sample.js",
          },
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1,2 @@",
                "lines": [
                  {
                    "content": "+test1",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 0,
            "isCombined": false,
            "language": "js",
            "newName": "sample1.js",
            "oldName": "sample1.js",
          },
        ]
      `);
    });

    it('should parse diff with --- and +++ in the context lines', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 3,
            "blocks": [
              {
                "header": "@@ -1,8 +1,8 @@",
                "lines": [
                  {
                    "content": " test",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 2,
                    "oldNumber": 2,
                    "type": "context",
                  },
                  {
                    "content": "-- 1",
                    "newNumber": undefined,
                    "oldNumber": 3,
                    "type": "delete",
                  },
                  {
                    "content": "--- 1",
                    "newNumber": undefined,
                    "oldNumber": 4,
                    "type": "delete",
                  },
                  {
                    "content": "---- 1",
                    "newNumber": undefined,
                    "oldNumber": 5,
                    "type": "delete",
                  },
                  {
                    "content": " ",
                    "newNumber": 3,
                    "oldNumber": 6,
                    "type": "context",
                  },
                  {
                    "content": "++ 2",
                    "newNumber": 4,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+++ 2",
                    "newNumber": 5,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "++++ 2",
                    "newNumber": 6,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 3,
            "isCombined": false,
            "language": "js",
            "newName": "sample.js",
            "oldName": "sample.js",
          },
        ]
      `);
    });

    it('should parse diff without proper hunk headers', () => {
      const diff = '--- sample.js\n' + '+++ sample.js\n' + '@@ @@\n' + ' test';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "@@ @@",
                "lines": [
                  {
                    "content": " test",
                    "newNumber": 0,
                    "oldNumber": 0,
                    "type": "context",
                  },
                ],
                "newStartLine": 0,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 0,
            "isCombined": false,
            "language": "js",
            "newName": "sample.js",
            "oldName": "sample.js",
          },
        ]
      `);
    });

    it('should parse binary file diff', () => {
      const diff =
        'diff --git a/last-changes-config.png b/last-changes-config.png\n' +
        'index 322248b..56fc1f2 100644\n' +
        '--- a/last-changes-config.png\n' +
        '+++ b/last-changes-config.png\n' +
        'Binary files differ';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "Binary files differ",
                "lines": [],
                "newStartLine": 0,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "56fc1f2",
            "checksumBefore": "322248b",
            "deletedLines": 0,
            "isCombined": false,
            "isGitDiff": true,
            "language": "png",
            "mode": "100644",
            "newName": "last-changes-config.png",
            "oldName": "last-changes-config.png",
          },
        ]
      `);
    });

    it('should parse diff with --find-renames', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1,4 +1,32 @@",
                "lines": [
                  {
                    "content": " function foo() {",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "-var bar = "Whoops!";",
                    "newNumber": undefined,
                    "oldNumber": 2,
                    "type": "delete",
                  },
                  {
                    "content": "+var baz = "Whoops!";",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " }",
                    "newNumber": 3,
                    "oldNumber": 3,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 4,
                    "oldNumber": 4,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "f14a870",
            "checksumBefore": "e01513b",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "isRename": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/test-baz.js",
            "oldName": "src/test-bar.js",
            "unchangedPercentage": 98,
          },
        ]
      `);
    });

    it('should parse diff with prefix 2', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 2,
            "blocks": [
              {
                "header": "@@ -1,6 +1,8 @@",
                "lines": [
                  {
                    "content": " class Test {",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 2,
                    "oldNumber": 2,
                    "type": "context",
                  },
                  {
                    "content": "   def method1 = ???",
                    "newNumber": 3,
                    "oldNumber": 3,
                    "type": "context",
                  },
                  {
                    "content": "+",
                    "newNumber": 4,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+  def method2 = ???",
                    "newNumber": 5,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " ",
                    "newNumber": 6,
                    "oldNumber": 4,
                    "type": "context",
                  },
                  {
                    "content": "   def myMethod = ???",
                    "newNumber": 7,
                    "oldNumber": 5,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 8,
                    "oldNumber": 6,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
              {
                "header": "@@ -10,7 +12,6 @@ class Test {",
                "lines": [
                  {
                    "content": " ",
                    "newNumber": 12,
                    "oldNumber": 10,
                    "type": "context",
                  },
                  {
                    "content": "   def + = ???",
                    "newNumber": 13,
                    "oldNumber": 11,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 14,
                    "oldNumber": 12,
                    "type": "context",
                  },
                  {
                    "content": "-  def |> = ???",
                    "newNumber": undefined,
                    "oldNumber": 13,
                    "type": "delete",
                  },
                  {
                    "content": " ",
                    "newNumber": 15,
                    "oldNumber": 14,
                    "type": "context",
                  },
                  {
                    "content": " }",
                    "newNumber": 16,
                    "oldNumber": 15,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 17,
                    "oldNumber": 16,
                    "type": "context",
                  },
                ],
                "newStartLine": 12,
                "oldStartLine": 10,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "8b13271",
            "checksumBefore": "7d1f9bf",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "isRename": true,
            "language": "scala",
            "mode": "100644",
            "newName": "	ScalaTest.scala",
            "oldName": "	Test.scala",
            "unchangedPercentage": 88,
          },
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "Binary file",
                "lines": [],
                "newStartLine": 0,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "d503a29",
            "checksumBefore": "0000000",
            "deletedLines": 0,
            "isBinary": true,
            "isCombined": false,
            "isGitDiff": true,
            "isNew": true,
            "newFileMode": "100644",
            "newName": "	tardis.png",
            "oldName": "/dev/null",
          },
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1,4 +1,32 @@",
                "lines": [
                  {
                    "content": " function foo() {",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "-var bar = "Whoops!";",
                    "newNumber": undefined,
                    "oldNumber": 2,
                    "type": "delete",
                  },
                  {
                    "content": "+var baz = "Whoops!";",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " }",
                    "newNumber": 3,
                    "oldNumber": 3,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 4,
                    "oldNumber": 4,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "f14a870",
            "checksumBefore": "e01513b",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "isRename": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/test-baz.js",
            "oldName": "src/test-bar.js",
            "unchangedPercentage": 98,
          },
        ]
      `);
    });

    it('should parse binary with content', () => {
      const diff =
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
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "GIT binary patch",
                "lines": [],
                "newStartLine": 0,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "0000000000000000000000000000000000000000",
            "checksumBefore": "2a9d516a5647205d7be510dd0dff93a3663eff6f",
            "deletedFileMode": "100644",
            "deletedLines": 0,
            "isBinary": true,
            "isCombined": false,
            "isDeleted": true,
            "isGitDiff": true,
            "newName": "favicon.png",
            "oldName": "favicon.png",
          },
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1,4 +1,32 @@",
                "lines": [
                  {
                    "content": " function foo() {",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "-var bar = "Whoops!";",
                    "newNumber": undefined,
                    "oldNumber": 2,
                    "type": "delete",
                  },
                  {
                    "content": "+var baz = "Whoops!";",
                    "newNumber": 2,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": " }",
                    "newNumber": 3,
                    "oldNumber": 3,
                    "type": "context",
                  },
                  {
                    "content": " ",
                    "newNumber": 4,
                    "oldNumber": 4,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "f14a870",
            "checksumBefore": "e01513b",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "isRename": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/test-baz.js",
            "oldName": "src/test-bar.js",
            "unchangedPercentage": 98,
          },
        ]
      `);
    });

    it('should work when `diffMaxChanges` is set and excedeed', () => {
      const diff =
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
      const result = parse(diff, { diffMaxChanges: 1 });
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "Diff too big to be displayed",
                "lines": [],
                "newStartLine": 0,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "50f310c",
            "checksumBefore": "e49196a",
            "deletedLines": 0,
            "isCombined": false,
            "isGitDiff": true,
            "isTooBig": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/core/init.js",
            "oldName": "src/core/init.js",
          },
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "@@ -1,6 +1,5 @@",
                "lines": [
                  {
                    "content": " define([",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "   "./core",",
                    "newNumber": 2,
                    "oldNumber": 2,
                    "type": "context",
                  },
                  {
                    "content": "-  "./var/strundefined",",
                    "newNumber": undefined,
                    "oldNumber": 3,
                    "type": "delete",
                  },
                  {
                    "content": "   "./var/rnotwhite",",
                    "newNumber": 3,
                    "oldNumber": 4,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/hasOwn",",
                    "newNumber": 4,
                    "oldNumber": 5,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/slice",",
                    "newNumber": 5,
                    "oldNumber": 6,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "6183f70",
            "checksumBefore": "7336f4d",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/event.js",
            "oldName": "src/event.js",
          },
        ]
      `);
    });

    it('should work when `diffMaxChanges` is set and excedeed, and `diffTooBigMessage` is set', () => {
      const diff =
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
      const result = parse(diff, { diffMaxChanges: 1, diffTooBigMessage: (i: number) => `Custom ${i}` });
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "Custom 0",
                "lines": [],
                "newStartLine": 0,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "50f310c",
            "checksumBefore": "e49196a",
            "deletedLines": 0,
            "isCombined": false,
            "isGitDiff": true,
            "isTooBig": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/core/init.js",
            "oldName": "src/core/init.js",
          },
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "@@ -1,6 +1,5 @@",
                "lines": [
                  {
                    "content": " define([",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "   "./core",",
                    "newNumber": 2,
                    "oldNumber": 2,
                    "type": "context",
                  },
                  {
                    "content": "-  "./var/strundefined",",
                    "newNumber": undefined,
                    "oldNumber": 3,
                    "type": "delete",
                  },
                  {
                    "content": "   "./var/rnotwhite",",
                    "newNumber": 3,
                    "oldNumber": 4,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/hasOwn",",
                    "newNumber": 4,
                    "oldNumber": 5,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/slice",",
                    "newNumber": 5,
                    "oldNumber": 6,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "6183f70",
            "checksumBefore": "7336f4d",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/event.js",
            "oldName": "src/event.js",
          },
        ]
      `);
    });

    it('should work when `diffMaxLineLength` is set and excedeed', () => {
      const diff =
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
      const result = parse(diff, { diffMaxLineLength: 50 });
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "Diff too big to be displayed",
                "lines": [],
                "newStartLine": 0,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "50f310c",
            "checksumBefore": "e49196a",
            "deletedLines": 0,
            "isCombined": false,
            "isGitDiff": true,
            "isTooBig": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/core/init.js",
            "oldName": "src/core/init.js",
          },
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "@@ -1,6 +1,5 @@",
                "lines": [
                  {
                    "content": " define([",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "   "./core",",
                    "newNumber": 2,
                    "oldNumber": 2,
                    "type": "context",
                  },
                  {
                    "content": "-  "./var/strundefined",",
                    "newNumber": undefined,
                    "oldNumber": 3,
                    "type": "delete",
                  },
                  {
                    "content": "   "./var/rnotwhite",",
                    "newNumber": 3,
                    "oldNumber": 4,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/hasOwn",",
                    "newNumber": 4,
                    "oldNumber": 5,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/slice",",
                    "newNumber": 5,
                    "oldNumber": 6,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "6183f70",
            "checksumBefore": "7336f4d",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/event.js",
            "oldName": "src/event.js",
          },
        ]
      `);
    });

    it('should work when `diffMaxLineLength` is set and excedeed, and `diffTooBigMessage` is set', () => {
      const diff =
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
      const result = parse(diff, { diffMaxLineLength: 50, diffTooBigMessage: (i: number) => `Custom ${i}` });
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "Custom 0",
                "lines": [],
                "newStartLine": 0,
                "oldStartLine": 0,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "50f310c",
            "checksumBefore": "e49196a",
            "deletedLines": 0,
            "isCombined": false,
            "isGitDiff": true,
            "isTooBig": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/core/init.js",
            "oldName": "src/core/init.js",
          },
          {
            "addedLines": 0,
            "blocks": [
              {
                "header": "@@ -1,6 +1,5 @@",
                "lines": [
                  {
                    "content": " define([",
                    "newNumber": 1,
                    "oldNumber": 1,
                    "type": "context",
                  },
                  {
                    "content": "   "./core",",
                    "newNumber": 2,
                    "oldNumber": 2,
                    "type": "context",
                  },
                  {
                    "content": "-  "./var/strundefined",",
                    "newNumber": undefined,
                    "oldNumber": 3,
                    "type": "delete",
                  },
                  {
                    "content": "   "./var/rnotwhite",",
                    "newNumber": 3,
                    "oldNumber": 4,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/hasOwn",",
                    "newNumber": 4,
                    "oldNumber": 5,
                    "type": "context",
                  },
                  {
                    "content": "   "./var/slice",",
                    "newNumber": 5,
                    "oldNumber": 6,
                    "type": "context",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "6183f70",
            "checksumBefore": "7336f4d",
            "deletedLines": 1,
            "isCombined": false,
            "isGitDiff": true,
            "language": "js",
            "mode": "100644",
            "newName": "src/event.js",
            "oldName": "src/event.js",
          },
        ]
      `);
    });

    it('should parse unix diff with binary file', () => {
      const diff =
        'diff -ur a/htest.html b/htest.html\n' +
        '--- a/htest.html        2023-01-10 09:43:04.284427636 +0800\n' +
        '+++ b/htest.html        2023-01-10 09:43:10.308388990 +0800\n' +
        '@@ -1 +1 @@\n' +
        '-<a>test</a>\n' +
        '+<a>new test</a>\n' +
        'Binary files a/image.gif and b/image.gif differ\n' +
        'diff -ur a/test.json b/test.json\n' +
        '--- a/test.json 2023-01-10 09:43:07.832404870 +0800\n' +
        '+++ b/test.json 2023-01-10 09:43:12.708373605 +0800\n' +
        '@@ -1 +1 @@\n' +
        '-{"list": [1, 2]}\n' +
        '+{"list": [1, 2, 3]}';

      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1 @@",
                "lines": [
                  {
                    "content": "-<a>test</a>",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+<a>new test</a>",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 1,
            "isCombined": false,
            "language": "html",
            "newName": "htest.html",
            "oldName": "htest.html",
          },
          {
            "addedLines": 0,
            "blocks": [],
            "deletedLines": 0,
            "isBinary": true,
            "newName": "image.gif",
            "oldName": "image.gif",
          },
          {
            "addedLines": 1,
            "blocks": [
              {
                "header": "@@ -1 +1 @@",
                "lines": [
                  {
                    "content": "-{"list": [1, 2]}",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  {
                    "content": "+{"list": [1, 2, 3]}",
                    "newNumber": 1,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 1,
                "oldStartLine": 1,
                "oldStartLine2": null,
              },
            ],
            "deletedLines": 1,
            "isCombined": false,
            "language": "json",
            "newName": "test.json",
            "oldName": "test.json",
          },
        ]
      `);
    });
  });
});
