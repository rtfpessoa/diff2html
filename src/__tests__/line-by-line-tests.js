const LineByLinePrinter = require("../line-by-line-printer.js").LineByLinePrinter;

describe("LineByLinePrinter", function() {
  describe("_generateEmptyDiff", function() {
    it("should return an empty diff", function() {
      const lineByLinePrinter = new LineByLinePrinter({});
      const fileHtml = lineByLinePrinter._generateEmptyDiff();
      const expected =
        "<tr>\n" +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-line d2h-info">\n' +
        "            File without changes\n" +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(fileHtml);
    });
  });

  describe("makeLineHtml", function() {
    it("should work for insertions", function() {
      const diffParser = require("../diff-parser.js").DiffParser;
      const lineByLinePrinter = new LineByLinePrinter({});
      let fileHtml = lineByLinePrinter.makeLineHtml(false, diffParser.LINE_TYPE.INSERTS, "", 30, "test", "+");
      fileHtml = fileHtml.replace(/\n\n+/g, "\n");
      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">30</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(fileHtml);
    });

    it("should work for deletions", function() {
      const diffParser = require("../diff-parser.js").DiffParser;
      const lineByLinePrinter = new LineByLinePrinter({});
      let fileHtml = lineByLinePrinter.makeLineHtml(false, diffParser.LINE_TYPE.DELETES, 30, "", "test", "-");
      fileHtml = fileHtml.replace(/\n\n+/g, "\n");
      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-linenumber d2h-del">\n' +
        '      <div class="line-num1">30</div>\n' +
        '<div class="line-num2"></div>\n' +
        "    </td>\n" +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(fileHtml);
    });

    it("should convert indents into non breakin spaces (2 white spaces)", function() {
      const diffParser = require("../diff-parser.js").DiffParser;
      const lineByLinePrinter = new LineByLinePrinter({});
      let fileHtml = lineByLinePrinter.makeLineHtml(false, diffParser.LINE_TYPE.INSERTS, "", 30, "  test", "+");
      fileHtml = fileHtml.replace(/\n\n+/g, "\n");
      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">30</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">  test</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(fileHtml);
    });

    it("should convert indents into non breakin spaces (4 white spaces)", function() {
      const diffParser = require("../diff-parser.js").DiffParser;
      const lineByLinePrinter = new LineByLinePrinter({});
      let fileHtml = lineByLinePrinter.makeLineHtml(false, diffParser.LINE_TYPE.INSERTS, "", 30, "    test", "+");
      fileHtml = fileHtml.replace(/\n\n+/g, "\n");
      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">30</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">    test</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(fileHtml);
    });

    it("should preserve tabs", function() {
      const diffParser = require("../diff-parser.js").DiffParser;
      const lineByLinePrinter = new LineByLinePrinter({});
      let fileHtml = lineByLinePrinter.makeLineHtml(false, diffParser.LINE_TYPE.INSERTS, "", 30, "\ttest", "+");
      fileHtml = fileHtml.replace(/\n\n+/g, "\n");
      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '      <div class="line-num1"></div>\n' +
        "" +
        '<div class="line-num2">30</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">\ttest</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(fileHtml);
    });
  });

  describe("makeFileDiffHtml", function() {
    it("should work for simple file", function() {
      const lineByLinePrinter = new LineByLinePrinter({});

      const file = {
        addedLines: 12,
        deletedLines: 41,
        language: "js",
        oldName: "my/file/name.js",
        newName: "my/file/name.js"
      };
      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLinePrinter.makeFileDiffHtml(file, diffs);

      const expected =
        '<div id="d2h-781444" class="d2h-file-wrapper" data-lang="js">\n' +
        '    <div class="d2h-file-header">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">my/file/name.js</span>\n' +
        '    <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>\n' +
        "    </div>\n" +
        '    <div class="d2h-file-diff">\n' +
        '        <div class="d2h-code-wrapper">\n' +
        '            <table class="d2h-diff-table">\n' +
        '                <tbody class="d2h-diff-tbody">\n' +
        "                <span>Random Html</span>\n" +
        "                </tbody>\n" +
        "            </table>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>";

      expect(expected).toEqual(fileHtml);
    });
    it("should work for simple added file", function() {
      const lineByLinePrinter = new LineByLinePrinter({});

      const file = {
        addedLines: 12,
        deletedLines: 0,
        language: "js",
        oldName: "dev/null",
        newName: "my/file/name.js",
        isNew: true
      };
      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLinePrinter.makeFileDiffHtml(file, diffs);

      const expected =
        '<div id="d2h-781444" class="d2h-file-wrapper" data-lang="js">\n' +
        '    <div class="d2h-file-header">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">my/file/name.js</span>\n' +
        '    <span class="d2h-tag d2h-added d2h-added-tag">ADDED</span></span>\n' +
        "    </div>\n" +
        '    <div class="d2h-file-diff">\n' +
        '        <div class="d2h-code-wrapper">\n' +
        '            <table class="d2h-diff-table">\n' +
        '                <tbody class="d2h-diff-tbody">\n' +
        "                <span>Random Html</span>\n" +
        "                </tbody>\n" +
        "            </table>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>";

      expect(expected).toEqual(fileHtml);
    });
    it("should work for simple deleted file", function() {
      const lineByLinePrinter = new LineByLinePrinter({});

      const file = {
        addedLines: 0,
        deletedLines: 41,
        language: "js",
        oldName: "my/file/name.js",
        newName: "dev/null",
        isDeleted: true
      };
      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLinePrinter.makeFileDiffHtml(file, diffs);

      const expected =
        '<div id="d2h-781444" class="d2h-file-wrapper" data-lang="js">\n' +
        '    <div class="d2h-file-header">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">my/file/name.js</span>\n' +
        '    <span class="d2h-tag d2h-deleted d2h-deleted-tag">DELETED</span></span>\n' +
        "    </div>\n" +
        '    <div class="d2h-file-diff">\n' +
        '        <div class="d2h-code-wrapper">\n' +
        '            <table class="d2h-diff-table">\n' +
        '                <tbody class="d2h-diff-tbody">\n' +
        "                <span>Random Html</span>\n" +
        "                </tbody>\n" +
        "            </table>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>";

      expect(expected).toEqual(fileHtml);
    });
    it("should work for simple renamed file", function() {
      const lineByLinePrinter = new LineByLinePrinter({});

      const file = {
        addedLines: 12,
        deletedLines: 41,
        language: "js",
        oldName: "my/file/name1.js",
        newName: "my/file/name2.js",
        isRename: true
      };
      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLinePrinter.makeFileDiffHtml(file, diffs);

      const expected =
        '<div id="d2h-662683" class="d2h-file-wrapper" data-lang="js">\n' +
        '    <div class="d2h-file-header">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">my/file/{name1.js → name2.js}</span>\n' +
        '    <span class="d2h-tag d2h-moved d2h-moved-tag">RENAMED</span></span>\n' +
        "    </div>\n" +
        '    <div class="d2h-file-diff">\n' +
        '        <div class="d2h-code-wrapper">\n' +
        '            <table class="d2h-diff-table">\n' +
        '                <tbody class="d2h-diff-tbody">\n' +
        "                <span>Random Html</span>\n" +
        "                </tbody>\n" +
        "            </table>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>";

      expect(expected).toEqual(fileHtml);
    });
    it("should return empty when option renderNothingWhenEmpty is true and file blocks not present", function() {
      const lineByLinePrinter = new LineByLinePrinter({
        renderNothingWhenEmpty: true
      });

      const file = {
        blocks: []
      };

      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLinePrinter.makeFileDiffHtml(file, diffs);

      const expected = "";

      expect(expected).toEqual(fileHtml);
    });
  });

  describe("makeLineByLineHtmlWrapper", function() {
    it("should work for simple content", function() {
      const lineByLinePrinter = new LineByLinePrinter({});
      const fileHtml = lineByLinePrinter.makeLineByLineHtmlWrapper("<span>Random Html</span>");

      const expected = '<div class="d2h-wrapper">\n' + "    <span>Random Html</span>\n" + "</div>";

      expect(expected).toEqual(fileHtml);
    });
  });

  describe("generateLineByLineJsonHtml", function() {
    it("should work for list of files", function() {
      const exampleJson = [
        {
          blocks: [
            {
              lines: [
                {
                  content: "-test",
                  type: "d2h-del",
                  oldNumber: 1,
                  newNumber: null
                },
                {
                  content: "+test1r",
                  type: "d2h-ins",
                  oldNumber: null,
                  newNumber: 1
                }
              ],
              oldStartLine: "1",
              oldStartLine2: null,
              newStartLine: "1",
              header: "@@ -1 +1 @@"
            }
          ],
          deletedLines: 1,
          addedLines: 1,
          checksumBefore: "0000001",
          checksumAfter: "0ddf2ba",
          oldName: "sample",
          language: undefined,
          newName: "sample",
          isCombined: false
        }
      ];

      const lineByLinePrinter = new LineByLinePrinter({ matching: "lines" });
      const html = lineByLinePrinter.generateLineByLineJsonHtml(exampleJson);
      const expected =
        '<div class="d2h-wrapper">\n' +
        '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">\n' +
        '    <div class="d2h-file-header">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">sample</span>\n' +
        '    <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>\n' +
        "    </div>\n" +
        '    <div class="d2h-file-diff">\n' +
        '        <div class="d2h-code-wrapper">\n' +
        '            <table class="d2h-diff-table">\n' +
        '                <tbody class="d2h-diff-tbody">\n' +
        "                <tr>\n" +
        '    <td class="d2h-code-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-line d2h-info">@@ -1 +1 @@</div>\n' +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-del">\n' +
        '      <div class="line-num1">1</div>\n' +
        '<div class="line-num2"></div>\n' +
        "    </td>\n" +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn"><del>test</del></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">1</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn"><ins>test1r</ins></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>\n" +
        "                </tbody>\n" +
        "            </table>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "</div>";

      expect(expected).toEqual(html);
    });

    it("should work for empty blocks", function() {
      const exampleJson = [
        {
          blocks: [],
          deletedLines: 0,
          addedLines: 0,
          oldName: "sample",
          language: "js",
          newName: "sample",
          isCombined: false
        }
      ];

      const lineByLinePrinter = new LineByLinePrinter({ renderNothingWhenEmpty: false });
      const html = lineByLinePrinter.generateLineByLineJsonHtml(exampleJson);
      const expected =
        '<div class="d2h-wrapper">\n' +
        '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="js">\n' +
        '    <div class="d2h-file-header">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">sample</span>\n' +
        '    <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>\n' +
        "    </div>\n" +
        '    <div class="d2h-file-diff">\n' +
        '        <div class="d2h-code-wrapper">\n' +
        '            <table class="d2h-diff-table">\n' +
        '                <tbody class="d2h-diff-tbody">\n' +
        "                <tr>\n" +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-line d2h-info">\n' +
        "            File without changes\n" +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>\n" +
        "                </tbody>\n" +
        "            </table>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "</div>";

      expect(expected).toEqual(html);
    });
  });

  describe("_processLines", function() {
    it("should work for simple block header", function() {
      const lineByLinePrinter = new LineByLinePrinter({});
      const oldLines = [
        {
          content: "-test",
          type: "d2h-del",
          oldNumber: 1,
          newNumber: null
        }
      ];
      const newLines = [
        {
          content: "+test1r",
          type: "d2h-ins",
          oldNumber: null,
          newNumber: 1
        }
      ];

      const html = lineByLinePrinter._processLines(false, oldLines, newLines);

      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-linenumber d2h-del">\n' +
        '      <div class="line-num1">1</div>\n' +
        '<div class="line-num2"></div>\n' +
        "    </td>\n" +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">1</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">test1r</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(html);
    });
  });

  describe("_generateFileHtml", function() {
    it("should work for simple file", function() {
      const lineByLinePrinter = new LineByLinePrinter({});
      const file = {
        blocks: [
          {
            lines: [
              {
                content: " one context line",
                type: "d2h-cntx",
                oldNumber: 1,
                newNumber: 1
              },
              {
                content: "-test",
                type: "d2h-del",
                oldNumber: 2,
                newNumber: null
              },
              {
                content: "+test1r",
                type: "d2h-ins",
                oldNumber: null,
                newNumber: 2
              },
              {
                content: "+test2r",
                type: "d2h-ins",
                oldNumber: null,
                newNumber: 3
              }
            ],
            oldStartLine: "1",
            oldStartLine2: null,
            newStartLine: "1",
            header: "@@ -1 +1 @@"
          }
        ],
        deletedLines: 1,
        addedLines: 1,
        checksumBefore: "0000001",
        checksumAfter: "0ddf2ba",
        oldName: "sample",
        language: undefined,
        newName: "sample",
        isCombined: false
      };

      const html = lineByLinePrinter._generateFileHtml(file);

      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-line d2h-info">@@ -1 +1 @@</div>\n' +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-cntx">\n' +
        '      <div class="line-num1">1</div>\n' +
        '<div class="line-num2">1</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-cntx">\n' +
        '        <div class="d2h-code-line d2h-cntx">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;</span>\n' +
        '            <span class="d2h-code-line-ctn">one context line</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-del">\n' +
        '      <div class="line-num1">2</div>\n' +
        '<div class="line-num2"></div>\n' +
        "    </td>\n" +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn"><del>test</del></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">2</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn"><ins>test1r</ins></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">3</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">test2r</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(html);
    });
  });
});
