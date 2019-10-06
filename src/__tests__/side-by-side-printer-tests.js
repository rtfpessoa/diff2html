const SideBySidePrinter = require("../side-by-side-printer.js").SideBySidePrinter;

describe("SideBySidePrinter", function() {
  describe("generateEmptyDiff", function() {
    it("should return an empty diff", function() {
      const sideBySidePrinter = new SideBySidePrinter({});
      const fileHtml = sideBySidePrinter.generateEmptyDiff();
      const expectedRight = "";
      const expectedLeft =
        "<tr>\n" +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">\n' +
        "            File without changes\n" +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expectedRight).toEqual(fileHtml.right);
      expect(expectedLeft).toEqual(fileHtml.left);
    });
  });

  describe("generateSideBySideFileHtml", function() {
    it("should generate lines with the right prefixes", function() {
      const sideBySidePrinter = new SideBySidePrinter({});

      const file = {
        blocks: [
          {
            lines: [
              {
                content: " context",
                type: "d2h-cntx",
                oldNumber: 19,
                newNumber: 19
              },
              {
                content: "-removed",
                type: "d2h-del",
                oldNumber: 20,
                newNumber: null
              },
              {
                content: "+added",
                type: "d2h-ins",
                oldNumber: null,
                newNumber: 20
              },
              {
                content: "+another added",
                type: "d2h-ins",
                oldNumber: null,
                newNumber: 21
              }
            ],
            oldStartLine: "19",
            newStartLine: "19",
            header: "@@ -19,7 +19,7 @@"
          }
        ],
        deletedLines: 1,
        addedLines: 1,
        checksumBefore: "fc56817",
        checksumAfter: "e8e7e49",
        mode: "100644",
        oldName: "coverage.init",
        language: "init",
        newName: "coverage.init",
        isCombined: false
      };

      const fileHtml = sideBySidePrinter.generateSideBySideFileHtml(file);

      const expectedLeft =
        "<tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">@@ -19,7 +19,7 @@</div>\n' +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-cntx">\n' +
        "      19\n" +
        "    </td>\n" +
        '    <td class="d2h-cntx">\n' +
        '        <div class="d2h-code-side-line d2h-cntx">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;</span>\n' +
        '            <span class="d2h-code-line-ctn">context</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-del">\n' +
        "      20\n" +
        "    </td>\n" +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-side-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn"><del>removed</del></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">\n' +
        "      " +
        "\n" +
        "    </td>\n" +
        '    <td class="d2h-cntx d2h-emptyplaceholder">\n' +
        '        <div class="d2h-code-side-line d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;</span>\n' +
        '            <span class="d2h-code-line-ctn">&nbsp;</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      const expectedRight =
        "<tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info"></div>\n' +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-cntx">\n' +
        "      19\n" +
        "    </td>\n" +
        '    <td class="d2h-cntx">\n' +
        '        <div class="d2h-code-side-line d2h-cntx">\n' +
        '            <span class="d2h-code-line-prefix">&nbsp;</span>\n' +
        '            <span class="d2h-code-line-ctn">context</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        "      20\n" +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn"><ins>added</ins></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        "      21\n" +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">another added</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expectedLeft).toEqual(fileHtml.left);
      expect(expectedRight).toEqual(fileHtml.right);
    });
  });

  describe("generateSingleLineHtml", function() {
    it("should work for insertions", function() {
      const diffParser = require("../diff-parser.js").DiffParser;
      const sideBySidePrinter = new SideBySidePrinter({});
      const fileHtml = sideBySidePrinter.generateSingleLineHtml(false, diffParser.LINE_TYPE.INSERTS, 30, "test", "+");
      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        "      30\n" +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(fileHtml);
    });
    it("should work for deletions", function() {
      const diffParser = require("../diff-parser.js").DiffParser;
      const sideBySidePrinter = new SideBySidePrinter({});
      const fileHtml = sideBySidePrinter.generateSingleLineHtml(false, diffParser.LINE_TYPE.DELETES, 30, "test", "-");
      const expected =
        "<tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-del">\n' +
        "      30\n" +
        "    </td>\n" +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-side-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expected).toEqual(fileHtml);
    });
  });

  describe("generateSideBySideJsonHtml", function() {
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

      const sideBySidePrinter = new SideBySidePrinter({ matching: "lines" });
      const html = sideBySidePrinter.generateSideBySideJsonHtml(exampleJson);
      const expected =
        '<div class="d2h-wrapper">\n' +
        '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">\n' +
        '    <div class="d2h-file-header">\n' +
        '      <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">sample</span>\n' +
        '    <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>\n' +
        "    </div>\n" +
        '    <div class="d2h-files-diff">\n' +
        '        <div class="d2h-file-side-diff">\n' +
        '            <div class="d2h-code-wrapper">\n' +
        '                <table class="d2h-diff-table">\n' +
        '                    <tbody class="d2h-diff-tbody">\n' +
        "                    <tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">@@ -1 +1 @@</div>\n' +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-del">\n' +
        "      1\n" +
        "    </td>\n" +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-side-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn"><del>test</del></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>\n" +
        "                    </tbody>\n" +
        "                </table>\n" +
        "            </div>\n" +
        "        </div>\n" +
        '        <div class="d2h-file-side-diff">\n' +
        '            <div class="d2h-code-wrapper">\n' +
        '                <table class="d2h-diff-table">\n' +
        '                    <tbody class="d2h-diff-tbody">\n' +
        "                    <tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-info"></td>\n' +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info"></div>\n' +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        "      1\n" +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn"><ins>test1r</ins></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>\n" +
        "                    </tbody>\n" +
        "                </table>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "</div>";

      expect(expected).toEqual(html);
    });
    it("should work for files without blocks", function() {
      const exampleJson = [
        {
          blocks: [],
          oldName: "sample",
          language: "js",
          newName: "sample",
          isCombined: false
        }
      ];

      const sideBySidePrinter = new SideBySidePrinter();
      const html = sideBySidePrinter.generateSideBySideJsonHtml(exampleJson);
      const expected =
        '<div class="d2h-wrapper">\n' +
        '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="js">\n' +
        '    <div class="d2h-file-header">\n' +
        '      <span class="d2h-file-name-wrapper">\n' +
        '    <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">\n' +
        '        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>\n' +
        '    </svg>    <span class="d2h-file-name">sample</span>\n' +
        '    <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>\n' +
        "    </div>\n" +
        '    <div class="d2h-files-diff">\n' +
        '        <div class="d2h-file-side-diff">\n' +
        '            <div class="d2h-code-wrapper">\n' +
        '                <table class="d2h-diff-table">\n' +
        '                    <tbody class="d2h-diff-tbody">\n' +
        "                    <tr>\n" +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">\n' +
        "            File without changes\n" +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>\n" +
        "                    </tbody>\n" +
        "                </table>\n" +
        "            </div>\n" +
        "        </div>\n" +
        '        <div class="d2h-file-side-diff">\n' +
        '            <div class="d2h-code-wrapper">\n' +
        '                <table class="d2h-diff-table">\n' +
        '                    <tbody class="d2h-diff-tbody">\n' +
        "                    \n" +
        "                    </tbody>\n" +
        "                </table>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "</div>";

      expect(expected).toEqual(html);
    });
  });

  describe("processLines", function() {
    it("should process file lines", function() {
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

      const sideBySidePrinter = new SideBySidePrinter({ matching: "lines" });
      const html = sideBySidePrinter.processLines(false, oldLines, newLines);
      const expectedLeft =
        "<tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-del">\n' +
        "      1\n" +
        "    </td>\n" +
        '    <td class="d2h-del">\n' +
        '        <div class="d2h-code-side-line d2h-del">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn">test</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      const expectedRight =
        "<tr>\n" +
        '    <td class="d2h-code-side-linenumber d2h-ins">\n' +
        "      1\n" +
        "    </td>\n" +
        '    <td class="d2h-ins">\n' +
        '        <div class="d2h-code-side-line d2h-ins">\n' +
        '            <span class="d2h-code-line-prefix">+</span>\n' +
        '            <span class="d2h-code-line-ctn">test1r</span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(expectedLeft).toEqual(html.left);
      expect(expectedRight).toEqual(html.right);
    });
  });
});
