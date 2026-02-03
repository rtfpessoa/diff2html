import WrappedSideBySideRenderer from '../wrapped-side-by-side-renderer';
import HoganJsUtils from '../hoganjs-utils';
import { LineType, DiffLine, DiffFile, LineMatchingType } from '../types';
import { CSSLineClass } from '../render-utils';

describe('WrappedSideBySideRenderer', () => {
  describe('generateEmptyDiff', () => {
    it('should return an empty diff', () => {
      const hoganUtils = new HoganJsUtils({});
      const wrappedSideBySideRenderer = new WrappedSideBySideRenderer(hoganUtils, {});
      const fileHtml = wrappedSideBySideRenderer.generateEmptyDiff();
      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td colspan="4" class="d2h-info">
                <div class="d2h-code-wrapped-side-line">
                    File without changes
                </div>
            </td>
        </tr>"
      `);
    });
  });

  describe('generateWrappedSideBySideFileHtml', () => {
    it('should generate lines with the right prefixes', () => {
      const hoganUtils = new HoganJsUtils({});
      const wrappedSideBySideRenderer = new WrappedSideBySideRenderer(hoganUtils, {});

      const file: DiffFile = {
        isGitDiff: true,
        blocks: [
          {
            lines: [
              {
                content: ' context',
                type: LineType.CONTEXT,
                oldNumber: 19,
                newNumber: 19,
              },
              {
                content: '-removed',
                type: LineType.DELETE,
                oldNumber: 20,
                newNumber: undefined,
              },
              {
                content: '+added',
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 20,
              },
              {
                content: '+another added',
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 21,
              },
            ],
            oldStartLine: 19,
            newStartLine: 19,
            header: '@@ -19,7 +19,7 @@',
          },
        ],
        deletedLines: 1,
        addedLines: 2,
        checksumBefore: 'fc56817',
        checksumAfter: 'e8e7e49',
        mode: '100644',
        oldName: 'coverage.init',
        language: 'init',
        newName: 'coverage.init',
        isCombined: false,
      };

      const fileHtml = wrappedSideBySideRenderer.generateFileHtml(file);

      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-info"></td>
            <td colspan="3" class="d2h-info">
                <div class="d2h-code-wrapped-side-line">@@ -19,7 +19,7 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-cntx">
                19
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">&nbsp;</span>
                    <span class="d2h-code-wrapped-line-ctn">context</span>
                </div>
            </td>
            <td class="d2h-code-wrapped-side-linenumber d2h-cntx">
                19
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">&nbsp;</span>
                    <span class="d2h-code-wrapped-line-ctn">context</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-del d2h-change">
                20
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">-</span>
                    <span class="d2h-code-wrapped-line-ctn"><del>removed</del></span>
                </div>
            </td>
            <td class="d2h-code-wrapped-side-linenumber d2h-ins d2h-change">
                20
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">+</span>
                    <span class="d2h-code-wrapped-line-ctn"><ins>added</ins></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
                
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-wrapped-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-wrapped-line-prefix">&nbsp;</span>
                    <span class="d2h-code-wrapped-line-ctn"><br></span>
                </div>
            </td>
            <td class="d2h-code-wrapped-side-linenumber d2h-ins">
                21
            </td>
            <td class="d2h-ins">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">+</span>
                    <span class="d2h-code-wrapped-line-ctn">another added</span>
                </div>
            </td>
        </tr>"
      `);
    });
  });

  describe('generateSingleLineHtml', () => {
    it('should work for insertions', () => {
      const file = {
        addedLines: 12,
        deletedLines: 41,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        blocks: [],
      };
      const hoganUtils = new HoganJsUtils({});
      const wrappedSideBySideRenderer = new WrappedSideBySideRenderer(hoganUtils, {});
      const fileHtml = wrappedSideBySideRenderer.generateLineHtml(file, {
        type: CSSLineClass.INSERTS,
        prefix: '+',
        content: 'test',
        number: 30,
      });

      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-ins">
                30
            </td>
            <td class="d2h-ins">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">+</span>
                    <span class="d2h-code-wrapped-line-ctn">test</span>
                </div>
            </td>
            <td class="d2h-code-wrapped-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
                
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-wrapped-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-wrapped-line-prefix">&nbsp;</span>
                    <span class="d2h-code-wrapped-line-ctn"><br></span>
                </div>
            </td>
        </tr>"
      `);
    });
    it('should work for deletions', () => {
      const file = {
        addedLines: 12,
        deletedLines: 41,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        blocks: [],
      };
      const hoganUtils = new HoganJsUtils({});
      const wrappedSideBySideRenderer = new WrappedSideBySideRenderer(hoganUtils, {});
      const fileHtml = wrappedSideBySideRenderer.generateLineHtml(
        file,
        {
          type: CSSLineClass.DELETES,
          prefix: '-',
          content: 'test',
          number: 30,
        },
        undefined,
      );

      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-del">
                30
            </td>
            <td class="d2h-del">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">-</span>
                    <span class="d2h-code-wrapped-line-ctn">test</span>
                </div>
            </td>
            <td class="d2h-code-wrapped-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
                
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-wrapped-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-wrapped-line-prefix">&nbsp;</span>
                    <span class="d2h-code-wrapped-line-ctn"><br></span>
                </div>
            </td>
        </tr>"
      `);
    });
  });

  describe('generateWrappedSideBySideJsonHtml', () => {
    it('should work for list of files', () => {
      const exampleJson: DiffFile[] = [
        {
          blocks: [
            {
              lines: [
                {
                  content: '-test',
                  type: LineType.DELETE,
                  oldNumber: 1,
                  newNumber: undefined,
                },
                {
                  content: '+test1r',
                  type: LineType.INSERT,
                  oldNumber: undefined,
                  newNumber: 1,
                },
              ],
              oldStartLine: 1,
              oldStartLine2: undefined,
              newStartLine: 1,
              header: '@@ -1 +1 @@',
            },
          ],
          deletedLines: 1,
          addedLines: 1,
          checksumBefore: '0000001',
          checksumAfter: '0ddf2ba',
          oldName: 'sample',
          language: 'txt',
          newName: 'sample',
          isCombined: false,
          isGitDiff: true,
        },
      ];

      const hoganUtils = new HoganJsUtils({});
      const wrappedSideBySideRenderer = new WrappedSideBySideRenderer(hoganUtils, { matching: LineMatchingType.LINES });
      const html = wrappedSideBySideRenderer.render(exampleJson);
      expect(html).toMatchInlineSnapshot(`
        "<div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="txt">
            <div class="d2h-file-header">
                <span class="d2h-file-name-wrapper">
            <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
                <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
            </svg>    <span class="d2h-file-name">sample</span>
            <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        <label class="d2h-file-collapse">
            <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">
            Viewed
        </label>
            </div>
            <div class="d2h-files-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-wrapped-table">
                        <colgroup>
                            <col class="d2h-diff-wrapped-col-linenumber">
                            <col class="d2h-diff-wrapped-col-contents">
                            <col class="d2h-diff-wrapped-col-linenumber">
                            <col class="d2h-diff-wrapped-col-contents">
                        </colgroup>
                        <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-info"></td>
            <td colspan="3" class="d2h-info">
                <div class="d2h-code-wrapped-side-line">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-del d2h-change">
                1
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">-</span>
                    <span class="d2h-code-wrapped-line-ctn"><del>test</del></span>
                </div>
            </td>
            <td class="d2h-code-wrapped-side-linenumber d2h-ins d2h-change">
                1
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">+</span>
                    <span class="d2h-code-wrapped-line-ctn"><ins>test1r</ins></span>
                </div>
            </td>
        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>"
      `);
    });
    it('should work for files without blocks', () => {
      const exampleJson: DiffFile[] = [
        {
          blocks: [],
          oldName: 'sample',
          language: 'js',
          newName: 'sample',
          isCombined: false,
          addedLines: 0,
          deletedLines: 0,
          isGitDiff: false,
        },
      ];

      const hoganUtils = new HoganJsUtils({});
      const wrappedSideBySideRenderer = new WrappedSideBySideRenderer(hoganUtils, {});
      const html = wrappedSideBySideRenderer.render(exampleJson);
      expect(html).toMatchInlineSnapshot(`
        "<div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="js">
            <div class="d2h-file-header">
                <span class="d2h-file-name-wrapper">
            <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
                <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
            </svg>    <span class="d2h-file-name">sample</span>
            <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        <label class="d2h-file-collapse">
            <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">
            Viewed
        </label>
            </div>
            <div class="d2h-files-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-wrapped-table">
                        <colgroup>
                            <col class="d2h-diff-wrapped-col-linenumber">
                            <col class="d2h-diff-wrapped-col-contents">
                            <col class="d2h-diff-wrapped-col-linenumber">
                            <col class="d2h-diff-wrapped-col-contents">
                        </colgroup>
                        <tbody class="d2h-diff-tbody">
                            <tr>
            <td colspan="4" class="d2h-info">
                <div class="d2h-code-wrapped-side-line">
                    File without changes
                </div>
            </td>
        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>"
      `);
    });

    it('should work for too big file diff', () => {
      const exampleJson = [
        {
          blocks: [
            {
              header: '<a href="http://example.com">Custom link to render</a>',
              lines: [],
              newStartLine: 0,
              oldStartLine: 0,
              oldStartLine2: undefined,
            },
          ],
          deletedLines: 0,
          addedLines: 0,
          oldName: 'sample',
          language: 'js',
          newName: 'sample',
          isCombined: false,
          isGitDiff: false,
          isTooBig: true,
        },
      ];

      const hoganUtils = new HoganJsUtils({});
      const wrappedSideBySideRenderer = new WrappedSideBySideRenderer(hoganUtils);
      const html = wrappedSideBySideRenderer.render(exampleJson);
      expect(html).toMatchInlineSnapshot(`
        "<div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="js">
            <div class="d2h-file-header">
                <span class="d2h-file-name-wrapper">
            <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
                <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
            </svg>    <span class="d2h-file-name">sample</span>
            <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        <label class="d2h-file-collapse">
            <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">
            Viewed
        </label>
            </div>
            <div class="d2h-files-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-wrapped-table">
                        <colgroup>
                            <col class="d2h-diff-wrapped-col-linenumber">
                            <col class="d2h-diff-wrapped-col-contents">
                            <col class="d2h-diff-wrapped-col-linenumber">
                            <col class="d2h-diff-wrapped-col-contents">
                        </colgroup>
                        <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-info"></td>
            <td colspan="3" class="d2h-info">
                <div class="d2h-code-wrapped-side-line"><a href="http://example.com">Custom link to render</a></div>
            </td>
        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>"
      `);
    });
  });

  describe('processLines', () => {
    it('should process file lines', () => {
      const file = {
        addedLines: 12,
        deletedLines: 41,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        blocks: [],
      };

      const oldLines: DiffLine[] = [
        {
          content: '-test',
          type: LineType.DELETE,
          oldNumber: 1,
          newNumber: undefined,
        },
      ];

      const newLines: DiffLine[] = [
        {
          content: '+test1r',
          type: LineType.INSERT,
          oldNumber: undefined,
          newNumber: 1,
        },
      ];

      const hoganUtils = new HoganJsUtils({});
      const wrappedSideBySideRenderer = new WrappedSideBySideRenderer(hoganUtils, { matching: LineMatchingType.LINES });
      const html = wrappedSideBySideRenderer.processChangedLines(file, false, oldLines, newLines);

      expect(html).toMatchInlineSnapshot(`
        "<tr>
            <td class="d2h-code-wrapped-side-linenumber d2h-del d2h-change">
                1
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">-</span>
                    <span class="d2h-code-wrapped-line-ctn"><del>test</del></span>
                </div>
            </td>
            <td class="d2h-code-wrapped-side-linenumber d2h-ins d2h-change">
                1
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-wrapped-side-line">
                    <span class="d2h-code-wrapped-line-prefix">+</span>
                    <span class="d2h-code-wrapped-line-ctn"><ins>test1r</ins></span>
                </div>
            </td>
        </tr>"
      `);
    });
  });
});
