import LineByLineRenderer from '../line-by-line-renderer';
import HoganJsUtils from '../hoganjs-utils';
import { LineType, DiffFile, LineMatchingType } from '../types';
import { CSSLineClass } from '../render-utils';

describe('LineByLineRenderer', () => {
  describe('_generateEmptyDiff', () => {
    it('should return an empty diff', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const fileHtml = lineByLineRenderer.generateEmptyDiff();
      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-line d2h-info\\">
                    File without changes
                </div>
            </td>
        </tr>"
      `);
    });
  });

  describe('makeLineHtml', () => {
    it('should work for insertions', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.INSERTS,
        prefix: '+',
        content: 'test',
        oldNumber: undefined,
        newNumber: 30,
      });
      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class=\\"d2h-code-linenumber d2h-ins\\">
              <div class=\\"line-num1\\"></div>
        <div class=\\"line-num2\\">30</div>
            </td>
            <td class=\\"d2h-ins\\">
                <div class=\\"d2h-code-line d2h-ins\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\">test</span>
                </div>
            </td>
        </tr>"
      `);
    });

    it('should work for deletions', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.DELETES,
        prefix: '-',
        content: 'test',
        oldNumber: 30,
        newNumber: undefined,
      });
      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class=\\"d2h-code-linenumber d2h-del\\">
              <div class=\\"line-num1\\">30</div>
        <div class=\\"line-num2\\"></div>
            </td>
            <td class=\\"d2h-del\\">
                <div class=\\"d2h-code-line d2h-del\\">
                    <span class=\\"d2h-code-line-prefix\\">-</span>
                    <span class=\\"d2h-code-line-ctn\\">test</span>
                </div>
            </td>
        </tr>"
      `);
    });

    it('should convert indents into non breakin spaces (2 white spaces)', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.INSERTS,
        prefix: '+',
        content: '  test',
        oldNumber: undefined,
        newNumber: 30,
      });
      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class=\\"d2h-code-linenumber d2h-ins\\">
              <div class=\\"line-num1\\"></div>
        <div class=\\"line-num2\\">30</div>
            </td>
            <td class=\\"d2h-ins\\">
                <div class=\\"d2h-code-line d2h-ins\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\">  test</span>
                </div>
            </td>
        </tr>"
      `);
    });

    it('should convert indents into non breakin spaces (4 white spaces)', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.INSERTS,
        prefix: '+',
        content: '    test',
        oldNumber: undefined,
        newNumber: 30,
      });
      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class=\\"d2h-code-linenumber d2h-ins\\">
              <div class=\\"line-num1\\"></div>
        <div class=\\"line-num2\\">30</div>
            </td>
            <td class=\\"d2h-ins\\">
                <div class=\\"d2h-code-line d2h-ins\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\">    test</span>
                </div>
            </td>
        </tr>"
      `);
    });

    it('should preserve tabs', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const fileHtml = lineByLineRenderer.generateSingleLineHtml({
        type: CSSLineClass.INSERTS,
        prefix: '+',
        content: '\ttest',
        oldNumber: undefined,
        newNumber: 30,
      });
      expect(fileHtml).toMatchInlineSnapshot(`
        "<tr>
            <td class=\\"d2h-code-linenumber d2h-ins\\">
              <div class=\\"line-num1\\"></div>
        <div class=\\"line-num2\\">30</div>
            </td>
            <td class=\\"d2h-ins\\">
                <div class=\\"d2h-code-line d2h-ins\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\">	test</span>
                </div>
            </td>
        </tr>"
      `);
    });
  });

  describe('makeFileDiffHtml', () => {
    it('should work for simple file', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});

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
      const diffs = '<span>Random Html</span>';

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

      expect(fileHtml).toMatchInlineSnapshot(`
        "<div id=\\"d2h-781444\\" class=\\"d2h-file-wrapper\\" data-lang=\\"js\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">my/file/name.js</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
        <label class=\\"d2h-file-collapse\\">
            <input class=\\"d2h-file-collapse-input\\" type=\\"checkbox\\" name=\\"viewed\\" value=\\"viewed\\">
            Viewed
        </label>
            </div>
            <div class=\\"d2h-file-diff\\">
                <div class=\\"d2h-code-wrapper\\">
                    <table class=\\"d2h-diff-table\\">
                        <tbody class=\\"d2h-diff-tbody\\">
                        <span>Random Html</span>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>"
      `);
    });
    it('should work for simple added file', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});

      const file = {
        addedLines: 12,
        deletedLines: 0,
        language: 'js',
        oldName: 'dev/null',
        newName: 'my/file/name.js',
        isNew: true,
        isCombined: false,
        isGitDiff: false,
        blocks: [],
      };
      const diffs = '<span>Random Html</span>';

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

      expect(fileHtml).toMatchInlineSnapshot(`
        "<div id=\\"d2h-781444\\" class=\\"d2h-file-wrapper\\" data-lang=\\"js\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">my/file/name.js</span>
            <span class=\\"d2h-tag d2h-added d2h-added-tag\\">ADDED</span></span>
        <label class=\\"d2h-file-collapse\\">
            <input class=\\"d2h-file-collapse-input\\" type=\\"checkbox\\" name=\\"viewed\\" value=\\"viewed\\">
            Viewed
        </label>
            </div>
            <div class=\\"d2h-file-diff\\">
                <div class=\\"d2h-code-wrapper\\">
                    <table class=\\"d2h-diff-table\\">
                        <tbody class=\\"d2h-diff-tbody\\">
                        <span>Random Html</span>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>"
      `);
    });
    it('should work for simple deleted file', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});

      const file = {
        addedLines: 0,
        deletedLines: 41,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'dev/null',
        isDeleted: true,
        isCombined: false,
        isGitDiff: false,
        blocks: [],
      };
      const diffs = '<span>Random Html</span>';

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

      expect(fileHtml).toMatchInlineSnapshot(`
        "<div id=\\"d2h-781444\\" class=\\"d2h-file-wrapper\\" data-lang=\\"js\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">my/file/name.js</span>
            <span class=\\"d2h-tag d2h-deleted d2h-deleted-tag\\">DELETED</span></span>
        <label class=\\"d2h-file-collapse\\">
            <input class=\\"d2h-file-collapse-input\\" type=\\"checkbox\\" name=\\"viewed\\" value=\\"viewed\\">
            Viewed
        </label>
            </div>
            <div class=\\"d2h-file-diff\\">
                <div class=\\"d2h-code-wrapper\\">
                    <table class=\\"d2h-diff-table\\">
                        <tbody class=\\"d2h-diff-tbody\\">
                        <span>Random Html</span>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>"
      `);
    });
    it('should work for simple renamed file', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});

      const file = {
        addedLines: 12,
        deletedLines: 41,
        language: 'js',
        oldName: 'my/file/name1.js',
        newName: 'my/file/name2.js',
        isRename: true,
        isCombined: false,
        isGitDiff: false,
        blocks: [],
      };
      const diffs = '<span>Random Html</span>';

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

      expect(fileHtml).toMatchInlineSnapshot(`
        "<div id=\\"d2h-662683\\" class=\\"d2h-file-wrapper\\" data-lang=\\"js\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">my/file/{name1.js → name2.js}</span>
            <span class=\\"d2h-tag d2h-moved d2h-moved-tag\\">RENAMED</span></span>
        <label class=\\"d2h-file-collapse\\">
            <input class=\\"d2h-file-collapse-input\\" type=\\"checkbox\\" name=\\"viewed\\" value=\\"viewed\\">
            Viewed
        </label>
            </div>
            <div class=\\"d2h-file-diff\\">
                <div class=\\"d2h-code-wrapper\\">
                    <table class=\\"d2h-diff-table\\">
                        <tbody class=\\"d2h-diff-tbody\\">
                        <span>Random Html</span>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>"
      `);
    });
    it('should return empty when option renderNothingWhenEmpty is true and file blocks not present', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {
        renderNothingWhenEmpty: true,
      });

      const file = {
        addedLines: 0,
        deletedLines: 0,
        language: 'js',
        oldName: 'my/file/name1.js',
        newName: 'my/file/name2.js',
        isRename: true,
        isCombined: false,
        isGitDiff: false,
        blocks: [],
      };

      const diffs = '<span>Random Html</span>';

      const fileHtml = lineByLineRenderer.makeFileDiffHtml(file, diffs);

      expect(fileHtml).toMatchInlineSnapshot(`""`);
    });
  });

  describe('generateLineByLineJsonHtml', () => {
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
          newName: 'sample',
          language: 'txt',
          isCombined: false,
          isGitDiff: true,
        },
      ];

      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {
        matching: LineMatchingType.LINES,
      });
      const html = lineByLineRenderer.render(exampleJson);
      expect(html).toMatchInlineSnapshot(`
        "<div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"txt\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
        <label class=\\"d2h-file-collapse\\">
            <input class=\\"d2h-file-collapse-input\\" type=\\"checkbox\\" name=\\"viewed\\" value=\\"viewed\\">
            Viewed
        </label>
            </div>
            <div class=\\"d2h-file-diff\\">
                <div class=\\"d2h-code-wrapper\\">
                    <table class=\\"d2h-diff-table\\">
                        <tbody class=\\"d2h-diff-tbody\\">
                        <tr>
            <td class=\\"d2h-code-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-line d2h-info\\">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-del d2h-change\\">
              <div class=\\"line-num1\\">1</div>
        <div class=\\"line-num2\\"></div>
            </td>
            <td class=\\"d2h-del d2h-change\\">
                <div class=\\"d2h-code-line d2h-del d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">-</span>
                    <span class=\\"d2h-code-line-ctn\\"><del>test</del></span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-ins d2h-change\\">
              <div class=\\"line-num1\\"></div>
        <div class=\\"line-num2\\">1</div>
            </td>
            <td class=\\"d2h-ins d2h-change\\">
                <div class=\\"d2h-code-line d2h-ins d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\"><ins>test1r</ins></span>
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

    it('should work for empty blocks', () => {
      const exampleJson = [
        {
          blocks: [],
          deletedLines: 0,
          addedLines: 0,
          oldName: 'sample',
          language: 'js',
          newName: 'sample',
          isCombined: false,
          isGitDiff: false,
        },
      ];

      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {
        renderNothingWhenEmpty: false,
      });
      const html = lineByLineRenderer.render(exampleJson);
      expect(html).toMatchInlineSnapshot(`
        "<div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"js\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
        <label class=\\"d2h-file-collapse\\">
            <input class=\\"d2h-file-collapse-input\\" type=\\"checkbox\\" name=\\"viewed\\" value=\\"viewed\\">
            Viewed
        </label>
            </div>
            <div class=\\"d2h-file-diff\\">
                <div class=\\"d2h-code-wrapper\\">
                    <table class=\\"d2h-diff-table\\">
                        <tbody class=\\"d2h-diff-tbody\\">
                        <tr>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-line d2h-info\\">
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
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils);
      const html = lineByLineRenderer.render(exampleJson);
      expect(html).toMatchInlineSnapshot(`
        "<div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"js\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
        <label class=\\"d2h-file-collapse\\">
            <input class=\\"d2h-file-collapse-input\\" type=\\"checkbox\\" name=\\"viewed\\" value=\\"viewed\\">
            Viewed
        </label>
            </div>
            <div class=\\"d2h-file-diff\\">
                <div class=\\"d2h-code-wrapper\\">
                    <table class=\\"d2h-diff-table\\">
                        <tbody class=\\"d2h-diff-tbody\\">
                        <tr>
            <td class=\\"d2h-code-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-line d2h-info\\"><a href=\\"http://example.com\\">Custom link to render</a></div>
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

  describe('_generateFileHtml', () => {
    it('should work for simple file', () => {
      const hoganUtils = new HoganJsUtils({});
      const lineByLineRenderer = new LineByLineRenderer(hoganUtils, {});
      const file: DiffFile = {
        blocks: [
          {
            lines: [
              {
                content: ' one context line',
                type: LineType.CONTEXT,
                oldNumber: 1,
                newNumber: 1,
              },
              {
                content: '-test',
                type: LineType.DELETE,
                oldNumber: 2,
                newNumber: undefined,
              },
              {
                content: '+test1r',
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 2,
              },
              {
                content: '+test2r',
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 3,
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
      };

      const html = lineByLineRenderer.generateFileHtml(file);

      expect(html).toMatchInlineSnapshot(`
        "<tr>
            <td class=\\"d2h-code-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-line d2h-info\\">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">1</div>
        <div class=\\"line-num2\\">1</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">one context line</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-del d2h-change\\">
              <div class=\\"line-num1\\">2</div>
        <div class=\\"line-num2\\"></div>
            </td>
            <td class=\\"d2h-del d2h-change\\">
                <div class=\\"d2h-code-line d2h-del d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">-</span>
                    <span class=\\"d2h-code-line-ctn\\"><del>test</del></span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-ins d2h-change\\">
              <div class=\\"line-num1\\"></div>
        <div class=\\"line-num2\\">2</div>
            </td>
            <td class=\\"d2h-ins d2h-change\\">
                <div class=\\"d2h-code-line d2h-ins d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\"><ins>test1r</ins></span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-ins\\">
              <div class=\\"line-num1\\"></div>
        <div class=\\"line-num2\\">3</div>
            </td>
            <td class=\\"d2h-ins\\">
                <div class=\\"d2h-code-line d2h-ins\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\">test2r</span>
                </div>
            </td>
        </tr>"
      `);
    });
  });
});
