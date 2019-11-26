import LineByLineRenderer from "../line-by-line-renderer";
import HoganJsUtils from "../hoganjs-utils";
import { LineType, DiffFile, LineMatchingType } from "../types";
import { CSSLineClass } from "../render-utils";

describe("LineByLineRenderer", () => {
  describe("_generateEmptyDiff", () => {
    it("should return an empty diff", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const fileHtml = lineByLineRenderer.generateEmptyDiff();
      const expected =
        "<tr>\n" +
        '    <td class="d2h-info">\n' +
        '        <div class="d2h-code-line d2h-info">\n' +
        "            File without changes\n" +
        "        </div>\n" +
        "    </td>\n" +
        "</tr>";

      expect(fileHtml).toEqual(expected);
    });
  });

  describe("makeLineHtml", () => {
    it("should work for insertions", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      let fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.INSERTS,
        prefix: "+",
        content: "test",
        oldNumber: undefined,
        newNumber: 30
      });
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

      expect(fileHtml).toEqual(expected);
    });

    it("should work for deletions", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      let fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.DELETES,
        prefix: "-",
        content: "test",
        oldNumber: 30,
        newNumber: undefined
      });
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

      expect(fileHtml).toEqual(expected);
    });

    it("should convert indents into non breakin spaces (2 white spaces)", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      let fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.INSERTS,
        prefix: "+",
        content: "  test",
        oldNumber: undefined,
        newNumber: 30
      });
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

      expect(fileHtml).toEqual(expected);
    });

    it("should convert indents into non breakin spaces (4 white spaces)", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      let fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.INSERTS,
        prefix: "+",
        content: "    test",
        oldNumber: undefined,
        newNumber: 30
      });
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

      expect(fileHtml).toEqual(expected);
    });

    it("should preserve tabs", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      let fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.INSERTS,
        prefix: "+",
        content: "\ttest",
        oldNumber: undefined,
        newNumber: 30
      });
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

      expect(fileHtml).toEqual(expected);
    });
  });

  describe("makeFileDiffHtml", () => {
    it("should work for simple file", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});

      const file = {
        addedLines: 12,
        deletedLines: 41,
        language: "js",
        oldName: "my/file/name.js",
        newName: "my/file/name.js",
        isCombined: false,
        isGitDiff: false,
        blocks: []
      };
      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

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

      expect(fileHtml).toEqual(expected);
    });
    it("should work for simple added file", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});

      const file = {
        addedLines: 12,
        deletedLines: 0,
        language: "js",
        oldName: "dev/null",
        newName: "my/file/name.js",
        isNew: true,
        isCombined: false,
        isGitDiff: false,
        blocks: []
      };
      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

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

      expect(fileHtml).toEqual(expected);
    });
    it("should work for simple deleted file", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});

      const file = {
        addedLines: 0,
        deletedLines: 41,
        language: "js",
        oldName: "my/file/name.js",
        newName: "dev/null",
        isDeleted: true,
        isCombined: false,
        isGitDiff: false,
        blocks: []
      };
      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

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

      expect(fileHtml).toEqual(expected);
    });
    it("should work for simple renamed file", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});

      const file = {
        addedLines: 12,
        deletedLines: 41,
        language: "js",
        oldName: "my/file/name1.js",
        newName: "my/file/name2.js",
        isRename: true,
        isCombined: false,
        isGitDiff: false,
        blocks: []
      };
      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

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

      expect(fileHtml).toEqual(expected);
    });
    it("should return empty when option renderNothingWhenEmpty is true and file blocks not present", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {
        renderNothingWhenEmpty: true
      });

      const file = {
        addedLines: 0,
        deletedLines: 0,
        language: "js",
        oldName: "my/file/name1.js",
        newName: "my/file/name2.js",
        isRename: true,
        isCombined: false,
        isGitDiff: false,
        blocks: []
      };

      const diffs = "<span>Random Html</span>";

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

      const expected = "";

      expect(fileHtml).toEqual(expected);
    });
  });

  describe("generateLineByLineJsonHtml", () => {
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
          newName: "sample",
          language: "txt",
          isCombined: false,
          isGitDiff: true
        }
      ];

      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {
        matching: LineMatchingType.LINES
      });
      const html = lineByLineRenderer.render(exampleJson);
      const expected =
        '<div class="d2h-wrapper">\n' +
        '    <div id="d2h-675094" class="d2h-file-wrapper" data-lang="txt">\n' +
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
        '    <td class="d2h-code-linenumber d2h-del d2h-change">\n' +
        '      <div class="line-num1">1</div>\n' +
        '<div class="line-num2"></div>\n' +
        "    </td>\n" +
        '    <td class="d2h-del d2h-change">\n' +
        '        <div class="d2h-code-line d2h-del d2h-change">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn"><del>test</del></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins d2h-change">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">1</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins d2h-change">\n' +
        '        <div class="d2h-code-line d2h-ins d2h-change">\n' +
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

      expect(html).toEqual(expected);
    });

    it("should work for empty blocks", () => {
      const exampleJson = [
        {
          blocks: [],
          deletedLines: 0,
          addedLines: 0,
          oldName: "sample",
          language: "js",
          newName: "sample",
          isCombined: false,
          isGitDiff: false
        }
      ];

      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {
        renderNothingWhenEmpty: false
      });
      const html = lineByLineRenderer.render(exampleJson);
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

      expect(html).toEqual(expected);
    });
  });

  describe("_generateFileHtml", () => {
    it("should work for simple file", () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const file: DiffFile = {
        blocks: [
          {
            lines: [
              {
                content: " one context line",
                type: LineType.CONTEXT,
                oldNumber: 1,
                newNumber: 1
              },
              {
                content: "-test",
                type: LineType.DELETE,
                oldNumber: 2,
                newNumber: undefined
              },
              {
                content: "+test1r",
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 2
              },
              {
                content: "+test2r",
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 3
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
      };

      const html = lineByLineRenderer.generateFileHtml(file);

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
        '    <td class="d2h-code-linenumber d2h-del d2h-change">\n' +
        '      <div class="line-num1">2</div>\n' +
        '<div class="line-num2"></div>\n' +
        "    </td>\n" +
        '    <td class="d2h-del d2h-change">\n' +
        '        <div class="d2h-code-line d2h-del d2h-change">\n' +
        '            <span class="d2h-code-line-prefix">-</span>\n' +
        '            <span class="d2h-code-line-ctn"><del>test</del></span>\n' +
        "        </div>\n" +
        "    </td>\n" +
        "</tr><tr>\n" +
        '    <td class="d2h-code-linenumber d2h-ins d2h-change">\n' +
        '      <div class="line-num1"></div>\n' +
        '<div class="line-num2">2</div>\n' +
        "    </td>\n" +
        '    <td class="d2h-ins d2h-change">\n' +
        '        <div class="d2h-code-line d2h-ins d2h-change">\n' +
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

      expect(html).toEqual(expected);
    });
  });
});
