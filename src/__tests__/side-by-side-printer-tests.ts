import SideBySideRenderer from '../side-by-side-renderer';
import HoganJsUtils from '../hoganjs-utils';
import { LineType, DiffLine, DiffFile, LineMatchingType } from '../types';
import { CSSLineClass } from '../render-utils';

describe('SideBySideRenderer', () => {
  describe('generateEmptyDiff', () => {
    it('should return an empty diff', () => {
      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const fileHtml = sideBySideRenderer.generateEmptyDiff();
      expect(fileHtml).toMatchInlineSnapshot(`
        {
          "left": "<tr>
            <td class="d2h-info">
                <div class="d2h-code-side-line">
                    File without changes
                </div>
            </td>
        </tr>",
          "right": "",
        }
      `);
    });
  });

  describe('generateSideBySideFileHtml', () => {
    it('should generate lines with the right prefixes', () => {
      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});

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

      const fileHtml = sideBySideRenderer.generateFileHtml(file);

      expect(fileHtml).toMatchInlineSnapshot(`
        {
          "left": "<tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">@@ -19,7 +19,7 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-cntx">
              19
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">context</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-del d2h-change">
              20
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn"><del>removed</del></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr>",
          "right": "<tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">&nbsp;</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-cntx">
              19
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">context</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-ins d2h-change">
              20
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn"><ins>added</ins></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-ins">
              21
            </td>
            <td class="d2h-ins">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">another added</span>
                </div>
            </td>
        </tr>",
        }
      `);
    });
  });

  describe('generateSingleLineHtml', () => {
    it('should work for insertions', () => {
      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const fileHtml = sideBySideRenderer.generateLineHtml(undefined, {
        type: CSSLineClass.INSERTS,
        prefix: '+',
        content: 'test',
        number: 30,
      });

      expect(fileHtml).toMatchInlineSnapshot(`
        {
          "left": "<tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr>",
          "right": "<tr>
            <td class="d2h-code-side-linenumber d2h-ins">
              30
            </td>
            <td class="d2h-ins">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">test</span>
                </div>
            </td>
        </tr>",
        }
      `);
    });
    it('should work for deletions', () => {
      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const fileHtml = sideBySideRenderer.generateLineHtml(
        {
          type: CSSLineClass.DELETES,
          prefix: '-',
          content: 'test',
          number: 30,
        },
        undefined,
      );

      expect(fileHtml).toMatchInlineSnapshot(`
        {
          "left": "<tr>
            <td class="d2h-code-side-linenumber d2h-del">
              30
            </td>
            <td class="d2h-del">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">test</span>
                </div>
            </td>
        </tr>",
          "right": "<tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr>",
        }
      `);
    });
  });

  describe('generateSideBySideJsonHtml', () => {
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
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, { matching: LineMatchingType.LINES });
      const html = sideBySideRenderer.render(exampleJson);
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
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-del d2h-change">
              1
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn"><del>test</del></span>
                </div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">&nbsp;</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-ins d2h-change">
              1
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn"><ins>test1r</ins></span>
                </div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
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
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const html = sideBySideRenderer.render(exampleJson);
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
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-info">
                <div class="d2h-code-side-line">
                    File without changes
                </div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        </div>"
      `);
    });

    it('should handle files without newlines at the end', () => {
      const exampleJson: DiffFile[] = [
        {
          blocks: [
            // Scenario 1: Old file missing newline, new file has newline
            {
              lines: [
                {
                  content: '-oldLine1',
                  type: LineType.DELETE,
                  oldNumber: 1,
                  newNumber: undefined,
                },
                {
                  content: '\\ No newline at end of file',
                  type: LineType.CONTEXT,
                  oldNumber: 1,
                  newNumber: 1,
                },
                {
                  content: '+newLine1',
                  type: LineType.INSERT,
                  oldNumber: undefined,
                  newNumber: 1,
                },
              ],
              oldStartLine: 1,
              newStartLine: 1,
              header: '@@ -1 +1 @@',
            },
            // Scenario 2: Old file has newline, new file missing newline
            {
              lines: [
                {
                  content: '-oldLine2',
                  type: LineType.DELETE,
                  oldNumber: 2,
                  newNumber: undefined,
                },
                {
                  content: '+newLine2',
                  type: LineType.INSERT,
                  oldNumber: undefined,
                  newNumber: 2,
                },
                {
                  content: '\\ No newline at end of file',
                  type: LineType.CONTEXT,
                  oldNumber: 2,
                  newNumber: 2,
                },
              ],
              oldStartLine: 2,
              newStartLine: 2,
              header: '@@ -2 +2 @@',
            },
            // Scenario 3: Both files missing newline
            {
              lines: [
                {
                  content: '-oldLine3',
                  type: LineType.DELETE,
                  oldNumber: 3,
                  newNumber: undefined,
                },
                {
                  content: '\\ No newline at end of file',
                  type: LineType.CONTEXT,
                  oldNumber: 3,
                  newNumber: 3,
                },
                {
                  content: '+newLine3',
                  type: LineType.INSERT,
                  oldNumber: undefined,
                  newNumber: 3,
                },
                {
                  content: '\\ No newline at end of file',
                  type: LineType.CONTEXT,
                  oldNumber: 3,
                  newNumber: 3,
                },
              ],
              oldStartLine: 3,
              newStartLine: 3,
              header: '@@ -3 +3 @@',
            },
          ],
          deletedLines: 3,
          addedLines: 3,
          oldName: 'sample',
          language: 'txt',
          newName: 'sample',
          isCombined: false,
          isGitDiff: true,
        },
      ];

      const hoganUtils = new HoganJsUtils({});
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, {});
      const html = sideBySideRenderer.render(exampleJson);
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
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-del">
              1
            </td>
            <td class="d2h-del">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">oldLine1</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-cntx">
              1
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">\\</span>
                    <span class="d2h-code-line-ctn"> No newline at end of file</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">@@ -2 +2 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-del d2h-change">
              2
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn"><del>oldLine2</del></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">@@ -3 +3 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-del">
              3
            </td>
            <td class="d2h-del">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">oldLine3</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-cntx">
              3
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">\\</span>
                    <span class="d2h-code-line-ctn"> No newline at end of file</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">&nbsp;</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-ins">
              1
            </td>
            <td class="d2h-ins">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">newLine1</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">&nbsp;</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-ins d2h-change">
              2
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn"><ins>newLine2</ins></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-cntx">
              2
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">\\</span>
                    <span class="d2h-code-line-ctn"> No newline at end of file</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">&nbsp;</div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-code-side-emptyplaceholder d2h-cntx d2h-emptyplaceholder">
              
            </td>
            <td class="d2h-cntx d2h-emptyplaceholder">
                <div class="d2h-code-side-line d2h-code-side-emptyplaceholder">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-ins">
              3
            </td>
            <td class="d2h-ins">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">newLine3</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-side-linenumber d2h-cntx">
              3
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">\\</span>
                    <span class="d2h-code-line-ctn"> No newline at end of file</span>
                </div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
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
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils);
      const html = sideBySideRenderer.render(exampleJson);
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
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line"><a href="http://example.com">Custom link to render</a></div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            <tr>
            <td class="d2h-code-side-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-side-line">&nbsp;</div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        </div>"
      `);
    });
  });

  describe('processLines', () => {
    it('should process file lines', () => {
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
      const sideBySideRenderer = new SideBySideRenderer(hoganUtils, { matching: LineMatchingType.LINES });
      const html = sideBySideRenderer.processChangedLines(false, oldLines, newLines);

      expect(html).toMatchInlineSnapshot(`
        {
          "left": "<tr>
            <td class="d2h-code-side-linenumber d2h-del d2h-change">
              1
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn"><del>test</del></span>
                </div>
            </td>
        </tr>",
          "right": "<tr>
            <td class="d2h-code-side-linenumber d2h-ins d2h-change">
              1
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-side-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn"><ins>test1r</ins></span>
                </div>
            </td>
        </tr>",
        }
      `);
    });
  });
});
