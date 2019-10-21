import SideBySideRenderer from "../side-by-side-renderer";
import HoganJsUtils from "../hoganjs-utils";
import { LineType, DiffLine, DiffFile, LineMatchingType } from "../types";
import { CSSLineClass } from "../render-utils";

describe("SideBySideRenderer", () => {
  describe("generateEmptyDiff", () => {
    it("should return an empty diff", () => {
      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const fileHtml = sideBySideRenderer.generateEmptyDiff();
      const expectedRight = "";
      const expectedLeft =
        "<tr>\n" +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-side-line d2h-info">\n' +
        "            File without changes\n" +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(fileHtml.right).toEqual(expectedRight);
      expect(fileHtml.left).toEqual(expectedLeft);
    });
  });

  describe("generateSideBySideFileHtml", () => {
    it("should generate lines with the right prefixes", () => {
      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});

      const file: DiffFile = {
        isGitDiff: true,
        blocks: [
          {
            lines: [
              {
                content: " context",
                type: LineType.CONTEXT,
                oldNumber: 19,
                newNumber: 19
              },
              {
                content: "-removed",
                type: LineType.DELETE,
                oldNumber: 20,
                newNumber: undefined
              },
              {
                content: "+added",
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 20
              },
              {
                content: "+another added",
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 21
              }
            ],
            oldStartLine: 19,
            newStartLine: 19,
            header: "@@ -19,7 +19,7 @@"
          }
        ],
        deletedLines: 1,
        addedLines: 2,
        checksumBefore: "fc56817",
        checksumAfter: "e8e7e49",
        mode: "100644",
        oldName: "coverage.init",
        language: "init",
        newName: "coverage.init",
        isCombined: false
      };

      const fileHtml = sideBySideRenderer.generateSideBySideFileHtml(file);

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

      expect(fileHtml.left).toEqual(expectedLeft);
      expect(fileHtml.right).toEqual(expectedRight);
    });
  });

  describe("generateSingleLineHtml", () => {
    it("should work for insertions", () => {
      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const fileHtml = sideBySideRenderer.generateSingleLineHtml(false, CSSLineClass.INSERTS, "test", 30, "+");
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

      expect(fileHtml).toEqual(expected);
    });
    it("should work for deletions", () => {
      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const fileHtml = sideBySideRenderer.generateSingleLineHtml(false, CSSLineClass.DELETES, "test", 30, "-");
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

      expect(fileHtml).toEqual(expected);
    });
  });

  describe("generateSideBySideJsonHtml", () => {
    it("should work for list of files", () => {
      const exampleJson: DiffFile[] = [
        {
          blocks: [
            {
              lines: [
                {
                  content: "-test",
                  type: LineType.DELETE,
                  oldNumber: 1,
                  newNumber: undefined
                },
                {
                  content: "+test1r",
                  type: LineType.INSERT,
                  oldNumber: undefined,
                  newNumber: 1
                }
              ],
              oldStartLine: 1,
              oldStartLine2: undefined,
              newStartLine: 1,
              header: "@@ -1 +1 @@"
            }
          ],
          deletedLines: 1,
          addedLines: 1,
          checksumBefore: "0000001",
          checksumAfter: "0ddf2ba",
          oldName: "sample",
          language: "txt",
          newName: "sample",
          isCombined: false,
          isGitDiff: true
        }
      ];

      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, { matching: LineMatchingType.LINES });
      const html = sideBySideRenderer.render(exampleJson);
      const expected =
        '<div class="d2h-wrapper">\n' +
        '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="txt">\n' +
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
        '    <td class="d2h-code-side-linenumber d2h-del d2h-change">\n' +
        "      1\n" +
        "    </td>\n" +
        '    <td class="d2h-del d2h-change">\n' +
        '        <div class="d2h-code-side-line d2h-del d2h-change">\n' +
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
        '    <td class="d2h-code-side-linenumber d2h-ins d2h-change">\n' +
        "      1\n" +
        "    </td>\n" +
        '    <td class="d2h-ins d2h-change">\n' +
        '        <div class="d2h-code-side-line d2h-ins d2h-change">\n' +
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

      expect(html).toEqual(expected);
    });
    it("should work for files without blocks", () => {
      const exampleJson: DiffFile[] = [
        {
          blocks: [],
          oldName: "sample",
          language: "js",
          newName: "sample",
          isCombined: false,
          addedLines: 0,
          deletedLines: 0,
          isGitDiff: false
        }
      ];

      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const html = sideBySideRenderer.render(exampleJson);
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

      expect(html).toEqual(expected);
    });
  });

  describe("processLines", () => {
    it("should process file lines", () => {
      const oldLines: DiffLine[] = [
        {
          content: "-test",
          type: LineType.DELETE,
          oldNumber: 1,
          newNumber: undefined
        }
      ];

      const newLines: DiffLine[] = [
        {
          content: "+test1r",
          type: LineType.INSERT,
          oldNumber: undefined,
          newNumber: 1
        }
      ];

      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, { matching: LineMatchingType.LINES });
      const html = sideBySideRenderer.processLines(false, oldLines, newLines);
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

      expect(html.left).toEqual(expectedLeft);
      expect(html.right).toEqual(expectedRight);
    });
  });
});
