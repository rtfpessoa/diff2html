import fs from 'fs';

import { parse, html } from '../diff2html';
import { ColorSchemeType, DiffFile, LineType, OutputFormatType } from '../types';

const diffExample1 =
  'diff --git a/sample b/sample\n' +
  'index 0000001..0ddf2ba\n' +
  '--- a/sample\n' +
  '+++ b/sample\n' +
  '@@ -1 +1 @@\n' +
  '-test\n' +
  '+test1\n';

const jsonExample1: DiffFile[] = [
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
            content: '+test1',
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
    language: '',
    isCombined: false,
    isGitDiff: true,
  },
];

describe('Diff2Html', () => {
  describe('parse', () => {
    it('should parse simple diff to json', () => {
      const diff =
        'diff --git a/sample b/sample\n' +
        'index 0000001..0ddf2ba\n' +
        '--- a/sample\n' +
        '+++ b/sample\n' +
        '@@ -1 +1 @@\n' +
        '-test\n' +
        '+test1\n';
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

    // Test case for issue #49
    it('should parse diff with added EOF', () => {
      const diff =
        'diff --git a/sample.scala b/sample.scala\n' +
        'index b583263..8b2fc3e 100644\n' +
        '--- a/b583263..8b2fc3e\n' +
        '+++ b/8b2fc3e\n' +
        '@@ -50,5 +50,7 @@ case class Response[+A](value: Option[A],\n' +
        ' object ResponseErrorCode extends JsonEnumeration {\n' +
        '  val NoError, ServiceError, JsonError,\n' +
        '  InvalidPermissions, MissingPermissions, GenericError,\n' +
        '-  TokenRevoked, MissingToken = Value\n' +
        '-}\n' +
        '\\ No newline at end of file\n' +
        '+  TokenRevoked, MissingToken,\n' +
        '+  IndexLock, RepositoryError, NotValidRepo, PullRequestNotMergeable, BranchError,\n' +
        '+  PluginError, CodeParserError, EngineError = Value\n' +
        '+}\n';
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "addedLines": 4,
            "blocks": [
              {
                "header": "@@ -50,5 +50,7 @@ case class Response[+A](value: Option[A],",
                "lines": [
                  {
                    "content": " object ResponseErrorCode extends JsonEnumeration {",
                    "newNumber": 50,
                    "oldNumber": 50,
                    "type": "context",
                  },
                  {
                    "content": "  val NoError, ServiceError, JsonError,",
                    "newNumber": 51,
                    "oldNumber": 51,
                    "type": "context",
                  },
                  {
                    "content": "  InvalidPermissions, MissingPermissions, GenericError,",
                    "newNumber": 52,
                    "oldNumber": 52,
                    "type": "context",
                  },
                  {
                    "content": "-  TokenRevoked, MissingToken = Value",
                    "newNumber": undefined,
                    "oldNumber": 53,
                    "type": "delete",
                  },
                  {
                    "content": "-}",
                    "newNumber": undefined,
                    "oldNumber": 54,
                    "type": "delete",
                  },
                  {
                    "content": "+  TokenRevoked, MissingToken,",
                    "newNumber": 53,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+  IndexLock, RepositoryError, NotValidRepo, PullRequestNotMergeable, BranchError,",
                    "newNumber": 54,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+  PluginError, CodeParserError, EngineError = Value",
                    "newNumber": 55,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  {
                    "content": "+}",
                    "newNumber": 56,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                ],
                "newStartLine": 50,
                "oldStartLine": 50,
                "oldStartLine2": null,
              },
            ],
            "checksumAfter": "8b2fc3e",
            "checksumBefore": "b583263",
            "deletedLines": 2,
            "isCombined": false,
            "isGitDiff": true,
            "language": "8b2fc3e",
            "mode": "100644",
            "newName": "8b2fc3e",
            "oldName": "b583263..8b2fc3e",
          },
        ]
      `);
    });
  });

  describe('html', () => {
    it('should generate pretty line by line html from diff', () => {
      const result = html(diffExample1, { drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
            <div class="d2h-file-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-table">
                        <tbody class="d2h-diff-tbody">
                        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">1</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn"><del>test</del></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">1</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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

    it('should generate pretty line by line html from json', () => {
      const result = html(jsonExample1, { drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
            <div class="d2h-file-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-table">
                        <tbody class="d2h-diff-tbody">
                        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">1</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn"><del>test</del></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">1</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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

    it('should generate pretty diff with files summary', () => {
      const result = html(diffExample1, { drawFileList: true });
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-file-list-wrapper d2h-light-color-scheme">
            <div class="d2h-file-list-header">
                <span class="d2h-file-list-title">Files changed (1)</span>
                <a class="d2h-file-switch d2h-hide">hide</a>
                <a class="d2h-file-switch d2h-show">show</a>
            </div>
            <ol class="d2h-file-list">
            <li class="d2h-file-list-line">
            <span class="d2h-file-name-wrapper">
              <svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"
                   viewBox="0 0 14 16" width="14">
                  <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>
              </svg>      <a href="#d2h-675094" class="d2h-file-name">sample</a>
              <span class="d2h-file-stats">
                  <span class="d2h-lines-added">+1</span>
                  <span class="d2h-lines-deleted">-1</span>
              </span>
            </span>
        </li>
            </ol>
        </div><div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
            <div class="d2h-file-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-table">
                        <tbody class="d2h-diff-tbody">
                        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">1</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn"><del>test</del></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">1</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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

    it('should generate pretty side by side html from diff', () => {
      const result = html(diffExample1, { outputFormat: OutputFormatType.SIDE_BY_SIDE, drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
                    <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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

    it('should generate pretty side by side html from json', () => {
      const result = html(jsonExample1, { outputFormat: OutputFormatType.SIDE_BY_SIDE, drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
                    <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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

    it('should generate pretty side by side html from diff 2', () => {
      const result = html(diffExample1, { outputFormat: OutputFormatType.SIDE_BY_SIDE, drawFileList: true });
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-file-list-wrapper d2h-light-color-scheme">
            <div class="d2h-file-list-header">
                <span class="d2h-file-list-title">Files changed (1)</span>
                <a class="d2h-file-switch d2h-hide">hide</a>
                <a class="d2h-file-switch d2h-show">show</a>
            </div>
            <ol class="d2h-file-list">
            <li class="d2h-file-list-line">
            <span class="d2h-file-name-wrapper">
              <svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"
                   viewBox="0 0 14 16" width="14">
                  <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>
              </svg>      <a href="#d2h-675094" class="d2h-file-name">sample</a>
              <span class="d2h-file-stats">
                  <span class="d2h-lines-added">+1</span>
                  <span class="d2h-lines-deleted">-1</span>
              </span>
            </span>
        </li>
            </ol>
        </div><div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
                    <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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

    it('should generate pretty side by side html from diff with html on headers', () => {
      const diffExample2 =
        'diff --git a/CHANGELOG.md b/CHANGELOG.md\n' +
        'index fc3e3f4..b486d10 100644\n' +
        '--- a/CHANGELOG.md\n' +
        '+++ b/CHANGELOG.md\n' +
        '@@ -1,7 +1,6 @@\n' +
        ' # Change Log\n' +
        ' All notable changes to this project will be documented in this file.\n' +
        ' This project adheres to [Semantic Versioning](http://semver.org/).\n' +
        '-$a="<table><tr><td>Use the following format for additions: ` - VERSION: [feature/patch (if applicable)] Short description of change. Links to relevant issues/PRs.`\n' +
        ' $a="<table><tr><td>\n' +
        ' $a="<table><tr><td>- 1.1.9: Fix around ubuntu\'s inability to cache promises. [#877](https://github.com/FredrikNoren/ungit/pull/878)\n' +
        ' - 1.1.8:\n' +
        '@@ -11,7 +10,7 @@ $a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;- 1.1.9: Fix around ubuntu&#x27;s inability to cache promises. [#8\n' +
        ' - 1.1.7:\n' +
        '     - Fix diff flickering issue and optimization [#865](https://github.com/FredrikNoren/ungit/pull/865)\n' +
        '     - Fix credential dialog issue [#864](https://github.com/FredrikNoren/ungit/pull/864)\n' +
        '-    - Fix HEAD branch order when redraw [#858](https://github.com/FredrikNoren/ungit/issues/858)\n' +
        '+4    - Fix HEAD branch order when redraw [#858](https://github.com/FredrikNoren/ungit/issues/858)\n' +
        ' - 1.1.6: Fix path auto complete [#861](https://github.com/FredrikNoren/ungit/issues/861)\n' +
        ' - 1.1.5: Update "Toggle all" button after commit or changing selected files [#859](https://github.com/FredrikNoren/ungit/issues/859)\n' +
        ' - 1.1.4: [patch] Promise refactoring\n' +
        ' \n';
      const result = html(diffExample2, { drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-211439" class="d2h-file-wrapper" data-lang="md">
            <div class="d2h-file-header">
            <span class="d2h-file-name-wrapper">
            <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
                <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
            </svg>    <span class="d2h-file-name">CHANGELOG.md</span>
            <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        <label class="d2h-file-collapse">
            <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">
            Viewed
        </label>
            </div>
            <div class="d2h-file-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-table">
                        <tbody class="d2h-diff-tbody">
                        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line">@@ -1,7 +1,6 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">1</div>
        <div class="line-num2">1</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"># Change Log</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">2</div>
        <div class="line-num2">2</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">All notable changes to this project will be documented in this file.</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">3</div>
        <div class="line-num2">3</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">This project adheres to [Semantic Versioning](http:&#x2F;&#x2F;semver.org&#x2F;).</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
              <div class="line-num1">4</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">$a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;Use the following format for additions: \` - VERSION: [feature&#x2F;patch (if applicable)] Short description of change. Links to relevant issues&#x2F;PRs.\`</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">5</div>
        <div class="line-num2">4</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">$a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">6</div>
        <div class="line-num2">5</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">$a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;- 1.1.9: Fix around ubuntu&#x27;s inability to cache promises. [#877](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;pull&#x2F;878)</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">7</div>
        <div class="line-num2">6</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">- 1.1.8:</span>
                </div>
            </td>
        </tr>
        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line">@@ -11,7 +10,7 @@ $a=&amp;quot;&amp;lt;table&amp;gt;&amp;lt;tr&amp;gt;&amp;lt;td&amp;gt;- 1.1.9: Fix around ubuntu&amp;#x27;s inability to cache promises. [#8</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">11</div>
        <div class="line-num2">10</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">- 1.1.7:</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">12</div>
        <div class="line-num2">11</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">    - Fix diff flickering issue and optimization [#865](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;pull&#x2F;865)</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">13</div>
        <div class="line-num2">12</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">    - Fix credential dialog issue [#864](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;pull&#x2F;864)</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">14</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">    - Fix HEAD branch order when redraw [#858](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;issues&#x2F;858)</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">13</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn"><ins>4</ins>    - Fix HEAD branch order when redraw [#858](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;issues&#x2F;858)</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">15</div>
        <div class="line-num2">14</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">- 1.1.6: Fix path auto complete [#861](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;issues&#x2F;861)</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">16</div>
        <div class="line-num2">15</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">- 1.1.5: Update &quot;Toggle all&quot; button after commit or changing selected files [#859](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;issues&#x2F;859)</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">17</div>
        <div class="line-num2">16</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">- 1.1.4: [patch] Promise refactoring</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">18</div>
        <div class="line-num2">17</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
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

    it('should generate html correctly without escaping twice', () => {
      const diff =
        '--- src/index.html\n' +
        '+++ src/index.html\n' +
        '@@ -1,2 +1,2 @@\n' +
        '-<!-- commented code -->\n' +
        '-</div>\n' +
        '+<html>\n' +
        '+<body>';

      const result = html(diff);
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-file-list-wrapper d2h-light-color-scheme">
            <div class="d2h-file-list-header">
                <span class="d2h-file-list-title">Files changed (1)</span>
                <a class="d2h-file-switch d2h-hide">hide</a>
                <a class="d2h-file-switch d2h-show">show</a>
            </div>
            <ol class="d2h-file-list">
            <li class="d2h-file-list-line">
            <span class="d2h-file-name-wrapper">
              <svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"
                   viewBox="0 0 14 16" width="14">
                  <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>
              </svg>      <a href="#d2h-597266" class="d2h-file-name">src/index.html</a>
              <span class="d2h-file-stats">
                  <span class="d2h-lines-added">+2</span>
                  <span class="d2h-lines-deleted">-2</span>
              </span>
            </span>
        </li>
            </ol>
        </div><div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-597266" class="d2h-file-wrapper" data-lang="html">
            <div class="d2h-file-header">
            <span class="d2h-file-name-wrapper">
            <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
                <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
            </svg>    <span class="d2h-file-name">src/index.html</span>
            <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        <label class="d2h-file-collapse">
            <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">
            Viewed
        </label>
            </div>
            <div class="d2h-file-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-table">
                        <tbody class="d2h-diff-tbody">
                        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line">@@ -1,2 +1,2 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">1</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">&lt;<del>!-- commented code --</del>&gt;</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">2</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">&lt;<del>&#x2F;div</del>&gt;</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">1</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">&lt;<ins>html</ins>&gt;</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">2</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">&lt;<ins>body</ins>&gt;</span>
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

    it('should escape html correctly', () => {
      const diff = fs.readFileSync('src/__tests__/diffs/bad-escaping.diff', 'utf-8');

      const result = html(diff);
      /* eslint-disable no-irregular-whitespace */
      expect(result).toMatchInlineSnapshot(`
        "<div class="d2h-file-list-wrapper d2h-light-color-scheme">
            <div class="d2h-file-list-header">
                <span class="d2h-file-list-title">Files changed (1)</span>
                <a class="d2h-file-switch d2h-hide">hide</a>
                <a class="d2h-file-switch d2h-show">show</a>
            </div>
            <ol class="d2h-file-list">
            <li class="d2h-file-list-line">
            <span class="d2h-file-name-wrapper">
              <svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"
                   viewBox="0 0 14 16" width="14">
                  <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>
              </svg>      <a href="#d2h-719103" class="d2h-file-name">web/assets/javascripts/application.js</a>
              <span class="d2h-file-stats">
                  <span class="d2h-lines-added">+3</span>
                  <span class="d2h-lines-deleted">-8</span>
              </span>
            </span>
        </li>
            </ol>
        </div><div class="d2h-wrapper d2h-light-color-scheme">
            <div id="d2h-719103" class="d2h-file-wrapper" data-lang="js">
            <div class="d2h-file-header">
            <span class="d2h-file-name-wrapper">
            <svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
                <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
            </svg>    <span class="d2h-file-name">web/assets/javascripts/application.js</span>
            <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        <label class="d2h-file-collapse">
            <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">
            Viewed
        </label>
            </div>
            <div class="d2h-file-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-table">
                        <tbody class="d2h-diff-tbody">
                        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line">@@ -1,5 +1,5 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">1</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">&#x2F;*! jQuery v1.<del>8</del>.<del>2</del> <del>jquery.com</del> | jquery.org&#x2F;license *&#x2F;</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">2</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">(function(a,b){function G(a){var b=F[a]={};return p.each(a.split(s),function(a,c){b[c]=!0}),b}function J(a,c,d){if(d===b&amp;&amp;a.nodeType===1){var e=&quot;data-&quot;+c.replace(I,&quot;-$1&quot;).toLowerCase();d=a.getAttribute(e);if(typeof d==&quot;string&quot;){try{d=d===&quot;true&quot;?!0:d===&quot;false&quot;?!1:d===&quot;null&quot;?null:+d+&quot;&quot;===d?+d:H.test(d)?p.parseJSON(d):d}catch(f){}p.data(a,c,d)}else d=b}return d}function K(a){var b;for(b in a){if(b===&quot;data&quot;&amp;&amp;p.isEmptyObject(a[b]))continue;if(b!==&quot;toJSON&quot;)return!1}return!0}function ba(){return!1}function bb(){return!0}function bh(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function bi(a,b){do a=a[b];while(a&amp;&amp;a.nodeType!==1);return a}function bj(a,b,c){b=b||0;if(p.isFunction(b))return p.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return p.grep(a,function(a,d){return a===b===c});if(typeof b==&quot;string&quot;){var d=p.grep(a,function(a){return a.nodeType===1});if(be.test(b))return p.filter(b,d,!c);b=p.filter(b,d)}return p.grep(a,function(a,d){return p.inArray(a,b)&gt;=0===c})}function bk(a){var b=bl.split(&quot;|&quot;),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function bC(a,b){return a.getElementsByTagName(b)[0]||a.appendChild(a.ownerDocument.createElement(b))}function bD(a,b){if(b.nodeType!==1||!p.hasData(a))return;var c,d,e,f=p._data(a),g=p._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;d&lt;e;d++)p.event.add(b,c,h[c][d])}g.data&amp;&amp;(g.data=p.extend({},g.data))}function bE(a,b){var c;if(b.nodeType!==1)return;b.clearAttributes&amp;&amp;b.clearAttributes(),b.mergeAttributes&amp;&amp;b.mergeAttributes(a),c=b.nodeName.toLowerCase(),c===&quot;object&quot;?(b.parentNode&amp;&amp;(b.outerHTML=a.outerHTML),p.support.html5Clone&amp;&amp;a.innerHTML&amp;&amp;!p.trim(b.innerHTML)&amp;&amp;(b.innerHTML=a.innerHTML)):c===&quot;input&quot;&amp;&amp;bv.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&amp;&amp;(b.value=a.value)):c===&quot;option&quot;?b.selected=a.defaultSelected:c===&quot;input&quot;||c===&quot;textarea&quot;?b.defaultValue=a.defaultValue:c===&quot;script&quot;&amp;&amp;b.text!==a.text&amp;&amp;(b.text=a.text),b.removeAttribute(p.expando)}function bF(a){return typeof a.getElementsByTagName!=&quot;undefined&quot;?a.getElementsByTagName(&quot;*&quot;):typeof a.querySelectorAll!=&quot;undefined&quot;?a.querySelectorAll(&quot;*&quot;):[]}function bG(a){bv.test(a.type)&amp;&amp;(a.defaultChecked=a.checked)}function bY(a,b){if(b in a)return b;var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=bW.length;while(e--){b=bW[e]+c;if(b in a)return b}return d}function bZ(a,b){return a=b||a,p.css(a,&quot;display&quot;)===&quot;none&quot;||!p.contains(a.ownerDocument,a)}function b$(a,b){var c,d,e=[],f=0,g=a.length;for(;f&lt;g;f++){c=a[f];if(!c.style)continue;e[f]=p._data(c,&quot;olddisplay&quot;),b?(!e[f]&amp;&amp;c.style.display===&quot;none&quot;&amp;&amp;(c.style.display=&quot;&quot;),c.style.display===&quot;&quot;&amp;&amp;bZ(c)&amp;&amp;(e[f]=p._data(c,&quot;olddisplay&quot;,cc(c.nodeName)))):(d=bH(c,&quot;display&quot;),!e[f]&amp;&amp;d!==&quot;none&quot;&amp;&amp;p._data(c,&quot;olddisplay&quot;,d))}for(f=0;f&lt;g;f++){c=a[f];if(!c.style)continue;if(!b||c.style.display===&quot;none&quot;||c.style.display===&quot;&quot;)c.style.display=b?e[f]||&quot;&quot;:&quot;none&quot;}return a}function b_(a,b,c){var d=bP.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||&quot;px&quot;):b}function ca(a,b,c,d){var e=c===(d?&quot;border&quot;:&quot;content&quot;)?4:b===&quot;width&quot;?1:0,f=0;for(;e&lt;4;e+=2)c===&quot;margin&quot;&amp;&amp;(f+=p.css(a,c+bV[e],!0)),d?(c===&quot;content&quot;&amp;&amp;(f-=parseFloat(bH(a,&quot;padding&quot;+bV[e]))||0),c!==&quot;margin&quot;&amp;&amp;(f-=parseFloat(bH(a,&quot;border&quot;+bV[e]+&quot;Width&quot;))||0)):(f+=parseFloat(bH(a,&quot;padding&quot;+bV[e]))||0,c!==&quot;padding&quot;&amp;&amp;(f+=parseFloat(bH(a,&quot;border&quot;+bV[e]+&quot;Width&quot;))||0));return f}function cb(a,b,c){var d=b===&quot;width&quot;?a.offsetWidth:a.offsetHeight,e=!0,f=p.support.boxSizing&amp;&amp;p.css(a,&quot;boxSizing&quot;)===&quot;border-box&quot;;if(d&lt;=0||d==null){d=bH(a,b);if(d&lt;0||d==null)d=a.style[b];if(bQ.test(d))return d;e=f&amp;&amp;(p.support.boxSizingReliable||d===a.style[b]),d=parseFloat(d)||0}return d+ca(a,b,c||(f?&quot;border&quot;:&quot;content&quot;),e)+&quot;px&quot;}function cc(a){if(bS[a])return bS[a];var b=p(&quot;&lt;&quot;+a+&quot;&gt;&quot;).appendTo(e.body),c=b.css(&quot;display&quot;);b.remove();if(c===&quot;none&quot;||c===&quot;&quot;){bI=e.body.appendChild(bI||p.extend(e.createElement(&quot;iframe&quot;),{frameBorder:0,width:0,height:0}));if(!bJ||!bI.createElement)bJ=(bI.contentWindow||bI.contentDocument).document,bJ.write(&quot;&lt;!doctype html&gt;&lt;html&gt;&lt;body&gt;&quot;),bJ.close();b=bJ.body.appendChild(bJ.createElement(a)),c=bH(b,&quot;display&quot;),e.body.removeChild(bI)}return bS[a]=c,c}function ci(a,b,c,d){var e;if(p.isArray(b))p.each(b,function(b,e){c||ce.test(a)?d(a,e):ci(a+&quot;[&quot;+(typeof e==&quot;object&quot;?b:&quot;&quot;)+&quot;]&quot;,e,c,d)});else if(!c&amp;&amp;p.type(b)===&quot;object&quot;)for(e in b)ci(a+&quot;[&quot;+e+&quot;]&quot;,b[e],c,d);else d(a,b)}function cz(a){return function(b,c){typeof b!=&quot;string&quot;&amp;&amp;(c=b,b=&quot;*&quot;);var d,e,f,g=b.toLowerCase().split(s),h=0,i=g.length;if(p.isFunction(c))for(;h&lt;i;h++)d=g[h],f=&#x2F;^\\+&#x2F;.test(d),f&amp;&amp;(d=d.substr(1)||&quot;*&quot;),e=a[d]=a[d]||[],e[f?&quot;unshift&quot;:&quot;push&quot;](c)}}function cA(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h,i=a[f],j=0,k=i?i.length:0,l=a===cv;for(;j&lt;k&amp;&amp;(l||!h);j++)h=i[j](c,d,e),typeof h==&quot;string&quot;&amp;&amp;(!l||g[h]?h=b:(c.dataTypes.unshift(h),h=cA(a,c,d,e,h,g)));return(l||!h)&amp;&amp;!g[&quot;*&quot;]&amp;&amp;(h=cA(a,c,d,e,&quot;*&quot;,g)),h}function cB(a,c){var d,e,f=p.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&amp;&amp;((f[d]?a:e||(e={}))[d]=c[d]);e&amp;&amp;p.extend(!0,a,e)}function cC(a,c,d){var e,f,g,h,i=a.contents,j=a.dataTypes,k=a.responseFields;for(f in k)f in d&amp;&amp;(c[k[f]]=d[f]);while(j[0]===&quot;*&quot;)j.shift(),e===b&amp;&amp;(e=a.mimeType||c.getResponseHeader(&quot;content-type&quot;));if(e)for(f in i)if(i[f]&amp;&amp;i[f].test(e)){j.unshift(f);break}if(j[0]in d)g=j[0];else{for(f in d){if(!j[0]||a.converters[f+&quot; &quot;+j[0]]){g=f;break}h||(h=f)}g=g||h}if(g)return g!==j[0]&amp;&amp;j.unshift(g),d[g]}function cD(a,b){var c,d,e,f,g=a.dataTypes.slice(),h=g[0],i={},j=0;a.dataFilter&amp;&amp;(b=a.dataFilter(b,a.dataType));if(g[1])for(c in a.converters)i[c.toLowerCase()]=a.converters[c];for(;e=g[++j];)if(e!==&quot;*&quot;){if(h!==&quot;*&quot;&amp;&amp;h!==e){c=i[h+&quot; &quot;+e]||i[&quot;* &quot;+e];if(!c)for(d in i){f=d.split(&quot; &quot;);if(f[1]===e){c=i[h+&quot; &quot;+f[0]]||i[&quot;* &quot;+f[0]];if(c){c===!0?c=i[d]:i[d]!==!0&amp;&amp;(e=f[0],g.splice(j--,0,e));break}}}if(c!==!0)if(c&amp;&amp;a[&quot;throws&quot;])b=c(b);else try{b=c(b)}catch(k){return{state:&quot;parsererror&quot;,error:c?k:&quot;No conversion from &quot;+h+&quot; to &quot;+e}}}h=e}return{state:&quot;success&quot;,data:b}}function cL(){try{return new a.XMLHttpRequest}catch(b){}}function cM(){try{return new a.ActiveXObject(&quot;Microsoft.XMLHTTP&quot;)}catch(b){}}function cU(){return setTimeout(function(){cN=b},0),cN=p.now()}function cV(a,b){p.each(b,function(b,c){var d=(cT[b]||[]).concat(cT[&quot;*&quot;]),e=0,f=d.length;for(;e&lt;f;e++)if(d[e].call(a,b,c))return})}function cW(a,b,c){var d,e=0,f=0,g=cS.length,h=p.Deferred().always(function(){delete i.elem}),i=function(){var b=cN||cU(),c=Math.max(0,j.startTime+j.duration-b),d=1-(c&#x2F;j.duration||0),e=0,f=j.tweens.length;for(;e&lt;f;e++)j.tweens[e].run(d);return h.notifyWith(a,[j,d,c]),d&lt;1&amp;&amp;f?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:p.extend({},b),opts:p.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:cN||cU(),duration:c.duration,tweens:[],createTween:function(b,c,d){var e=p.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(e),e},stop:function(b){var c=0,d=b?j.tweens.length:0;for(;c&lt;d;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;cX(k,j.opts.specialEasing);for(;e&lt;g;e++){d=cS[e].call(j,a,k,j.opts);if(d)return d}return cV(j,k),p.isFunction(j.opts.start)&amp;&amp;j.opts.start.call(a,j),p.fx.timer(p.extend(i,{anim:j,queue:j.opts.queue,elem:a})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}function cX(a,b){var c,d,e,f,g;for(c in a){d=p.camelCase(c),e=b[d],f=a[c],p.isArray(f)&amp;&amp;(e=f[1],f=a[c]=f[0]),c!==d&amp;&amp;(a[d]=f,delete a[c]),g=p.cssHooks[d];if(g&amp;&amp;&quot;expand&quot;in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}}function cY(a,b,c){var d,e,f,g,h,i,j,k,l=this,m=a.style,n={},o=[],q=a.nodeType&amp;&amp;bZ(a);c.queue||(j=p._queueHooks(a,&quot;fx&quot;),j.unqueued==null&amp;&amp;(j.unqueued=0,k=j.empty.fire,j.empty.fire=function(){j.unqueued||k()}),j.unqueued++,l.always(function(){l.always(function(){j.unqueued--,p.queue(a,&quot;fx&quot;).length||j.empty.fire()})})),a.nodeType===1&amp;&amp;(&quot;height&quot;in b||&quot;width&quot;in b)&amp;&amp;(c.overflow=[m.overflow,m.overflowX,m.overflowY],p.css(a,&quot;display&quot;)===&quot;inline&quot;&amp;&amp;p.css(a,&quot;float&quot;)===&quot;none&quot;&amp;&amp;(!p.support.inlineBlockNeedsLayout||cc(a.nodeName)===&quot;inline&quot;?m.display=&quot;inline-block&quot;:m.zoom=1)),c.overflow&amp;&amp;(m.overflow=&quot;hidden&quot;,p.support.shrinkWrapBlocks||l.done(function(){m.overflow=c.overflow[0],m.overflowX=c.overflow[1],m.overflowY=c.overflow[2]}));for(d in b){f=b[d];if(cP.exec(f)){delete b[d];if(f===(q?&quot;hide&quot;:&quot;show&quot;))continue;o.push(d)}}g=o.length;if(g){h=p._data(a,&quot;fxshow&quot;)||p._data(a,&quot;fxshow&quot;,{}),q?p(a).show():l.done(function(){p(a).hide()}),l.done(function(){var b;p.removeData(a,&quot;fxshow&quot;,!0);for(b in n)p.style(a,b,n[b])});for(d=0;d&lt;g;d++)e=o[d],i=l.createTween(e,q?h[e]:0),n[e]=h[e]||p.style(a,e),e in h||(h[e]=i.start,q&amp;&amp;(i.end=i.start,i.start=e===&quot;width&quot;||e===&quot;height&quot;?1:0))}}function cZ(a,b,c,d,e){return new cZ.prototype.init(a,b,c,d,e)}function c$(a,b){var c,d={height:a},e=0;b=b?1:0;for(;e&lt;4;e+=2-b)c=bV[e],d[&quot;margin&quot;+c]=d[&quot;padding&quot;+c]=a;return b&amp;&amp;(d.opacity=d.width=a),d}function da(a){return p.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}var c,d,e=a.document,f=a.location,g=a.navigator,h=a.jQuery,i=a.$,j=Array.prototype.push,k=Array.prototype.slice,l=Array.prototype.indexOf,m=Object.prototype.toString,n=Object.prototype.hasOwnProperty,o=String.prototype.trim,p=function(a,b){return new p.fn.init(a,b,c)},q=&#x2F;[\\-+]?(?:\\d*\\.|)\\d+(?:[eE][\\-+]?\\d+|)&#x2F;.source,r=&#x2F;\\S&#x2F;,s=&#x2F;\\s+&#x2F;,t=&#x2F;^[\\s\\uFEFF\\xA0]+|[\\s\\uFEFF\\xA0]+$&#x2F;g,u=&#x2F;^(?:[^#&lt;]*(&lt;[\\w\\W]+&gt;)[^&gt;]*$|#([\\w\\-]*)$)&#x2F;,v=&#x2F;^&lt;(\\w+)\\s*\\&#x2F;?&gt;(?:&lt;\\&#x2F;\\1&gt;|)$&#x2F;,w=&#x2F;^[\\],:{}\\s]*$&#x2F;,x=&#x2F;(?:^|:|,)(?:\\s*\\[)+&#x2F;g,y=&#x2F;\\\\(?:[&quot;\\\\\\&#x2F;bfnrt]|u[\\da-fA-F]{4})&#x2F;g,z=&#x2F;&quot;[^&quot;\\\\\\r\\n]*&quot;|true|false|null|-?(?:\\d\\d*\\.|)\\d+(?:[eE][\\-+]?\\d+|)&#x2F;g,A=&#x2F;^-ms-&#x2F;,B=&#x2F;-([\\da-z])&#x2F;gi,C=function(a,b){return(b+&quot;&quot;).toUpperCase()},D=function(){e.addEventListener?(e.removeEventListener(&quot;DOMContentLoaded&quot;,D,!1),p.ready()):e.readyState===&quot;complete&quot;&amp;&amp;(e.detachEvent(&quot;onreadystatechange&quot;,D),p.ready())},E={};p.fn=p.prototype={constructor:p,init:function(a,c,d){var f,g,h,i;if(!a)return this;if(a.nodeType)return this.context=this[0]=a,this.length=1,this;if(typeof a==&quot;string&quot;){a.charAt(0)===&quot;&lt;&quot;&amp;&amp;a.charAt(a.length-1)===&quot;&gt;&quot;&amp;&amp;a.length&gt;=3?f=[null,a,null]:f=u.exec(a);if(f&amp;&amp;(f[1]||!c)){if(f[1])return c=c instanceof p?c[0]:c,i=c&amp;&amp;c.nodeType?c.ownerDocument||c:e,a=p.parseHTML(f[1],i,!0),v.test(f[1])&amp;&amp;p.isPlainObject(c)&amp;&amp;this.attr.call(a,c,!0),p.merge(this,a);g=e.getElementById(f[2]);if(g&amp;&amp;g.parentNode){if(g.id!==f[2])return d.find(a);this.length=1,this[0]=g}return this.context=e,this.selector=a,this}return!c||c.jquery?(c||d).find(a):this.constructor(c).find(a)}return p.isFunction(a)?d.ready(a):(a.selector!==b&amp;&amp;(this.selector=a.selector,this.context=a.context),p.makeArray(a,this))},selector:&quot;&quot;,jquery:&quot;1.8.2&quot;,length:0,size:function(){return this.length},toArray:function(){return k.call(this)},get:function(a){return a==null?this.toArray():a&lt;0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=p.merge(this.constructor(),a);return d.prevObject=this,d.context=this.context,b===&quot;find&quot;?d.selector=this.selector+(this.selector?&quot; &quot;:&quot;&quot;)+c:b&amp;&amp;(d.selector=this.selector+&quot;.&quot;+b+&quot;(&quot;+c+&quot;)&quot;),d},each:function(a,b){return p.each(this,a,b)},ready:function(a){return p.ready.promise().done(a),this},eq:function(a){return a=+a,a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(k.apply(this,arguments),&quot;slice&quot;,k.call(arguments).join(&quot;,&quot;))},map:function(a){return this.pushStack(p.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:j,sort:[].sort,splice:[].splice},p.fn.init.prototype=p.fn,p.extend=p.fn.extend=function(){var a,c,d,e,f,g,h=arguments[0]||{},i=1,j=arguments.length,k=!1;typeof h==&quot;boolean&quot;&amp;&amp;(k=h,h=arguments[1]||{},i=2),typeof h!=&quot;object&quot;&amp;&amp;!p.isFunction(h)&amp;&amp;(h={}),j===i&amp;&amp;(h=this,--i);for(;i&lt;j;i++)if((a=arguments[i])!=null)for(c in a){d=h[c],e=a[c];if(h===e)continue;k&amp;&amp;e&amp;&amp;(p.isPlainObject(e)||(f=p.isArray(e)))?(f?(f=!1,g=d&amp;&amp;p.isArray(d)?d:[]):g=d&amp;&amp;p.isPlainObject(d)?d:{},h[c]=p.extend(k,g,e)):e!==b&amp;&amp;(h[c]=e)}return h},p.extend({noConflict:function(b){return a.$===p&amp;&amp;(a.$=i),b&amp;&amp;a.jQuery===p&amp;&amp;(a.jQuery=h),p},isReady:!1,readyWait:1,holdReady:function(a){a?p.readyWait++:p.ready(!0)},ready:function(a){if(a===!0?--p.readyWait:p.isReady)return;if(!e.body)return setTimeout(p.ready,1);p.isReady=!0;if(a!==!0&amp;&amp;--p.readyWait&gt;0)return;d.resolveWith(e,[p]),p.fn.trigger&amp;&amp;p(e).trigger(&quot;ready&quot;).off(&quot;ready&quot;)},isFunction:function(a){return p.type(a)===&quot;function&quot;},isArray:Array.isArray||function(a){return p.type(a)===&quot;array&quot;},isWindow:function(a){return a!=null&amp;&amp;a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&amp;&amp;isFinite(a)},type:function(a){return a==null?String(a):E[m.call(a)]||&quot;object&quot;},isPlainObject:function(a){if(!a||p.type(a)!==&quot;object&quot;||a.nodeType||p.isWindow(a))return!1;try{if(a.constructor&amp;&amp;!n.call(a,&quot;constructor&quot;)&amp;&amp;!n.call(a.constructor.prototype,&quot;isPrototypeOf&quot;))return!1}catch(c){return!1}var d;for(d in a);return d===b||n.call(a,d)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},error:function(a){throw new Error(a)},parseHTML:function(a,b,c){var d;return!a||typeof a!=&quot;string&quot;?null:(typeof b==&quot;boolean&quot;&amp;&amp;(c=b,b=0),b=b||e,(d=v.exec(a))?[b.createElement(d[1])]:(d=p.buildFragment([a],b,c?null:[]),p.merge([],(d.cacheable?p.clone(d.fragment):d.fragment).childNodes)))},parseJSON:function(b){if(!b||typeof b!=&quot;string&quot;)return null;b=p.trim(b);if(a.JSON&amp;&amp;a.JSON.parse)return a.JSON.parse(b);if(w.test(b.replace(y,&quot;@&quot;).replace(z,&quot;]&quot;).replace(x,&quot;&quot;)))return(new Function(&quot;return &quot;+b))();p.error(&quot;Invalid JSON: &quot;+b)},parseXML:function(c){var d,e;if(!c||typeof c!=&quot;string&quot;)return null;try{a.DOMParser?(e=new DOMParser,d=e.parseFromString(c,&quot;text&#x2F;xml&quot;)):(d=new ActiveXObject(&quot;Microsoft.XMLDOM&quot;),d.async=&quot;false&quot;,d.loadXML(c))}catch(f){d=b}return(!d||!d.documentElement||d.getElementsByTagName(&quot;parsererror&quot;).length)&amp;&amp;p.error(&quot;Invalid XML: &quot;+c),d},noop:function(){},globalEval:function(b){b&amp;&amp;r.test(b)&amp;&amp;(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(A,&quot;ms-&quot;).replace(B,C)},nodeName:function(a,b){return a.nodeName&amp;&amp;a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,c,d){var e,f=0,g=a.length,h=g===b||p.isFunction(a);if(d){if(h){for(e in a)if(c.apply(a[e],d)===!1)break}else for(;f&lt;g;)if(c.apply(a[f++],d)===!1)break}else if(h){for(e in a)if(c.call(a[e],e,a[e])===!1)break}else for(;f&lt;g;)if(c.call(a[f],f,a[f++])===!1)break;return a},trim:o&amp;&amp;!o.call(&quot;﻿ &quot;)?function(a){return a==null?&quot;&quot;:o.call(a)}:function(a){return a==null?&quot;&quot;:(a+&quot;&quot;).replace(t,&quot;&quot;)},makeArray:function(a,b){var c,d=b||[];return a!=null&amp;&amp;(c=p.type(a),a.length==null||c===&quot;string&quot;||c===&quot;function&quot;||c===&quot;regexp&quot;||p.isWindow(a)?j.call(d,a):p.merge(d,a)),d},inArray:function(a,b,c){var d;if(b){if(l)return l.call(b,a,c);d=b.length,c=c?c&lt;0?Math.max(0,d+c):c:0;for(;c&lt;d;c++)if(c in b&amp;&amp;b[c]===a)return c}return-1},merge:function(a,c){var d=c.length,e=a.length,f=0;if(typeof d==&quot;number&quot;)for(;f&lt;d;f++)a[e++]=c[f];else while(c[f]!==b)a[e++]=c[f++];return a.length=e,a},grep:function(a,b,c){var d,e=[],f=0,g=a.length;c=!!c;for(;f&lt;g;f++)d=!!b(a[f],f),c!==d&amp;&amp;e.push(a[f]);return e},map:function(a,c,d){var e,f,g=[],h=0,i=a.length,j=a instanceof p||i!==b&amp;&amp;typeof i==&quot;number&quot;&amp;&amp;(i&gt;0&amp;&amp;a[0]&amp;&amp;a[i-1]||i===0||p.isArray(a));if(j)for(;h&lt;i;h++)e=c(a[h],h,d),e!=null&amp;&amp;(g[g.length]=e);else for(f in a)e=c(a[f],f,d),e!=null&amp;&amp;(g[g.length]=e);return g.concat.apply([],g)},guid:1,proxy:function(a,c){var d,e,f;return typeof c==&quot;string&quot;&amp;&amp;(d=a[c],c=a,a=d),p.isFunction(a)?(e=k.call(arguments,2),f=function(){return a.apply(c,e.concat(k.call(arguments)))},f.guid=a.guid=a.guid||p.guid++,f):b},access:function(a,c,d,e,f,g,h){var i,j=d==null,k=0,l=a.length;if(d&amp;&amp;typeof d==&quot;object&quot;){for(k in d)p.access(a,c,k,d[k],1,g,e);f=1}else if(e!==b){i=h===b&amp;&amp;p.isFunction(e),j&amp;&amp;(i?(i=c,c=function(a,b,c){return i.call(p(a),c)}):(c.call(a,e),c=null));if(c)for(;k&lt;l;k++)c(a[k],d,i?e.call(a[k],k,c(a[k],d)):e,h);f=1}return f?a:j?c.call(a):l?c(a[0],d):g},now:function(){return(new Date).getTime()}}),p.ready.promise=function(b){if(!d){d=p.Deferred();if(e.readyState===&quot;complete&quot;)setTimeout(p.ready,1);else if(e.addEventListener)e.addEventListener(&quot;DOMContentLoaded&quot;,D,!1),a.addEventListener(&quot;load&quot;,p.ready,!1);else{e.attachEvent(&quot;onreadystatechange&quot;,D),a.attachEvent(&quot;onload&quot;,p.ready);var c=!1;try{c=a.frameElement==null&amp;&amp;e.documentElement}catch(f){}c&amp;&amp;c.doScroll&amp;&amp;function g(){if(!p.isReady){try{c.doScroll(&quot;left&quot;)}catch(a){return setTimeout(g,50)}p.ready()}}()}}return d.promise(b)},p.each(&quot;Boolean Number String Function Array Date RegExp Object&quot;.split(&quot; &quot;),function(a,b){E[&quot;[object &quot;+b+&quot;]&quot;]=b.toLowerCase()}),c=p(e);var F={};p.Callbacks=function(a){a=typeof a==&quot;string&quot;?F[a]||G(a):p.extend({},a);var c,d,e,f,g,h,i=[],j=!a.once&amp;&amp;[],k=function(b){c=a.memory&amp;&amp;b,d=!0,h=f||0,f=0,g=i.length,e=!0;for(;i&amp;&amp;h&lt;g;h++)if(i[h].apply(b[0],b[1])===!1&amp;&amp;a.stopOnFalse){c=!1;break}e=!1,i&amp;&amp;(j?j.length&amp;&amp;k(j.shift()):c?i=[]:l.disable())},l={add:function(){if(i){var b=i.length;(function d(b){p.each(b,function(b,c){var e=p.type(c);e===&quot;function&quot;&amp;&amp;(!a.unique||!l.has(c))?i.push(c):c&amp;&amp;c.length&amp;&amp;e!==&quot;string&quot;&amp;&amp;d(c)})})(arguments),e?g=i.length:c&amp;&amp;(f=b,k(c))}return this},remove:function(){return i&amp;&amp;p.each(arguments,function(a,b){var c;while((c=p.inArray(b,i,c))&gt;-1)i.splice(c,1),e&amp;&amp;(c&lt;=g&amp;&amp;g--,c&lt;=h&amp;&amp;h--)}),this},has:function(a){return p.inArray(a,i)&gt;-1},empty:function(){return i=[],this},disable:function(){return i=j=c=b,this},disabled:function(){return!i},lock:function(){return j=b,c||l.disable(),this},locked:function(){return!j},fireWith:function(a,b){return b=b||[],b=[a,b.slice?b.slice():b],i&amp;&amp;(!d||j)&amp;&amp;(e?j.push(b):k(b)),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!d}};return l},p.extend({Deferred:function(a){var b=[[&quot;resolve&quot;,&quot;done&quot;,p.Callbacks(&quot;once memory&quot;),&quot;resolved&quot;],[&quot;reject&quot;,&quot;fail&quot;,p.Callbacks(&quot;once memory&quot;),&quot;rejected&quot;],[&quot;notify&quot;,&quot;progress&quot;,p.Callbacks(&quot;memory&quot;)]],c=&quot;pending&quot;,d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return p.Deferred(function(c){p.each(b,function(b,d){var f=d[0],g=a[b];e[d[1]](p.isFunction(g)?function(){var a=g.apply(this,arguments);a&amp;&amp;p.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f+&quot;With&quot;](this===e?c:this,[a])}:c[f])}),a=null}).promise()},promise:function(a){return a!=null?p.extend(a,d):d}},e={};return d.pipe=d.then,p.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&amp;&amp;g.add(function(){c=h},b[a^1][2].disable,b[2][2].lock),e[f[0]]=g.fire,e[f[0]+&quot;With&quot;]=g.fireWith}),d.promise(e),a&amp;&amp;a.call(e,e),e},when:function(a){var b=0,c=k.call(arguments),d=c.length,e=d!==1||a&amp;&amp;p.isFunction(a.promise)?d:0,f=e===1?a:p.Deferred(),g=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length&gt;1?k.call(arguments):d,c===h?f.notifyWith(b,c):--e||f.resolveWith(b,c)}},h,i,j;if(d&gt;1){h=new Array(d),i=new Array(d),j=new Array(d);for(;b&lt;d;b++)c[b]&amp;&amp;p.isFunction(c[b].promise)?c[b].promise().done(g(b,j,c)).fail(f.reject).progress(g(b,i,h)):--e}return e||f.resolveWith(j,c),f.promise()}}),p.support=function(){var b,c,d,f,g,h,i,j,k,l,m,n=e.createElement(&quot;div&quot;);n.setAttribute(&quot;className&quot;,&quot;t&quot;),n.innerHTML=&quot;  &lt;link&#x2F;&gt;&lt;table&gt;&lt;&#x2F;table&gt;&lt;a href=&#x27;&#x2F;a&#x27;&gt;a&lt;&#x2F;a&gt;&lt;input type=&#x27;checkbox&#x27;&#x2F;&gt;&quot;,c=n.getElementsByTagName(&quot;*&quot;),d=n.getElementsByTagName(&quot;a&quot;)[0],d.style.cssText=&quot;top:1px;float:left;opacity:.5&quot;;if(!c||!c.length)return{};f=e.createElement(&quot;select&quot;),g=f.appendChild(e.createElement(&quot;option&quot;)),h=n.getElementsByTagName(&quot;input&quot;)[0],b={leadingWhitespace:n.firstChild.nodeType===3,tbody:!n.getElementsByTagName(&quot;tbody&quot;).length,htmlSerialize:!!n.getElementsByTagName(&quot;link&quot;).length,style:&#x2F;top&#x2F;.test(d.getAttribute(&quot;style&quot;)),hrefNormalized:d.getAttribute(&quot;href&quot;)===&quot;&#x2F;a&quot;,opacity:&#x2F;^0.5&#x2F;.test(d.style.opacity),cssFloat:!!d.style.cssFloat,checkOn:h.value===&quot;on&quot;,optSelected:g.selected,getSetAttribute:n.className!==&quot;t&quot;,enctype:!!e.createElement(&quot;form&quot;).enctype,html5Clone:e.createElement(&quot;nav&quot;).cloneNode(!0).outerHTML!==&quot;&lt;:nav&gt;&lt;&#x2F;:nav&gt;&quot;,boxModel:e.compatMode===&quot;CSS1Compat&quot;,submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},h.checked=!0,b.noCloneChecked=h.cloneNode(!0).checked,f.disabled=!0,b.optDisabled=!g.disabled;try{delete n.test}catch(o){b.deleteExpando=!1}!n.addEventListener&amp;&amp;n.attachEvent&amp;&amp;n.fireEvent&amp;&amp;(n.attachEvent(&quot;onclick&quot;,m=function(){b.noCloneEvent=!1}),n.cloneNode(!0).fireEvent(&quot;onclick&quot;),n.detachEvent(&quot;onclick&quot;,m)),h=e.createElement(&quot;input&quot;),h.value=&quot;t&quot;,h.setAttribute(&quot;type&quot;,&quot;radio&quot;),b.radioValue=h.value===&quot;t&quot;,h.setAttribute(&quot;checked&quot;,&quot;checked&quot;),h.setAttribute(&quot;name&quot;,&quot;t&quot;),n.appendChild(h),i=e.createDocumentFragment(),i.appendChild(n.lastChild),b.checkClone=i.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=h.checked,i.removeChild(h),i.appendChild(n);if(n.attachEvent)for(k in{submit:!0,change:!0,focusin:!0})j=&quot;on&quot;+k,l=j in n,l||(n.setAttribute(j,&quot;return;&quot;),l=typeof n[j]==&quot;function&quot;),b[k+&quot;Bubbles&quot;]=l;return p(function(){var c,d,f,g,h=&quot;padding:0;margin:0;border:0;display:block;overflow:hidden;&quot;,i=e.getElementsByTagName(&quot;body&quot;)[0];if(!i)return;c=e.createElement(&quot;div&quot;),c.style.cssText=&quot;visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px&quot;,i.insertBefore(c,i.firstChild),d=e.createElement(&quot;div&quot;),c.appendChild(d),d.innerHTML=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;&lt;&#x2F;td&gt;&lt;td&gt;t&lt;&#x2F;td&gt;&lt;&#x2F;tr&gt;&lt;&#x2F;table&gt;&quot;,f=d.getElementsByTagName(&quot;td&quot;),f[0].style.cssText=&quot;padding:0;margin:0;border:0;display:none&quot;,l=f[0].offsetHeight===0,f[0].style.display=&quot;&quot;,f[1].style.display=&quot;none&quot;,b.reliableHiddenOffsets=l&amp;&amp;f[0].offsetHeight===0,d.innerHTML=&quot;&quot;,d.style.cssText=&quot;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;&quot;,b.boxSizing=d.offsetWidth===4,b.doesNotIncludeMarginInBodyOffset=i.offsetTop!==1,a.getComputedStyle&amp;&amp;(b.pixelPosition=(a.getComputedStyle(d,null)||{}).top!==&quot;1%&quot;,b.boxSizingReliable=(a.getComputedStyle(d,null)||{width:&quot;4px&quot;}).width===&quot;4px&quot;,g=e.createElement(&quot;div&quot;),g.style.cssText=d.style.cssText=h,g.style.marginRight=g.style.width=&quot;0&quot;,d.style.width=&quot;1px&quot;,d.appendChild(g),b.reliableMarginRight=!parseFloat((a.getComputedStyle(g,null)||{}).marginRight)),typeof d.style.zoom!=&quot;undefined&quot;&amp;&amp;(d.innerHTML=&quot;&quot;,d.style.cssText=h+&quot;width:1px;padding:1px;display:inline;zoom:1&quot;,b.inlineBlockNeedsLayout=d.offsetWidth===3,d.style.display=&quot;block&quot;,d.style.overflow=&quot;visible&quot;,d.innerHTML=&quot;&lt;div&gt;&lt;&#x2F;div&gt;&quot;,d.firstChild.style.width=&quot;5px&quot;,b.shrinkWrapBlocks=d.offsetWidth!==3,c.style.zoom=1),i.removeChild(c),c=d=f=g=null}),i.removeChild(n),c=d=f=g=h=i=n=null,b}();var H=&#x2F;(?:\\{[\\s\\S]*\\}|\\[[\\s\\S]*\\])$&#x2F;,I=&#x2F;([A-Z])&#x2F;g;p.extend({cache:{},deletedIds:[],uuid:0,expando:&quot;jQuery&quot;+(p.fn.jquery+Math.random()).replace(&#x2F;\\D&#x2F;g,&quot;&quot;),noData:{embed:!0,object:&quot;clsid:D27CDB6E-AE6D-11cf-96B8-444553540000&quot;,applet:!0},hasData:function(a){return a=a.nodeType?p.cache[a[p.expando]]:a[p.expando],!!a&amp;&amp;!K(a)},data:function(a,c,d,e){if(!p.acceptData(a))return;var f,g,h=p.expando,i=typeof c==&quot;string&quot;,j=a.nodeType,k=j?p.cache:a,l=j?a[h]:a[h]&amp;&amp;h;if((!l||!k[l]||!e&amp;&amp;!k[l].data)&amp;&amp;i&amp;&amp;d===b)return;l||(j?a[h]=l=p.deletedIds.pop()||p.guid++:l=h),k[l]||(k[l]={},j||(k[l].toJSON=p.noop));if(typeof c==&quot;object&quot;||typeof c==&quot;function&quot;)e?k[l]=p.extend(k[l],c):k[l].data=p.extend(k[l].data,c);return f=k[l],e||(f.data||(f.data={}),f=f.data),d!==b&amp;&amp;(f[p.camelCase(c)]=d),i?(g=f[c],g==null&amp;&amp;(g=f[p.camelCase(c)])):g=f,g},removeData:function(a,b,c){if(!p.acceptData(a))return;var d,e,f,g=a.nodeType,h=g?p.cache:a,i=g?a[p.expando]:p.expando;if(!h[i])return;if(b){d=c?h[i]:h[i].data;if(d){p.isArray(b)||(b in d?b=[b]:(b=p.camelCase(b),b in d?b=[b]:b=b.split(&quot; &quot;)));for(e=0,f=b.length;e&lt;f;e++)delete d[b[e]];if(!(c?K:p.isEmptyObject)(d))return}}if(!c){delete h[i].data;if(!K(h[i]))return}g?p.cleanData([a],!0):p.support.deleteExpando||h!=h.window?delete h[i]:h[i]=null},_data:function(a,b,c){return p.data(a,b,c,!0)},acceptData:function(a){var b=a.nodeName&amp;&amp;p.noData[a.nodeName.toLowerCase()];return!b||b!==!0&amp;&amp;a.getAttribute(&quot;classid&quot;)===b}}),p.fn.extend({data:function(a,c){var d,e,f,g,h,i=this[0],j=0,k=null;if(a===b){if(this.length){k=p.data(i);if(i.nodeType===1&amp;&amp;!p._data(i,&quot;parsedAttrs&quot;)){f=i.attributes;for(h=f.length;j&lt;h;j++)g=f[j].name,g.indexOf(&quot;data-&quot;)||(g=p.camelCase(g.substring(5)),J(i,g,k[g]));p._data(i,&quot;parsedAttrs&quot;,!0)}}return k}return typeof a==&quot;object&quot;?this.each(function(){p.data(this,a)}):(d=a.split(&quot;.&quot;,2),d[1]=d[1]?&quot;.&quot;+d[1]:&quot;&quot;,e=d[1]+&quot;!&quot;,p.access(this,function(c){if(c===b)return k=this.triggerHandler(&quot;getData&quot;+e,[d[0]]),k===b&amp;&amp;i&amp;&amp;(k=p.data(i,a),k=J(i,a,k)),k===b&amp;&amp;d[1]?this.data(d[0]):k;d[1]=c,this.each(function(){var b=p(this);b.triggerHandler(&quot;setData&quot;+e,d),p.data(this,a,c),b.triggerHandler(&quot;changeData&quot;+e,d)})},null,c,arguments.length&gt;1,null,!1))},removeData:function(a){return this.each(function(){p.removeData(this,a)})}}),p.extend({queue:function(a,b,c){var d;if(a)return b=(b||&quot;fx&quot;)+&quot;queue&quot;,d=p._data(a,b),c&amp;&amp;(!d||p.isArray(c)?d=p._data(a,b,p.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||&quot;fx&quot;;var c=p.queue(a,b),d=c.length,e=c.shift(),f=p._queueHooks(a,b),g=function(){p.dequeue(a,b)};e===&quot;inprogress&quot;&amp;&amp;(e=c.shift(),d--),e&amp;&amp;(b===&quot;fx&quot;&amp;&amp;c.unshift(&quot;inprogress&quot;),delete f.stop,e.call(a,g,f)),!d&amp;&amp;f&amp;&amp;f.empty.fire()},_queueHooks:function(a,b){var c=b+&quot;queueHooks&quot;;return p._data(a,c)||p._data(a,c,{empty:p.Callbacks(&quot;once memory&quot;).add(function(){p.removeData(a,b+&quot;queue&quot;,!0),p.removeData(a,c,!0)})})}}),p.fn.extend({queue:function(a,c){var d=2;return typeof a!=&quot;string&quot;&amp;&amp;(c=a,a=&quot;fx&quot;,d--),arguments.length&lt;d?p.queue(this[0],a):c===b?this:this.each(function(){var b=p.queue(this,a,c);p._queueHooks(this,a),a===&quot;fx&quot;&amp;&amp;b[0]!==&quot;inprogress&quot;&amp;&amp;p.dequeue(this,a)})},dequeue:function(a){return this.each(function(){p.dequeue(this,a)})},delay:function(a,b){return a=p.fx?p.fx.speeds[a]||a:a,b=b||&quot;fx&quot;,this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||&quot;fx&quot;,[])},promise:function(a,c){var d,e=1,f=p.Deferred(),g=this,h=this.length,i=function(){--e||f.resolveWith(g,[g])};typeof a!=&quot;string&quot;&amp;&amp;(c=a,a=b),a=a||&quot;fx&quot;;while(h--)d=p._data(g[h],a+&quot;queueHooks&quot;),d&amp;&amp;d.empty&amp;&amp;(e++,d.empty.add(i));return i(),f.promise(c)}});var L,M,N,O=&#x2F;[\\t\\r\\n]&#x2F;g,P=&#x2F;\\r&#x2F;g,Q=&#x2F;^(?:button|input)$&#x2F;i,R=&#x2F;^(?:button|input|object|select|textarea)$&#x2F;i,S=&#x2F;^a(?:rea|)$&#x2F;i,T=&#x2F;^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$&#x2F;i,U=p.support.getSetAttribute;p.fn.extend({attr:function(a,b){return p.access(this,p.attr,a,b,arguments.length&gt;1)},removeAttr:function(a){return this.each(function(){p.removeAttr(this,a)})},prop:function(a,b){return p.access(this,p.prop,a,b,arguments.length&gt;1)},removeProp:function(a){return a=p.propFix[a]||a,this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,f,g,h;if(p.isFunction(a))return this.each(function(b){p(this).addClass(a.call(this,b,this.className))});if(a&amp;&amp;typeof a==&quot;string&quot;){b=a.split(s);for(c=0,d=this.length;c&lt;d;c++){e=this[c];if(e.nodeType===1)if(!e.className&amp;&amp;b.length===1)e.className=a;else{f=&quot; &quot;+e.className+&quot; &quot;;for(g=0,h=b.length;g&lt;h;g++)f.indexOf(&quot; &quot;+b[g]+&quot; &quot;)&lt;0&amp;&amp;(f+=b[g]+&quot; &quot;);e.className=p.trim(f)}}}return this},removeClass:function(a){var c,d,e,f,g,h,i;if(p.isFunction(a))return this.each(function(b){p(this).removeClass(a.call(this,b,this.className))});if(a&amp;&amp;typeof a==&quot;string&quot;||a===b){c=(a||&quot;&quot;).split(s);for(h=0,i=this.length;h&lt;i;h++){e=this[h];if(e.nodeType===1&amp;&amp;e.className){d=(&quot; &quot;+e.className+&quot; &quot;).replace(O,&quot; &quot;);for(f=0,g=c.length;f&lt;g;f++)while(d.indexOf(&quot; &quot;+c[f]+&quot; &quot;)&gt;=0)d=d.replace(&quot; &quot;+c[f]+&quot; &quot;,&quot; &quot;);e.className=a?p.trim(d):&quot;&quot;}}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b==&quot;boolean&quot;;return p.isFunction(a)?this.each(function(c){p(this).toggleClass(a.call(this,c,this.className,b),b)}):this.each(function(){if(c===&quot;string&quot;){var e,f=0,g=p(this),h=b,i=a.split(s);while(e=i[f++])h=d?h:!g.hasClass(e),g[h?&quot;addClass&quot;:&quot;removeClass&quot;](e)}else if(c===&quot;undefined&quot;||c===&quot;boolean&quot;)this.className&amp;&amp;p._data(this,&quot;__className__&quot;,this.className),this.className=this.className||a===!1?&quot;&quot;:p._data(this,&quot;__className__&quot;)||&quot;&quot;})},hasClass:function(a){var b=&quot; &quot;+a+&quot; &quot;,c=0,d=this.length;for(;c&lt;d;c++)if(this[c].nodeType===1&amp;&amp;(&quot; &quot;+this[c].className+&quot; &quot;).replace(O,&quot; &quot;).indexOf(b)&gt;=0)return!0;return!1},val:function(a){var c,d,e,f=this[0];if(!arguments.length){if(f)return c=p.valHooks[f.type]||p.valHooks[f.nodeName.toLowerCase()],c&amp;&amp;&quot;get&quot;in c&amp;&amp;(d=c.get(f,&quot;value&quot;))!==b?d:(d=f.value,typeof d==&quot;string&quot;?d.replace(P,&quot;&quot;):d==null?&quot;&quot;:d);return}return e=p.isFunction(a),this.each(function(d){var f,g=p(this);if(this.nodeType!==1)return;e?f=a.call(this,d,g.val()):f=a,f==null?f=&quot;&quot;:typeof f==&quot;number&quot;?f+=&quot;&quot;:p.isArray(f)&amp;&amp;(f=p.map(f,function(a){return a==null?&quot;&quot;:a+&quot;&quot;})),c=p.valHooks[this.type]||p.valHooks[this.nodeName.toLowerCase()];if(!c||!(&quot;set&quot;in c)||c.set(this,f,&quot;value&quot;)===b)this.value=f})}}),p.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,f=a.selectedIndex,g=[],h=a.options,i=a.type===&quot;select-one&quot;;if(f&lt;0)return null;c=i?f:0,d=i?f+1:h.length;for(;c&lt;d;c++){e=h[c];if(e.selected&amp;&amp;(p.support.optDisabled?!e.disabled:e.getAttribute(&quot;disabled&quot;)===null)&amp;&amp;(!e.parentNode.disabled||!p.nodeName(e.parentNode,&quot;optgroup&quot;))){b=p(e).val();if(i)return b;g.push(b)}}return i&amp;&amp;!g.length&amp;&amp;h.length?p(h[f]).val():g},set:function(a,b){var c=p.makeArray(b);return p(a).find(&quot;option&quot;).each(function(){this.selected=p.inArray(p(this).val(),c)&gt;=0}),c.length||(a.selectedIndex=-1),c}}},attrFn:{},attr:function(a,c,d,e){var f,g,h,i=a.nodeType;if(!a||i===3||i===8||i===2)return;if(e&amp;&amp;p.isFunction(p.fn[c]))return p(a)[c](d);if(typeof a.getAttribute==&quot;undefined&quot;)return p.prop(a,c,d);h=i!==1||!p.isXMLDoc(a),h&amp;&amp;(c=c.toLowerCase(),g=p.attrHooks[c]||(T.test(c)?M:L));if(d!==b){if(d===null){p.removeAttr(a,c);return}return g&amp;&amp;&quot;set&quot;in g&amp;&amp;h&amp;&amp;(f=g.set(a,d,c))!==b?f:(a.setAttribute(c,d+&quot;&quot;),d)}return g&amp;&amp;&quot;get&quot;in g&amp;&amp;h&amp;&amp;(f=g.get(a,c))!==null?f:(f=a.getAttribute(c),f===null?b:f)},removeAttr:function(a,b){var c,d,e,f,g=0;if(b&amp;&amp;a.nodeType===1){d=b.split(s);for(;g&lt;d.length;g++)e=d[g],e&amp;&amp;(c=p.propFix[e]||e,f=T.test(e),f||p.attr(a,e,&quot;&quot;),a.removeAttribute(U?e:c),f&amp;&amp;c in a&amp;&amp;(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(Q.test(a.nodeName)&amp;&amp;a.parentNode)p.error(&quot;type property can&#x27;t be changed&quot;);else if(!p.support.radioValue&amp;&amp;b===&quot;radio&quot;&amp;&amp;p.nodeName(a,&quot;input&quot;)){var c=a.value;return a.setAttribute(&quot;type&quot;,b),c&amp;&amp;(a.value=c),b}}},value:{get:function(a,b){return L&amp;&amp;p.nodeName(a,&quot;button&quot;)?L.get(a,b):b in a?a.value:null},set:function(a,b,c){if(L&amp;&amp;p.nodeName(a,&quot;button&quot;))return L.set(a,b,c);a.value=b}}},propFix:{tabindex:&quot;tabIndex&quot;,readonly:&quot;readOnly&quot;,&quot;for&quot;:&quot;htmlFor&quot;,&quot;class&quot;:&quot;className&quot;,maxlength:&quot;maxLength&quot;,cellspacing:&quot;cellSpacing&quot;,cellpadding:&quot;cellPadding&quot;,rowspan:&quot;rowSpan&quot;,colspan:&quot;colSpan&quot;,usemap:&quot;useMap&quot;,frameborder:&quot;frameBorder&quot;,contenteditable:&quot;contentEditable&quot;},prop:function(a,c,d){var e,f,g,h=a.nodeType;if(!a||h===3||h===8||h===2)return;return g=h!==1||!p.isXMLDoc(a),g&amp;&amp;(c=p.propFix[c]||c,f=p.propHooks[c]),d!==b?f&amp;&amp;&quot;set&quot;in f&amp;&amp;(e=f.set(a,d,c))!==b?e:a[c]=d:f&amp;&amp;&quot;get&quot;in f&amp;&amp;(e=f.get(a,c))!==null?e:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode(&quot;tabindex&quot;);return c&amp;&amp;c.specified?parseInt(c.value,10):R.test(a.nodeName)||S.test(a.nodeName)&amp;&amp;a.href?0:b}}}}),M={get:function(a,c){var d,e=p.prop(a,c);return e===!0||typeof e!=&quot;boolean&quot;&amp;&amp;(d=a.getAttributeNode(c))&amp;&amp;d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;return b===!1?p.removeAttr(a,c):(d=p.propFix[c]||c,d in a&amp;&amp;(a[d]=!0),a.setAttribute(c,c.toLowerCase())),c}},U||(N={name:!0,id:!0,coords:!0},L=p.valHooks.button={get:function(a,c){var d;return d=a.getAttributeNode(c),d&amp;&amp;(N[c]?d.value!==&quot;&quot;:d.specified)?d.value:b},set:function(a,b,c){var d=a.getAttributeNode(c);return d||(d=e.createAttribute(c),a.setAttributeNode(d)),d.value=b+&quot;&quot;}},p.each([&quot;width&quot;,&quot;height&quot;],function(a,b){p.attrHooks[b]=p.extend(p.attrHooks[b],{set:function(a,c){if(c===&quot;&quot;)return a.setAttribute(b,&quot;auto&quot;),c}})}),p.attrHooks.contenteditable={get:L.get,set:function(a,b,c){b===&quot;&quot;&amp;&amp;(b=&quot;false&quot;),L.set(a,b,c)}}),p.support.hrefNormalized||p.each([&quot;href&quot;,&quot;src&quot;,&quot;width&quot;,&quot;height&quot;],function(a,c){p.attrHooks[c]=p.extend(p.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),p.support.style||(p.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=b+&quot;&quot;}}),p.support.optSelected||(p.propHooks.selected=p.extend(p.propHooks.selected,{get:function(a){var b=a.parentNode;return b&amp;&amp;(b.selectedIndex,b.parentNode&amp;&amp;b.parentNode.selectedIndex),null}})),p.support.enctype||(p.propFix.enctype=&quot;encoding&quot;),p.support.checkOn||p.each([&quot;radio&quot;,&quot;checkbox&quot;],function(){p.valHooks[this]={get:function(a){return a.getAttribute(&quot;value&quot;)===null?&quot;on&quot;:a.value}}}),p.each([&quot;radio&quot;,&quot;checkbox&quot;],function(){p.valHooks[this]=p.extend(p.valHooks[this],{set:function(a,b){if(p.isArray(b))return a.checked=p.inArray(p(a).val(),b)&gt;=0}})});var V=&#x2F;^(?:textarea|input|select)$&#x2F;i,W=&#x2F;^([^\\.]*|)(?:\\.(.+)|)$&#x2F;,X=&#x2F;(?:^|\\s)hover(\\.\\S+|)\\b&#x2F;,Y=&#x2F;^key&#x2F;,Z=&#x2F;^(?:mouse|contextmenu)|click&#x2F;,$=&#x2F;^(?:focusinfocus|focusoutblur)$&#x2F;,_=function(a){return p.event.special.hover?a:a.replace(X,&quot;mouseenter$1 mouseleave$1&quot;)};p.event={add:function(a,c,d,e,f){var g,h,i,j,k,l,m,n,o,q,r;if(a.nodeType===3||a.nodeType===8||!c||!d||!(g=p._data(a)))return;d.handler&amp;&amp;(o=d,d=o.handler,f=o.selector),d.guid||(d.guid=p.guid++),i=g.events,i||(g.events=i={}),h=g.handle,h||(g.handle=h=function(a){return typeof p!=&quot;undefined&quot;&amp;&amp;(!a||p.event.triggered!==a.type)?p.event.dispatch.apply(h.elem,arguments):b},h.elem=a),c=p.trim(_(c)).split(&quot; &quot;);for(j=0;j&lt;c.length;j++){k=W.exec(c[j])||[],l=k[1],m=(k[2]||&quot;&quot;).split(&quot;.&quot;).sort(),r=p.event.special[l]||{},l=(f?r.delegateType:r.bindType)||l,r=p.event.special[l]||{},n=p.extend({type:l,origType:k[1],data:e,handler:d,guid:d.guid,selector:f,needsContext:f&amp;&amp;p.expr.match.needsContext.test(f),namespace:m.join(&quot;.&quot;)},o),q=i[l];if(!q){q=i[l]=[],q.delegateCount=0;if(!r.setup||r.setup.call(a,e,m,h)===!1)a.addEventListener?a.addEventListener(l,h,!1):a.attachEvent&amp;&amp;a.attachEvent(&quot;on&quot;+l,h)}r.add&amp;&amp;(r.add.call(a,n),n.handler.guid||(n.handler.guid=d.guid)),f?q.splice(q.delegateCount++,0,n):q.push(n),p.event.global[l]=!0}a=null},global:{},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,q,r=p.hasData(a)&amp;&amp;p._data(a);if(!r||!(m=r.events))return;b=p.trim(_(b||&quot;&quot;)).split(&quot; &quot;);for(f=0;f&lt;b.length;f++){g=W.exec(b[f])||[],h=i=g[1],j=g[2];if(!h){for(h in m)p.event.remove(a,h+b[f],c,d,!0);continue}n=p.event.special[h]||{},h=(d?n.delegateType:n.bindType)||h,o=m[h]||[],k=o.length,j=j?new RegExp(&quot;(^|\\\\.)&quot;+j.split(&quot;.&quot;).sort().join(&quot;\\\\.(?:.*\\\\.|)&quot;)+&quot;(\\\\.|$)&quot;):null;for(l=0;l&lt;o.length;l++)q=o[l],(e||i===q.origType)&amp;&amp;(!c||c.guid===q.guid)&amp;&amp;(!j||j.test(q.namespace))&amp;&amp;(!d||d===q.selector||d===&quot;**&quot;&amp;&amp;q.selector)&amp;&amp;(o.splice(l--,1),q.selector&amp;&amp;o.delegateCount--,n.remove&amp;&amp;n.remove.call(a,q));o.length===0&amp;&amp;k!==o.length&amp;&amp;((!n.teardown||n.teardown.call(a,j,r.handle)===!1)&amp;&amp;p.removeEvent(a,h,r.handle),delete m[h])}p.isEmptyObject(m)&amp;&amp;(delete r.handle,p.removeData(a,&quot;events&quot;,!0))},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,f,g){if(!f||f.nodeType!==3&amp;&amp;f.nodeType!==8){var h,i,j,k,l,m,n,o,q,r,s=c.type||c,t=[];if($.test(s+p.event.triggered))return;s.indexOf(&quot;!&quot;)&gt;=0&amp;&amp;(s=s.slice(0,-1),i=!0),s.indexOf(&quot;.&quot;)&gt;=0&amp;&amp;(t=s.split(&quot;.&quot;),s=t.shift(),t.sort());if((!f||p.event.customEvent[s])&amp;&amp;!p.event.global[s])return;c=typeof c==&quot;object&quot;?c[p.expando]?c:new p.Event(s,c):new p.Event(s),c.type=s,c.isTrigger=!0,c.exclusive=i,c.namespace=t.join(&quot;.&quot;),c.namespace_re=c.namespace?new RegExp(&quot;(^|\\\\.)&quot;+t.join(&quot;\\\\.(?:.*\\\\.|)&quot;)+&quot;(\\\\.|$)&quot;):null,m=s.indexOf(&quot;:&quot;)&lt;0?&quot;on&quot;+s:&quot;&quot;;if(!f){h=p.cache;for(j in h)h[j].events&amp;&amp;h[j].events[s]&amp;&amp;p.event.trigger(c,d,h[j].handle.elem,!0);return}c.result=b,c.target||(c.target=f),d=d!=null?p.makeArray(d):[],d.unshift(c),n=p.event.special[s]||{};if(n.trigger&amp;&amp;n.trigger.apply(f,d)===!1)return;q=[[f,n.bindType||s]];if(!g&amp;&amp;!n.noBubble&amp;&amp;!p.isWindow(f)){r=n.delegateType||s,k=$.test(r+s)?f:f.parentNode;for(l=f;k;k=k.parentNode)q.push([k,r]),l=k;l===(f.ownerDocument||e)&amp;&amp;q.push([l.defaultView||l.parentWindow||a,r])}for(j=0;j&lt;q.length&amp;&amp;!c.isPropagationStopped();j++)k=q[j][0],c.type=q[j][1],o=(p._data(k,&quot;events&quot;)||{})[c.type]&amp;&amp;p._data(k,&quot;handle&quot;),o&amp;&amp;o.apply(k,d),o=m&amp;&amp;k[m],o&amp;&amp;p.acceptData(k)&amp;&amp;o.apply&amp;&amp;o.apply(k,d)===!1&amp;&amp;c.preventDefault();return c.type=s,!g&amp;&amp;!c.isDefaultPrevented()&amp;&amp;(!n._default||n._default.apply(f.ownerDocument,d)===!1)&amp;&amp;(s!==&quot;click&quot;||!p.nodeName(f,&quot;a&quot;))&amp;&amp;p.acceptData(f)&amp;&amp;m&amp;&amp;f[s]&amp;&amp;(s!==&quot;focus&quot;&amp;&amp;s!==&quot;blur&quot;||c.target.offsetWidth!==0)&amp;&amp;!p.isWindow(f)&amp;&amp;(l=f[m],l&amp;&amp;(f[m]=null),p.event.triggered=s,f[s](),p.event.triggered=b,l&amp;&amp;(f[m]=l)),c.result}return},dispatch:function(c){c=p.event.fix(c||a.event);var d,e,f,g,h,i,j,l,m,n,o=(p._data(this,&quot;events&quot;)||{})[c.type]||[],q=o.delegateCount,r=k.call(arguments),s=!c.exclusive&amp;&amp;!c.namespace,t=p.event.special[c.type]||{},u=[];r[0]=c,c.delegateTarget=this;if(t.preDispatch&amp;&amp;t.preDispatch.call(this,c)===!1)return;if(q&amp;&amp;(!c.button||c.type!==&quot;click&quot;))for(f=c.target;f!=this;f=f.parentNode||this)if(f.disabled!==!0||c.type!==&quot;click&quot;){h={},j=[];for(d=0;d&lt;q;d++)l=o[d],m=l.selector,h[m]===b&amp;&amp;(h[m]=l.needsContext?p(m,this).index(f)&gt;=0:p.find(m,this,null,[f]).length),h[m]&amp;&amp;j.push(l);j.length&amp;&amp;u.push({elem:f,matches:j})}o.length&gt;q&amp;&amp;u.push({elem:this,matches:o.slice(q)});for(d=0;d&lt;u.length&amp;&amp;!c.isPropagationStopped();d++){i=u[d],c.currentTarget=i.elem;for(e=0;e&lt;i.matches.length&amp;&amp;!c.isImmediatePropagationStopped();e++){l=i.matches[e];if(s||!c.namespace&amp;&amp;!l.namespace||c.namespace_re&amp;&amp;c.namespace_re.test(l.namespace))c.data=l.data,c.handleObj=l,g=((p.event.special[l.origType]||{}).handle||l.handler).apply(i.elem,r),g!==b&amp;&amp;(c.result=g,g===!1&amp;&amp;(c.preventDefault(),c.stopPropagation()))}}return t.postDispatch&amp;&amp;t.postDispatch.call(this,c),c.result},props:&quot;attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which&quot;.split(&quot; &quot;),fixHooks:{},keyHooks:{props:&quot;char charCode key keyCode&quot;.split(&quot; &quot;),filter:function(a,b){return a.which==null&amp;&amp;(a.which=b.charCode!=null?b.charCode:b.keyCode),a}},mouseHooks:{props:&quot;button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement&quot;.split(&quot; &quot;),filter:function(a,c){var d,f,g,h=c.button,i=c.fromElement;return a.pageX==null&amp;&amp;c.clientX!=null&amp;&amp;(d=a.target.ownerDocument||e,f=d.documentElement,g=d.body,a.pageX=c.clientX+(f&amp;&amp;f.scrollLeft||g&amp;&amp;g.scrollLeft||0)-(f&amp;&amp;f.clientLeft||g&amp;&amp;g.clientLeft||0),a.pageY=c.clientY+(f&amp;&amp;f.scrollTop||g&amp;&amp;g.scrollTop||0)-(f&amp;&amp;f.clientTop||g&amp;&amp;g.clientTop||0)),!a.relatedTarget&amp;&amp;i&amp;&amp;(a.relatedTarget=i===a.target?c.toElement:i),!a.which&amp;&amp;h!==b&amp;&amp;(a.which=h&amp;1?1:h&amp;2?3:h&amp;4?2:0),a}},fix:function(a){if(a[p.expando])return a;var b,c,d=a,f=p.event.fixHooks[a.type]||{},g=f.props?this.props.concat(f.props):this.props;a=p.Event(d);for(b=g.length;b;)c=g[--b],a[c]=d[c];return a.target||(a.target=d.srcElement||e),a.target.nodeType===3&amp;&amp;(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,f.filter?f.filter(a,d):a},special:{load:{noBubble:!0},focus:{delegateType:&quot;focusin&quot;},blur:{delegateType:&quot;focusout&quot;},beforeunload:{setup:function(a,b,c){p.isWindow(this)&amp;&amp;(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&amp;&amp;(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=p.extend(new p.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?p.event.trigger(e,null,b):p.event.dispatch.call(b,e),e.isDefaultPrevented()&amp;&amp;c.preventDefault()}},p.event.handle=p.event.dispatch,p.removeEvent=e.removeEventListener?function(a,b,c){a.removeEventListener&amp;&amp;a.removeEventListener(b,c,!1)}:function(a,b,c){var d=&quot;on&quot;+b;a.detachEvent&amp;&amp;(typeof a[d]==&quot;undefined&quot;&amp;&amp;(a[d]=null),a.detachEvent(d,c))},p.Event=function(a,b){if(this instanceof p.Event)a&amp;&amp;a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&amp;&amp;a.getPreventDefault()?bb:ba):this.type=a,b&amp;&amp;p.extend(this,b),this.timeStamp=a&amp;&amp;a.timeStamp||p.now(),this[p.expando]=!0;else return new p.Event(a,b)},p.Event.prototype={preventDefault:function(){this.isDefaultPrevented=bb;var a=this.originalEvent;if(!a)return;a.preventDefault?a.preventDefault():a.returnValue=!1},stopPropagation:function(){this.isPropagationStopped=bb;var a=this.originalEvent;if(!a)return;a.stopPropagation&amp;&amp;a.stopPropagation(),a.cancelBubble=!0},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=bb,this.stopPropagation()},isDefaultPrevented:ba,isPropagationStopped:ba,isImmediatePropagationStopped:ba},p.each({mouseenter:&quot;mouseover&quot;,mouseleave:&quot;mouseout&quot;},function(a,b){p.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj,g=f.selector;if(!e||e!==d&amp;&amp;!p.contains(d,e))a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b;return c}}}),p.support.submitBubbles||(p.event.special.submit={setup:function(){if(p.nodeName(this,&quot;form&quot;))return!1;p.event.add(this,&quot;click._submit keypress._submit&quot;,function(a){var c=a.target,d=p.nodeName(c,&quot;input&quot;)||p.nodeName(c,&quot;button&quot;)?c.form:b;d&amp;&amp;!p._data(d,&quot;_submit_attached&quot;)&amp;&amp;(p.event.add(d,&quot;submit._submit&quot;,function(a){a._submit_bubble=!0}),p._data(d,&quot;_submit_attached&quot;,!0))})},postDispatch:function(a){a._submit_bubble&amp;&amp;(delete a._submit_bubble,this.parentNode&amp;&amp;!a.isTrigger&amp;&amp;p.event.simulate(&quot;submit&quot;,this.parentNode,a,!0))},teardown:function(){if(p.nodeName(this,&quot;form&quot;))return!1;p.event.remove(this,&quot;._submit&quot;)}}),p.support.changeBubbles||(p.event.special.change={setup:function(){if(V.test(this.nodeName)){if(this.type===&quot;checkbox&quot;||this.type===&quot;radio&quot;)p.event.add(this,&quot;propertychange._change&quot;,function(a){a.originalEvent.propertyName===&quot;checked&quot;&amp;&amp;(this._just_changed=!0)}),p.event.add(this,&quot;click._change&quot;,function(a){this._just_changed&amp;&amp;!a.isTrigger&amp;&amp;(this._just_changed=!1),p.event.simulate(&quot;change&quot;,this,a,!0)});return!1}p.event.add(this,&quot;beforeactivate._change&quot;,function(a){var b=a.target;V.test(b.nodeName)&amp;&amp;!p._data(b,&quot;_change_attached&quot;)&amp;&amp;(p.event.add(b,&quot;change._change&quot;,function(a){this.parentNode&amp;&amp;!a.isSimulated&amp;&amp;!a.isTrigger&amp;&amp;p.event.simulate(&quot;change&quot;,this.parentNode,a,!0)}),p._data(b,&quot;_change_attached&quot;,!0))})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!==&quot;radio&quot;&amp;&amp;b.type!==&quot;checkbox&quot;)return a.handleObj.handler.apply(this,arguments)},teardown:function(){return p.event.remove(this,&quot;._change&quot;),!V.test(this.nodeName)}}),p.support.focusinBubbles||p.each({focus:&quot;focusin&quot;,blur:&quot;focusout&quot;},function(a,b){var c=0,d=function(a){p.event.simulate(b,a.target,p.event.fix(a),!0)};p.event.special[b]={setup:function(){c++===0&amp;&amp;e.addEventListener(a,d,!0)},teardown:function(){--c===0&amp;&amp;e.removeEventListener(a,d,!0)}}}),p.fn.extend({on:function(a,c,d,e,f){var g,h;if(typeof a==&quot;object&quot;){typeof c!=&quot;string&quot;&amp;&amp;(d=d||c,c=b);for(h in a)this.on(h,c,d,a[h],f);return this}d==null&amp;&amp;e==null?(e=c,d=c=b):e==null&amp;&amp;(typeof c==&quot;string&quot;?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=ba;else if(!e)return this;return f===1&amp;&amp;(g=e,e=function(a){return p().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=p.guid++)),this.each(function(){p.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){var e,f;if(a&amp;&amp;a.preventDefault&amp;&amp;a.handleObj)return e=a.handleObj,p(a.delegateTarget).off(e.namespace?e.origType+&quot;.&quot;+e.namespace:e.origType,e.selector,e.handler),this;if(typeof a==&quot;object&quot;){for(f in a)this.off(f,c,a[f]);return this}if(c===!1||typeof c==&quot;function&quot;)d=c,c=b;return d===!1&amp;&amp;(d=ba),this.each(function(){p.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){return p(this.context).on(a,this.selector,b,c),this},die:function(a,b){return p(this.context).off(a,this.selector||&quot;**&quot;,b),this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length===1?this.off(a,&quot;**&quot;):this.off(b,a||&quot;**&quot;,c)},trigger:function(a,b){return this.each(function(){p.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return p.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||p.guid++,d=0,e=function(c){var e=(p._data(this,&quot;lastToggle&quot;+a.guid)||0)%d;return p._data(this,&quot;lastToggle&quot;+a.guid,e+1),c.preventDefault(),b[e].apply(this,arguments)||!1};e.guid=c;while(d&lt;b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),p.each(&quot;blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu&quot;.split(&quot; &quot;),function(a,b){p.fn[b]=function(a,c){return c==null&amp;&amp;(c=a,a=null),arguments.length&gt;0?this.on(b,null,a,c):this.trigger(b)},Y.test(b)&amp;&amp;(p.event.fixHooks[b]=p.event.keyHooks),Z.test(b)&amp;&amp;(p.event.fixHooks[b]=p.event.mouseHooks)}),function(a,b){function bc(a,b,c,d){c=c||[],b=b||r;var e,f,i,j,k=b.nodeType;if(!a||typeof a!=&quot;string&quot;)return c;if(k!==1&amp;&amp;k!==9)return[];i=g(b);if(!i&amp;&amp;!d)if(e=P.exec(a))if(j=e[1]){if(k===9){f=b.getElementById(j);if(!f||!f.parentNode)return c;if(f.id===j)return c.push(f),c}else if(b.ownerDocument&amp;&amp;(f=b.ownerDocument.getElementById(j))&amp;&amp;h(b,f)&amp;&amp;f.id===j)return c.push(f),c}else{if(e[2])return w.apply(c,x.call(b.getElementsByTagName(a),0)),c;if((j=e[3])&amp;&amp;_&amp;&amp;b.getElementsByClassName)return w.apply(c,x.call(b.getElementsByClassName(j),0)),c}return bp(a.replace(L,&quot;$1&quot;),b,c,d,i)}function bd(a){return function(b){var c=b.nodeName.toLowerCase();return c===&quot;input&quot;&amp;&amp;b.type===a}}function be(a){return function(b){var c=b.nodeName.toLowerCase();return(c===&quot;input&quot;||c===&quot;button&quot;)&amp;&amp;b.type===a}}function bf(a){return z(function(b){return b=+b,z(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&amp;&amp;(c[e]=!(d[e]=c[e]))})})}function bg(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}function bh(a,b){var c,d,f,g,h,i,j,k=C[o][a];if(k)return b?0:k.slice(0);h=a,i=[],j=e.preFilter;while(h){if(!c||(d=M.exec(h)))d&amp;&amp;(h=h.slice(d[0].length)),i.push(f=[]);c=!1;if(d=N.exec(h))f.push(c=new q(d.shift())),h=h.slice(c.length),c.type=d[0].replace(L,&quot; &quot;);for(g in e.filter)(d=W[g].exec(h))&amp;&amp;(!j[g]||(d=j[g](d,r,!0)))&amp;&amp;(f.push(c=new q(d.shift())),h=h.slice(c.length),c.type=g,c.matches=d);if(!c)break}return b?h.length:h?bc.error(a):C(a,i).slice(0)}function bi(a,b,d){var e=b.dir,f=d&amp;&amp;b.dir===&quot;parentNode&quot;,g=u++;return b.first?function(b,c,d){while(b=b[e])if(f||b.nodeType===1)return a(b,c,d)}:function(b,d,h){if(!h){var i,j=t+&quot; &quot;+g+&quot; &quot;,k=j+c;while(b=b[e])if(f||b.nodeType===1){if((i=b[o])===k)return b.sizset;if(typeof i==&quot;string&quot;&amp;&amp;i.indexOf(j)===0){if(b.sizset)return b}else{b[o]=k;if(a(b,d,h))return b.sizset=!0,b;b.sizset=!1}}}else while(b=b[e])if(f||b.nodeType===1)if(a(b,d,h))return b}}function bj(a){return a.length&gt;1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function bk(a,b,c,d,e){var f,g=[],h=0,i=a.length,j=b!=null;for(;h&lt;i;h++)if(f=a[h])if(!c||c(f,d,e))g.push(f),j&amp;&amp;b.push(h);return g}function bl(a,b,c,d,e,f){return d&amp;&amp;!d[o]&amp;&amp;(d=bl(d)),e&amp;&amp;!e[o]&amp;&amp;(e=bl(e,f)),z(function(f,g,h,i){if(f&amp;&amp;e)return;var j,k,l,m=[],n=[],o=g.length,p=f||bo(b||&quot;*&quot;,h.nodeType?[h]:h,[],f),q=a&amp;&amp;(f||!b)?bk(p,m,a,h,i):p,r=c?e||(f?a:o||d)?[]:g:q;c&amp;&amp;c(q,r,h,i);if(d){l=bk(r,n),d(l,[],h,i),j=l.length;while(j--)if(k=l[j])r[n[j]]=!(q[n[j]]=k)}if(f){j=a&amp;&amp;r.length;while(j--)if(k=r[j])f[m[j]]=!(g[m[j]]=k)}else r=bk(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):w.apply(g,r)})}function bm(a){var b,c,d,f=a.length,g=e.relative[a[0].type],h=g||e.relative[&quot; &quot;],i=g?1:0,j=bi(function(a){return a===b},h,!0),k=bi(function(a){return y.call(b,a)&gt;-1},h,!0),m=[function(a,c,d){return!g&amp;&amp;(d||c!==l)||((b=c).nodeType?j(a,c,d):k(a,c,d))}];for(;i&lt;f;i++)if(c=e.relative[a[i].type])m=[bi(bj(m),c)];else{c=e.filter[a[i].type].apply(null,a[i].matches);if(c[o]){d=++i;for(;d&lt;f;d++)if(e.relative[a[d].type])break;return bl(i&gt;1&amp;&amp;bj(m),i&gt;1&amp;&amp;a.slice(0,i-1).join(&quot;&quot;).replace(L,&quot;$1&quot;),c,i&lt;d&amp;&amp;bm(a.slice(i,d)),d&lt;f&amp;&amp;bm(a=a.slice(d)),d&lt;f&amp;&amp;a.join(&quot;&quot;))}m.push(c)}return bj(m)}function bn(a,b){var d=b.length&gt;0,f=a.length&gt;0,g=function(h,i,j,k,m){var n,o,p,q=[],s=0,u=&quot;0&quot;,x=h&amp;&amp;[],y=m!=null,z=l,A=h||f&amp;&amp;e.find.TAG(&quot;*&quot;,m&amp;&amp;i.parentNode||i),B=t+=z==null?1:Math.E;y&amp;&amp;(l=i!==r&amp;&amp;i,c=g.el);for(;(n=A[u])!=null;u++){if(f&amp;&amp;n){for(o=0;p=a[o];o++)if(p(n,i,j)){k.push(n);break}y&amp;&amp;(t=B,c=++g.el)}d&amp;&amp;((n=!p&amp;&amp;n)&amp;&amp;s--,h&amp;&amp;x.push(n))}s+=u;if(d&amp;&amp;u!==s){for(o=0;p=b[o];o++)p(x,q,i,j);if(h){if(s&gt;0)while(u--)!x[u]&amp;&amp;!q[u]&amp;&amp;(q[u]=v.call(k));q=bk(q)}w.apply(k,q),y&amp;&amp;!h&amp;&amp;q.length&gt;0&amp;&amp;s+b.length&gt;1&amp;&amp;bc.uniqueSort(k)}return y&amp;&amp;(t=B,l=z),x};return g.el=0,d?z(g):g}function bo(a,b,c,d){var e=0,f=b.length;for(;e&lt;f;e++)bc(a,b[e],c,d);return c}function bp(a,b,c,d,f){var g,h,j,k,l,m=bh(a),n=m.length;if(!d&amp;&amp;m.length===1){h=m[0]=m[0].slice(0);if(h.length&gt;2&amp;&amp;(j=h[0]).type===&quot;ID&quot;&amp;&amp;b.nodeType===9&amp;&amp;!f&amp;&amp;e.relative[h[1].type]){b=e.find.ID(j.matches[0].replace(V,&quot;&quot;),b,f)[0];if(!b)return c;a=a.slice(h.shift().length)}for(g=W.POS.test(a)?-1:h.length-1;g&gt;=0;g--){j=h[g];if(e.relative[k=j.type])break;if(l=e.find[k])if(d=l(j.matches[0].replace(V,&quot;&quot;),R.test(h[0].type)&amp;&amp;b.parentNode||b,f)){h.splice(g,1),a=d.length&amp;&amp;h.join(&quot;&quot;);if(!a)return w.apply(c,x.call(d,0)),c;break}}}return i(a,m)(d,b,f,c,R.test(a)),c}function bq(){}var c,d,e,f,g,h,i,j,k,l,m=!0,n=&quot;undefined&quot;,o=(&quot;sizcache&quot;+Math.random()).replace(&quot;.&quot;,&quot;&quot;),q=String,r=a.document,s=r.documentElement,t=0,u=0,v=[].pop,w=[].push,x=[].slice,y=[].indexOf||function(a){var b=0,c=this.length;for(;b&lt;c;b++)if(this[b]===a)return b;return-1},z=function(a,b){return a[o]=b==null||b,a},A=function(){var a={},b=[];return z(function(c,d){return b.push(c)&gt;e.cacheLength&amp;&amp;delete a[b.shift()],a[c]=d},a)},B=A(),C=A(),D=A(),E=&quot;[\\\\x20\\\\t\\\\r\\\\n\\\\f]&quot;,F=&quot;(?:\\\\\\\\.|[-\\\\w]|[^\\\\x00-\\\\xa0])+&quot;,G=F.replace(&quot;w&quot;,&quot;w#&quot;),H=&quot;([*^$|!~]?=)&quot;,I=&quot;\\\\[&quot;+E+&quot;*(&quot;+F+&quot;)&quot;+E+&quot;*(?:&quot;+H+E+&quot;*(?:([&#x27;\\&quot;])((?:\\\\\\\\.|[^\\\\\\\\])*?)\\\\3|(&quot;+G+&quot;)|)|)&quot;+E+&quot;*\\\\]&quot;,J=&quot;:(&quot;+F+&quot;)(?:\\\\((?:([&#x27;\\&quot;])((?:\\\\\\\\.|[^\\\\\\\\])*?)\\\\2|([^()[\\\\]]*|(?:(?:&quot;+I+&quot;)|[^:]|\\\\\\\\.)*|.*))\\\\)|)&quot;,K=&quot;:(even|odd|eq|gt|lt|nth|first|last)(?:\\\\(&quot;+E+&quot;*((?:-\\\\d)?\\\\d*)&quot;+E+&quot;*\\\\)|)(?=[^-]|$)&quot;,L=new RegExp(&quot;^&quot;+E+&quot;+|((?:^|[^\\\\\\\\])(?:\\\\\\\\.)*)&quot;+E+&quot;+$&quot;,&quot;g&quot;),M=new RegExp(&quot;^&quot;+E+&quot;*,&quot;+E+&quot;*&quot;),N=new RegExp(&quot;^&quot;+E+&quot;*([\\\\x20\\\\t\\\\r\\\\n\\\\f&gt;+~])&quot;+E+&quot;*&quot;),O=new RegExp(J),P=&#x2F;^(?:#([\\w\\-]+)|(\\w+)|\\.([\\w\\-]+))$&#x2F;,Q=&#x2F;^:not&#x2F;,R=&#x2F;[\\x20\\t\\r\\n\\f]*[+~]&#x2F;,S=&#x2F;:not\\($&#x2F;,T=&#x2F;h\\d&#x2F;i,U=&#x2F;input|select|textarea|button&#x2F;i,V=&#x2F;\\\\(?!\\\\)&#x2F;g,W={ID:new RegExp(&quot;^#(&quot;+F+&quot;)&quot;),CLASS:new RegExp(&quot;^\\\\.(&quot;+F+&quot;)&quot;),NAME:new RegExp(&quot;^\\\\[name=[&#x27;\\&quot;]?(&quot;+F+&quot;)[&#x27;\\&quot;]?\\\\]&quot;),TAG:new RegExp(&quot;^(&quot;+F.replace(&quot;w&quot;,&quot;w*&quot;)+&quot;)&quot;),ATTR:new RegExp(&quot;^&quot;+I),PSEUDO:new RegExp(&quot;^&quot;+J),POS:new RegExp(K,&quot;i&quot;),CHILD:new RegExp(&quot;^:(only|nth|first|last)-child(?:\\\\(&quot;+E+&quot;*(even|odd|(([+-]|)(\\\\d*)n|)&quot;+E+&quot;*(?:([+-]|)&quot;+E+&quot;*(\\\\d+)|))&quot;+E+&quot;*\\\\)|)&quot;,&quot;i&quot;),needsContext:new RegExp(&quot;^&quot;+E+&quot;*[&gt;+~]|&quot;+K,&quot;i&quot;)},X=function(a){var b=r.createElement(&quot;div&quot;);try{return a(b)}catch(c){return!1}finally{b=null}},Y=X(function(a){return a.appendChild(r.createComment(&quot;&quot;)),!a.getElementsByTagName(&quot;*&quot;).length}),Z=X(function(a){return a.innerHTML=&quot;&lt;a href=&#x27;#&#x27;&gt;&lt;&#x2F;a&gt;&quot;,a.firstChild&amp;&amp;typeof a.firstChild.getAttribute!==n&amp;&amp;a.firstChild.getAttribute(&quot;href&quot;)===&quot;#&quot;}),$=X(function(a){a.innerHTML=&quot;&lt;select&gt;&lt;&#x2F;select&gt;&quot;;var b=typeof a.lastChild.getAttribute(&quot;multiple&quot;);return b!==&quot;boolean&quot;&amp;&amp;b!==&quot;string&quot;}),_=X(function(a){return a.innerHTML=&quot;&lt;div class=&#x27;hidden e&#x27;&gt;&lt;&#x2F;div&gt;&lt;div class=&#x27;hidden&#x27;&gt;&lt;&#x2F;div&gt;&quot;,!a.getElementsByClassName||!a.getElementsByClassName(&quot;e&quot;).length?!1:(a.lastChild.className=&quot;e&quot;,a.getElementsByClassName(&quot;e&quot;).length===2)}),ba=X(function(a){a.id=o+0,a.innerHTML=&quot;&lt;a name=&#x27;&quot;+o+&quot;&#x27;&gt;&lt;&#x2F;a&gt;&lt;div name=&#x27;&quot;+o+&quot;&#x27;&gt;&lt;&#x2F;div&gt;&quot;,s.insertBefore(a,s.firstChild);var b=r.getElementsByName&amp;&amp;r.getElementsByName(o).length===2+r.getElementsByName(o+0).length;return d=!r.getElementById(o),s.removeChild(a),b});try{x.call(s.childNodes,0)[0].nodeType}catch(bb){x=function(a){var b,c=[];for(;b=this[a];a++)c.push(b);return c}}bc.matches=function(a,b){return bc(a,null,null,b)},bc.matchesSelector=function(a,b){return bc(b,null,null,[a]).length&gt;0},f=bc.getText=function(a){var b,c=&quot;&quot;,d=0,e=a.nodeType;if(e){if(e===1||e===9||e===11){if(typeof a.textContent==&quot;string&quot;)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=f(a)}else if(e===3||e===4)return a.nodeValue}else for(;b=a[d];d++)c+=f(b);return c},g=bc.isXML=function(a){var b=a&amp;&amp;(a.ownerDocument||a).documentElement;return b?b.nodeName!==&quot;HTML&quot;:!1},h=bc.contains=s.contains?function(a,b){var c=a.nodeType===9?a.documentElement:a,d=b&amp;&amp;b.parentNode;return a===d||!!(d&amp;&amp;d.nodeType===1&amp;&amp;c.contains&amp;&amp;c.contains(d))}:s.compareDocumentPosition?function(a,b){return b&amp;&amp;!!(a.compareDocumentPosition(b)&amp;16)}:function(a,b){while(b=b.parentNode)if(b===a)return!0;return!1},bc.attr=function(a,b){var c,d=g(a);return d||(b=b.toLowerCase()),(c=e.attrHandle[b])?c(a):d||$?a.getAttribute(b):(c=a.getAttributeNode(b),c?typeof a[b]==&quot;boolean&quot;?a[b]?b:null:c.specified?c.value:null:null)},e=bc.selectors={cacheLength:50,createPseudo:z,match:W,attrHandle:Z?{}:{href:function(a){return a.getAttribute(&quot;href&quot;,2)},type:function(a){return a.getAttribute(&quot;type&quot;)}},find:{ID:d?function(a,b,c){if(typeof b.getElementById!==n&amp;&amp;!c){var d=b.getElementById(a);return d&amp;&amp;d.parentNode?[d]:[]}}:function(a,c,d){if(typeof c.getElementById!==n&amp;&amp;!d){var e=c.getElementById(a);return e?e.id===a||typeof e.getAttributeNode!==n&amp;&amp;e.getAttributeNode(&quot;id&quot;).value===a?[e]:b:[]}},TAG:Y?function(a,b){if(typeof b.getElementsByTagName!==n)return b.getElementsByTagName(a)}:function(a,b){var c=b.getElementsByTagName(a);if(a===&quot;*&quot;){var d,e=[],f=0;for(;d=c[f];f++)d.nodeType===1&amp;&amp;e.push(d);return e}return c},NAME:ba&amp;&amp;function(a,b){if(typeof b.getElementsByName!==n)return b.getElementsByName(name)},CLASS:_&amp;&amp;function(a,b,c){if(typeof b.getElementsByClassName!==n&amp;&amp;!c)return b.getElementsByClassName(a)}},relative:{&quot;&gt;&quot;:{dir:&quot;parentNode&quot;,first:!0},&quot; &quot;:{dir:&quot;parentNode&quot;},&quot;+&quot;:{dir:&quot;previousSibling&quot;,first:!0},&quot;~&quot;:{dir:&quot;previousSibling&quot;}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(V,&quot;&quot;),a[3]=(a[4]||a[5]||&quot;&quot;).replace(V,&quot;&quot;),a[2]===&quot;~=&quot;&amp;&amp;(a[3]=&quot; &quot;+a[3]+&quot; &quot;),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),a[1]===&quot;nth&quot;?(a[2]||bc.error(a[0]),a[3]=+(a[3]?a[4]+(a[5]||1):2*(a[2]===&quot;even&quot;||a[2]===&quot;odd&quot;)),a[4]=+(a[6]+a[7]||a[2]===&quot;odd&quot;)):a[2]&amp;&amp;bc.error(a[0]),a},PSEUDO:function(a){var b,c;if(W.CHILD.test(a[0]))return null;if(a[3])a[2]=a[3];else if(b=a[4])O.test(b)&amp;&amp;(c=bh(b,!0))&amp;&amp;(c=b.indexOf(&quot;)&quot;,b.length-c)-b.length)&amp;&amp;(b=b.slice(0,c),a[0]=a[0].slice(0,c)),a[2]=b;return a.slice(0,3)}},filter:{ID:d?function(a){return a=a.replace(V,&quot;&quot;),function(b){return b.getAttribute(&quot;id&quot;)===a}}:function(a){return a=a.replace(V,&quot;&quot;),function(b){var c=typeof b.getAttributeNode!==n&amp;&amp;b.getAttributeNode(&quot;id&quot;);return c&amp;&amp;c.value===a}},TAG:function(a){return a===&quot;*&quot;?function(){return!0}:(a=a.replace(V,&quot;&quot;).toLowerCase(),function(b){return b.nodeName&amp;&amp;b.nodeName.toLowerCase()===a})},CLASS:function(a){var b=B[o][a];return b||(b=B(a,new RegExp(&quot;(^|&quot;+E+&quot;)&quot;+a+&quot;(&quot;+E+&quot;|$)&quot;))),function(a){return b.test(a.className||typeof a.getAttribute!==n&amp;&amp;a.getAttribute(&quot;class&quot;)||&quot;&quot;)}},ATTR:function(a,b,c){return function(d,e){var f=bc.attr(d,a);return f==null?b===&quot;!=&quot;:b?(f+=&quot;&quot;,b===&quot;=&quot;?f===c:b===&quot;!=&quot;?f!==c:b===&quot;^=&quot;?c&amp;&amp;f.indexOf(c)===0:b===&quot;*=&quot;?c&amp;&amp;f.indexOf(c)&gt;-1:b===&quot;$=&quot;?c&amp;&amp;f.substr(f.length-c.length)===c:b===&quot;~=&quot;?(&quot; &quot;+f+&quot; &quot;).indexOf(c)&gt;-1:b===&quot;|=&quot;?f===c||f.substr(0,c.length+1)===c+&quot;-&quot;:!1):!0}},CHILD:function(a,b,c,d){return a===&quot;nth&quot;?function(a){var b,e,f=a.parentNode;if(c===1&amp;&amp;d===0)return!0;if(f){e=0;for(b=f.firstChild;b;b=b.nextSibling)if(b.nodeType===1){e++;if(a===b)break}}return e-=d,e===c||e%c===0&amp;&amp;e&#x2F;c&gt;=0}:function(b){var c=b;switch(a){case&quot;only&quot;:case&quot;first&quot;:while(c=c.previousSibling)if(c.nodeType===1)return!1;if(a===&quot;first&quot;)return!0;c=b;case&quot;last&quot;:while(c=c.nextSibling)if(c.nodeType===1)return!1;return!0}}},PSEUDO:function(a,b){var c,d=e.pseudos[a]||e.setFilters[a.toLowerCase()]||bc.error(&quot;unsupported pseudo: &quot;+a);return d[o]?d(b):d.length&gt;1?(c=[a,a,&quot;&quot;,b],e.setFilters.hasOwnProperty(a.toLowerCase())?z(function(a,c){var e,f=d(a,b),g=f.length;while(g--)e=y.call(a,f[g]),a[e]=!(c[e]=f[g])}):function(a){return d(a,0,c)}):d}},pseudos:{not:z(function(a){var b=[],c=[],d=i(a.replace(L,&quot;$1&quot;));return d[o]?z(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)if(f=g[h])a[h]=!(b[h]=f)}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:z(function(a){return function(b){return bc(a,b).length&gt;0}}),contains:z(function(a){return function(b){return(b.textContent||b.innerText||f(b)).indexOf(a)&gt;-1}}),enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return b===&quot;input&quot;&amp;&amp;!!a.checked||b===&quot;option&quot;&amp;&amp;!!a.selected},selected:function(a){return a.parentNode&amp;&amp;a.parentNode.selectedIndex,a.selected===!0},parent:function(a){return!e.pseudos.empty(a)},empty:function(a){var b;a=a.firstChild;while(a){if(a.nodeName&gt;&quot;@&quot;||(b=a.nodeType)===3||b===4)return!1;a=a.nextSibling}return!0},header:function(a){return T.test(a.nodeName)},text:function(a){var b,c;return a.nodeName.toLowerCase()===&quot;input&quot;&amp;&amp;(b=a.type)===&quot;text&quot;&amp;&amp;((c=a.getAttribute(&quot;type&quot;))==null||c.toLowerCase()===b)},radio:bd(&quot;radio&quot;),checkbox:bd(&quot;checkbox&quot;),file:bd(&quot;file&quot;),password:bd(&quot;password&quot;),image:bd(&quot;image&quot;),submit:be(&quot;submit&quot;),reset:be(&quot;reset&quot;),button:function(a){var b=a.nodeName.toLowerCase();return b===&quot;input&quot;&amp;&amp;a.type===&quot;button&quot;||b===&quot;button&quot;},input:function(a){return U.test(a.nodeName)},focus:function(a){var b=a.ownerDocument;return a===b.activeElement&amp;&amp;(!b.hasFocus||b.hasFocus())&amp;&amp;(!!a.type||!!a.href)},active:function(a){return a===a.ownerDocument.activeElement},first:bf(function(a,b,c){return[0]}),last:bf(function(a,b,c){return[b-1]}),eq:bf(function(a,b,c){return[c&lt;0?c+b:c]}),even:bf(function(a,b,c){for(var d=0;d&lt;b;d+=2)a.push(d);return a}),odd:bf(function(a,b,c){for(var d=1;d&lt;b;d+=2)a.push(d);return a}),lt:bf(function(a,b,c){for(var d=c&lt;0?c+b:c;--d&gt;=0;)a.push(d);return a}),gt:bf(function(a,b,c){for(var d=c&lt;0?c+b:c;++d&lt;b;)a.push(d);return a})}},j=s.compareDocumentPosition?function(a,b){return a===b?(k=!0,0):(!a.compareDocumentPosition||!b.compareDocumentPosition?a.compareDocumentPosition:a.compareDocumentPosition(b)&amp;4)?-1:1}:function(a,b){if(a===b)return k=!0,0;if(a.sourceIndex&amp;&amp;b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,h=b.parentNode,i=g;if(g===h)return bg(a,b);if(!g)return-1;if(!h)return 1;while(i)e.unshift(i),i=i.parentNode;i=h;while(i)f.unshift(i),i=i.parentNode;c=e.length,d=f.length;for(var j=0;j&lt;c&amp;&amp;j&lt;d;j++)if(e[j]!==f[j])return bg(e[j],f[j]);return j===c?bg(a,f[j],-1):bg(e[j],b,1)},[0,0].sort(j),m=!k,bc.uniqueSort=function(a){var b,c=1;k=m,a.sort(j);if(k)for(;b=a[c];c++)b===a[c-1]&amp;&amp;a.splice(c--,1);return a},bc.error=function(a){throw new Error(&quot;Syntax error, unrecognized expression: &quot;+a)},i=bc.compile=function(a,b){var c,d=[],e=[],f=D[o][a];if(!f){b||(b=bh(a)),c=b.length;while(c--)f=bm(b[c]),f[o]?d.push(f):e.push(f);f=D(a,bn(e,d))}return f},r.querySelectorAll&amp;&amp;function(){var a,b=bp,c=&#x2F;&#x27;|\\\\&#x2F;g,d=&#x2F;\\=[\\x20\\t\\r\\n\\f]*([^&#x27;&quot;\\]]*)[\\x20\\t\\r\\n\\f]*\\]&#x2F;g,e=[&quot;:focus&quot;],f=[&quot;:active&quot;,&quot;:focus&quot;],h=s.matchesSelector||s.mozMatchesSelector||s.webkitMatchesSelector||s.oMatchesSelector||s.msMatchesSelector;X(function(a){a.innerHTML=&quot;&lt;select&gt;&lt;option selected=&#x27;&#x27;&gt;&lt;&#x2F;option&gt;&lt;&#x2F;select&gt;&quot;,a.querySelectorAll(&quot;[selected]&quot;).length||e.push(&quot;\\\\[&quot;+E+&quot;*(?:checked|disabled|ismap|multiple|readonly|selected|value)&quot;),a.querySelectorAll(&quot;:checked&quot;).length||e.push(&quot;:checked&quot;)}),X(function(a){a.innerHTML=&quot;&lt;p test=&#x27;&#x27;&gt;&lt;&#x2F;p&gt;&quot;,a.querySelectorAll(&quot;[test^=&#x27;&#x27;]&quot;).length&amp;&amp;e.push(&quot;[*^$]=&quot;+E+&quot;*(?:\\&quot;\\&quot;|&#x27;&#x27;)&quot;),a.innerHTML=&quot;&lt;input type=&#x27;hidden&#x27;&#x2F;&gt;&quot;,a.querySelectorAll(&quot;:enabled&quot;).length||e.push(&quot;:enabled&quot;,&quot;:disabled&quot;)}),e=new RegExp(e.join(&quot;|&quot;)),bp=function(a,d,f,g,h){if(!g&amp;&amp;!h&amp;&amp;(!e||!e.test(a))){var i,j,k=!0,l=o,m=d,n=d.nodeType===9&amp;&amp;a;if(d.nodeType===1&amp;&amp;d.nodeName.toLowerCase()!==&quot;object&quot;){i=bh(a),(k=d.getAttribute(&quot;id&quot;))?l=k.replace(c,&quot;\\\\$&amp;&quot;):d.setAttribute(&quot;id&quot;,l),l=&quot;[id=&#x27;&quot;+l+&quot;&#x27;] &quot;,j=i.length;while(j--)i[j]=l+i[j].join(&quot;&quot;);m=R.test(a)&amp;&amp;d.parentNode||d,n=i.join(&quot;,&quot;)}if(n)try{return w.apply(f,x.call(m.querySelectorAll(n),0)),f}catch(p){}finally{k||d.removeAttribute(&quot;id&quot;)}}return b(a,d,f,g,h)},h&amp;&amp;(X(function(b){a=h.call(b,&quot;div&quot;);try{h.call(b,&quot;[test!=&#x27;&#x27;]:sizzle&quot;),f.push(&quot;!=&quot;,J)}catch(c){}}),f=new RegExp(f.join(&quot;|&quot;)),bc.matchesSelector=function(b,c){c=c.replace(d,&quot;=&#x27;$1&#x27;]&quot;);if(!g(b)&amp;&amp;!f.test(c)&amp;&amp;(!e||!e.test(c)))try{var i=h.call(b,c);if(i||a||b.document&amp;&amp;b.document.nodeType!==11)return i}catch(j){}return bc(c,null,null,[b]).length&gt;0})}(),e.pseudos.nth=e.pseudos.eq,e.filters=bq.prototype=e.pseudos,e.setFilters=new bq,bc.attr=p.attr,p.find=bc,p.expr=bc.selectors,p.expr[&quot;:&quot;]=p.expr.pseudos,p.unique=bc.uniqueSort,p.text=bc.getText,p.isXMLDoc=bc.isXML,p.contains=bc.contains}(a);var bc=&#x2F;Until$&#x2F;,bd=&#x2F;^(?:parents|prev(?:Until|All))&#x2F;,be=&#x2F;^.[^:#\\[\\.,]*$&#x2F;,bf=p.expr.match.needsContext,bg={children:!0,contents:!0,next:!0,prev:!0};p.fn.extend({find:function(a){var b,c,d,e,f,g,h=this;if(typeof a!=&quot;string&quot;)return p(a).filter(function(){for(b=0,c=h.length;b&lt;c;b++)if(p.contains(h[b],this))return!0});g=this.pushStack(&quot;&quot;,&quot;find&quot;,a);for(b=0,c=this.length;b&lt;c;b++){d=g.length,p.find(a,this[b],g);if(b&gt;0)for(e=d;e&lt;g.length;e++)for(f=0;f&lt;d;f++)if(g[f]===g[e]){g.splice(e--,1);break}}return g},has:function(a){var b,c=p(a,this),d=c.length;return this.filter(function(){for(b=0;b&lt;d;b++)if(p.contains(this,c[b]))return!0})},not:function(a){return this.pushStack(bj(this,a,!1),&quot;not&quot;,a)},filter:function(a){return this.pushStack(bj(this,a,!0),&quot;filter&quot;,a)},is:function(a){return!!a&amp;&amp;(typeof a==&quot;string&quot;?bf.test(a)?p(a,this.context).index(this[0])&gt;=0:p.filter(a,this).length&gt;0:this.filter(a).length&gt;0)},closest:function(a,b){var c,d=0,e=this.length,f=[],g=bf.test(a)||typeof a!=&quot;string&quot;?p(a,b||this.context):0;for(;d&lt;e;d++){c=this[d];while(c&amp;&amp;c.ownerDocument&amp;&amp;c!==b&amp;&amp;c.nodeType!==11){if(g?g.index(c)&gt;-1:p.find.matchesSelector(c,a)){f.push(c);break}c=c.parentNode}}return f=f.length&gt;1?p.unique(f):f,this.pushStack(f,&quot;closest&quot;,a)},index:function(a){return a?typeof a==&quot;string&quot;?p.inArray(this[0],p(a)):p.inArray(a.jquery?a[0]:a,this):this[0]&amp;&amp;this[0].parentNode?this.prevAll().length:-1},add:function(a,b){var c=typeof a==&quot;string&quot;?p(a,b):p.makeArray(a&amp;&amp;a.nodeType?[a]:a),d=p.merge(this.get(),c);return this.pushStack(bh(c[0])||bh(d[0])?d:p.unique(d))},addBack:function(a){return this.add(a==null?this.prevObject:this.prevObject.filter(a))}}),p.fn.andSelf=p.fn.addBack,p.each({parent:function(a){var b=a.parentNode;return b&amp;&amp;b.nodeType!==11?b:null},parents:function(a){return p.dir(a,&quot;parentNode&quot;)},parentsUntil:function(a,b,c){return p.dir(a,&quot;parentNode&quot;,c)},next:function(a){return bi(a,&quot;nextSibling&quot;)},prev:function(a){return bi(a,&quot;previousSibling&quot;)},nextAll:function(a){return p.dir(a,&quot;nextSibling&quot;)},prevAll:function(a){return p.dir(a,&quot;previousSibling&quot;)},nextUntil:function(a,b,c){return p.dir(a,&quot;nextSibling&quot;,c)},prevUntil:function(a,b,c){return p.dir(a,&quot;previousSibling&quot;,c)},siblings:function(a){return p.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return p.sibling(a.firstChild)},contents:function(a){return p.nodeName(a,&quot;iframe&quot;)?a.contentDocument||a.contentWindow.document:p.merge([],a.childNodes)}},function(a,b){p.fn[a]=function(c,d){var e=p.map(this,b,c);return bc.test(a)||(d=c),d&amp;&amp;typeof d==&quot;string&quot;&amp;&amp;(e=p.filter(d,e)),e=this.length&gt;1&amp;&amp;!bg[a]?p.unique(e):e,this.length&gt;1&amp;&amp;bd.test(a)&amp;&amp;(e=e.reverse()),this.pushStack(e,a,k.call(arguments).join(&quot;,&quot;))}}),p.extend({filter:function(a,b,c){return c&amp;&amp;(a=&quot;:not(&quot;+a+&quot;)&quot;),b.length===1?p.find.matchesSelector(b[0],a)?[b[0]]:[]:p.find.matches(a,b)},dir:function(a,c,d){var e=[],f=a[c];while(f&amp;&amp;f.nodeType!==9&amp;&amp;(d===b||f.nodeType!==1||!p(f).is(d)))f.nodeType===1&amp;&amp;e.push(f),f=f[c];return e},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&amp;&amp;a!==b&amp;&amp;c.push(a);return c}});var bl=&quot;abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video&quot;,bm=&#x2F; jQuery\\d+=&quot;(?:null|\\d+)&quot;&#x2F;g,bn=&#x2F;^\\s+&#x2F;,bo=&#x2F;&lt;(?!area|br|col|embed|hr|img|input|link|meta|param)(([\\w:]+)[^&gt;]*)\\&#x2F;&gt;&#x2F;gi,bp=&#x2F;&lt;([\\w:]+)&#x2F;,bq=&#x2F;&lt;tbody&#x2F;i,br=&#x2F;&lt;|&amp;#?\\w+;&#x2F;,bs=&#x2F;&lt;(?:script|style|link)&#x2F;i,bt=&#x2F;&lt;(?:script|object|embed|option|style)&#x2F;i,bu=new RegExp(&quot;&lt;(?:&quot;+bl+&quot;)[\\\\s&#x2F;&gt;]&quot;,&quot;i&quot;),bv=&#x2F;^(?:checkbox|radio)$&#x2F;,bw=&#x2F;checked\\s*(?:[^=]|=\\s*.checked.)&#x2F;i,bx=&#x2F;\\&#x2F;(java|ecma)script&#x2F;i,by=&#x2F;^\\s*&lt;!(?:\\[CDATA\\[|\\-\\-)|[\\]\\-]{2}&gt;\\s*$&#x2F;g,bz={option:[1,&quot;&lt;select multiple=&#x27;multiple&#x27;&gt;&quot;,&quot;&lt;&#x2F;select&gt;&quot;],legend:[1,&quot;&lt;fieldset&gt;&quot;,&quot;&lt;&#x2F;fieldset&gt;&quot;],thead:[1,&quot;&lt;table&gt;&quot;,&quot;&lt;&#x2F;table&gt;&quot;],tr:[2,&quot;&lt;table&gt;&lt;tbody&gt;&quot;,&quot;&lt;&#x2F;tbody&gt;&lt;&#x2F;table&gt;&quot;],td:[3,&quot;&lt;table&gt;&lt;tbody&gt;&lt;tr&gt;&quot;,&quot;&lt;&#x2F;tr&gt;&lt;&#x2F;tbody&gt;&lt;&#x2F;table&gt;&quot;],col:[2,&quot;&lt;table&gt;&lt;tbody&gt;&lt;&#x2F;tbody&gt;&lt;colgroup&gt;&quot;,&quot;&lt;&#x2F;colgroup&gt;&lt;&#x2F;table&gt;&quot;],area:[1,&quot;&lt;map&gt;&quot;,&quot;&lt;&#x2F;map&gt;&quot;],_default:[0,&quot;&quot;,&quot;&quot;]},bA=bk(e),bB=bA.appendChild(e.createElement(&quot;div&quot;));bz.optgroup=bz.option,bz.tbody=bz.tfoot=bz.colgroup=bz.caption=bz.thead,bz.th=bz.td,p.support.htmlSerialize||(bz._default=[1,&quot;X&lt;div&gt;&quot;,&quot;&lt;&#x2F;div&gt;&quot;]),p.fn.extend({text:function(a){return p.access(this,function(a){return a===b?p.text(this):this.empty().append((this[0]&amp;&amp;this[0].ownerDocument||e).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if(p.isFunction(a))return this.each(function(b){p(this).wrapAll(a.call(this,b))});if(this[0]){var b=p(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&amp;&amp;b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&amp;&amp;a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return p.isFunction(a)?this.each(function(b){p(this).wrapInner(a.call(this,b))}):this.each(function(){var b=p(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=p.isFunction(a);return this.each(function(c){p(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){p.nodeName(this,&quot;body&quot;)||p(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){(this.nodeType===1||this.nodeType===11)&amp;&amp;this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){(this.nodeType===1||this.nodeType===11)&amp;&amp;this.insertBefore(a,this.firstChild)})},before:function(){if(!bh(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=p.clean(arguments);return this.pushStack(p.merge(a,this),&quot;before&quot;,this.selector)}},after:function(){if(!bh(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=p.clean(arguments);return this.pushStack(p.merge(this,a),&quot;after&quot;,this.selector)}},remove:function(a,b){var c,d=0;for(;(c=this[d])!=null;d++)if(!a||p.filter(a,[c]).length)!b&amp;&amp;c.nodeType===1&amp;&amp;(p.cleanData(c.getElementsByTagName(&quot;*&quot;)),p.cleanData([c])),c.parentNode&amp;&amp;c.parentNode.removeChild(c);return this},empty:function(){var a,b=0;for(;(a=this[b])!=null;b++){a.nodeType===1&amp;&amp;p.cleanData(a.getElementsByTagName(&quot;*&quot;));while(a.firstChild)a.removeChild(a.firstChild)}return this},clone:function(a,b){return a=a==null?!1:a,b=b==null?a:b,this.map(function(){return p.clone(this,a,b)})},html:function(a){return p.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return c.nodeType===1?c.innerHTML.replace(bm,&quot;&quot;):b;if(typeof a==&quot;string&quot;&amp;&amp;!bs.test(a)&amp;&amp;(p.support.htmlSerialize||!bu.test(a))&amp;&amp;(p.support.leadingWhitespace||!bn.test(a))&amp;&amp;!bz[(bp.exec(a)||[&quot;&quot;,&quot;&quot;])[1].toLowerCase()]){a=a.replace(bo,&quot;&lt;$1&gt;&lt;&#x2F;$2&gt;&quot;);try{for(;d&lt;e;d++)c=this[d]||{},c.nodeType===1&amp;&amp;(p.cleanData(c.getElementsByTagName(&quot;*&quot;)),c.innerHTML=a);c=0}catch(f){}}c&amp;&amp;this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){return bh(this[0])?this.length?this.pushStack(p(p.isFunction(a)?a():a),&quot;replaceWith&quot;,a):this:p.isFunction(a)?this.each(function(b){var c=p(this),d=c.html();c.replaceWith(a.call(this,b,d))}):(typeof a!=&quot;string&quot;&amp;&amp;(a=p(a).detach()),this.each(function(){var b=this.nextSibling,c=this.parentNode;p(this).remove(),b?p(b).before(a):p(c).append(a)}))},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){a=[].concat.apply([],a);var e,f,g,h,i=0,j=a[0],k=[],l=this.length;if(!p.support.checkClone&amp;&amp;l&gt;1&amp;&amp;typeof j==&quot;string&quot;&amp;&amp;bw.test(j))return this.each(function(){p(this).domManip(a,c,d)});if(p.isFunction(j))return this.each(function(e){var f=p(this);a[0]=j.call(this,e,c?f.html():b),f.domManip(a,c,d)});if(this[0]){e=p.buildFragment(a,this,k),g=e.fragment,f=g.firstChild,g.childNodes.length===1&amp;&amp;(g=f);if(f){c=c&amp;&amp;p.nodeName(f,&quot;tr&quot;);for(h=e.cacheable||l-1;i&lt;l;i++)d.call(c&amp;&amp;p.nodeName(this[i],&quot;table&quot;)?bC(this[i],&quot;tbody&quot;):this[i],i===h?g:p.clone(g,!0,!0))}g=f=null,k.length&amp;&amp;p.each(k,function(a,b){b.src?p.ajax?p.ajax({url:b.src,type:&quot;GET&quot;,dataType:&quot;script&quot;,async:!1,global:!1,&quot;throws&quot;:!0}):p.error(&quot;no ajax&quot;):p.globalEval((b.text||b.textContent||b.innerHTML||&quot;&quot;).replace(by,&quot;&quot;)),b.parentNode&amp;&amp;b.parentNode.removeChild(b)})}return this}}),p.buildFragment=function(a,c,d){var f,g,h,i=a[0];return c=c||e,c=!c.nodeType&amp;&amp;c[0]||c,c=c.ownerDocument||c,a.length===1&amp;&amp;typeof i==&quot;string&quot;&amp;&amp;i.length&lt;512&amp;&amp;c===e&amp;&amp;i.charAt(0)===&quot;&lt;&quot;&amp;&amp;!bt.test(i)&amp;&amp;(p.support.checkClone||!bw.test(i))&amp;&amp;(p.support.html5Clone||!bu.test(i))&amp;&amp;(g=!0,f=p.fragments[i],h=f!==b),f||(f=c.createDocumentFragment(),p.clean(a,c,f,d),g&amp;&amp;(p.fragments[i]=h&amp;&amp;f)),{fragment:f,cacheable:g}},p.fragments={},p.each({appendTo:&quot;append&quot;,prependTo:&quot;prepend&quot;,insertBefore:&quot;before&quot;,insertAfter:&quot;after&quot;,replaceAll:&quot;replaceWith&quot;},function(a,b){p.fn[a]=function(c){var d,e=0,f=[],g=p(c),h=g.length,i=this.length===1&amp;&amp;this[0].parentNode;if((i==null||i&amp;&amp;i.nodeType===11&amp;&amp;i.childNodes.length===1)&amp;&amp;h===1)return g[b](this[0]),this;for(;e&lt;h;e++)d=(e&gt;0?this.clone(!0):this).get(),p(g[e])[b](d),f=f.concat(d);return this.pushStack(f,a,g.selector)}}),p.extend({clone:function(a,b,c){var d,e,f,g;p.support.html5Clone||p.isXMLDoc(a)||!bu.test(&quot;&lt;&quot;+a.nodeName+&quot;&gt;&quot;)?g=a.cloneNode(!0):(bB.innerHTML=a.outerHTML,bB.removeChild(g=bB.firstChild));if((!p.support.noCloneEvent||!p.support.noCloneChecked)&amp;&amp;(a.nodeType===1||a.nodeType===11)&amp;&amp;!p.isXMLDoc(a)){bE(a,g),d=bF(a),e=bF(g);for(f=0;d[f];++f)e[f]&amp;&amp;bE(d[f],e[f])}if(b){bD(a,g);if(c){d=bF(a),e=bF(g);for(f=0;d[f];++f)bD(d[f],e[f])}}return d=e=null,g},clean:function(a,b,c,d){var f,g,h,i,j,k,l,m,n,o,q,r,s=b===e&amp;&amp;bA,t=[];if(!b||typeof b.createDocumentFragment==&quot;undefined&quot;)b=e;for(f=0;(h=a[f])!=null;f++){typeof h==&quot;number&quot;&amp;&amp;(h+=&quot;&quot;);if(!h)continue;if(typeof h==&quot;string&quot;)if(!br.test(h))h=b.createTextNode(h);else{s=s||bk(b),l=b.createElement(&quot;div&quot;),s.appendChild(l),h=h.replace(bo,&quot;&lt;$1&gt;&lt;&#x2F;$2&gt;&quot;),i=(bp.exec(h)||[&quot;&quot;,&quot;&quot;])[1].toLowerCase(),j=bz[i]||bz._default,k=j[0],l.innerHTML=j[1]+h+j[2];while(k--)l=l.lastChild;if(!p.support.tbody){m=bq.test(h),n=i===&quot;table&quot;&amp;&amp;!m?l.firstChild&amp;&amp;l.firstChild.childNodes:j[1]===&quot;&lt;table&gt;&quot;&amp;&amp;!m?l.childNodes:[];for(g=n.length-1;g&gt;=0;--g)p.nodeName(n[g],&quot;tbody&quot;)&amp;&amp;!n[g].childNodes.length&amp;&amp;n[g].parentNode.removeChild(n[g])}!p.support.leadingWhitespace&amp;&amp;bn.test(h)&amp;&amp;l.insertBefore(b.createTextNode(bn.exec(h)[0]),l.firstChild),h=l.childNodes,l.parentNode.removeChild(l)}h.nodeType?t.push(h):p.merge(t,h)}l&amp;&amp;(h=l=s=null);if(!p.support.appendChecked)for(f=0;(h=t[f])!=null;f++)p.nodeName(h,&quot;input&quot;)?bG(h):typeof h.getElementsByTagName!=&quot;undefined&quot;&amp;&amp;p.grep(h.getElementsByTagName(&quot;input&quot;),bG);if(c){q=function(a){if(!a.type||bx.test(a.type))return d?d.push(a.parentNode?a.parentNode.removeChild(a):a):c.appendChild(a)};for(f=0;(h=t[f])!=null;f++)if(!p.nodeName(h,&quot;script&quot;)||!q(h))c.appendChild(h),typeof h.getElementsByTagName!=&quot;undefined&quot;&amp;&amp;(r=p.grep(p.merge([],h.getElementsByTagName(&quot;script&quot;)),q),t.splice.apply(t,[f+1,0].concat(r)),f+=r.length)}return t},cleanData:function(a,b){var c,d,e,f,g=0,h=p.expando,i=p.cache,j=p.support.deleteExpando,k=p.event.special;for(;(e=a[g])!=null;g++)if(b||p.acceptData(e)){d=e[h],c=d&amp;&amp;i[d];if(c){if(c.events)for(f in c.events)k[f]?p.event.remove(e,f):p.removeEvent(e,f,c.handle);i[d]&amp;&amp;(delete i[d],j?delete e[h]:e.removeAttribute?e.removeAttribute(h):e[h]=null,p.deletedIds.push(d))}}}}),function(){var a,b;p.uaMatch=function(a){a=a.toLowerCase();var b=&#x2F;(chrome)[ \\&#x2F;]([\\w.]+)&#x2F;.exec(a)||&#x2F;(webkit)[ \\&#x2F;]([\\w.]+)&#x2F;.exec(a)||&#x2F;(opera)(?:.*version|)[ \\&#x2F;]([\\w.]+)&#x2F;.exec(a)||&#x2F;(msie) ([\\w.]+)&#x2F;.exec(a)||a.indexOf(&quot;compatible&quot;)&lt;0&amp;&amp;&#x2F;(mozilla)(?:.*? rv:([\\w.]+)|)&#x2F;.exec(a)||[];return{browser:b[1]||&quot;&quot;,version:b[2]||&quot;0&quot;}},a=p.uaMatch(g.userAgent),b={},a.browser&amp;&amp;(b[a.browser]=!0,b.version=a.version),b.chrome?b.webkit=!0:b.webkit&amp;&amp;(b.safari=!0),p.browser=b,p.sub=function(){function a(b,c){return new a.fn.init(b,c)}p.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function c(c,d){return d&amp;&amp;d instanceof p&amp;&amp;!(d instanceof a)&amp;&amp;(d=a(d)),p.fn.init.call(this,c,d,b)},a.fn.init.prototype=a.fn;var b=a(e);return a}}();var bH,bI,bJ,bK=&#x2F;alpha\\([^)]*\\)&#x2F;i,bL=&#x2F;opacity=([^)]*)&#x2F;,bM=&#x2F;^(top|right|bottom|left)$&#x2F;,bN=&#x2F;^(none|table(?!-c[ea]).+)&#x2F;,bO=&#x2F;^margin&#x2F;,bP=new RegExp(&quot;^(&quot;+q+&quot;)(.*)$&quot;,&quot;i&quot;),bQ=new RegExp(&quot;^(&quot;+q+&quot;)(?!px)[a-z%]+$&quot;,&quot;i&quot;),bR=new RegExp(&quot;^([-+])=(&quot;+q+&quot;)&quot;,&quot;i&quot;),bS={},bT={position:&quot;absolute&quot;,visibility:&quot;hidden&quot;,display:&quot;block&quot;},bU={letterSpacing:0,fontWeight:400},bV=[&quot;Top&quot;,&quot;Right&quot;,&quot;Bottom&quot;,&quot;Left&quot;],bW=[&quot;Webkit&quot;,&quot;O&quot;,&quot;Moz&quot;,&quot;ms&quot;],bX=p.fn.toggle;p.fn.extend({css:function(a,c){return p.access(this,function(a,c,d){return d!==b?p.style(a,c,d):p.css(a,c)},a,c,arguments.length&gt;1)},show:function(){return b$(this,!0)},hide:function(){return b$(this)},toggle:function(a,b){var c=typeof a==&quot;boolean&quot;;return p.isFunction(a)&amp;&amp;p.isFunction(b)?bX.apply(this,arguments):this.each(function(){(c?a:bZ(this))?p(this).show():p(this).hide()})}}),p.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bH(a,&quot;opacity&quot;);return c===&quot;&quot;?&quot;1&quot;:c}}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{&quot;float&quot;:p.support.cssFloat?&quot;cssFloat&quot;:&quot;styleFloat&quot;},style:function(a,c,d,e){if(!a||a.nodeType===3||a.nodeType===8||!a.style)return;var f,g,h,i=p.camelCase(c),j=a.style;c=p.cssProps[i]||(p.cssProps[i]=bY(j,i)),h=p.cssHooks[c]||p.cssHooks[i];if(d===b)return h&amp;&amp;&quot;get&quot;in h&amp;&amp;(f=h.get(a,!1,e))!==b?f:j[c];g=typeof d,g===&quot;string&quot;&amp;&amp;(f=bR.exec(d))&amp;&amp;(d=(f[1]+1)*f[2]+parseFloat(p.css(a,c)),g=&quot;number&quot;);if(d==null||g===&quot;number&quot;&amp;&amp;isNaN(d))return;g===&quot;number&quot;&amp;&amp;!p.cssNumber[i]&amp;&amp;(d+=&quot;px&quot;);if(!h||!(&quot;set&quot;in h)||(d=h.set(a,d,e))!==b)try{j[c]=d}catch(k){}},css:function(a,c,d,e){var f,g,h,i=p.camelCase(c);return c=p.cssProps[i]||(p.cssProps[i]=bY(a.style,i)),h=p.cssHooks[c]||p.cssHooks[i],h&amp;&amp;&quot;get&quot;in h&amp;&amp;(f=h.get(a,!0,e)),f===b&amp;&amp;(f=bH(a,c)),f===&quot;normal&quot;&amp;&amp;c in bU&amp;&amp;(f=bU[c]),d||e!==b?(g=parseFloat(f),d||p.isNumeric(g)?g||0:f):f},swap:function(a,b,c){var d,e,f={};for(e in b)f[e]=a.style[e],a.style[e]=b[e];d=c.call(a);for(e in b)a.style[e]=f[e];return d}}),a.getComputedStyle?bH=function(b,c){var d,e,f,g,h=a.getComputedStyle(b,null),i=b.style;return h&amp;&amp;(d=h[c],d===&quot;&quot;&amp;&amp;!p.contains(b.ownerDocument,b)&amp;&amp;(d=p.style(b,c)),bQ.test(d)&amp;&amp;bO.test(c)&amp;&amp;(e=i.width,f=i.minWidth,g=i.maxWidth,i.minWidth=i.maxWidth=i.width=d,d=h.width,i.width=e,i.minWidth=f,i.maxWidth=g)),d}:e.documentElement.currentStyle&amp;&amp;(bH=function(a,b){var c,d,e=a.currentStyle&amp;&amp;a.currentStyle[b],f=a.style;return e==null&amp;&amp;f&amp;&amp;f[b]&amp;&amp;(e=f[b]),bQ.test(e)&amp;&amp;!bM.test(b)&amp;&amp;(c=f.left,d=a.runtimeStyle&amp;&amp;a.runtimeStyle.left,d&amp;&amp;(a.runtimeStyle.left=a.currentStyle.left),f.left=b===&quot;fontSize&quot;?&quot;1em&quot;:e,e=f.pixelLeft+&quot;px&quot;,f.left=c,d&amp;&amp;(a.runtimeStyle.left=d)),e===&quot;&quot;?&quot;auto&quot;:e}),p.each([&quot;height&quot;,&quot;width&quot;],function(a,b){p.cssHooks[b]={get:function(a,c,d){if(c)return a.offsetWidth===0&amp;&amp;bN.test(bH(a,&quot;display&quot;))?p.swap(a,bT,function(){return cb(a,b,d)}):cb(a,b,d)},set:function(a,c,d){return b_(a,c,d?ca(a,b,d,p.support.boxSizing&amp;&amp;p.css(a,&quot;boxSizing&quot;)===&quot;border-box&quot;):0)}}}),p.support.opacity||(p.cssHooks.opacity={get:function(a,b){return bL.test((b&amp;&amp;a.currentStyle?a.currentStyle.filter:a.style.filter)||&quot;&quot;)?.01*parseFloat(RegExp.$1)+&quot;&quot;:b?&quot;1&quot;:&quot;&quot;},set:function(a,b){var c=a.style,d=a.currentStyle,e=p.isNumeric(b)?&quot;alpha(opacity=&quot;+b*100+&quot;)&quot;:&quot;&quot;,f=d&amp;&amp;d.filter||c.filter||&quot;&quot;;c.zoom=1;if(b&gt;=1&amp;&amp;p.trim(f.replace(bK,&quot;&quot;))===&quot;&quot;&amp;&amp;c.removeAttribute){c.removeAttribute(&quot;filter&quot;);if(d&amp;&amp;!d.filter)return}c.filter=bK.test(f)?f.replace(bK,e):f+&quot; &quot;+e}}),p(function(){p.support.reliableMarginRight||(p.cssHooks.marginRight={get:function(a,b){return p.swap(a,{display:&quot;inline-block&quot;},function(){if(b)return bH(a,&quot;marginRight&quot;)})}}),!p.support.pixelPosition&amp;&amp;p.fn.position&amp;&amp;p.each([&quot;top&quot;,&quot;left&quot;],function(a,b){p.cssHooks[b]={get:function(a,c){if(c){var d=bH(a,b);return bQ.test(d)?p(a).position()[b]+&quot;px&quot;:d}}}})}),p.expr&amp;&amp;p.expr.filters&amp;&amp;(p.expr.filters.hidden=function(a){return a.offsetWidth===0&amp;&amp;a.offsetHeight===0||!p.support.reliableHiddenOffsets&amp;&amp;(a.style&amp;&amp;a.style.display||bH(a,&quot;display&quot;))===&quot;none&quot;},p.expr.filters.visible=function(a){return!p.expr.filters.hidden(a)}),p.each({margin:&quot;&quot;,padding:&quot;&quot;,border:&quot;Width&quot;},function(a,b){p.cssHooks[a+b]={expand:function(c){var d,e=typeof c==&quot;string&quot;?c.split(&quot; &quot;):[c],f={};for(d=0;d&lt;4;d++)f[a+bV[d]+b]=e[d]||e[d-2]||e[0];return f}},bO.test(a)||(p.cssHooks[a+b].set=b_)});var cd=&#x2F;%20&#x2F;g,ce=&#x2F;\\[\\]$&#x2F;,cf=&#x2F;\\r?\\n&#x2F;g,cg=&#x2F;^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$&#x2F;i,ch=&#x2F;^(?:select|textarea)&#x2F;i;p.fn.extend({serialize:function(){return p.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?p.makeArray(this.elements):this}).filter(function(){return this.name&amp;&amp;!this.disabled&amp;&amp;(this.checked||ch.test(this.nodeName)||cg.test(this.type))}).map(function(a,b){var c=p(this).val();return c==null?null:p.isArray(c)?p.map(c,function(a,c){return{name:b.name,value:a.replace(cf,&quot;\\r\\n&quot;)}}):{name:b.name,value:c.replace(cf,&quot;\\r\\n&quot;)}}).get()}}),p.param=function(a,c){var d,e=[],f=function(a,b){b=p.isFunction(b)?b():b==null?&quot;&quot;:b,e[e.length]=encodeURIComponent(a)+&quot;=&quot;+encodeURIComponent(b)};c===b&amp;&amp;(c=p.ajaxSettings&amp;&amp;p.ajaxSettings.traditional);if(p.isArray(a)||a.jquery&amp;&amp;!p.isPlainObject(a))p.each(a,function(){f(this.name,this.value)});else for(d in a)ci(d,a[d],c,f);return e.join(&quot;&amp;&quot;).replace(cd,&quot;+&quot;)};var cj,ck,cl=&#x2F;#.*$&#x2F;,cm=&#x2F;^(.*?):[ \\t]*([^\\r\\n]*)\\r?$&#x2F;mg,cn=&#x2F;^(?:about|app|app\\-storage|.+\\-extension|file|res|widget):$&#x2F;,co=&#x2F;^(?:GET|HEAD)$&#x2F;,cp=&#x2F;^\\&#x2F;\\&#x2F;&#x2F;,cq=&#x2F;\\?&#x2F;,cr=&#x2F;&lt;script\\b[^&lt;]*(?:(?!&lt;\\&#x2F;script&gt;)&lt;[^&lt;]*)*&lt;\\&#x2F;script&gt;&#x2F;gi,cs=&#x2F;([?&amp;])_=[^&amp;]*&#x2F;,ct=&#x2F;^([\\w\\+\\.\\-]+:)(?:\\&#x2F;\\&#x2F;([^\\&#x2F;?#:]*)(?::(\\d+)|)|)&#x2F;,cu=p.fn.load,cv={},cw={},cx=[&quot;*&#x2F;&quot;]+[&quot;*&quot;];try{ck=f.href}catch(cy){ck=e.createElement(&quot;a&quot;),ck.href=&quot;&quot;,ck=ck.href}cj=ct.exec(ck.toLowerCase())||[],p.fn.load=function(a,c,d){if(typeof a!=&quot;string&quot;&amp;&amp;cu)return cu.apply(this,arguments);if(!this.length)return this;var e,f,g,h=this,i=a.indexOf(&quot; &quot;);return i&gt;=0&amp;&amp;(e=a.slice(i,a.length),a=a.slice(0,i)),p.isFunction(c)?(d=c,c=b):c&amp;&amp;typeof c==&quot;object&quot;&amp;&amp;(f=&quot;POST&quot;),p.ajax({url:a,type:f,dataType:&quot;html&quot;,data:c,complete:function(a,b){d&amp;&amp;h.each(d,g||[a.responseText,b,a])}}).done(function(a){g=arguments,h.html(e?p(&quot;&lt;div&gt;&quot;).append(a.replace(cr,&quot;&quot;)).find(e):a)}),this},p.each(&quot;ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend&quot;.split(&quot; &quot;),function(a,b){p.fn[b]=function(a){return this.on(b,a)}}),p.each([&quot;get&quot;,&quot;post&quot;],function(a,c){p[c]=function(a,d,e,f){return p.isFunction(d)&amp;&amp;(f=f||e,e=d,d=b),p.ajax({type:c,url:a,data:d,success:e,dataType:f})}}),p.extend({getScript:function(a,c){return p.get(a,b,c,&quot;script&quot;)},getJSON:function(a,b,c){return p.get(a,b,c,&quot;json&quot;)},ajaxSetup:function(a,b){return b?cB(a,p.ajaxSettings):(b=a,a=p.ajaxSettings),cB(a,b),a},ajaxSettings:{url:ck,isLocal:cn.test(cj[1]),global:!0,type:&quot;GET&quot;,contentType:&quot;application&#x2F;x-www-form-urlencoded; charset=UTF-8&quot;,processData:!0,async:!0,accepts:{xml:&quot;application&#x2F;xml, text&#x2F;xml&quot;,html:&quot;text&#x2F;html&quot;,text:&quot;text&#x2F;plain&quot;,json:&quot;application&#x2F;json, text&#x2F;javascript&quot;,&quot;*&quot;:cx},contents:{xml:&#x2F;xml&#x2F;,html:&#x2F;html&#x2F;,json:&#x2F;json&#x2F;},responseFields:{xml:&quot;responseXML&quot;,text:&quot;responseText&quot;},converters:{&quot;* text&quot;:a.String,&quot;text html&quot;:!0,&quot;text json&quot;:p.parseJSON,&quot;text xml&quot;:p.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:cz(cv),ajaxTransport:cz(cw),ajax:function(a,c){function y(a,c,f,i){var k,s,t,u,w,y=c;if(v===2)return;v=2,h&amp;&amp;clearTimeout(h),g=b,e=i||&quot;&quot;,x.readyState=a&gt;0?4:0,f&amp;&amp;(u=cC(l,x,f));if(a&gt;=200&amp;&amp;a&lt;300||a===304)l.ifModified&amp;&amp;(w=x.getResponseHeader(&quot;Last-Modified&quot;),w&amp;&amp;(p.lastModified[d]=w),w=x.getResponseHeader(&quot;Etag&quot;),w&amp;&amp;(p.etag[d]=w)),a===304?(y=&quot;notmodified&quot;,k=!0):(k=cD(l,u),y=k.state,s=k.data,t=k.error,k=!t);else{t=y;if(!y||a)y=&quot;error&quot;,a&lt;0&amp;&amp;(a=0)}x.status=a,x.statusText=(c||y)+&quot;&quot;,k?o.resolveWith(m,[s,y,x]):o.rejectWith(m,[x,y,t]),x.statusCode(r),r=b,j&amp;&amp;n.trigger(&quot;ajax&quot;+(k?&quot;Success&quot;:&quot;Error&quot;),[x,l,k?s:t]),q.fireWith(m,[x,y]),j&amp;&amp;(n.trigger(&quot;ajaxComplete&quot;,[x,l]),--p.active||p.event.trigger(&quot;ajaxStop&quot;))}typeof a==&quot;object&quot;&amp;&amp;(c=a,a=b),c=c||{};var d,e,f,g,h,i,j,k,l=p.ajaxSetup({},c),m=l.context||l,n=m!==l&amp;&amp;(m.nodeType||m instanceof p)?p(m):p.event,o=p.Deferred(),q=p.Callbacks(&quot;once memory&quot;),r=l.statusCode||{},t={},u={},v=0,w=&quot;canceled&quot;,x={readyState:0,setRequestHeader:function(a,b){if(!v){var c=a.toLowerCase();a=u[c]=u[c]||a,t[a]=b}return this},getAllResponseHeaders:function(){return v===2?e:null},getResponseHeader:function(a){var c;if(v===2){if(!f){f={};while(c=cm.exec(e))f[c[1].toLowerCase()]=c[2]}c=f[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){return v||(l.mimeType=a),this},abort:function(a){return a=a||w,g&amp;&amp;g.abort(a),y(0,a),this}};o.promise(x),x.success=x.done,x.error=x.fail,x.complete=q.add,x.statusCode=function(a){if(a){var b;if(v&lt;2)for(b in a)r[b]=[r[b],a[b]];else b=a[x.status],x.always(b)}return this},l.url=((a||l.url)+&quot;&quot;).replace(cl,&quot;&quot;).replace(cp,cj[1]+&quot;&#x2F;&#x2F;&quot;),l.dataTypes=p.trim(l.dataType||&quot;*&quot;).toLowerCase().split(s),l.crossDomain==null&amp;&amp;(i=ct.exec(l.url.toLowerCase())||!1,l.crossDomain=i&amp;&amp;i.join(&quot;:&quot;)+(i[3]?&quot;&quot;:i[1]===&quot;http:&quot;?80:443)!==cj.join(&quot;:&quot;)+(cj[3]?&quot;&quot;:cj[1]===&quot;http:&quot;?80:443)),l.data&amp;&amp;l.processData&amp;&amp;typeof l.data!=&quot;string&quot;&amp;&amp;(l.data=p.param(l.data,l.traditional)),cA(cv,l,c,x);if(v===2)return x;j=l.global,l.type=l.type.toUpperCase(),l.hasContent=!co.test(l.type),j&amp;&amp;p.active++===0&amp;&amp;p.event.trigger(&quot;ajaxStart&quot;);if(!l.hasContent){l.data&amp;&amp;(l.url+=(cq.test(l.url)?&quot;&amp;&quot;:&quot;?&quot;)+l.data,delete l.data),d=l.url;if(l.cache===!1){var z=p.now(),A=l.url.replace(cs,&quot;$1_=&quot;+z);l.url=A+(A===l.url?(cq.test(l.url)?&quot;&amp;&quot;:&quot;?&quot;)+&quot;_=&quot;+z:&quot;&quot;)}}(l.data&amp;&amp;l.hasContent&amp;&amp;l.contentType!==!1||c.contentType)&amp;&amp;x.setRequestHeader(&quot;Content-Type&quot;,l.contentType),l.ifModified&amp;&amp;(d=d||l.url,p.lastModified[d]&amp;&amp;x.setRequestHeader(&quot;If-Modified-Since&quot;,p.lastModified[d]),p.etag[d]&amp;&amp;x.setRequestHeader(&quot;If-None-Match&quot;,p.etag[d])),x.setRequestHeader(&quot;Accept&quot;,l.dataTypes[0]&amp;&amp;l.accepts[l.dataTypes[0]]?l.accepts[l.dataTypes[0]]+(l.dataTypes[0]!==&quot;*&quot;?&quot;, &quot;+cx+&quot;; q=0.01&quot;:&quot;&quot;):l.accepts[&quot;*&quot;]);for(k in l.headers)x.setRequestHeader(k,l.headers[k]);if(!l.beforeSend||l.beforeSend.call(m,x,l)!==!1&amp;&amp;v!==2){w=&quot;abort&quot;;for(k in{success:1,error:1,complete:1})x[k](l[k]);g=cA(cw,l,c,x);if(!g)y(-1,&quot;No Transport&quot;);else{x.readyState=1,j&amp;&amp;n.trigger(&quot;ajaxSend&quot;,[x,l]),l.async&amp;&amp;l.timeout&gt;0&amp;&amp;(h=setTimeout(function(){x.abort(&quot;timeout&quot;)},l.timeout));try{v=1,g.send(t,y)}catch(B){if(v&lt;2)y(-1,B);else throw B}}return x}return x.abort()},active:0,lastModified:{},etag:{}});var cE=[],cF=&#x2F;\\?&#x2F;,cG=&#x2F;(=)\\?(?=&amp;|$)|\\?\\?&#x2F;,cH=p.now();p.ajaxSetup({jsonp:&quot;callback&quot;,jsonpCallback:function(){var a=cE.pop()||p.expando+&quot;_&quot;+cH++;return this[a]=!0,a}}),p.ajaxPrefilter(&quot;json jsonp&quot;,function(c,d,e){var f,g,h,i=c.data,j=c.url,k=c.jsonp!==!1,l=k&amp;&amp;cG.test(j),m=k&amp;&amp;!l&amp;&amp;typeof i==&quot;string&quot;&amp;&amp;!(c.contentType||&quot;&quot;).indexOf(&quot;application&#x2F;x-www-form-urlencoded&quot;)&amp;&amp;cG.test(i);if(c.dataTypes[0]===&quot;jsonp&quot;||l||m)return f=c.jsonpCallback=p.isFunction(c.jsonpCallback)?c.jsonpCallback():c.jsonpCallback,g=a[f],l?c.url=j.replace(cG,&quot;$1&quot;+f):m?c.data=i.replace(cG,&quot;$1&quot;+f):k&amp;&amp;(c.url+=(cF.test(j)?&quot;&amp;&quot;:&quot;?&quot;)+c.jsonp+&quot;=&quot;+f),c.converters[&quot;script json&quot;]=function(){return h||p.error(f+&quot; was not called&quot;),h[0]},c.dataTypes[0]=&quot;json&quot;,a[f]=function(){h=arguments},e.always(function(){a[f]=g,c[f]&amp;&amp;(c.jsonpCallback=d.jsonpCallback,cE.push(f)),h&amp;&amp;p.isFunction(g)&amp;&amp;g(h[0]),h=g=b}),&quot;script&quot;}),p.ajaxSetup({accepts:{script:&quot;text&#x2F;javascript, application&#x2F;javascript, application&#x2F;ecmascript, application&#x2F;x-ecmascript&quot;},contents:{script:&#x2F;javascript|ecmascript&#x2F;},converters:{&quot;text script&quot;:function(a){return p.globalEval(a),a}}}),p.ajaxPrefilter(&quot;script&quot;,function(a){a.cache===b&amp;&amp;(a.cache=!1),a.crossDomain&amp;&amp;(a.type=&quot;GET&quot;,a.global=!1)}),p.ajaxTransport(&quot;script&quot;,function(a){if(a.crossDomain){var c,d=e.head||e.getElementsByTagName(&quot;head&quot;)[0]||e.documentElement;return{send:function(f,g){c=e.createElement(&quot;script&quot;),c.async=&quot;async&quot;,a.scriptCharset&amp;&amp;(c.charset=a.scriptCharset),c.src=a.url,c.onload=c.onreadystatechange=function(a,e){if(e||!c.readyState||&#x2F;loaded|complete&#x2F;.test(c.readyState))c.onload=c.onreadystatechange=null,d&amp;&amp;c.parentNode&amp;&amp;d.removeChild(c),c=b,e||g(200,&quot;success&quot;)},d.insertBefore(c,d.firstChild)},abort:function(){c&amp;&amp;c.onload(0,1)}}}});var cI,cJ=a.ActiveXObject?function(){for(var a in cI)cI[a](0,1)}:!1,cK=0;p.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&amp;&amp;cL()||cM()}:cL,function(a){p.extend(p.support,{ajax:!!a,cors:!!a&amp;&amp;&quot;withCredentials&quot;in a})}(p.ajaxSettings.xhr()),p.support.ajax&amp;&amp;p.ajaxTransport(function(c){if(!c.crossDomain||p.support.cors){var d;return{send:function(e,f){var g,h,i=c.xhr();c.username?i.open(c.type,c.url,c.async,c.username,c.password):i.open(c.type,c.url,c.async);if(c.xhrFields)for(h in c.xhrFields)i[h]=c.xhrFields[h];c.mimeType&amp;&amp;i.overrideMimeType&amp;&amp;i.overrideMimeType(c.mimeType),!c.crossDomain&amp;&amp;!e[&quot;X-Requested-With&quot;]&amp;&amp;(e[&quot;X-Requested-With&quot;]=&quot;XMLHttpRequest&quot;);try{for(h in e)i.setRequestHeader(h,e[h])}catch(j){}i.send(c.hasContent&amp;&amp;c.data||null),d=function(a,e){var h,j,k,l,m;try{if(d&amp;&amp;(e||i.readyState===4)){d=b,g&amp;&amp;(i.onreadystatechange=p.noop,cJ&amp;&amp;delete cI[g]);if(e)i.readyState!==4&amp;&amp;i.abort();else{h=i.status,k=i.getAllResponseHeaders(),l={},m=i.responseXML,m&amp;&amp;m.documentElement&amp;&amp;(l.xml=m);try{l.text=i.responseText}catch(a){}try{j=i.statusText}catch(n){j=&quot;&quot;}!h&amp;&amp;c.isLocal&amp;&amp;!c.crossDomain?h=l.text?200:404:h===1223&amp;&amp;(h=204)}}}catch(o){e||f(-1,o)}l&amp;&amp;f(h,j,l,k)},c.async?i.readyState===4?setTimeout(d,0):(g=++cK,cJ&amp;&amp;(cI||(cI={},p(a).unload(cJ)),cI[g]=d),i.onreadystatechange=d):d()},abort:function(){d&amp;&amp;d(0,1)}}}});var cN,cO,cP=&#x2F;^(?:toggle|show|hide)$&#x2F;,cQ=new RegExp(&quot;^(?:([-+])=|)(&quot;+q+&quot;)([a-z%]*)$&quot;,&quot;i&quot;),cR=&#x2F;queueHooks$&#x2F;,cS=[cY],cT={&quot;*&quot;:[function(a,b){var c,d,e=this.createTween(a,b),f=cQ.exec(b),g=e.cur(),h=+g||0,i=1,j=20;if(f){c=+f[2],d=f[3]||(p.cssNumber[a]?&quot;&quot;:&quot;px&quot;);if(d!==&quot;px&quot;&amp;&amp;h){h=p.css(e.elem,a,!0)||c||1;do i=i||&quot;.5&quot;,h=h&#x2F;i,p.style(e.elem,a,h+d);while(i!==(i=e.cur()&#x2F;g)&amp;&amp;i!==1&amp;&amp;--j)}e.unit=d,e.start=h,e.end=f[1]?h+(f[1]+1)*c:c}return e}]};p.Animation=p.extend(cW,{tweener:function(a,b){p.isFunction(a)?(b=a,a=[&quot;*&quot;]):a=a.split(&quot; &quot;);var c,d=0,e=a.length;for(;d&lt;e;d++)c=a[d],cT[c]=cT[c]||[],cT[c].unshift(b)},prefilter:function(a,b){b?cS.unshift(a):cS.push(a)}}),p.Tween=cZ,cZ.prototype={constructor:cZ,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||&quot;swing&quot;,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(p.cssNumber[c]?&quot;&quot;:&quot;px&quot;)},cur:function(){var a=cZ.propHooks[this.prop];return a&amp;&amp;a.get?a.get(this):cZ.propHooks._default.get(this)},run:function(a){var b,c=cZ.propHooks[this.prop];return this.options.duration?this.pos=b=p.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&amp;&amp;this.options.step.call(this.elem,this.now,this),c&amp;&amp;c.set?c.set(this):cZ.propHooks._default.set(this),this}},cZ.prototype.init.prototype=cZ.prototype,cZ.propHooks={_default:{get:function(a){var b;return a.elem[a.prop]==null||!!a.elem.style&amp;&amp;a.elem.style[a.prop]!=null?(b=p.css(a.elem,a.prop,!1,&quot;&quot;),!b||b===&quot;auto&quot;?0:b):a.elem[a.prop]},set:function(a){p.fx.step[a.prop]?p.fx.step[a.prop](a):a.elem.style&amp;&amp;(a.elem.style[p.cssProps[a.prop]]!=null||p.cssHooks[a.prop])?p.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},cZ.propHooks.scrollTop=cZ.propHooks.scrollLeft={set:function(a){a.elem.nodeType&amp;&amp;a.elem.parentNode&amp;&amp;(a.elem[a.prop]=a.now)}},p.each([&quot;toggle&quot;,&quot;show&quot;,&quot;hide&quot;],function(a,b){var c=p.fn[b];p.fn[b]=function(d,e,f){return d==null||typeof d==&quot;boolean&quot;||!a&amp;&amp;p.isFunction(d)&amp;&amp;p.isFunction(e)?c.apply(this,arguments):this.animate(c$(b,!0),d,e,f)}}),p.fn.extend({fadeTo:function(a,b,c,d){return this.filter(bZ).css(&quot;opacity&quot;,0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=p.isEmptyObject(a),f=p.speed(b,c,d),g=function(){var b=cW(this,p.extend({},a),f);e&amp;&amp;b.stop(!0)};return e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,c,d){var e=function(a){var b=a.stop;delete a.stop,b(d)};return typeof a!=&quot;string&quot;&amp;&amp;(d=c,c=a,a=b),c&amp;&amp;a!==!1&amp;&amp;this.queue(a||&quot;fx&quot;,[]),this.each(function(){var b=!0,c=a!=null&amp;&amp;a+&quot;queueHooks&quot;,f=p.timers,g=p._data(this);if(c)g[c]&amp;&amp;g[c].stop&amp;&amp;e(g[c]);else for(c in g)g[c]&amp;&amp;g[c].stop&amp;&amp;cR.test(c)&amp;&amp;e(g[c]);for(c=f.length;c--;)f[c].elem===this&amp;&amp;(a==null||f[c].queue===a)&amp;&amp;(f[c].anim.stop(d),b=!1,f.splice(c,1));(b||!d)&amp;&amp;p.dequeue(this,a)})}}),p.each({slideDown:c$(&quot;show&quot;),slideUp:c$(&quot;hide&quot;),slideToggle:c$(&quot;toggle&quot;),fadeIn:{opacity:&quot;show&quot;},fadeOut:{opacity:&quot;hide&quot;},fadeToggle:{opacity:&quot;toggle&quot;}},function(a,b){p.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),p.speed=function(a,b,c){var d=a&amp;&amp;typeof a==&quot;object&quot;?p.extend({},a):{complete:c||!c&amp;&amp;b||p.isFunction(a)&amp;&amp;a,duration:a,easing:c&amp;&amp;b||b&amp;&amp;!p.isFunction(b)&amp;&amp;b};d.duration=p.fx.off?0:typeof d.duration==&quot;number&quot;?d.duration:d.duration in p.fx.speeds?p.fx.speeds[d.duration]:p.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue=&quot;fx&quot;;return d.old=d.complete,d.complete=function(){p.isFunction(d.old)&amp;&amp;d.old.call(this),d.queue&amp;&amp;p.dequeue(this,d.queue)},d},p.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)&#x2F;2}},p.timers=[],p.fx=cZ.prototype.init,p.fx.tick=function(){var a,b=p.timers,c=0;for(;c&lt;b.length;c++)a=b[c],!a()&amp;&amp;b[c]===a&amp;&amp;b.splice(c--,1);b.length||p.fx.stop()},p.fx.timer=function(a){a()&amp;&amp;p.timers.push(a)&amp;&amp;!cO&amp;&amp;(cO=setInterval(p.fx.tick,p.fx.interval))},p.fx.interval=13,p.fx.stop=function(){clearInterval(cO),cO=null},p.fx.speeds={slow:600,fast:200,_default:400},p.fx.step={},p.expr&amp;&amp;p.expr.filters&amp;&amp;(p.expr.filters.animated=function(a){return p.grep(p.timers,function(b){return a===b.elem}).length});var c_=&#x2F;^(?:body|html)$&#x2F;i;p.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){p.offset.setOffset(this,a,b)});var c,d,e,f,g,h,i,j={top:0,left:0},k=this[0],l=k&amp;&amp;k.ownerDocument;if(!l)return;return(d=l.body)===k?p.offset.bodyOffset(k):(c=l.documentElement,p.contains(c,k)?(typeof k.getBoundingClientRect!=&quot;undefined&quot;&amp;&amp;(j=k.getBoundingClientRect()),e=da(l),f=c.clientTop||d.clientTop||0,g=c.clientLeft||d.clientLeft||0,h=e.pageYOffset||c.scrollTop,i=e.pageXOffset||c.scrollLeft,{top:j.top+h-f,left:j.left+i-g}):j)},p.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;return p.support.doesNotIncludeMarginInBodyOffset&amp;&amp;(b+=parseFloat(p.css(a,&quot;marginTop&quot;))||0,c+=parseFloat(p.css(a,&quot;marginLeft&quot;))||0),{top:b,left:c}},setOffset:function(a,b,c){var d=p.css(a,&quot;position&quot;);d===&quot;static&quot;&amp;&amp;(a.style.position=&quot;relative&quot;);var e=p(a),f=e.offset(),g=p.css(a,&quot;top&quot;),h=p.css(a,&quot;left&quot;),i=(d===&quot;absolute&quot;||d===&quot;fixed&quot;)&amp;&amp;p.inArray(&quot;auto&quot;,[g,h])&gt;-1,j={},k={},l,m;i?(k=e.position(),l=k.top,m=k.left):(l=parseFloat(g)||0,m=parseFloat(h)||0),p.isFunction(b)&amp;&amp;(b=b.call(a,c,f)),b.top!=null&amp;&amp;(j.top=b.top-f.top+l),b.left!=null&amp;&amp;(j.left=b.left-f.left+m),&quot;using&quot;in b?b.using.call(a,j):e.css(j)}},p.fn.extend({position:function(){if(!this[0])return;var a=this[0],b=this.offsetParent(),c=this.offset(),d=c_.test(b[0].nodeName)?{top:0,left:0}:b.offset();return c.top-=parseFloat(p.css(a,&quot;marginTop&quot;))||0,c.left-=parseFloat(p.css(a,&quot;marginLeft&quot;))||0,d.top+=parseFloat(p.css(b[0],&quot;borderTopWidth&quot;))||0,d.left+=parseFloat(p.css(b[0],&quot;borderLeftWidth&quot;))||0,{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||e.body;while(a&amp;&amp;!c_.test(a.nodeName)&amp;&amp;p.css(a,&quot;position&quot;)===&quot;static&quot;)a=a.offsetParent;return a||e.body})}}),p.each({scrollLeft:&quot;pageXOffset&quot;,scrollTop:&quot;pageYOffset&quot;},function(a,c){var d=&#x2F;Y&#x2F;.test(c);p.fn[a]=function(e){return p.access(this,function(a,e,f){var g=da(a);if(f===b)return g?c in g?g[c]:g.document.documentElement[e]:a[e];g?g.scrollTo(d?p(g).scrollLeft():f,d?f:p(g).scrollTop()):a[e]=f},a,e,arguments.length,null)}}),p.each({Height:&quot;height&quot;,Width:&quot;width&quot;},function(a,c){p.each({padding:&quot;inner&quot;+a,content:c,&quot;&quot;:&quot;outer&quot;+a},function(d,e){p.fn[e]=function(e,f){var g=arguments.length&amp;&amp;(d||typeof e!=&quot;boolean&quot;),h=d||(e===!0||f===!0?&quot;margin&quot;:&quot;border&quot;);return p.access(this,function(c,d,e){var f;return p.isWindow(c)?c.document.documentElement[&quot;client&quot;+a]:c.nodeType===9?(f=c.documentElement,Math.max(c.body[&quot;scroll&quot;+a],f[&quot;scroll&quot;+a],c.body[&quot;offset&quot;+a],f[&quot;offset&quot;+a],f[&quot;client&quot;+a])):e===b?p.css(c,d,e,h):p.style(c,d,e,h)},c,g?e:b,g,null)}})}),a.jQuery=a.$=p,typeof define==&quot;function&quot;&amp;&amp;define.amd&amp;&amp;define.amd.jQuery&amp;&amp;define(&quot;jquery&quot;,[],function(){return p})})(window);</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">1</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">&#x2F;*! jQuery v1.<ins>12</ins>.<ins>4</ins> <ins>|</ins> <ins>(c) jQuery Foundation </ins>| jquery.org&#x2F;license *&#x2F;</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">2</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">!function(a,b){&quot;object&quot;==typeof module&amp;&amp;&quot;object&quot;==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error(&quot;jQuery requires a window with a document&quot;);return b(a)}:b(a)}(&quot;undefined&quot;!=typeof window?window:this,function(a,b){var c=[],d=a.document,e=c.slice,f=c.concat,g=c.push,h=c.indexOf,i={},j=i.toString,k=i.hasOwnProperty,l={},m=&quot;1.12.4&quot;,n=function(a,b){return new n.fn.init(a,b)},o=&#x2F;^[\\s\\uFEFF\\xA0]+|[\\s\\uFEFF\\xA0]+$&#x2F;g,p=&#x2F;^-ms-&#x2F;,q=&#x2F;-([\\da-z])&#x2F;gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:&quot;&quot;,length:0,toArray:function(){return e.call(this)},get:function(a){return null!=a?0&gt;a?this[a+this.length]:this[a]:e.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a){return n.each(this,a)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(e.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0&gt;a?b:0);return this.pushStack(c&gt;=0&amp;&amp;b&gt;c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:g,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for(&quot;boolean&quot;==typeof g&amp;&amp;(j=g,g=arguments[h]||{},h++),&quot;object&quot;==typeof g||n.isFunction(g)||(g={}),h===i&amp;&amp;(g=this,h--);i&gt;h;h++)if(null!=(e=arguments[h]))for(d in e)a=g[d],c=e[d],g!==c&amp;&amp;(j&amp;&amp;c&amp;&amp;(n.isPlainObject(c)||(b=n.isArray(c)))?(b?(b=!1,f=a&amp;&amp;n.isArray(a)?a:[]):f=a&amp;&amp;n.isPlainObject(a)?a:{},g[d]=n.extend(j,f,c)):void 0!==c&amp;&amp;(g[d]=c));return g},n.extend({expando:&quot;jQuery&quot;+(m+Math.random()).replace(&#x2F;\\D&#x2F;g,&quot;&quot;),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return&quot;function&quot;===n.type(a)},isArray:Array.isArray||function(a){return&quot;array&quot;===n.type(a)},isWindow:function(a){return null!=a&amp;&amp;a==a.window},isNumeric:function(a){var b=a&amp;&amp;a.toString();return!n.isArray(a)&amp;&amp;b-parseFloat(b)+1&gt;=0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},isPlainObject:function(a){var b;if(!a||&quot;object&quot;!==n.type(a)||a.nodeType||n.isWindow(a))return!1;try{if(a.constructor&amp;&amp;!k.call(a,&quot;constructor&quot;)&amp;&amp;!k.call(a.constructor.prototype,&quot;isPrototypeOf&quot;))return!1}catch(c){return!1}if(!l.ownFirst)for(b in a)return k.call(a,b);for(b in a);return void 0===b||k.call(a,b)},type:function(a){return null==a?a+&quot;&quot;:&quot;object&quot;==typeof a||&quot;function&quot;==typeof a?i[j.call(a)]||&quot;object&quot;:typeof a},globalEval:function(b){b&amp;&amp;n.trim(b)&amp;&amp;(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(p,&quot;ms-&quot;).replace(q,r)},nodeName:function(a,b){return a.nodeName&amp;&amp;a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(s(a)){for(c=a.length;c&gt;d;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?&quot;&quot;:(a+&quot;&quot;).replace(o,&quot;&quot;)},makeArray:function(a,b){var c=b||[];return null!=a&amp;&amp;(s(Object(a))?n.merge(c,&quot;string&quot;==typeof a?[a]:a):g.call(c,a)),c},inArray:function(a,b,c){var d;if(b){if(h)return h.call(b,a,c);for(d=b.length,c=c?0&gt;c?Math.max(0,d+c):c:0;d&gt;c;c++)if(c in b&amp;&amp;b[c]===a)return c}return-1},merge:function(a,b){var c=+b.length,d=0,e=a.length;while(c&gt;d)a[e++]=b[d++];if(c!==c)while(void 0!==b[d])a[e++]=b[d++];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g&gt;f;f++)d=!b(a[f],f),d!==h&amp;&amp;e.push(a[f]);return e},map:function(a,b,c){var d,e,g=0,h=[];if(s(a))for(d=a.length;d&gt;g;g++)e=b(a[g],g,c),null!=e&amp;&amp;h.push(e);else for(g in a)e=b(a[g],g,c),null!=e&amp;&amp;h.push(e);return f.apply([],h)},guid:1,proxy:function(a,b){var c,d,f;return&quot;string&quot;==typeof b&amp;&amp;(f=a[b],b=a,a=f),n.isFunction(a)?(c=e.call(arguments,2),d=function(){return a.apply(b||this,c.concat(e.call(arguments)))},d.guid=a.guid=a.guid||n.guid++,d):void 0},now:function(){return+new Date},support:l}),&quot;function&quot;==typeof Symbol&amp;&amp;(n.fn[Symbol.iterator]=c[Symbol.iterator]),n.each(&quot;Boolean Number String Function Array Date RegExp Object Error Symbol&quot;.split(&quot; &quot;),function(a,b){i[&quot;[object &quot;+b+&quot;]&quot;]=b.toLowerCase()});function s(a){var b=!!a&amp;&amp;&quot;length&quot;in a&amp;&amp;a.length,c=n.type(a);return&quot;function&quot;===c||n.isWindow(a)?!1:&quot;array&quot;===c||0===b||&quot;number&quot;==typeof b&amp;&amp;b&gt;0&amp;&amp;b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u=&quot;sizzle&quot;+1*new Date,v=a.document,w=0,x=0,y=ga(),z=ga(),A=ga(),B=function(a,b){return a===b&amp;&amp;(l=!0),0},C=1&lt;&lt;31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d&gt;c;c++)if(a[c]===b)return c;return-1},K=&quot;checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped&quot;,L=&quot;[\\\\x20\\\\t\\\\r\\\\n\\\\f]&quot;,M=&quot;(?:\\\\\\\\.|[\\\\w-]|[^\\\\x00-\\\\xa0])+&quot;,N=&quot;\\\\[&quot;+L+&quot;*(&quot;+M+&quot;)(?:&quot;+L+&quot;*([*^$|!~]?=)&quot;+L+&quot;*(?:&#x27;((?:\\\\\\\\.|[^\\\\\\\\&#x27;])*)&#x27;|\\&quot;((?:\\\\\\\\.|[^\\\\\\\\\\&quot;])*)\\&quot;|(&quot;+M+&quot;))|)&quot;+L+&quot;*\\\\]&quot;,O=&quot;:(&quot;+M+&quot;)(?:\\\\(((&#x27;((?:\\\\\\\\.|[^\\\\\\\\&#x27;])*)&#x27;|\\&quot;((?:\\\\\\\\.|[^\\\\\\\\\\&quot;])*)\\&quot;)|((?:\\\\\\\\.|[^\\\\\\\\()[\\\\]]|&quot;+N+&quot;)*)|.*)\\\\)|)&quot;,P=new RegExp(L+&quot;+&quot;,&quot;g&quot;),Q=new RegExp(&quot;^&quot;+L+&quot;+|((?:^|[^\\\\\\\\])(?:\\\\\\\\.)*)&quot;+L+&quot;+$&quot;,&quot;g&quot;),R=new RegExp(&quot;^&quot;+L+&quot;*,&quot;+L+&quot;*&quot;),S=new RegExp(&quot;^&quot;+L+&quot;*([&gt;+~]|&quot;+L+&quot;)&quot;+L+&quot;*&quot;),T=new RegExp(&quot;=&quot;+L+&quot;*([^\\\\]&#x27;\\&quot;]*?)&quot;+L+&quot;*\\\\]&quot;,&quot;g&quot;),U=new RegExp(O),V=new RegExp(&quot;^&quot;+M+&quot;$&quot;),W={ID:new RegExp(&quot;^#(&quot;+M+&quot;)&quot;),CLASS:new RegExp(&quot;^\\\\.(&quot;+M+&quot;)&quot;),TAG:new RegExp(&quot;^(&quot;+M+&quot;|[*])&quot;),ATTR:new RegExp(&quot;^&quot;+N),PSEUDO:new RegExp(&quot;^&quot;+O),CHILD:new RegExp(&quot;^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\\\(&quot;+L+&quot;*(even|odd|(([+-]|)(\\\\d*)n|)&quot;+L+&quot;*(?:([+-]|)&quot;+L+&quot;*(\\\\d+)|))&quot;+L+&quot;*\\\\)|)&quot;,&quot;i&quot;),bool:new RegExp(&quot;^(?:&quot;+K+&quot;)$&quot;,&quot;i&quot;),needsContext:new RegExp(&quot;^&quot;+L+&quot;*[&gt;+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\\\(&quot;+L+&quot;*((?:-\\\\d)?\\\\d*)&quot;+L+&quot;*\\\\)|)(?=[^-]|$)&quot;,&quot;i&quot;)},X=&#x2F;^(?:input|select|textarea|button)$&#x2F;i,Y=&#x2F;^h\\d$&#x2F;i,Z=&#x2F;^[^{]+\\{\\s*\\[native \\w&#x2F;,$=&#x2F;^(?:#([\\w-]+)|(\\w+)|\\.([\\w-]+))$&#x2F;,_=&#x2F;[+~]&#x2F;,aa=&#x2F;&#x27;|\\\\&#x2F;g,ba=new RegExp(&quot;\\\\\\\\([\\\\da-f]{1,6}&quot;+L+&quot;?|(&quot;+L+&quot;)|.)&quot;,&quot;ig&quot;),ca=function(a,b,c){var d=&quot;0x&quot;+b-65536;return d!==d||c?b:0&gt;d?String.fromCharCode(d+65536):String.fromCharCode(d&gt;&gt;10|55296,1023&amp;d|56320)},da=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(ea){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fa(a,b,d,e){var f,h,j,k,l,o,r,s,w=b&amp;&amp;b.ownerDocument,x=b?b.nodeType:9;if(d=d||[],&quot;string&quot;!=typeof a||!a||1!==x&amp;&amp;9!==x&amp;&amp;11!==x)return d;if(!e&amp;&amp;((b?b.ownerDocument||b:v)!==n&amp;&amp;m(b),b=b||n,p)){if(11!==x&amp;&amp;(o=$.exec(a)))if(f=o[1]){if(9===x){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(w&amp;&amp;(j=w.getElementById(f))&amp;&amp;t(b,j)&amp;&amp;j.id===f)return d.push(j),d}else{if(o[2])return H.apply(d,b.getElementsByTagName(a)),d;if((f=o[3])&amp;&amp;c.getElementsByClassName&amp;&amp;b.getElementsByClassName)return H.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&amp;&amp;!A[a+&quot; &quot;]&amp;&amp;(!q||!q.test(a))){if(1!==x)w=b,s=a;else if(&quot;object&quot;!==b.nodeName.toLowerCase()){(k=b.getAttribute(&quot;id&quot;))?k=k.replace(aa,&quot;\\\\$&amp;&quot;):b.setAttribute(&quot;id&quot;,k=u),r=g(a),h=r.length,l=V.test(k)?&quot;#&quot;+k:&quot;[id=&#x27;&quot;+k+&quot;&#x27;]&quot;;while(h--)r[h]=l+&quot; &quot;+qa(r[h]);s=r.join(&quot;,&quot;),w=_.test(a)&amp;&amp;oa(b.parentNode)||b}if(s)try{return H.apply(d,w.querySelectorAll(s)),d}catch(y){}finally{k===u&amp;&amp;b.removeAttribute(&quot;id&quot;)}}}return i(a.replace(Q,&quot;$1&quot;),b,d,e)}function ga(){var a=[];function b(c,e){return a.push(c+&quot; &quot;)&gt;d.cacheLength&amp;&amp;delete b[a.shift()],b[c+&quot; &quot;]=e}return b}function ha(a){return a[u]=!0,a}function ia(a){var b=n.createElement(&quot;div&quot;);try{return!!a(b)}catch(c){return!1}finally{b.parentNode&amp;&amp;b.parentNode.removeChild(b),b=null}}function ja(a,b){var c=a.split(&quot;|&quot;),e=c.length;while(e--)d.attrHandle[c[e]]=b}function ka(a,b){var c=b&amp;&amp;a,d=c&amp;&amp;1===a.nodeType&amp;&amp;1===b.nodeType&amp;&amp;(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function la(a){return function(b){var c=b.nodeName.toLowerCase();return&quot;input&quot;===c&amp;&amp;b.type===a}}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return(&quot;input&quot;===c||&quot;button&quot;===c)&amp;&amp;b.type===a}}function na(a){return ha(function(b){return b=+b,ha(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&amp;&amp;(c[e]=!(d[e]=c[e]))})})}function oa(a){return a&amp;&amp;&quot;undefined&quot;!=typeof a.getElementsByTagName&amp;&amp;a}c=fa.support={},f=fa.isXML=function(a){var b=a&amp;&amp;(a.ownerDocument||a).documentElement;return b?&quot;HTML&quot;!==b.nodeName:!1},m=fa.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&amp;&amp;9===g.nodeType&amp;&amp;g.documentElement?(n=g,o=n.documentElement,p=!f(n),(e=n.defaultView)&amp;&amp;e.top!==e&amp;&amp;(e.addEventListener?e.addEventListener(&quot;unload&quot;,da,!1):e.attachEvent&amp;&amp;e.attachEvent(&quot;onunload&quot;,da)),c.attributes=ia(function(a){return a.className=&quot;i&quot;,!a.getAttribute(&quot;className&quot;)}),c.getElementsByTagName=ia(function(a){return a.appendChild(n.createComment(&quot;&quot;)),!a.getElementsByTagName(&quot;*&quot;).length}),c.getElementsByClassName=Z.test(n.getElementsByClassName),c.getById=ia(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if(&quot;undefined&quot;!=typeof b.getElementById&amp;&amp;p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){return a.getAttribute(&quot;id&quot;)===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){var c=&quot;undefined&quot;!=typeof a.getAttributeNode&amp;&amp;a.getAttributeNode(&quot;id&quot;);return c&amp;&amp;c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return&quot;undefined&quot;!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if(&quot;*&quot;===a){while(c=f[e++])1===c.nodeType&amp;&amp;d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&amp;&amp;function(a,b){return&quot;undefined&quot;!=typeof b.getElementsByClassName&amp;&amp;p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=Z.test(n.querySelectorAll))&amp;&amp;(ia(function(a){o.appendChild(a).innerHTML=&quot;&lt;a id=&#x27;&quot;+u+&quot;&#x27;&gt;&lt;&#x2F;a&gt;&lt;select id=&#x27;&quot;+u+&quot;-\\r\\\\&#x27; msallowcapture=&#x27;&#x27;&gt;&lt;option selected=&#x27;&#x27;&gt;&lt;&#x2F;option&gt;&lt;&#x2F;select&gt;&quot;,a.querySelectorAll(&quot;[msallowcapture^=&#x27;&#x27;]&quot;).length&amp;&amp;q.push(&quot;[*^$]=&quot;+L+&quot;*(?:&#x27;&#x27;|\\&quot;\\&quot;)&quot;),a.querySelectorAll(&quot;[selected]&quot;).length||q.push(&quot;\\\\[&quot;+L+&quot;*(?:value|&quot;+K+&quot;)&quot;),a.querySelectorAll(&quot;[id~=&quot;+u+&quot;-]&quot;).length||q.push(&quot;~=&quot;),a.querySelectorAll(&quot;:checked&quot;).length||q.push(&quot;:checked&quot;),a.querySelectorAll(&quot;a#&quot;+u+&quot;+*&quot;).length||q.push(&quot;.#.+[+~]&quot;)}),ia(function(a){var b=n.createElement(&quot;input&quot;);b.setAttribute(&quot;type&quot;,&quot;hidden&quot;),a.appendChild(b).setAttribute(&quot;name&quot;,&quot;D&quot;),a.querySelectorAll(&quot;[name=d]&quot;).length&amp;&amp;q.push(&quot;name&quot;+L+&quot;*[*^$|!~]?=&quot;),a.querySelectorAll(&quot;:enabled&quot;).length||q.push(&quot;:enabled&quot;,&quot;:disabled&quot;),a.querySelectorAll(&quot;*,:x&quot;),q.push(&quot;,.*:&quot;)})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&amp;&amp;ia(function(a){c.disconnectedMatch=s.call(a,&quot;div&quot;),s.call(a,&quot;[s!=&#x27;&#x27;]:x&quot;),r.push(&quot;!=&quot;,O)}),q=q.length&amp;&amp;new RegExp(q.join(&quot;|&quot;)),r=r.length&amp;&amp;new RegExp(r.join(&quot;|&quot;)),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&amp;&amp;b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&amp;&amp;16&amp;a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&amp;d||!c.sortDetached&amp;&amp;b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&amp;&amp;t(v,a)?-1:b===n||b.ownerDocument===v&amp;&amp;t(v,b)?1:k?J(k,a)-J(k,b):0:4&amp;d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return ka(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?ka(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},fa.matches=function(a,b){return fa(a,null,null,b)},fa.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&amp;&amp;m(a),b=b.replace(T,&quot;=&#x27;$1&#x27;]&quot;),c.matchesSelector&amp;&amp;p&amp;&amp;!A[b+&quot; &quot;]&amp;&amp;(!r||!r.test(b))&amp;&amp;(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&amp;&amp;11!==a.document.nodeType)return d}catch(e){}return fa(b,n,null,[a]).length&gt;0},fa.contains=function(a,b){return(a.ownerDocument||a)!==n&amp;&amp;m(a),t(a,b)},fa.attr=function(a,b){(a.ownerDocument||a)!==n&amp;&amp;m(a);var e=d.attrHandle[b.toLowerCase()],f=e&amp;&amp;D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&amp;&amp;f.specified?f.value:null},fa.error=function(a){throw new Error(&quot;Syntax error, unrecognized expression: &quot;+a)},fa.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&amp;&amp;a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&amp;&amp;(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fa.getText=function(a){var b,c=&quot;&quot;,d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if(&quot;string&quot;==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fa.selectors={cacheLength:50,createPseudo:ha,match:W,attrHandle:{},find:{},relative:{&quot;&gt;&quot;:{dir:&quot;parentNode&quot;,first:!0},&quot; &quot;:{dir:&quot;parentNode&quot;},&quot;+&quot;:{dir:&quot;previousSibling&quot;,first:!0},&quot;~&quot;:{dir:&quot;previousSibling&quot;}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ba,ca),a[3]=(a[3]||a[4]||a[5]||&quot;&quot;).replace(ba,ca),&quot;~=&quot;===a[2]&amp;&amp;(a[3]=&quot; &quot;+a[3]+&quot; &quot;),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),&quot;nth&quot;===a[1].slice(0,3)?(a[3]||fa.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*(&quot;even&quot;===a[3]||&quot;odd&quot;===a[3])),a[5]=+(a[7]+a[8]||&quot;odd&quot;===a[3])):a[3]&amp;&amp;fa.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&amp;&amp;a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||&quot;&quot;:c&amp;&amp;U.test(c)&amp;&amp;(b=g(c,!0))&amp;&amp;(b=c.indexOf(&quot;)&quot;,c.length-b)-c.length)&amp;&amp;(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ba,ca).toLowerCase();return&quot;*&quot;===a?function(){return!0}:function(a){return a.nodeName&amp;&amp;a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+&quot; &quot;];return b||(b=new RegExp(&quot;(^|&quot;+L+&quot;)&quot;+a+&quot;(&quot;+L+&quot;|$)&quot;))&amp;&amp;y(a,function(a){return b.test(&quot;string&quot;==typeof a.className&amp;&amp;a.className||&quot;undefined&quot;!=typeof a.getAttribute&amp;&amp;a.getAttribute(&quot;class&quot;)||&quot;&quot;)})},ATTR:function(a,b,c){return function(d){var e=fa.attr(d,a);return null==e?&quot;!=&quot;===b:b?(e+=&quot;&quot;,&quot;=&quot;===b?e===c:&quot;!=&quot;===b?e!==c:&quot;^=&quot;===b?c&amp;&amp;0===e.indexOf(c):&quot;*=&quot;===b?c&amp;&amp;e.indexOf(c)&gt;-1:&quot;$=&quot;===b?c&amp;&amp;e.slice(-c.length)===c:&quot;~=&quot;===b?(&quot; &quot;+e.replace(P,&quot; &quot;)+&quot; &quot;).indexOf(c)&gt;-1:&quot;|=&quot;===b?e===c||e.slice(0,c.length+1)===c+&quot;-&quot;:!1):!0}},CHILD:function(a,b,c,d,e){var f=&quot;nth&quot;!==a.slice(0,3),g=&quot;last&quot;!==a.slice(-4),h=&quot;of-type&quot;===b;return 1===d&amp;&amp;0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?&quot;nextSibling&quot;:&quot;previousSibling&quot;,q=b.parentNode,r=h&amp;&amp;b.nodeName.toLowerCase(),s=!i&amp;&amp;!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p=&quot;only&quot;===a&amp;&amp;!o&amp;&amp;&quot;nextSibling&quot;}return!0}if(o=[g?q.firstChild:q.lastChild],g&amp;&amp;s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&amp;&amp;j[1],t=n&amp;&amp;j[2],m=n&amp;&amp;q.childNodes[n];while(m=++n&amp;&amp;m&amp;&amp;m[p]||(t=n=0)||o.pop())if(1===m.nodeType&amp;&amp;++t&amp;&amp;m===b){k[a]=[w,n,t];break}}else if(s&amp;&amp;(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&amp;&amp;j[1],t=n),t===!1)while(m=++n&amp;&amp;m&amp;&amp;m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&amp;&amp;++t&amp;&amp;(s&amp;&amp;(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&amp;&amp;t&#x2F;d&gt;=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fa.error(&quot;unsupported pseudo: &quot;+a);return e[u]?e(b):e.length&gt;1?(c=[a,a,&quot;&quot;,b],d.setFilters.hasOwnProperty(a.toLowerCase())?ha(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ha(function(a){var b=[],c=[],d=h(a.replace(Q,&quot;$1&quot;));return d[u]?ha(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&amp;&amp;(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ha(function(a){return function(b){return fa(a,b).length&gt;0}}),contains:ha(function(a){return a=a.replace(ba,ca),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)&gt;-1}}),lang:ha(function(a){return V.test(a||&quot;&quot;)||fa.error(&quot;unsupported lang: &quot;+a),a=a.replace(ba,ca).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute(&quot;xml:lang&quot;)||b.getAttribute(&quot;lang&quot;))return c=c.toLowerCase(),c===a||0===c.indexOf(a+&quot;-&quot;);while((b=b.parentNode)&amp;&amp;1===b.nodeType);return!1}}),target:function(b){var c=a.location&amp;&amp;a.location.hash;return c&amp;&amp;c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&amp;&amp;(!n.hasFocus||n.hasFocus())&amp;&amp;!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return&quot;input&quot;===b&amp;&amp;!!a.checked||&quot;option&quot;===b&amp;&amp;!!a.selected},selected:function(a){return a.parentNode&amp;&amp;a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType&lt;6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return&quot;input&quot;===b&amp;&amp;&quot;button&quot;===a.type||&quot;button&quot;===b},text:function(a){var b;return&quot;input&quot;===a.nodeName.toLowerCase()&amp;&amp;&quot;text&quot;===a.type&amp;&amp;(null==(b=a.getAttribute(&quot;type&quot;))||&quot;text&quot;===b.toLowerCase())},first:na(function(){return[0]}),last:na(function(a,b){return[b-1]}),eq:na(function(a,b,c){return[0&gt;c?c+b:c]}),even:na(function(a,b){for(var c=0;b&gt;c;c+=2)a.push(c);return a}),odd:na(function(a,b){for(var c=1;b&gt;c;c+=2)a.push(c);return a}),lt:na(function(a,b,c){for(var d=0&gt;c?c+b:c;--d&gt;=0;)a.push(d);return a}),gt:na(function(a,b,c){for(var d=0&gt;c?c+b:c;++d&lt;b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=la(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=ma(b);function pa(){}pa.prototype=d.filters=d.pseudos,d.setFilters=new pa,g=fa.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+&quot; &quot;];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&amp;&amp;!(e=R.exec(h))||(e&amp;&amp;(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&amp;&amp;(c=e.shift(),f.push({value:c,type:e[0].replace(Q,&quot; &quot;)}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&amp;&amp;!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fa.error(a):z(a,i).slice(0)};function qa(a){for(var b=0,c=a.length,d=&quot;&quot;;c&gt;b;b++)d+=a[b].value;return d}function ra(a,b,c){var d=b.dir,e=c&amp;&amp;&quot;parentNode&quot;===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&amp;&amp;a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(j=b[u]||(b[u]={}),i=j[b.uniqueID]||(j[b.uniqueID]={}),(h=i[d])&amp;&amp;h[0]===w&amp;&amp;h[1]===f)return k[2]=h[2];if(i[d]=k,k[2]=a(b,c,g))return!0}}}function sa(a){return a.length&gt;1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ta(a,b,c){for(var d=0,e=b.length;e&gt;d;d++)fa(a,b[d],c);return c}function ua(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i&gt;h;h++)(f=a[h])&amp;&amp;(c&amp;&amp;!c(f,d,e)||(g.push(f),j&amp;&amp;b.push(h)));return g}function va(a,b,c,d,e,f){return d&amp;&amp;!d[u]&amp;&amp;(d=va(d)),e&amp;&amp;!e[u]&amp;&amp;(e=va(e,f)),ha(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ta(b||&quot;*&quot;,h.nodeType?[h]:h,[]),q=!a||!f&amp;&amp;b?p:ua(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&amp;&amp;c(q,r,h,i),d){j=ua(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&amp;&amp;(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&amp;&amp;j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&amp;&amp;(j=e?J(f,l):m[k])&gt;-1&amp;&amp;(f[j]=!(g[j]=l))}}else r=ua(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[&quot; &quot;],i=g?1:0,k=ra(function(a){return a===b},h,!0),l=ra(function(a){return J(b,a)&gt;-1},h,!0),m=[function(a,c,d){var e=!g&amp;&amp;(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f&gt;i;i++)if(c=d.relative[a[i].type])m=[ra(sa(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f&gt;e;e++)if(d.relative[a[e].type])break;return va(i&gt;1&amp;&amp;sa(m),i&gt;1&amp;&amp;qa(a.slice(0,i-1).concat({value:&quot; &quot;===a[i-2].type?&quot;*&quot;:&quot;&quot;})).replace(Q,&quot;$1&quot;),c,e&gt;i&amp;&amp;wa(a.slice(i,e)),f&gt;e&amp;&amp;wa(a=a.slice(e)),f&gt;e&amp;&amp;qa(a))}m.push(c)}return sa(m)}function xa(a,b){var c=b.length&gt;0,e=a.length&gt;0,f=function(f,g,h,i,k){var l,o,q,r=0,s=&quot;0&quot;,t=f&amp;&amp;[],u=[],v=j,x=f||e&amp;&amp;d.find.TAG(&quot;*&quot;,k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&amp;&amp;(j=g===n||g||k);s!==z&amp;&amp;null!=(l=x[s]);s++){if(e&amp;&amp;l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&amp;&amp;(w=y)}c&amp;&amp;((l=!q&amp;&amp;l)&amp;&amp;r--,f&amp;&amp;t.push(l))}if(r+=s,c&amp;&amp;s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r&gt;0)while(s--)t[s]||u[s]||(u[s]=F.call(i));u=ua(u)}H.apply(i,u),k&amp;&amp;!f&amp;&amp;u.length&gt;0&amp;&amp;r+b.length&gt;1&amp;&amp;fa.uniqueSort(i)}return k&amp;&amp;(w=y,j=v),t};return c?ha(f):f}return h=fa.compile=function(a,b){var c,d=[],e=[],f=A[a+&quot; &quot;];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xa(e,d)),f.selector=a}return f},i=fa.select=function(a,b,e,f){var i,j,k,l,m,n=&quot;function&quot;==typeof a&amp;&amp;a,o=!f&amp;&amp;g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length&gt;2&amp;&amp;&quot;ID&quot;===(k=j[0]).type&amp;&amp;c.getById&amp;&amp;9===b.nodeType&amp;&amp;p&amp;&amp;d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ba,ca),b)||[])[0],!b)return e;n&amp;&amp;(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&amp;&amp;(f=m(k.matches[0].replace(ba,ca),_.test(j[0].type)&amp;&amp;oa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&amp;&amp;qa(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||_.test(a)&amp;&amp;oa(b.parentNode)||b),e},c.sortStable=u.split(&quot;&quot;).sort(B).join(&quot;&quot;)===u,c.detectDuplicates=!!l,m(),c.sortDetached=ia(function(a){return 1&amp;a.compareDocumentPosition(n.createElement(&quot;div&quot;))}),ia(function(a){return a.innerHTML=&quot;&lt;a href=&#x27;#&#x27;&gt;&lt;&#x2F;a&gt;&quot;,&quot;#&quot;===a.firstChild.getAttribute(&quot;href&quot;)})||ja(&quot;type|href|height|width&quot;,function(a,b,c){return c?void 0:a.getAttribute(b,&quot;type&quot;===b.toLowerCase()?1:2)}),c.attributes&amp;&amp;ia(function(a){return a.innerHTML=&quot;&lt;input&#x2F;&gt;&quot;,a.firstChild.setAttribute(&quot;value&quot;,&quot;&quot;),&quot;&quot;===a.firstChild.getAttribute(&quot;value&quot;)})||ja(&quot;value&quot;,function(a,b,c){return c||&quot;input&quot;!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ia(function(a){return null==a.getAttribute(&quot;disabled&quot;)})||ja(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&amp;&amp;d.specified?d.value:null}),fa}(a);n.find=t,n.expr=t.selectors,n.expr[&quot;:&quot;]=n.expr.pseudos,n.uniqueSort=n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&amp;&amp;9!==a.nodeType)if(1===a.nodeType){if(e&amp;&amp;n(a).is(c))break;d.push(a)}return d},v=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&amp;&amp;a!==b&amp;&amp;c.push(a);return c},w=n.expr.match.needsContext,x=&#x2F;^&lt;([\\w-]+)\\s*\\&#x2F;?&gt;(?:&lt;\\&#x2F;\\1&gt;|)$&#x2F;,y=&#x2F;^.[^:#\\[\\.,]*$&#x2F;;function z(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if(&quot;string&quot;==typeof b){if(y.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return n.inArray(a,b)&gt;-1!==c})}n.filter=function(a,b,c){var d=b[0];return c&amp;&amp;(a=&quot;:not(&quot;+a+&quot;)&quot;),1===b.length&amp;&amp;1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=[],d=this,e=d.length;if(&quot;string&quot;!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;e&gt;b;b++)if(n.contains(d[b],this))return!0}));for(b=0;e&gt;b;b++)n.find(a,d[b],c);return c=this.pushStack(e&gt;1?n.unique(c):c),c.selector=this.selector?this.selector+&quot; &quot;+a:a,c},filter:function(a){return this.pushStack(z(this,a||[],!1))},not:function(a){return this.pushStack(z(this,a||[],!0))},is:function(a){return!!z(this,&quot;string&quot;==typeof a&amp;&amp;w.test(a)?n(a):a||[],!1).length}});var A,B=&#x2F;^(?:\\s*(&lt;[\\w\\W]+&gt;)[^&gt;]*|#([\\w-]*))$&#x2F;,C=n.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||A,&quot;string&quot;==typeof a){if(e=&quot;&lt;&quot;===a.charAt(0)&amp;&amp;&quot;&gt;&quot;===a.charAt(a.length-1)&amp;&amp;a.length&gt;=3?[null,a,null]:B.exec(a),!e||!e[1]&amp;&amp;b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(e[1],b&amp;&amp;b.nodeType?b.ownerDocument||b:d,!0)),x.test(e[1])&amp;&amp;n.isPlainObject(b))for(e in b)n.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}if(f=d.getElementById(e[2]),f&amp;&amp;f.parentNode){if(f.id!==e[2])return A.find(a);this.length=1,this[0]=f}return this.context=d,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?&quot;undefined&quot;!=typeof c.ready?c.ready(a):a(n):(void 0!==a.selector&amp;&amp;(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};C.prototype=n.fn,A=n(d);var D=&#x2F;^(?:parents|prev(?:Until|All))&#x2F;,E={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(a){var b,c=n(a,this),d=c.length;return this.filter(function(){for(b=0;d&gt;b;b++)if(n.contains(this,c[b]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=w.test(a)||&quot;string&quot;!=typeof a?n(a,b||this.context):0;e&gt;d;d++)for(c=this[d];c&amp;&amp;c!==b;c=c.parentNode)if(c.nodeType&lt;11&amp;&amp;(g?g.index(c)&gt;-1:1===c.nodeType&amp;&amp;n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length&gt;1?n.uniqueSort(f):f)},index:function(a){return a?&quot;string&quot;==typeof a?n.inArray(this[0],n(a)):n.inArray(a.jquery?a[0]:a,this):this[0]&amp;&amp;this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function F(a,b){do a=a[b];while(a&amp;&amp;1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&amp;&amp;11!==b.nodeType?b:null},parents:function(a){return u(a,&quot;parentNode&quot;)},parentsUntil:function(a,b,c){return u(a,&quot;parentNode&quot;,c)},next:function(a){return F(a,&quot;nextSibling&quot;)},prev:function(a){return F(a,&quot;previousSibling&quot;)},nextAll:function(a){return u(a,&quot;nextSibling&quot;)},prevAll:function(a){return u(a,&quot;previousSibling&quot;)},nextUntil:function(a,b,c){return u(a,&quot;nextSibling&quot;,c)},prevUntil:function(a,b,c){return u(a,&quot;previousSibling&quot;,c)},siblings:function(a){return v((a.parentNode||{}).firstChild,a)},children:function(a){return v(a.firstChild)},contents:function(a){return n.nodeName(a,&quot;iframe&quot;)?a.contentDocument||a.contentWindow.document:n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return&quot;Until&quot;!==a.slice(-5)&amp;&amp;(d=c),d&amp;&amp;&quot;string&quot;==typeof d&amp;&amp;(e=n.filter(d,e)),this.length&gt;1&amp;&amp;(E[a]||(e=n.uniqueSort(e)),D.test(a)&amp;&amp;(e=e.reverse())),this.pushStack(e)}});var G=&#x2F;\\S+&#x2F;g;function H(a){var b={};return n.each(a.match(G)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a=&quot;string&quot;==typeof a?H(a):n.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h&lt;f.length)f[h].apply(c[0],c[1])===!1&amp;&amp;a.stopOnFalse&amp;&amp;(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&amp;&amp;(f=c?[]:&quot;&quot;)},j={add:function(){return f&amp;&amp;(c&amp;&amp;!b&amp;&amp;(h=f.length-1,g.push(c)),function d(b){n.each(b,function(b,c){n.isFunction(c)?a.unique&amp;&amp;j.has(c)||f.push(c):c&amp;&amp;c.length&amp;&amp;&quot;string&quot;!==n.type(c)&amp;&amp;d(c)})}(arguments),c&amp;&amp;!b&amp;&amp;i()),this},remove:function(){return n.each(arguments,function(a,b){var c;while((c=n.inArray(b,f,c))&gt;-1)f.splice(c,1),h&gt;=c&amp;&amp;h--}),this},has:function(a){return a?n.inArray(a,f)&gt;-1:f.length&gt;0},empty:function(){return f&amp;&amp;(f=[]),this},disable:function(){return e=g=[],f=c=&quot;&quot;,this},disabled:function(){return!f},lock:function(){return e=!0,c||j.disable(),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j},n.extend({Deferred:function(a){var b=[[&quot;resolve&quot;,&quot;done&quot;,n.Callbacks(&quot;once memory&quot;),&quot;resolved&quot;],[&quot;reject&quot;,&quot;fail&quot;,n.Callbacks(&quot;once memory&quot;),&quot;rejected&quot;],[&quot;notify&quot;,&quot;progress&quot;,n.Callbacks(&quot;memory&quot;)]],c=&quot;pending&quot;,d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&amp;&amp;a[b];e[f[1]](function(){var a=g&amp;&amp;g.apply(this,arguments);a&amp;&amp;n.isFunction(a.promise)?a.promise().progress(c.notify).done(c.resolve).fail(c.reject):c[f[0]+&quot;With&quot;](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&amp;&amp;g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+&quot;With&quot;](this===e?d:this,arguments),this},e[f[0]+&quot;With&quot;]=g.fireWith}),d.promise(e),a&amp;&amp;a.call(e,e),e},when:function(a){var b=0,c=e.call(arguments),d=c.length,f=1!==d||a&amp;&amp;n.isFunction(a.promise)?d:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length&gt;1?e.call(arguments):d,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(d&gt;1)for(i=new Array(d),j=new Array(d),k=new Array(d);d&gt;b;b++)c[b]&amp;&amp;n.isFunction(c[b].promise)?c[b].promise().progress(h(b,j,i)).done(h(b,k,c)).fail(g.reject):--f;return f||g.resolveWith(k,c),g.promise()}});var I;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&amp;&amp;--n.readyWait&gt;0||(I.resolveWith(d,[n]),n.fn.triggerHandler&amp;&amp;(n(d).triggerHandler(&quot;ready&quot;),n(d).off(&quot;ready&quot;))))}});function J(){d.addEventListener?(d.removeEventListener(&quot;DOMContentLoaded&quot;,K),a.removeEventListener(&quot;load&quot;,K)):(d.detachEvent(&quot;onreadystatechange&quot;,K),a.detachEvent(&quot;onload&quot;,K))}function K(){(d.addEventListener||&quot;load&quot;===a.event.type||&quot;complete&quot;===d.readyState)&amp;&amp;(J(),n.ready())}n.ready.promise=function(b){if(!I)if(I=n.Deferred(),&quot;complete&quot;===d.readyState||&quot;loading&quot;!==d.readyState&amp;&amp;!d.documentElement.doScroll)a.setTimeout(n.ready);else if(d.addEventListener)d.addEventListener(&quot;DOMContentLoaded&quot;,K),a.addEventListener(&quot;load&quot;,K);else{d.attachEvent(&quot;onreadystatechange&quot;,K),a.attachEvent(&quot;onload&quot;,K);var c=!1;try{c=null==a.frameElement&amp;&amp;d.documentElement}catch(e){}c&amp;&amp;c.doScroll&amp;&amp;!function f(){if(!n.isReady){try{c.doScroll(&quot;left&quot;)}catch(b){return a.setTimeout(f,50)}J(),n.ready()}}()}return I.promise(b)},n.ready.promise();var L;for(L in n(l))break;l.ownFirst=&quot;0&quot;===L,l.inlineBlockNeedsLayout=!1,n(function(){var a,b,c,e;c=d.getElementsByTagName(&quot;body&quot;)[0],c&amp;&amp;c.style&amp;&amp;(b=d.createElement(&quot;div&quot;),e=d.createElement(&quot;div&quot;),e.style.cssText=&quot;position:absolute;border:0;width:0;height:0;top:0;left:-9999px&quot;,c.appendChild(e).appendChild(b),&quot;undefined&quot;!=typeof b.style.zoom&amp;&amp;(b.style.cssText=&quot;display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1&quot;,l.inlineBlockNeedsLayout=a=3===b.offsetWidth,a&amp;&amp;(c.style.zoom=1)),c.removeChild(e))}),function(){var a=d.createElement(&quot;div&quot;);l.deleteExpando=!0;try{delete a.test}catch(b){l.deleteExpando=!1}a=null}();var M=function(a){var b=n.noData[(a.nodeName+&quot; &quot;).toLowerCase()],c=+a.nodeType||1;return 1!==c&amp;&amp;9!==c?!1:!b||b!==!0&amp;&amp;a.getAttribute(&quot;classid&quot;)===b},N=&#x2F;^(?:\\{[\\w\\W]*\\}|\\[[\\w\\W]*\\])$&#x2F;,O=&#x2F;([A-Z])&#x2F;g;function P(a,b,c){if(void 0===c&amp;&amp;1===a.nodeType){var d=&quot;data-&quot;+b.replace(O,&quot;-$1&quot;).toLowerCase();if(c=a.getAttribute(d),&quot;string&quot;==typeof c){try{c=&quot;true&quot;===c?!0:&quot;false&quot;===c?!1:&quot;null&quot;===c?null:+c+&quot;&quot;===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}n.data(a,b,c)}else c=void 0;}return c}function Q(a){var b;for(b in a)if((&quot;data&quot;!==b||!n.isEmptyObject(a[b]))&amp;&amp;&quot;toJSON&quot;!==b)return!1;return!0}function R(a,b,d,e){if(M(a)){var f,g,h=n.expando,i=a.nodeType,j=i?n.cache:a,k=i?a[h]:a[h]&amp;&amp;h;if(k&amp;&amp;j[k]&amp;&amp;(e||j[k].data)||void 0!==d||&quot;string&quot;!=typeof b)return k||(k=i?a[h]=c.pop()||n.guid++:h),j[k]||(j[k]=i?{}:{toJSON:n.noop}),&quot;object&quot;!=typeof b&amp;&amp;&quot;function&quot;!=typeof b||(e?j[k]=n.extend(j[k],b):j[k].data=n.extend(j[k].data,b)),g=j[k],e||(g.data||(g.data={}),g=g.data),void 0!==d&amp;&amp;(g[n.camelCase(b)]=d),&quot;string&quot;==typeof b?(f=g[b],null==f&amp;&amp;(f=g[n.camelCase(b)])):f=g,f}}function S(a,b,c){if(M(a)){var d,e,f=a.nodeType,g=f?n.cache:a,h=f?a[n.expando]:n.expando;if(g[h]){if(b&amp;&amp;(d=c?g[h]:g[h].data)){n.isArray(b)?b=b.concat(n.map(b,n.camelCase)):b in d?b=[b]:(b=n.camelCase(b),b=b in d?[b]:b.split(&quot; &quot;)),e=b.length;while(e--)delete d[b[e]];if(c?!Q(d):!n.isEmptyObject(d))return}(c||(delete g[h].data,Q(g[h])))&amp;&amp;(f?n.cleanData([a],!0):l.deleteExpando||g!=g.window?delete g[h]:g[h]=void 0)}}}n.extend({cache:{},noData:{&quot;applet &quot;:!0,&quot;embed &quot;:!0,&quot;object &quot;:&quot;clsid:D27CDB6E-AE6D-11cf-96B8-444553540000&quot;},hasData:function(a){return a=a.nodeType?n.cache[a[n.expando]]:a[n.expando],!!a&amp;&amp;!Q(a)},data:function(a,b,c){return R(a,b,c)},removeData:function(a,b){return S(a,b)},_data:function(a,b,c){return R(a,b,c,!0)},_removeData:function(a,b){return S(a,b,!0)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&amp;&amp;f.attributes;if(void 0===a){if(this.length&amp;&amp;(e=n.data(f),1===f.nodeType&amp;&amp;!n._data(f,&quot;parsedAttrs&quot;))){c=g.length;while(c--)g[c]&amp;&amp;(d=g[c].name,0===d.indexOf(&quot;data-&quot;)&amp;&amp;(d=n.camelCase(d.slice(5)),P(f,d,e[d])));n._data(f,&quot;parsedAttrs&quot;,!0)}return e}return&quot;object&quot;==typeof a?this.each(function(){n.data(this,a)}):arguments.length&gt;1?this.each(function(){n.data(this,a,b)}):f?P(f,a,n.data(f,a)):void 0},removeData:function(a){return this.each(function(){n.removeData(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||&quot;fx&quot;)+&quot;queue&quot;,d=n._data(a,b),c&amp;&amp;(!d||n.isArray(c)?d=n._data(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||&quot;fx&quot;;var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};&quot;inprogress&quot;===e&amp;&amp;(e=c.shift(),d--),e&amp;&amp;(&quot;fx&quot;===b&amp;&amp;c.unshift(&quot;inprogress&quot;),delete f.stop,e.call(a,g,f)),!d&amp;&amp;f&amp;&amp;f.empty.fire()},_queueHooks:function(a,b){var c=b+&quot;queueHooks&quot;;return n._data(a,c)||n._data(a,c,{empty:n.Callbacks(&quot;once memory&quot;).add(function(){n._removeData(a,b+&quot;queue&quot;),n._removeData(a,c)})})}}),n.fn.extend({queue:function(a,b){var c=2;return&quot;string&quot;!=typeof a&amp;&amp;(b=a,a=&quot;fx&quot;,c--),arguments.length&lt;c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),&quot;fx&quot;===a&amp;&amp;&quot;inprogress&quot;!==c[0]&amp;&amp;n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||&quot;fx&quot;,[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};&quot;string&quot;!=typeof a&amp;&amp;(b=a,a=void 0),a=a||&quot;fx&quot;;while(g--)c=n._data(f[g],a+&quot;queueHooks&quot;),c&amp;&amp;c.empty&amp;&amp;(d++,c.empty.add(h));return h(),e.promise(b)}}),function(){var a;l.shrinkWrapBlocks=function(){if(null!=a)return a;a=!1;var b,c,e;return c=d.getElementsByTagName(&quot;body&quot;)[0],c&amp;&amp;c.style?(b=d.createElement(&quot;div&quot;),e=d.createElement(&quot;div&quot;),e.style.cssText=&quot;position:absolute;border:0;width:0;height:0;top:0;left:-9999px&quot;,c.appendChild(e).appendChild(b),&quot;undefined&quot;!=typeof b.style.zoom&amp;&amp;(b.style.cssText=&quot;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1&quot;,b.appendChild(d.createElement(&quot;div&quot;)).style.width=&quot;5px&quot;,a=3!==b.offsetWidth),c.removeChild(e),a):void 0}}();var T=&#x2F;[+-]?(?:\\d*\\.|)\\d+(?:[eE][+-]?\\d+|)&#x2F;.source,U=new RegExp(&quot;^(?:([+-])=|)(&quot;+T+&quot;)([a-z%]*)$&quot;,&quot;i&quot;),V=[&quot;Top&quot;,&quot;Right&quot;,&quot;Bottom&quot;,&quot;Left&quot;],W=function(a,b){return a=b||a,&quot;none&quot;===n.css(a,&quot;display&quot;)||!n.contains(a.ownerDocument,a)};function X(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return n.css(a,b,&quot;&quot;)},i=h(),j=c&amp;&amp;c[3]||(n.cssNumber[b]?&quot;&quot;:&quot;px&quot;),k=(n.cssNumber[b]||&quot;px&quot;!==j&amp;&amp;+i)&amp;&amp;U.exec(n.css(a,b));if(k&amp;&amp;k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||&quot;.5&quot;,k&#x2F;=f,n.style(a,b,k+j);while(f!==(f=h()&#x2F;i)&amp;&amp;1!==f&amp;&amp;--g)}return c&amp;&amp;(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&amp;&amp;(d.unit=j,d.start=k,d.end=e)),e}var Y=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if(&quot;object&quot;===n.type(c)){e=!0;for(h in c)Y(a,b,h,c[h],!0,f,g)}else if(void 0!==d&amp;&amp;(e=!0,n.isFunction(d)||(g=!0),j&amp;&amp;(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i&gt;h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},Z=&#x2F;^(?:checkbox|radio)$&#x2F;i,$=&#x2F;&lt;([\\w:-]+)&#x2F;,_=&#x2F;^$|\\&#x2F;(?:java|ecma)script&#x2F;i,aa=&#x2F;^\\s+&#x2F;,ba=&quot;abbr|article|aside|audio|bdi|canvas|data|datalist|details|dialog|figcaption|figure|footer|header|hgroup|main|mark|meter|nav|output|picture|progress|section|summary|template|time|video&quot;;function ca(a){var b=ba.split(&quot;|&quot;),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}!function(){var a=d.createElement(&quot;div&quot;),b=d.createDocumentFragment(),c=d.createElement(&quot;input&quot;);a.innerHTML=&quot;  &lt;link&#x2F;&gt;&lt;table&gt;&lt;&#x2F;table&gt;&lt;a href=&#x27;&#x2F;a&#x27;&gt;a&lt;&#x2F;a&gt;&lt;input type=&#x27;checkbox&#x27;&#x2F;&gt;&quot;,l.leadingWhitespace=3===a.firstChild.nodeType,l.tbody=!a.getElementsByTagName(&quot;tbody&quot;).length,l.htmlSerialize=!!a.getElementsByTagName(&quot;link&quot;).length,l.html5Clone=&quot;&lt;:nav&gt;&lt;&#x2F;:nav&gt;&quot;!==d.createElement(&quot;nav&quot;).cloneNode(!0).outerHTML,c.type=&quot;checkbox&quot;,c.checked=!0,b.appendChild(c),l.appendChecked=c.checked,a.innerHTML=&quot;&lt;textarea&gt;x&lt;&#x2F;textarea&gt;&quot;,l.noCloneChecked=!!a.cloneNode(!0).lastChild.defaultValue,b.appendChild(a),c=d.createElement(&quot;input&quot;),c.setAttribute(&quot;type&quot;,&quot;radio&quot;),c.setAttribute(&quot;checked&quot;,&quot;checked&quot;),c.setAttribute(&quot;name&quot;,&quot;t&quot;),a.appendChild(c),l.checkClone=a.cloneNode(!0).cloneNode(!0).lastChild.checked,l.noCloneEvent=!!a.addEventListener,a[n.expando]=1,l.attributes=!a.getAttribute(n.expando)}();var da={option:[1,&quot;&lt;select multiple=&#x27;multiple&#x27;&gt;&quot;,&quot;&lt;&#x2F;select&gt;&quot;],legend:[1,&quot;&lt;fieldset&gt;&quot;,&quot;&lt;&#x2F;fieldset&gt;&quot;],area:[1,&quot;&lt;map&gt;&quot;,&quot;&lt;&#x2F;map&gt;&quot;],param:[1,&quot;&lt;object&gt;&quot;,&quot;&lt;&#x2F;object&gt;&quot;],thead:[1,&quot;&lt;table&gt;&quot;,&quot;&lt;&#x2F;table&gt;&quot;],tr:[2,&quot;&lt;table&gt;&lt;tbody&gt;&quot;,&quot;&lt;&#x2F;tbody&gt;&lt;&#x2F;table&gt;&quot;],col:[2,&quot;&lt;table&gt;&lt;tbody&gt;&lt;&#x2F;tbody&gt;&lt;colgroup&gt;&quot;,&quot;&lt;&#x2F;colgroup&gt;&lt;&#x2F;table&gt;&quot;],td:[3,&quot;&lt;table&gt;&lt;tbody&gt;&lt;tr&gt;&quot;,&quot;&lt;&#x2F;tr&gt;&lt;&#x2F;tbody&gt;&lt;&#x2F;table&gt;&quot;],_default:l.htmlSerialize?[0,&quot;&quot;,&quot;&quot;]:[1,&quot;X&lt;div&gt;&quot;,&quot;&lt;&#x2F;div&gt;&quot;]};da.optgroup=da.option,da.tbody=da.tfoot=da.colgroup=da.caption=da.thead,da.th=da.td;function ea(a,b){var c,d,e=0,f=&quot;undefined&quot;!=typeof a.getElementsByTagName?a.getElementsByTagName(b||&quot;*&quot;):&quot;undefined&quot;!=typeof a.querySelectorAll?a.querySelectorAll(b||&quot;*&quot;):void 0;if(!f)for(f=[],c=a.childNodes||a;null!=(d=c[e]);e++)!b||n.nodeName(d,b)?f.push(d):n.merge(f,ea(d,b));return void 0===b||b&amp;&amp;n.nodeName(a,b)?n.merge([a],f):f}function fa(a,b){for(var c,d=0;null!=(c=a[d]);d++)n._data(c,&quot;globalEval&quot;,!b||n._data(b[d],&quot;globalEval&quot;))}var ga=&#x2F;&lt;|&amp;#?\\w+;&#x2F;,ha=&#x2F;&lt;tbody&#x2F;i;function ia(a){Z.test(a.type)&amp;&amp;(a.defaultChecked=a.checked)}function ja(a,b,c,d,e){for(var f,g,h,i,j,k,m,o=a.length,p=ca(b),q=[],r=0;o&gt;r;r++)if(g=a[r],g||0===g)if(&quot;object&quot;===n.type(g))n.merge(q,g.nodeType?[g]:g);else if(ga.test(g)){i=i||p.appendChild(b.createElement(&quot;div&quot;)),j=($.exec(g)||[&quot;&quot;,&quot;&quot;])[1].toLowerCase(),m=da[j]||da._default,i.innerHTML=m[1]+n.htmlPrefilter(g)+m[2],f=m[0];while(f--)i=i.lastChild;if(!l.leadingWhitespace&amp;&amp;aa.test(g)&amp;&amp;q.push(b.createTextNode(aa.exec(g)[0])),!l.tbody){g=&quot;table&quot;!==j||ha.test(g)?&quot;&lt;table&gt;&quot;!==m[1]||ha.test(g)?0:i:i.firstChild,f=g&amp;&amp;g.childNodes.length;while(f--)n.nodeName(k=g.childNodes[f],&quot;tbody&quot;)&amp;&amp;!k.childNodes.length&amp;&amp;g.removeChild(k)}n.merge(q,i.childNodes),i.textContent=&quot;&quot;;while(i.firstChild)i.removeChild(i.firstChild);i=p.lastChild}else q.push(b.createTextNode(g));i&amp;&amp;p.removeChild(i),l.appendChecked||n.grep(ea(q,&quot;input&quot;),ia),r=0;while(g=q[r++])if(d&amp;&amp;n.inArray(g,d)&gt;-1)e&amp;&amp;e.push(g);else if(h=n.contains(g.ownerDocument,g),i=ea(p.appendChild(g),&quot;script&quot;),h&amp;&amp;fa(i),c){f=0;while(g=i[f++])_.test(g.type||&quot;&quot;)&amp;&amp;c.push(g)}return i=null,p}!function(){var b,c,e=d.createElement(&quot;div&quot;);for(b in{submit:!0,change:!0,focusin:!0})c=&quot;on&quot;+b,(l[b]=c in a)||(e.setAttribute(c,&quot;t&quot;),l[b]=e.attributes[c].expando===!1);e=null}();var ka=&#x2F;^(?:input|select|textarea)$&#x2F;i,la=&#x2F;^key&#x2F;,ma=&#x2F;^(?:mouse|pointer|contextmenu|drag|drop)|click&#x2F;,na=&#x2F;^(?:focusinfocus|focusoutblur)$&#x2F;,oa=&#x2F;^([^.]*)(?:\\.(.+)|)&#x2F;;function pa(){return!0}function qa(){return!1}function ra(){try{return d.activeElement}catch(a){}}function sa(a,b,c,d,e,f){var g,h;if(&quot;object&quot;==typeof b){&quot;string&quot;!=typeof c&amp;&amp;(d=d||c,c=void 0);for(h in b)sa(a,h,c,d,b[h],f);return a}if(null==d&amp;&amp;null==e?(e=c,d=c=void 0):null==e&amp;&amp;(&quot;string&quot;==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=qa;else if(!e)return a;return 1===f&amp;&amp;(g=e,e=function(a){return n().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=n.guid++)),a.each(function(){n.event.add(this,b,e,d,c)})}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=n._data(a);if(r){c.handler&amp;&amp;(i=c,c=i.handler,e=i.selector),c.guid||(c.guid=n.guid++),(g=r.events)||(g=r.events={}),(k=r.handle)||(k=r.handle=function(a){return&quot;undefined&quot;==typeof n||a&amp;&amp;n.event.triggered===a.type?void 0:n.event.dispatch.apply(k.elem,arguments)},k.elem=a),b=(b||&quot;&quot;).match(G)||[&quot;&quot;],h=b.length;while(h--)f=oa.exec(b[h])||[],o=q=f[1],p=(f[2]||&quot;&quot;).split(&quot;.&quot;).sort(),o&amp;&amp;(j=n.event.special[o]||{},o=(e?j.delegateType:j.bindType)||o,j=n.event.special[o]||{},l=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&amp;&amp;n.expr.match.needsContext.test(e),namespace:p.join(&quot;.&quot;)},i),(m=g[o])||(m=g[o]=[],m.delegateCount=0,j.setup&amp;&amp;j.setup.call(a,d,p,k)!==!1||(a.addEventListener?a.addEventListener(o,k,!1):a.attachEvent&amp;&amp;a.attachEvent(&quot;on&quot;+o,k))),j.add&amp;&amp;(j.add.call(a,l),l.handler.guid||(l.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,l):m.push(l),n.event.global[o]=!0);a=null}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=n.hasData(a)&amp;&amp;n._data(a);if(r&amp;&amp;(k=r.events)){b=(b||&quot;&quot;).match(G)||[&quot;&quot;],j=b.length;while(j--)if(h=oa.exec(b[j])||[],o=q=h[1],p=(h[2]||&quot;&quot;).split(&quot;.&quot;).sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=k[o]||[],h=h[2]&amp;&amp;new RegExp(&quot;(^|\\\\.)&quot;+p.join(&quot;\\\\.(?:.*\\\\.|)&quot;)+&quot;(\\\\.|$)&quot;),i=f=m.length;while(f--)g=m[f],!e&amp;&amp;q!==g.origType||c&amp;&amp;c.guid!==g.guid||h&amp;&amp;!h.test(g.namespace)||d&amp;&amp;d!==g.selector&amp;&amp;(&quot;**&quot;!==d||!g.selector)||(m.splice(f,1),g.selector&amp;&amp;m.delegateCount--,l.remove&amp;&amp;l.remove.call(a,g));i&amp;&amp;!m.length&amp;&amp;(l.teardown&amp;&amp;l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete k[o])}else for(o in k)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(k)&amp;&amp;(delete r.handle,n._removeData(a,&quot;events&quot;))}},trigger:function(b,c,e,f){var g,h,i,j,l,m,o,p=[e||d],q=k.call(b,&quot;type&quot;)?b.type:b,r=k.call(b,&quot;namespace&quot;)?b.namespace.split(&quot;.&quot;):[];if(i=m=e=e||d,3!==e.nodeType&amp;&amp;8!==e.nodeType&amp;&amp;!na.test(q+n.event.triggered)&amp;&amp;(q.indexOf(&quot;.&quot;)&gt;-1&amp;&amp;(r=q.split(&quot;.&quot;),q=r.shift(),r.sort()),h=q.indexOf(&quot;:&quot;)&lt;0&amp;&amp;&quot;on&quot;+q,b=b[n.expando]?b:new n.Event(q,&quot;object&quot;==typeof b&amp;&amp;b),b.isTrigger=f?2:3,b.namespace=r.join(&quot;.&quot;),b.rnamespace=b.namespace?new RegExp(&quot;(^|\\\\.)&quot;+r.join(&quot;\\\\.(?:.*\\\\.|)&quot;)+&quot;(\\\\.|$)&quot;):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:n.makeArray(c,[b]),l=n.event.special[q]||{},f||!l.trigger||l.trigger.apply(e,c)!==!1)){if(!f&amp;&amp;!l.noBubble&amp;&amp;!n.isWindow(e)){for(j=l.delegateType||q,na.test(j+q)||(i=i.parentNode);i;i=i.parentNode)p.push(i),m=i;m===(e.ownerDocument||d)&amp;&amp;p.push(m.defaultView||m.parentWindow||a)}o=0;while((i=p[o++])&amp;&amp;!b.isPropagationStopped())b.type=o&gt;1?j:l.bindType||q,g=(n._data(i,&quot;events&quot;)||{})[b.type]&amp;&amp;n._data(i,&quot;handle&quot;),g&amp;&amp;g.apply(i,c),g=h&amp;&amp;i[h],g&amp;&amp;g.apply&amp;&amp;M(i)&amp;&amp;(b.result=g.apply(i,c),b.result===!1&amp;&amp;b.preventDefault());if(b.type=q,!f&amp;&amp;!b.isDefaultPrevented()&amp;&amp;(!l._default||l._default.apply(p.pop(),c)===!1)&amp;&amp;M(e)&amp;&amp;h&amp;&amp;e[q]&amp;&amp;!n.isWindow(e)){m=e[h],m&amp;&amp;(e[h]=null),n.event.triggered=q;try{e[q]()}catch(s){}n.event.triggered=void 0,m&amp;&amp;(e[h]=m)}return b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,d,f,g,h=[],i=e.call(arguments),j=(n._data(this,&quot;events&quot;)||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&amp;&amp;!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&amp;&amp;!a.isImmediatePropagationStopped())a.rnamespace&amp;&amp;!a.rnamespace.test(g.namespace)||(a.handleObj=g,a.data=g.data,d=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==d&amp;&amp;(a.result=d)===!1&amp;&amp;(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&amp;&amp;k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&amp;&amp;i.nodeType&amp;&amp;(&quot;click&quot;!==a.type||isNaN(a.button)||a.button&lt;1))for(;i!=this;i=i.parentNode||this)if(1===i.nodeType&amp;&amp;(i.disabled!==!0||&quot;click&quot;!==a.type)){for(d=[],c=0;h&gt;c;c++)f=b[c],e=f.selector+&quot; &quot;,void 0===d[e]&amp;&amp;(d[e]=f.needsContext?n(e,this).index(i)&gt;-1:n.find(e,this,null,[i]).length),d[e]&amp;&amp;d.push(f);d.length&amp;&amp;g.push({elem:i,handlers:d})}return h&lt;b.length&amp;&amp;g.push({elem:this,handlers:b.slice(h)}),g},fix:function(a){if(a[n.expando])return a;var b,c,e,f=a.type,g=a,h=this.fixHooks[f];h||(this.fixHooks[f]=h=ma.test(f)?this.mouseHooks:la.test(f)?this.keyHooks:{}),e=h.props?this.props.concat(h.props):this.props,a=new n.Event(g),b=e.length;while(b--)c=e[b],a[c]=g[c];return a.target||(a.target=g.srcElement||d),3===a.target.nodeType&amp;&amp;(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,h.filter?h.filter(a,g):a},props:&quot;altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which&quot;.split(&quot; &quot;),fixHooks:{},keyHooks:{props:&quot;char charCode key keyCode&quot;.split(&quot; &quot;),filter:function(a,b){return null==a.which&amp;&amp;(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:&quot;button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement&quot;.split(&quot; &quot;),filter:function(a,b){var c,e,f,g=b.button,h=b.fromElement;return null==a.pageX&amp;&amp;null!=b.clientX&amp;&amp;(e=a.target.ownerDocument||d,f=e.documentElement,c=e.body,a.pageX=b.clientX+(f&amp;&amp;f.scrollLeft||c&amp;&amp;c.scrollLeft||0)-(f&amp;&amp;f.clientLeft||c&amp;&amp;c.clientLeft||0),a.pageY=b.clientY+(f&amp;&amp;f.scrollTop||c&amp;&amp;c.scrollTop||0)-(f&amp;&amp;f.clientTop||c&amp;&amp;c.clientTop||0)),!a.relatedTarget&amp;&amp;h&amp;&amp;(a.relatedTarget=h===a.target?b.toElement:h),a.which||void 0===g||(a.which=1&amp;g?1:2&amp;g?3:4&amp;g?2:0),a}},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==ra()&amp;&amp;this.focus)try{return this.focus(),!1}catch(a){}},delegateType:&quot;focusin&quot;},blur:{trigger:function(){return this===ra()&amp;&amp;this.blur?(this.blur(),!1):void 0},delegateType:&quot;focusout&quot;},click:{trigger:function(){return n.nodeName(this,&quot;input&quot;)&amp;&amp;&quot;checkbox&quot;===this.type&amp;&amp;this.click?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,&quot;a&quot;)}},beforeunload:{postDispatch:function(a){void 0!==a.result&amp;&amp;a.originalEvent&amp;&amp;(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c){var d=n.extend(new n.Event,c,{type:a,isSimulated:!0});n.event.trigger(d,null,b),d.isDefaultPrevented()&amp;&amp;c.preventDefault()}},n.removeEvent=d.removeEventListener?function(a,b,c){a.removeEventListener&amp;&amp;a.removeEventListener(b,c)}:function(a,b,c){var d=&quot;on&quot;+b;a.detachEvent&amp;&amp;(&quot;undefined&quot;==typeof a[d]&amp;&amp;(a[d]=null),a.detachEvent(d,c))},n.Event=function(a,b){return this instanceof n.Event?(a&amp;&amp;a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&amp;&amp;a.returnValue===!1?pa:qa):this.type=a,b&amp;&amp;n.extend(this,b),this.timeStamp=a&amp;&amp;a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={constructor:n.Event,isDefaultPrevented:qa,isPropagationStopped:qa,isImmediatePropagationStopped:qa,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=pa,a&amp;&amp;(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=pa,a&amp;&amp;!this.isSimulated&amp;&amp;(a.stopPropagation&amp;&amp;a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=pa,a&amp;&amp;a.stopImmediatePropagation&amp;&amp;a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:&quot;mouseover&quot;,mouseleave:&quot;mouseout&quot;,pointerenter:&quot;pointerover&quot;,pointerleave:&quot;pointerout&quot;},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&amp;&amp;(e===d||n.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),l.submit||(n.event.special.submit={setup:function(){return n.nodeName(this,&quot;form&quot;)?!1:void n.event.add(this,&quot;click._submit keypress._submit&quot;,function(a){var b=a.target,c=n.nodeName(b,&quot;input&quot;)||n.nodeName(b,&quot;button&quot;)?n.prop(b,&quot;form&quot;):void 0;c&amp;&amp;!n._data(c,&quot;submit&quot;)&amp;&amp;(n.event.add(c,&quot;submit._submit&quot;,function(a){a._submitBubble=!0}),n._data(c,&quot;submit&quot;,!0))})},postDispatch:function(a){a._submitBubble&amp;&amp;(delete a._submitBubble,this.parentNode&amp;&amp;!a.isTrigger&amp;&amp;n.event.simulate(&quot;submit&quot;,this.parentNode,a))},teardown:function(){return n.nodeName(this,&quot;form&quot;)?!1:void n.event.remove(this,&quot;._submit&quot;)}}),l.change||(n.event.special.change={setup:function(){return ka.test(this.nodeName)?(&quot;checkbox&quot;!==this.type&amp;&amp;&quot;radio&quot;!==this.type||(n.event.add(this,&quot;propertychange._change&quot;,function(a){&quot;checked&quot;===a.originalEvent.propertyName&amp;&amp;(this._justChanged=!0)}),n.event.add(this,&quot;click._change&quot;,function(a){this._justChanged&amp;&amp;!a.isTrigger&amp;&amp;(this._justChanged=!1),n.event.simulate(&quot;change&quot;,this,a)})),!1):void n.event.add(this,&quot;beforeactivate._change&quot;,function(a){var b=a.target;ka.test(b.nodeName)&amp;&amp;!n._data(b,&quot;change&quot;)&amp;&amp;(n.event.add(b,&quot;change._change&quot;,function(a){!this.parentNode||a.isSimulated||a.isTrigger||n.event.simulate(&quot;change&quot;,this.parentNode,a)}),n._data(b,&quot;change&quot;,!0))})},handle:function(a){var b=a.target;return this!==b||a.isSimulated||a.isTrigger||&quot;radio&quot;!==b.type&amp;&amp;&quot;checkbox&quot;!==b.type?a.handleObj.handler.apply(this,arguments):void 0},teardown:function(){return n.event.remove(this,&quot;._change&quot;),!ka.test(this.nodeName)}}),l.focusin||n.each({focus:&quot;focusin&quot;,blur:&quot;focusout&quot;},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a))};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=n._data(d,b);e||d.addEventListener(a,c,!0),n._data(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=n._data(d,b)-1;e?n._data(d,b,e):(d.removeEventListener(a,c,!0),n._removeData(d,b))}}}),n.fn.extend({on:function(a,b,c,d){return sa(this,a,b,c,d)},one:function(a,b,c,d){return sa(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&amp;&amp;a.preventDefault&amp;&amp;a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+&quot;.&quot;+d.namespace:d.origType,d.selector,d.handler),this;if(&quot;object&quot;==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&amp;&amp;&quot;function&quot;!=typeof b||(c=b,b=void 0),c===!1&amp;&amp;(c=qa),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var ta=&#x2F; jQuery\\d+=&quot;(?:null|\\d+)&quot;&#x2F;g,ua=new RegExp(&quot;&lt;(?:&quot;+ba+&quot;)[\\\\s&#x2F;&gt;]&quot;,&quot;i&quot;),va=&#x2F;&lt;(?!area|br|col|embed|hr|img|input|link|meta|param)(([\\w:-]+)[^&gt;]*)\\&#x2F;&gt;&#x2F;gi,wa=&#x2F;&lt;script|&lt;style|&lt;link&#x2F;i,xa=&#x2F;checked\\s*(?:[^=]|=\\s*.checked.)&#x2F;i,ya=&#x2F;^true\\&#x2F;(.*)&#x2F;,za=&#x2F;^\\s*&lt;!(?:\\[CDATA\\[|--)|(?:\\]\\]|--)&gt;\\s*$&#x2F;g,Aa=ca(d),Ba=Aa.appendChild(d.createElement(&quot;div&quot;));function Ca(a,b){return n.nodeName(a,&quot;table&quot;)&amp;&amp;n.nodeName(11!==b.nodeType?b:b.firstChild,&quot;tr&quot;)?a.getElementsByTagName(&quot;tbody&quot;)[0]||a.appendChild(a.ownerDocument.createElement(&quot;tbody&quot;)):a}function Da(a){return a.type=(null!==n.find.attr(a,&quot;type&quot;))+&quot;&#x2F;&quot;+a.type,a}function Ea(a){var b=ya.exec(a.type);return b?a.type=b[1]:a.removeAttribute(&quot;type&quot;),a}function Fa(a,b){if(1===b.nodeType&amp;&amp;n.hasData(a)){var c,d,e,f=n._data(a),g=n._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;e&gt;d;d++)n.event.add(b,c,h[c][d])}g.data&amp;&amp;(g.data=n.extend({},g.data))}}function Ga(a,b){var c,d,e;if(1===b.nodeType){if(c=b.nodeName.toLowerCase(),!l.noCloneEvent&amp;&amp;b[n.expando]){e=n._data(b);for(d in e.events)n.removeEvent(b,d,e.handle);b.removeAttribute(n.expando)}&quot;script&quot;===c&amp;&amp;b.text!==a.text?(Da(b).text=a.text,Ea(b)):&quot;object&quot;===c?(b.parentNode&amp;&amp;(b.outerHTML=a.outerHTML),l.html5Clone&amp;&amp;a.innerHTML&amp;&amp;!n.trim(b.innerHTML)&amp;&amp;(b.innerHTML=a.innerHTML)):&quot;input&quot;===c&amp;&amp;Z.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&amp;&amp;(b.value=a.value)):&quot;option&quot;===c?b.defaultSelected=b.selected=a.defaultSelected:&quot;input&quot;!==c&amp;&amp;&quot;textarea&quot;!==c||(b.defaultValue=a.defaultValue)}}function Ha(a,b,c,d){b=f.apply([],b);var e,g,h,i,j,k,m=0,o=a.length,p=o-1,q=b[0],r=n.isFunction(q);if(r||o&gt;1&amp;&amp;&quot;string&quot;==typeof q&amp;&amp;!l.checkClone&amp;&amp;xa.test(q))return a.each(function(e){var f=a.eq(e);r&amp;&amp;(b[0]=q.call(this,e,f.html())),Ha(f,b,c,d)});if(o&amp;&amp;(k=ja(b,a[0].ownerDocument,!1,a,d),e=k.firstChild,1===k.childNodes.length&amp;&amp;(k=e),e||d)){for(i=n.map(ea(k,&quot;script&quot;),Da),h=i.length;o&gt;m;m++)g=k,m!==p&amp;&amp;(g=n.clone(g,!0,!0),h&amp;&amp;n.merge(i,ea(g,&quot;script&quot;))),c.call(a[m],g,m);if(h)for(j=i[i.length-1].ownerDocument,n.map(i,Ea),m=0;h&gt;m;m++)g=i[m],_.test(g.type||&quot;&quot;)&amp;&amp;!n._data(g,&quot;globalEval&quot;)&amp;&amp;n.contains(j,g)&amp;&amp;(g.src?n._evalUrl&amp;&amp;n._evalUrl(g.src):n.globalEval((g.text||g.textContent||g.innerHTML||&quot;&quot;).replace(za,&quot;&quot;)));k=e=null}return a}function Ia(a,b,c){for(var d,e=b?n.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||n.cleanData(ea(d)),d.parentNode&amp;&amp;(c&amp;&amp;n.contains(d.ownerDocument,d)&amp;&amp;fa(ea(d,&quot;script&quot;)),d.parentNode.removeChild(d));return a}n.extend({htmlPrefilter:function(a){return a.replace(va,&quot;&lt;$1&gt;&lt;&#x2F;$2&gt;&quot;)},clone:function(a,b,c){var d,e,f,g,h,i=n.contains(a.ownerDocument,a);if(l.html5Clone||n.isXMLDoc(a)||!ua.test(&quot;&lt;&quot;+a.nodeName+&quot;&gt;&quot;)?f=a.cloneNode(!0):(Ba.innerHTML=a.outerHTML,Ba.removeChild(f=Ba.firstChild)),!(l.noCloneEvent&amp;&amp;l.noCloneChecked||1!==a.nodeType&amp;&amp;11!==a.nodeType||n.isXMLDoc(a)))for(d=ea(f),h=ea(a),g=0;null!=(e=h[g]);++g)d[g]&amp;&amp;Ga(e,d[g]);if(b)if(c)for(h=h||ea(a),d=d||ea(f),g=0;null!=(e=h[g]);g++)Fa(e,d[g]);else Fa(a,f);return d=ea(f,&quot;script&quot;),d.length&gt;0&amp;&amp;fa(d,!i&amp;&amp;ea(a,&quot;script&quot;)),d=h=e=null,f},cleanData:function(a,b){for(var d,e,f,g,h=0,i=n.expando,j=n.cache,k=l.attributes,m=n.event.special;null!=(d=a[h]);h++)if((b||M(d))&amp;&amp;(f=d[i],g=f&amp;&amp;j[f])){if(g.events)for(e in g.events)m[e]?n.event.remove(d,e):n.removeEvent(d,e,g.handle);j[f]&amp;&amp;(delete j[f],k||&quot;undefined&quot;==typeof d.removeAttribute?d[i]=void 0:d.removeAttribute(i),c.push(f))}}}),n.fn.extend({domManip:Ha,detach:function(a){return Ia(this,a,!0)},remove:function(a){return Ia(this,a)},text:function(a){return Y(this,function(a){return void 0===a?n.text(this):this.empty().append((this[0]&amp;&amp;this[0].ownerDocument||d).createTextNode(a))},null,a,arguments.length)},append:function(){return Ha(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=Ca(this,a);b.appendChild(a)}})},prepend:function(){return Ha(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=Ca(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return Ha(this,arguments,function(a){this.parentNode&amp;&amp;this.parentNode.insertBefore(a,this)})},after:function(){return Ha(this,arguments,function(a){this.parentNode&amp;&amp;this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++){1===a.nodeType&amp;&amp;n.cleanData(ea(a,!1));while(a.firstChild)a.removeChild(a.firstChild);a.options&amp;&amp;n.nodeName(a,&quot;select&quot;)&amp;&amp;(a.options.length=0)}return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return Y(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a)return 1===b.nodeType?b.innerHTML.replace(ta,&quot;&quot;):void 0;if(&quot;string&quot;==typeof a&amp;&amp;!wa.test(a)&amp;&amp;(l.htmlSerialize||!ua.test(a))&amp;&amp;(l.leadingWhitespace||!aa.test(a))&amp;&amp;!da[($.exec(a)||[&quot;&quot;,&quot;&quot;])[1].toLowerCase()]){a=n.htmlPrefilter(a);try{for(;d&gt;c;c++)b=this[c]||{},1===b.nodeType&amp;&amp;(n.cleanData(ea(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&amp;&amp;this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return Ha(this,arguments,function(b){var c=this.parentNode;n.inArray(this,a)&lt;0&amp;&amp;(n.cleanData(ea(this)),c&amp;&amp;c.replaceChild(b,this))},a)}}),n.each({appendTo:&quot;append&quot;,prependTo:&quot;prepend&quot;,insertBefore:&quot;before&quot;,insertAfter:&quot;after&quot;,replaceAll:&quot;replaceWith&quot;},function(a,b){n.fn[a]=function(a){for(var c,d=0,e=[],f=n(a),h=f.length-1;h&gt;=d;d++)c=d===h?this:this.clone(!0),n(f[d])[b](c),g.apply(e,c.get());return this.pushStack(e)}});var Ja,Ka={HTML:&quot;block&quot;,BODY:&quot;block&quot;};function La(a,b){var c=n(b.createElement(a)).appendTo(b.body),d=n.css(c[0],&quot;display&quot;);return c.detach(),d}function Ma(a){var b=d,c=Ka[a];return c||(c=La(a,b),&quot;none&quot;!==c&amp;&amp;c||(Ja=(Ja||n(&quot;&lt;iframe frameborder=&#x27;0&#x27; width=&#x27;0&#x27; height=&#x27;0&#x27;&#x2F;&gt;&quot;)).appendTo(b.documentElement),b=(Ja[0].contentWindow||Ja[0].contentDocument).document,b.write(),b.close(),c=La(a,b),Ja.detach()),Ka[a]=c),c}var Na=&#x2F;^margin&#x2F;,Oa=new RegExp(&quot;^(&quot;+T+&quot;)(?!px)[a-z%]+$&quot;,&quot;i&quot;),Pa=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e},Qa=d.documentElement;!function(){var b,c,e,f,g,h,i=d.createElement(&quot;div&quot;),j=d.createElement(&quot;div&quot;);if(j.style){j.style.cssText=&quot;float:left;opacity:.5&quot;,l.opacity=&quot;0.5&quot;===j.style.opacity,l.cssFloat=!!j.style.cssFloat,j.style.backgroundClip=&quot;content-box&quot;,j.cloneNode(!0).style.backgroundClip=&quot;&quot;,l.clearCloneStyle=&quot;content-box&quot;===j.style.backgroundClip,i=d.createElement(&quot;div&quot;),i.style.cssText=&quot;border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute&quot;,j.innerHTML=&quot;&quot;,i.appendChild(j),l.boxSizing=&quot;&quot;===j.style.boxSizing||&quot;&quot;===j.style.MozBoxSizing||&quot;&quot;===j.style.WebkitBoxSizing,n.extend(l,{reliableHiddenOffsets:function(){return null==b&amp;&amp;k(),f},boxSizingReliable:function(){return null==b&amp;&amp;k(),e},pixelMarginRight:function(){return null==b&amp;&amp;k(),c},pixelPosition:function(){return null==b&amp;&amp;k(),b},reliableMarginRight:function(){return null==b&amp;&amp;k(),g},reliableMarginLeft:function(){return null==b&amp;&amp;k(),h}});function k(){var k,l,m=d.documentElement;m.appendChild(i),j.style.cssText=&quot;-webkit-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%&quot;,b=e=h=!1,c=g=!0,a.getComputedStyle&amp;&amp;(l=a.getComputedStyle(j),b=&quot;1%&quot;!==(l||{}).top,h=&quot;2px&quot;===(l||{}).marginLeft,e=&quot;4px&quot;===(l||{width:&quot;4px&quot;}).width,j.style.marginRight=&quot;50%&quot;,c=&quot;4px&quot;===(l||{marginRight:&quot;4px&quot;}).marginRight,k=j.appendChild(d.createElement(&quot;div&quot;)),k.style.cssText=j.style.cssText=&quot;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0&quot;,k.style.marginRight=k.style.width=&quot;0&quot;,j.style.width=&quot;1px&quot;,g=!parseFloat((a.getComputedStyle(k)||{}).marginRight),j.removeChild(k)),j.style.display=&quot;none&quot;,f=0===j.getClientRects().length,f&amp;&amp;(j.style.display=&quot;&quot;,j.innerHTML=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;&lt;&#x2F;td&gt;&lt;td&gt;t&lt;&#x2F;td&gt;&lt;&#x2F;tr&gt;&lt;&#x2F;table&gt;&quot;,j.childNodes[0].style.borderCollapse=&quot;separate&quot;,k=j.getElementsByTagName(&quot;td&quot;),k[0].style.cssText=&quot;margin:0;border:0;padding:0;display:none&quot;,f=0===k[0].offsetHeight,f&amp;&amp;(k[0].style.display=&quot;&quot;,k[1].style.display=&quot;none&quot;,f=0===k[0].offsetHeight)),m.removeChild(i)}}}();var Ra,Sa,Ta=&#x2F;^(top|right|bottom|left)$&#x2F;;a.getComputedStyle?(Ra=function(b){var c=b.ownerDocument.defaultView;return c&amp;&amp;c.opener||(c=a),c.getComputedStyle(b)},Sa=function(a,b,c){var d,e,f,g,h=a.style;return c=c||Ra(a),g=c?c.getPropertyValue(b)||c[b]:void 0,&quot;&quot;!==g&amp;&amp;void 0!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),c&amp;&amp;!l.pixelMarginRight()&amp;&amp;Oa.test(g)&amp;&amp;Na.test(b)&amp;&amp;(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f),void 0===g?g:g+&quot;&quot;}):Qa.currentStyle&amp;&amp;(Ra=function(a){return a.currentStyle},Sa=function(a,b,c){var d,e,f,g,h=a.style;return c=c||Ra(a),g=c?c[b]:void 0,null==g&amp;&amp;h&amp;&amp;h[b]&amp;&amp;(g=h[b]),Oa.test(g)&amp;&amp;!Ta.test(b)&amp;&amp;(d=h.left,e=a.runtimeStyle,f=e&amp;&amp;e.left,f&amp;&amp;(e.left=a.currentStyle.left),h.left=&quot;fontSize&quot;===b?&quot;1em&quot;:g,g=h.pixelLeft+&quot;px&quot;,h.left=d,f&amp;&amp;(e.left=f)),void 0===g?g:g+&quot;&quot;||&quot;auto&quot;});function Ua(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Va=&#x2F;alpha\\([^)]*\\)&#x2F;i,Wa=&#x2F;opacity\\s*=\\s*([^)]*)&#x2F;i,Xa=&#x2F;^(none|table(?!-c[ea]).+)&#x2F;,Ya=new RegExp(&quot;^(&quot;+T+&quot;)(.*)$&quot;,&quot;i&quot;),Za={position:&quot;absolute&quot;,visibility:&quot;hidden&quot;,display:&quot;block&quot;},$a={letterSpacing:&quot;0&quot;,fontWeight:&quot;400&quot;},_a=[&quot;Webkit&quot;,&quot;O&quot;,&quot;Moz&quot;,&quot;ms&quot;],ab=d.createElement(&quot;div&quot;).style;function bb(a){if(a in ab)return a;var b=a.charAt(0).toUpperCase()+a.slice(1),c=_a.length;while(c--)if(a=_a[c]+b,a in ab)return a}function cb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h&gt;g;g++)d=a[g],d.style&amp;&amp;(f[g]=n._data(d,&quot;olddisplay&quot;),c=d.style.display,b?(f[g]||&quot;none&quot;!==c||(d.style.display=&quot;&quot;),&quot;&quot;===d.style.display&amp;&amp;W(d)&amp;&amp;(f[g]=n._data(d,&quot;olddisplay&quot;,Ma(d.nodeName)))):(e=W(d),(c&amp;&amp;&quot;none&quot;!==c||!e)&amp;&amp;n._data(d,&quot;olddisplay&quot;,e?c:n.css(d,&quot;display&quot;))));for(g=0;h&gt;g;g++)d=a[g],d.style&amp;&amp;(b&amp;&amp;&quot;none&quot;!==d.style.display&amp;&amp;&quot;&quot;!==d.style.display||(d.style.display=b?f[g]||&quot;&quot;:&quot;none&quot;));return a}function db(a,b,c){var d=Ya.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||&quot;px&quot;):b}function eb(a,b,c,d,e){for(var f=c===(d?&quot;border&quot;:&quot;content&quot;)?4:&quot;width&quot;===b?1:0,g=0;4&gt;f;f+=2)&quot;margin&quot;===c&amp;&amp;(g+=n.css(a,c+V[f],!0,e)),d?(&quot;content&quot;===c&amp;&amp;(g-=n.css(a,&quot;padding&quot;+V[f],!0,e)),&quot;margin&quot;!==c&amp;&amp;(g-=n.css(a,&quot;border&quot;+V[f]+&quot;Width&quot;,!0,e))):(g+=n.css(a,&quot;padding&quot;+V[f],!0,e),&quot;padding&quot;!==c&amp;&amp;(g+=n.css(a,&quot;border&quot;+V[f]+&quot;Width&quot;,!0,e)));return g}function fb(a,b,c){var d=!0,e=&quot;width&quot;===b?a.offsetWidth:a.offsetHeight,f=Ra(a),g=l.boxSizing&amp;&amp;&quot;border-box&quot;===n.css(a,&quot;boxSizing&quot;,!1,f);if(0&gt;=e||null==e){if(e=Sa(a,b,f),(0&gt;e||null==e)&amp;&amp;(e=a.style[b]),Oa.test(e))return e;d=g&amp;&amp;(l.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+eb(a,b,c||(g?&quot;border&quot;:&quot;content&quot;),d,f)+&quot;px&quot;}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Sa(a,&quot;opacity&quot;);return&quot;&quot;===c?&quot;1&quot;:c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{&quot;float&quot;:l.cssFloat?&quot;cssFloat&quot;:&quot;styleFloat&quot;},style:function(a,b,c,d){if(a&amp;&amp;3!==a.nodeType&amp;&amp;8!==a.nodeType&amp;&amp;a.style){var e,f,g,h=n.camelCase(b),i=a.style;if(b=n.cssProps[h]||(n.cssProps[h]=bb(h)||h),g=n.cssHooks[b]||n.cssHooks[h],void 0===c)return g&amp;&amp;&quot;get&quot;in g&amp;&amp;void 0!==(e=g.get(a,!1,d))?e:i[b];if(f=typeof c,&quot;string&quot;===f&amp;&amp;(e=U.exec(c))&amp;&amp;e[1]&amp;&amp;(c=X(a,b,e),f=&quot;number&quot;),null!=c&amp;&amp;c===c&amp;&amp;(&quot;number&quot;===f&amp;&amp;(c+=e&amp;&amp;e[3]||(n.cssNumber[h]?&quot;&quot;:&quot;px&quot;)),l.clearCloneStyle||&quot;&quot;!==c||0!==b.indexOf(&quot;background&quot;)||(i[b]=&quot;inherit&quot;),!(g&amp;&amp;&quot;set&quot;in g&amp;&amp;void 0===(c=g.set(a,c,d)))))try{i[b]=c}catch(j){}}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=bb(h)||h),g=n.cssHooks[b]||n.cssHooks[h],g&amp;&amp;&quot;get&quot;in g&amp;&amp;(f=g.get(a,!0,c)),void 0===f&amp;&amp;(f=Sa(a,b,d)),&quot;normal&quot;===f&amp;&amp;b in $a&amp;&amp;(f=$a[b]),&quot;&quot;===c||c?(e=parseFloat(f),c===!0||isFinite(e)?e||0:f):f}}),n.each([&quot;height&quot;,&quot;width&quot;],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?Xa.test(n.css(a,&quot;display&quot;))&amp;&amp;0===a.offsetWidth?Pa(a,Za,function(){return fb(a,b,d)}):fb(a,b,d):void 0},set:function(a,c,d){var e=d&amp;&amp;Ra(a);return db(a,c,d?eb(a,b,d,l.boxSizing&amp;&amp;&quot;border-box&quot;===n.css(a,&quot;boxSizing&quot;,!1,e),e):0)}}}),l.opacity||(n.cssHooks.opacity={get:function(a,b){return Wa.test((b&amp;&amp;a.currentStyle?a.currentStyle.filter:a.style.filter)||&quot;&quot;)?.01*parseFloat(RegExp.$1)+&quot;&quot;:b?&quot;1&quot;:&quot;&quot;},set:function(a,b){var c=a.style,d=a.currentStyle,e=n.isNumeric(b)?&quot;alpha(opacity=&quot;+100*b+&quot;)&quot;:&quot;&quot;,f=d&amp;&amp;d.filter||c.filter||&quot;&quot;;c.zoom=1,(b&gt;=1||&quot;&quot;===b)&amp;&amp;&quot;&quot;===n.trim(f.replace(Va,&quot;&quot;))&amp;&amp;c.removeAttribute&amp;&amp;(c.removeAttribute(&quot;filter&quot;),&quot;&quot;===b||d&amp;&amp;!d.filter)||(c.filter=Va.test(f)?f.replace(Va,e):f+&quot; &quot;+e)}}),n.cssHooks.marginRight=Ua(l.reliableMarginRight,function(a,b){return b?Pa(a,{display:&quot;inline-block&quot;},Sa,[a,&quot;marginRight&quot;]):void 0}),n.cssHooks.marginLeft=Ua(l.reliableMarginLeft,function(a,b){return b?(parseFloat(Sa(a,&quot;marginLeft&quot;))||(n.contains(a.ownerDocument,a)?a.getBoundingClientRect().left-Pa(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}):0))+&quot;px&quot;:void 0}),n.each({margin:&quot;&quot;,padding:&quot;&quot;,border:&quot;Width&quot;},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f=&quot;string&quot;==typeof c?c.split(&quot; &quot;):[c];4&gt;d;d++)e[a+V[d]+b]=f[d]||f[d-2]||f[0];return e}},Na.test(a)||(n.cssHooks[a+b].set=db)}),n.fn.extend({css:function(a,b){return Y(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=Ra(a),e=b.length;e&gt;g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length&gt;1)},show:function(){return cb(this,!0)},hide:function(){return cb(this)},toggle:function(a){return&quot;boolean&quot;==typeof a?a?this.show():this.hide():this.each(function(){W(this)?n(this).show():n(this).hide()})}});function gb(a,b,c,d,e){return new gb.prototype.init(a,b,c,d,e)}n.Tween=gb,gb.prototype={constructor:gb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||n.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?&quot;&quot;:&quot;px&quot;)},cur:function(){var a=gb.propHooks[this.prop];return a&amp;&amp;a.get?a.get(this):gb.propHooks._default.get(this)},run:function(a){var b,c=gb.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&amp;&amp;this.options.step.call(this.elem,this.now,this),c&amp;&amp;c.set?c.set(this):gb.propHooks._default.set(this),this}},gb.prototype.init.prototype=gb.prototype,gb.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&amp;&amp;null==a.elem.style[a.prop]?a.elem[a.prop]:(b=n.css(a.elem,a.prop,&quot;&quot;),b&amp;&amp;&quot;auto&quot;!==b?b:0)},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[n.cssProps[a.prop]]&amp;&amp;!n.cssHooks[a.prop]?a.elem[a.prop]=a.now:n.style(a.elem,a.prop,a.now+a.unit)}}},gb.propHooks.scrollTop=gb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&amp;&amp;a.elem.parentNode&amp;&amp;(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)&#x2F;2},_default:&quot;swing&quot;},n.fx=gb.prototype.init,n.fx.step={};var hb,ib,jb=&#x2F;^(?:toggle|show|hide)$&#x2F;,kb=&#x2F;queueHooks$&#x2F;;function lb(){return a.setTimeout(function(){hb=void 0}),hb=n.now()}function mb(a,b){var c,d={height:a},e=0;for(b=b?1:0;4&gt;e;e+=2-b)c=V[e],d[&quot;margin&quot;+c]=d[&quot;padding&quot;+c]=a;return b&amp;&amp;(d.opacity=d.width=a),d}function nb(a,b,c){for(var d,e=(qb.tweeners[b]||[]).concat(qb.tweeners[&quot;*&quot;]),f=0,g=e.length;g&gt;f;f++)if(d=e[f].call(c,b,a))return d}function ob(a,b,c){var d,e,f,g,h,i,j,k,m=this,o={},p=a.style,q=a.nodeType&amp;&amp;W(a),r=n._data(a,&quot;fxshow&quot;);c.queue||(h=n._queueHooks(a,&quot;fx&quot;),null==h.unqueued&amp;&amp;(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,m.always(function(){m.always(function(){h.unqueued--,n.queue(a,&quot;fx&quot;).length||h.empty.fire()})})),1===a.nodeType&amp;&amp;(&quot;height&quot;in b||&quot;width&quot;in b)&amp;&amp;(c.overflow=[p.overflow,p.overflowX,p.overflowY],j=n.css(a,&quot;display&quot;),k=&quot;none&quot;===j?n._data(a,&quot;olddisplay&quot;)||Ma(a.nodeName):j,&quot;inline&quot;===k&amp;&amp;&quot;none&quot;===n.css(a,&quot;float&quot;)&amp;&amp;(l.inlineBlockNeedsLayout&amp;&amp;&quot;inline&quot;!==Ma(a.nodeName)?p.zoom=1:p.display=&quot;inline-block&quot;)),c.overflow&amp;&amp;(p.overflow=&quot;hidden&quot;,l.shrinkWrapBlocks()||m.always(function(){p.overflow=c.overflow[0],p.overflowX=c.overflow[1],p.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],jb.exec(e)){if(delete b[d],f=f||&quot;toggle&quot;===e,e===(q?&quot;hide&quot;:&quot;show&quot;)){if(&quot;show&quot;!==e||!r||void 0===r[d])continue;q=!0}o[d]=r&amp;&amp;r[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(o))&quot;inline&quot;===(&quot;none&quot;===j?Ma(a.nodeName):j)&amp;&amp;(p.display=j);else{r?&quot;hidden&quot;in r&amp;&amp;(q=r.hidden):r=n._data(a,&quot;fxshow&quot;,{}),f&amp;&amp;(r.hidden=!q),q?n(a).show():m.done(function(){n(a).hide()}),m.done(function(){var b;n._removeData(a,&quot;fxshow&quot;);for(b in o)n.style(a,b,o[b])});for(d in o)g=nb(q?r[d]:0,d,m),d in r||(r[d]=g.start,q&amp;&amp;(g.end=g.start,g.start=&quot;width&quot;===d||&quot;height&quot;===d?1:0))}}function pb(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&amp;&amp;(e=f[1],f=a[c]=f[0]),c!==d&amp;&amp;(a[d]=f,delete a[c]),g=n.cssHooks[d],g&amp;&amp;&quot;expand&quot;in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function qb(a,b,c){var d,e,f=0,g=qb.prefilters.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=hb||lb(),c=Math.max(0,j.startTime+j.duration-b),d=c&#x2F;j.duration||0,f=1-d,g=0,i=j.tweens.length;i&gt;g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1&gt;f&amp;&amp;i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},c),originalProperties:b,originalOptions:c,startTime:hb||lb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d&gt;c;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for(pb(k,j.opts.specialEasing);g&gt;f;f++)if(d=qb.prefilters[f].call(j,a,k,j.opts))return n.isFunction(d.stop)&amp;&amp;(n._queueHooks(j.elem,j.opts.queue).stop=n.proxy(d.stop,d)),d;return n.map(k,nb,j),n.isFunction(j.opts.start)&amp;&amp;j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(qb,{tweeners:{&quot;*&quot;:[function(a,b){var c=this.createTween(a,b);return X(c.elem,a,U.exec(b),c),c}]},tweener:function(a,b){n.isFunction(a)?(b=a,a=[&quot;*&quot;]):a=a.match(G);for(var c,d=0,e=a.length;e&gt;d;d++)c=a[d],qb.tweeners[c]=qb.tweeners[c]||[],qb.tweeners[c].unshift(b)},prefilters:[ob],prefilter:function(a,b){b?qb.prefilters.unshift(a):qb.prefilters.push(a)}}),n.speed=function(a,b,c){var d=a&amp;&amp;&quot;object&quot;==typeof a?n.extend({},a):{complete:c||!c&amp;&amp;b||n.isFunction(a)&amp;&amp;a,duration:a,easing:c&amp;&amp;b||b&amp;&amp;!n.isFunction(b)&amp;&amp;b};return d.duration=n.fx.off?0:&quot;number&quot;==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,null!=d.queue&amp;&amp;d.queue!==!0||(d.queue=&quot;fx&quot;),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&amp;&amp;d.old.call(this),d.queue&amp;&amp;n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(W).css(&quot;opacity&quot;,0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=qb(this,n.extend({},a),f);(e||n._data(this,&quot;finish&quot;))&amp;&amp;b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return&quot;string&quot;!=typeof a&amp;&amp;(c=b,b=a,a=void 0),b&amp;&amp;a!==!1&amp;&amp;this.queue(a||&quot;fx&quot;,[]),this.each(function(){var b=!0,e=null!=a&amp;&amp;a+&quot;queueHooks&quot;,f=n.timers,g=n._data(this);if(e)g[e]&amp;&amp;g[e].stop&amp;&amp;d(g[e]);else for(e in g)g[e]&amp;&amp;g[e].stop&amp;&amp;kb.test(e)&amp;&amp;d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&amp;&amp;f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&amp;&amp;c||n.dequeue(this,a)})},finish:function(a){return a!==!1&amp;&amp;(a=a||&quot;fx&quot;),this.each(function(){var b,c=n._data(this),d=c[a+&quot;queue&quot;],e=c[a+&quot;queueHooks&quot;],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&amp;&amp;e.stop&amp;&amp;e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&amp;&amp;f[b].queue===a&amp;&amp;(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g&gt;b;b++)d[b]&amp;&amp;d[b].finish&amp;&amp;d[b].finish.call(this);delete c.finish})}}),n.each([&quot;toggle&quot;,&quot;show&quot;,&quot;hide&quot;],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||&quot;boolean&quot;==typeof a?c.apply(this,arguments):this.animate(mb(b,!0),a,d,e)}}),n.each({slideDown:mb(&quot;show&quot;),slideUp:mb(&quot;hide&quot;),slideToggle:mb(&quot;toggle&quot;),fadeIn:{opacity:&quot;show&quot;},fadeOut:{opacity:&quot;hide&quot;},fadeToggle:{opacity:&quot;toggle&quot;}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=n.timers,c=0;for(hb=n.now();c&lt;b.length;c++)a=b[c],a()||b[c]!==a||b.splice(c--,1);b.length||n.fx.stop(),hb=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){ib||(ib=a.setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){a.clearInterval(ib),ib=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(b,c){return b=n.fx?n.fx.speeds[b]||b:b,c=c||&quot;fx&quot;,this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a,b=d.createElement(&quot;input&quot;),c=d.createElement(&quot;div&quot;),e=d.createElement(&quot;select&quot;),f=e.appendChild(d.createElement(&quot;option&quot;));c=d.createElement(&quot;div&quot;),c.setAttribute(&quot;className&quot;,&quot;t&quot;),c.innerHTML=&quot;  &lt;link&#x2F;&gt;&lt;table&gt;&lt;&#x2F;table&gt;&lt;a href=&#x27;&#x2F;a&#x27;&gt;a&lt;&#x2F;a&gt;&lt;input type=&#x27;checkbox&#x27;&#x2F;&gt;&quot;,a=c.getElementsByTagName(&quot;a&quot;)[0],b.setAttribute(&quot;type&quot;,&quot;checkbox&quot;),c.appendChild(b),a=c.getElementsByTagName(&quot;a&quot;)[0],a.style.cssText=&quot;top:1px&quot;,l.getSetAttribute=&quot;t&quot;!==c.className,l.style=&#x2F;top&#x2F;.test(a.getAttribute(&quot;style&quot;)),l.hrefNormalized=&quot;&#x2F;a&quot;===a.getAttribute(&quot;href&quot;),l.checkOn=!!b.value,l.optSelected=f.selected,l.enctype=!!d.createElement(&quot;form&quot;).enctype,e.disabled=!0,l.optDisabled=!f.disabled,b=d.createElement(&quot;input&quot;),b.setAttribute(&quot;value&quot;,&quot;&quot;),l.input=&quot;&quot;===b.getAttribute(&quot;value&quot;),b.value=&quot;t&quot;,b.setAttribute(&quot;type&quot;,&quot;radio&quot;),l.radioValue=&quot;t&quot;===b.value}();var rb=&#x2F;\\r&#x2F;g,sb=&#x2F;[\\x20\\t\\r\\n\\f]+&#x2F;g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&amp;&amp;(e=d?a.call(this,c,n(this).val()):a,null==e?e=&quot;&quot;:&quot;number&quot;==typeof e?e+=&quot;&quot;:n.isArray(e)&amp;&amp;(e=n.map(e,function(a){return null==a?&quot;&quot;:a+&quot;&quot;})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&amp;&amp;&quot;set&quot;in b&amp;&amp;void 0!==b.set(this,e,&quot;value&quot;)||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&amp;&amp;&quot;get&quot;in b&amp;&amp;void 0!==(c=b.get(e,&quot;value&quot;))?c:(c=e.value,&quot;string&quot;==typeof c?c.replace(rb,&quot;&quot;):null==c?&quot;&quot;:c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,&quot;value&quot;);return null!=b?b:n.trim(n.text(a)).replace(sb,&quot; &quot;)}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f=&quot;select-one&quot;===a.type||0&gt;e,g=f?null:[],h=f?e+1:d.length,i=0&gt;e?h:f?e:0;h&gt;i;i++)if(c=d[i],(c.selected||i===e)&amp;&amp;(l.optDisabled?!c.disabled:null===c.getAttribute(&quot;disabled&quot;))&amp;&amp;(!c.parentNode.disabled||!n.nodeName(c.parentNode,&quot;optgroup&quot;))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)if(d=e[g],n.inArray(n.valHooks.option.get(d),f)&gt;-1)try{d.selected=c=!0}catch(h){d.scrollHeight}else d.selected=!1;return c||(a.selectedIndex=-1),e}}}}),n.each([&quot;radio&quot;,&quot;checkbox&quot;],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)&gt;-1:void 0}},l.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute(&quot;value&quot;)?&quot;on&quot;:a.value})});var tb,ub,vb=n.expr.attrHandle,wb=&#x2F;^(?:checked|selected)$&#x2F;i,xb=l.getSetAttribute,yb=l.input;n.fn.extend({attr:function(a,b){return Y(this,n.attr,a,b,arguments.length&gt;1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&amp;&amp;8!==f&amp;&amp;2!==f)return&quot;undefined&quot;==typeof a.getAttribute?n.prop(a,b,c):(1===f&amp;&amp;n.isXMLDoc(a)||(b=b.toLowerCase(),e=n.attrHooks[b]||(n.expr.match.bool.test(b)?ub:tb)),void 0!==c?null===c?void n.removeAttr(a,b):e&amp;&amp;&quot;set&quot;in e&amp;&amp;void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+&quot;&quot;),c):e&amp;&amp;&quot;get&quot;in e&amp;&amp;null!==(d=e.get(a,b))?d:(d=n.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!l.radioValue&amp;&amp;&quot;radio&quot;===b&amp;&amp;n.nodeName(a,&quot;input&quot;)){var c=a.value;return a.setAttribute(&quot;type&quot;,b),c&amp;&amp;(a.value=c),b}}}},removeAttr:function(a,b){var c,d,e=0,f=b&amp;&amp;b.match(G);if(f&amp;&amp;1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)?yb&amp;&amp;xb||!wb.test(c)?a[d]=!1:a[n.camelCase(&quot;default-&quot;+c)]=a[d]=!1:n.attr(a,c,&quot;&quot;),a.removeAttribute(xb?c:d)}}),ub={set:function(a,b,c){return b===!1?n.removeAttr(a,c):yb&amp;&amp;xb||!wb.test(c)?a.setAttribute(!xb&amp;&amp;n.propFix[c]||c,c):a[n.camelCase(&quot;default-&quot;+c)]=a[c]=!0,c}},n.each(n.expr.match.bool.source.match(&#x2F;\\w+&#x2F;g),function(a,b){var c=vb[b]||n.find.attr;yb&amp;&amp;xb||!wb.test(b)?vb[b]=function(a,b,d){var e,f;return d||(f=vb[b],vb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,vb[b]=f),e}:vb[b]=function(a,b,c){return c?void 0:a[n.camelCase(&quot;default-&quot;+b)]?b.toLowerCase():null}}),yb&amp;&amp;xb||(n.attrHooks.value={set:function(a,b,c){return n.nodeName(a,&quot;input&quot;)?void(a.defaultValue=b):tb&amp;&amp;tb.set(a,b,c)}}),xb||(tb={set:function(a,b,c){var d=a.getAttributeNode(c);return d||a.setAttributeNode(d=a.ownerDocument.createAttribute(c)),d.value=b+=&quot;&quot;,&quot;value&quot;===c||b===a.getAttribute(c)?b:void 0}},vb.id=vb.name=vb.coords=function(a,b,c){var d;return c?void 0:(d=a.getAttributeNode(b))&amp;&amp;&quot;&quot;!==d.value?d.value:null},n.valHooks.button={get:function(a,b){var c=a.getAttributeNode(b);return c&amp;&amp;c.specified?c.value:void 0},set:tb.set},n.attrHooks.contenteditable={set:function(a,b,c){tb.set(a,&quot;&quot;===b?!1:b,c)}},n.each([&quot;width&quot;,&quot;height&quot;],function(a,b){n.attrHooks[b]={set:function(a,c){return&quot;&quot;===c?(a.setAttribute(b,&quot;auto&quot;),c):void 0}}})),l.style||(n.attrHooks.style={get:function(a){return a.style.cssText||void 0},set:function(a,b){return a.style.cssText=b+&quot;&quot;}});var zb=&#x2F;^(?:input|select|textarea|button|object)$&#x2F;i,Ab=&#x2F;^(?:a|area)$&#x2F;i;n.fn.extend({prop:function(a,b){return Y(this,n.prop,a,b,arguments.length&gt;1)},removeProp:function(a){return a=n.propFix[a]||a,this.each(function(){try{this[a]=void 0,delete this[a]}catch(b){}})}}),n.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&amp;&amp;8!==f&amp;&amp;2!==f)return 1===f&amp;&amp;n.isXMLDoc(a)||(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&amp;&amp;&quot;set&quot;in e&amp;&amp;void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&amp;&amp;&quot;get&quot;in e&amp;&amp;null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=n.find.attr(a,&quot;tabindex&quot;);return b?parseInt(b,10):zb.test(a.nodeName)||Ab.test(a.nodeName)&amp;&amp;a.href?0:-1}}},propFix:{&quot;for&quot;:&quot;htmlFor&quot;,&quot;class&quot;:&quot;className&quot;}}),l.hrefNormalized||n.each([&quot;href&quot;,&quot;src&quot;],function(a,b){n.propHooks[b]={get:function(a){return a.getAttribute(b,4)}}}),l.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&amp;&amp;(b.selectedIndex,b.parentNode&amp;&amp;b.parentNode.selectedIndex),null},set:function(a){var b=a.parentNode;b&amp;&amp;(b.selectedIndex,b.parentNode&amp;&amp;b.parentNode.selectedIndex)}}),n.each([&quot;tabIndex&quot;,&quot;readOnly&quot;,&quot;maxLength&quot;,&quot;cellSpacing&quot;,&quot;cellPadding&quot;,&quot;rowSpan&quot;,&quot;colSpan&quot;,&quot;useMap&quot;,&quot;frameBorder&quot;,&quot;contentEditable&quot;],function(){n.propFix[this.toLowerCase()]=this}),l.enctype||(n.propFix.enctype=&quot;encoding&quot;);var Bb=&#x2F;[\\t\\r\\n\\f]&#x2F;g;function Cb(a){return n.attr(a,&quot;class&quot;)||&quot;&quot;}n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,Cb(this)))});if(&quot;string&quot;==typeof a&amp;&amp;a){b=a.match(G)||[];while(c=this[i++])if(e=Cb(c),d=1===c.nodeType&amp;&amp;(&quot; &quot;+e+&quot; &quot;).replace(Bb,&quot; &quot;)){g=0;while(f=b[g++])d.indexOf(&quot; &quot;+f+&quot; &quot;)&lt;0&amp;&amp;(d+=f+&quot; &quot;);h=n.trim(d),e!==h&amp;&amp;n.attr(c,&quot;class&quot;,h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,Cb(this)))});if(!arguments.length)return this.attr(&quot;class&quot;,&quot;&quot;);if(&quot;string&quot;==typeof a&amp;&amp;a){b=a.match(G)||[];while(c=this[i++])if(e=Cb(c),d=1===c.nodeType&amp;&amp;(&quot; &quot;+e+&quot; &quot;).replace(Bb,&quot; &quot;)){g=0;while(f=b[g++])while(d.indexOf(&quot; &quot;+f+&quot; &quot;)&gt;-1)d=d.replace(&quot; &quot;+f+&quot; &quot;,&quot; &quot;);h=n.trim(d),e!==h&amp;&amp;n.attr(c,&quot;class&quot;,h)}}return this},toggleClass:function(a,b){var c=typeof a;return&quot;boolean&quot;==typeof b&amp;&amp;&quot;string&quot;===c?b?this.addClass(a):this.removeClass(a):n.isFunction(a)?this.each(function(c){n(this).toggleClass(a.call(this,c,Cb(this),b),b)}):this.each(function(){var b,d,e,f;if(&quot;string&quot;===c){d=0,e=n(this),f=a.match(G)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&amp;&amp;&quot;boolean&quot;!==c||(b=Cb(this),b&amp;&amp;n._data(this,&quot;__className__&quot;,b),n.attr(this,&quot;class&quot;,b||a===!1?&quot;&quot;:n._data(this,&quot;__className__&quot;)||&quot;&quot;))})},hasClass:function(a){var b,c,d=0;b=&quot; &quot;+a+&quot; &quot;;while(c=this[d++])if(1===c.nodeType&amp;&amp;(&quot; &quot;+Cb(c)+&quot; &quot;).replace(Bb,&quot; &quot;).indexOf(b)&gt;-1)return!0;return!1}}),n.each(&quot;blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu&quot;.split(&quot; &quot;),function(a,b){n.fn[b]=function(a,c){return arguments.length&gt;0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}});var Db=a.location,Eb=n.now(),Fb=&#x2F;\\?&#x2F;,Gb=&#x2F;(,)|(\\[|{)|(}|])|&quot;(?:[^&quot;\\\\\\r\\n]|\\\\[&quot;\\\\\\&#x2F;bfnrt]|\\\\u[\\da-fA-F]{4})*&quot;\\s*:?|true|false|null|-?(?!0\\d)\\d+(?:\\.\\d+|)(?:[eE][+-]?\\d+|)&#x2F;g;n.parseJSON=function(b){if(a.JSON&amp;&amp;a.JSON.parse)return a.JSON.parse(b+&quot;&quot;);var c,d=null,e=n.trim(b+&quot;&quot;);return e&amp;&amp;!n.trim(e.replace(Gb,function(a,b,e,f){return c&amp;&amp;b&amp;&amp;(d=0),0===d?a:(c=e||b,d+=!f-!e,&quot;&quot;)}))?Function(&quot;return &quot;+e)():n.error(&quot;Invalid JSON: &quot;+b)},n.parseXML=function(b){var c,d;if(!b||&quot;string&quot;!=typeof b)return null;try{a.DOMParser?(d=new a.DOMParser,c=d.parseFromString(b,&quot;text&#x2F;xml&quot;)):(c=new a.ActiveXObject(&quot;Microsoft.XMLDOM&quot;),c.async=&quot;false&quot;,c.loadXML(b))}catch(e){c=void 0}return c&amp;&amp;c.documentElement&amp;&amp;!c.getElementsByTagName(&quot;parsererror&quot;).length||n.error(&quot;Invalid XML: &quot;+b),c};var Hb=&#x2F;#.*$&#x2F;,Ib=&#x2F;([?&amp;])_=[^&amp;]*&#x2F;,Jb=&#x2F;^(.*?):[ \\t]*([^\\r\\n]*)\\r?$&#x2F;gm,Kb=&#x2F;^(?:about|app|app-storage|.+-extension|file|res|widget):$&#x2F;,Lb=&#x2F;^(?:GET|HEAD)$&#x2F;,Mb=&#x2F;^\\&#x2F;\\&#x2F;&#x2F;,Nb=&#x2F;^([\\w.+-]+:)(?:\\&#x2F;\\&#x2F;(?:[^\\&#x2F;?#]*@|)([^\\&#x2F;?#:]*)(?::(\\d+)|)|)&#x2F;,Ob={},Pb={},Qb=&quot;*&#x2F;&quot;.concat(&quot;*&quot;),Rb=Db.href,Sb=Nb.exec(Rb.toLowerCase())||[];function Tb(a){return function(b,c){&quot;string&quot;!=typeof b&amp;&amp;(c=b,b=&quot;*&quot;);var d,e=0,f=b.toLowerCase().match(G)||[];if(n.isFunction(c))while(d=f[e++])&quot;+&quot;===d.charAt(0)?(d=d.slice(1)||&quot;*&quot;,(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function Ub(a,b,c,d){var e={},f=a===Pb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return&quot;string&quot;!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e[&quot;*&quot;]&amp;&amp;g(&quot;*&quot;)}function Vb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(d in b)void 0!==b[d]&amp;&amp;((e[d]?a:c||(c={}))[d]=b[d]);return c&amp;&amp;n.extend(!0,a,c),a}function Wb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while(&quot;*&quot;===i[0])i.shift(),void 0===e&amp;&amp;(e=a.mimeType||b.getResponseHeader(&quot;Content-Type&quot;));if(e)for(g in h)if(h[g]&amp;&amp;h[g].test(e)){i.unshift(g);break}if(i[0]in c)f=i[0];else{for(g in c){if(!i[0]||a.converters[g+&quot; &quot;+i[0]]){f=g;break}d||(d=g)}f=f||d}return f?(f!==i[0]&amp;&amp;i.unshift(f),c[f]):void 0}function Xb(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&amp;&amp;(c[a.responseFields[f]]=b),!i&amp;&amp;d&amp;&amp;a.dataFilter&amp;&amp;(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if(&quot;*&quot;===f)f=i;else if(&quot;*&quot;!==i&amp;&amp;i!==f){if(g=j[i+&quot; &quot;+f]||j[&quot;* &quot;+f],!g)for(e in j)if(h=e.split(&quot; &quot;),h[1]===f&amp;&amp;(g=j[i+&quot; &quot;+h[0]]||j[&quot;* &quot;+h[0]])){g===!0?g=j[e]:j[e]!==!0&amp;&amp;(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&amp;&amp;a[&quot;throws&quot;])b=g(b);else try{b=g(b)}catch(l){return{state:&quot;parsererror&quot;,error:g?l:&quot;No conversion from &quot;+i+&quot; to &quot;+f}}}return{state:&quot;success&quot;,data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Rb,type:&quot;GET&quot;,isLocal:Kb.test(Sb[1]),global:!0,processData:!0,async:!0,contentType:&quot;application&#x2F;x-www-form-urlencoded; charset=UTF-8&quot;,accepts:{&quot;*&quot;:Qb,text:&quot;text&#x2F;plain&quot;,html:&quot;text&#x2F;html&quot;,xml:&quot;application&#x2F;xml, text&#x2F;xml&quot;,json:&quot;application&#x2F;json, text&#x2F;javascript&quot;},contents:{xml:&#x2F;\\bxml\\b&#x2F;,html:&#x2F;\\bhtml&#x2F;,json:&#x2F;\\bjson\\b&#x2F;},responseFields:{xml:&quot;responseXML&quot;,text:&quot;responseText&quot;,json:&quot;responseJSON&quot;},converters:{&quot;* text&quot;:String,&quot;text html&quot;:!0,&quot;text json&quot;:n.parseJSON,&quot;text xml&quot;:n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?Vb(Vb(a,n.ajaxSettings),b):Vb(n.ajaxSettings,a)},ajaxPrefilter:Tb(Ob),ajaxTransport:Tb(Pb),ajax:function(b,c){&quot;object&quot;==typeof b&amp;&amp;(c=b,b=void 0),c=c||{};var d,e,f,g,h,i,j,k,l=n.ajaxSetup({},c),m=l.context||l,o=l.context&amp;&amp;(m.nodeType||m.jquery)?n(m):n.event,p=n.Deferred(),q=n.Callbacks(&quot;once memory&quot;),r=l.statusCode||{},s={},t={},u=0,v=&quot;canceled&quot;,w={readyState:0,getResponseHeader:function(a){var b;if(2===u){if(!k){k={};while(b=Jb.exec(g))k[b[1].toLowerCase()]=b[2]}b=k[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===u?g:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return u||(a=t[c]=t[c]||a,s[a]=b),this},overrideMimeType:function(a){return u||(l.mimeType=a),this},statusCode:function(a){var b;if(a)if(2&gt;u)for(b in a)r[b]=[r[b],a[b]];else w.always(a[w.status]);return this},abort:function(a){var b=a||v;return j&amp;&amp;j.abort(b),y(0,b),this}};if(p.promise(w).complete=q.add,w.success=w.done,w.error=w.fail,l.url=((b||l.url||Rb)+&quot;&quot;).replace(Hb,&quot;&quot;).replace(Mb,Sb[1]+&quot;&#x2F;&#x2F;&quot;),l.type=c.method||c.type||l.method||l.type,l.dataTypes=n.trim(l.dataType||&quot;*&quot;).toLowerCase().match(G)||[&quot;&quot;],null==l.crossDomain&amp;&amp;(d=Nb.exec(l.url.toLowerCase()),l.crossDomain=!(!d||d[1]===Sb[1]&amp;&amp;d[2]===Sb[2]&amp;&amp;(d[3]||(&quot;http:&quot;===d[1]?&quot;80&quot;:&quot;443&quot;))===(Sb[3]||(&quot;http:&quot;===Sb[1]?&quot;80&quot;:&quot;443&quot;)))),l.data&amp;&amp;l.processData&amp;&amp;&quot;string&quot;!=typeof l.data&amp;&amp;(l.data=n.param(l.data,l.traditional)),Ub(Ob,l,c,w),2===u)return w;i=n.event&amp;&amp;l.global,i&amp;&amp;0===n.active++&amp;&amp;n.event.trigger(&quot;ajaxStart&quot;),l.type=l.type.toUpperCase(),l.hasContent=!Lb.test(l.type),f=l.url,l.hasContent||(l.data&amp;&amp;(f=l.url+=(Fb.test(f)?&quot;&amp;&quot;:&quot;?&quot;)+l.data,delete l.data),l.cache===!1&amp;&amp;(l.url=Ib.test(f)?f.replace(Ib,&quot;$1_=&quot;+Eb++):f+(Fb.test(f)?&quot;&amp;&quot;:&quot;?&quot;)+&quot;_=&quot;+Eb++)),l.ifModified&amp;&amp;(n.lastModified[f]&amp;&amp;w.setRequestHeader(&quot;If-Modified-Since&quot;,n.lastModified[f]),n.etag[f]&amp;&amp;w.setRequestHeader(&quot;If-None-Match&quot;,n.etag[f])),(l.data&amp;&amp;l.hasContent&amp;&amp;l.contentType!==!1||c.contentType)&amp;&amp;w.setRequestHeader(&quot;Content-Type&quot;,l.contentType),w.setRequestHeader(&quot;Accept&quot;,l.dataTypes[0]&amp;&amp;l.accepts[l.dataTypes[0]]?l.accepts[l.dataTypes[0]]+(&quot;*&quot;!==l.dataTypes[0]?&quot;, &quot;+Qb+&quot;; q=0.01&quot;:&quot;&quot;):l.accepts[&quot;*&quot;]);for(e in l.headers)w.setRequestHeader(e,l.headers[e]);if(l.beforeSend&amp;&amp;(l.beforeSend.call(m,w,l)===!1||2===u))return w.abort();v=&quot;abort&quot;;for(e in{success:1,error:1,complete:1})w[e](l[e]);if(j=Ub(Pb,l,c,w)){if(w.readyState=1,i&amp;&amp;o.trigger(&quot;ajaxSend&quot;,[w,l]),2===u)return w;l.async&amp;&amp;l.timeout&gt;0&amp;&amp;(h=a.setTimeout(function(){w.abort(&quot;timeout&quot;)},l.timeout));try{u=1,j.send(s,y)}catch(x){if(!(2&gt;u))throw x;y(-1,x)}}else y(-1,&quot;No Transport&quot;);function y(b,c,d,e){var k,s,t,v,x,y=c;2!==u&amp;&amp;(u=2,h&amp;&amp;a.clearTimeout(h),j=void 0,g=e||&quot;&quot;,w.readyState=b&gt;0?4:0,k=b&gt;=200&amp;&amp;300&gt;b||304===b,d&amp;&amp;(v=Wb(l,w,d)),v=Xb(l,v,w,k),k?(l.ifModified&amp;&amp;(x=w.getResponseHeader(&quot;Last-Modified&quot;),x&amp;&amp;(n.lastModified[f]=x),x=w.getResponseHeader(&quot;etag&quot;),x&amp;&amp;(n.etag[f]=x)),204===b||&quot;HEAD&quot;===l.type?y=&quot;nocontent&quot;:304===b?y=&quot;notmodified&quot;:(y=v.state,s=v.data,t=v.error,k=!t)):(t=y,!b&amp;&amp;y||(y=&quot;error&quot;,0&gt;b&amp;&amp;(b=0))),w.status=b,w.statusText=(c||y)+&quot;&quot;,k?p.resolveWith(m,[s,y,w]):p.rejectWith(m,[w,y,t]),w.statusCode(r),r=void 0,i&amp;&amp;o.trigger(k?&quot;ajaxSuccess&quot;:&quot;ajaxError&quot;,[w,l,k?s:t]),q.fireWith(m,[w,y]),i&amp;&amp;(o.trigger(&quot;ajaxComplete&quot;,[w,l]),--n.active||n.event.trigger(&quot;ajaxStop&quot;)))}return w},getJSON:function(a,b,c){return n.get(a,b,c,&quot;json&quot;)},getScript:function(a,b){return n.get(a,void 0,b,&quot;script&quot;)}}),n.each([&quot;get&quot;,&quot;post&quot;],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&amp;&amp;(e=e||d,d=c,c=void 0),n.ajax(n.extend({url:a,type:b,dataType:e,data:c,success:d},n.isPlainObject(a)&amp;&amp;a))}}),n._evalUrl=function(a){return n.ajax({url:a,type:&quot;GET&quot;,dataType:&quot;script&quot;,cache:!0,async:!1,global:!1,&quot;throws&quot;:!0})},n.fn.extend({wrapAll:function(a){if(n.isFunction(a))return this.each(function(b){n(this).wrapAll(a.call(this,b))});if(this[0]){var b=n(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&amp;&amp;b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&amp;&amp;1===a.firstChild.nodeType)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return n.isFunction(a)?this.each(function(b){n(this).wrapInner(a.call(this,b))}):this.each(function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,&quot;body&quot;)||n(this).replaceWith(this.childNodes)}).end()}});function Yb(a){return a.style&amp;&amp;a.style.display||n.css(a,&quot;display&quot;)}function Zb(a){if(!n.contains(a.ownerDocument||d,a))return!0;while(a&amp;&amp;1===a.nodeType){if(&quot;none&quot;===Yb(a)||&quot;hidden&quot;===a.type)return!0;a=a.parentNode}return!1}n.expr.filters.hidden=function(a){return l.reliableHiddenOffsets()?a.offsetWidth&lt;=0&amp;&amp;a.offsetHeight&lt;=0&amp;&amp;!a.getClientRects().length:Zb(a)},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var $b=&#x2F;%20&#x2F;g,_b=&#x2F;\\[\\]$&#x2F;,ac=&#x2F;\\r?\\n&#x2F;g,bc=&#x2F;^(?:submit|button|image|reset|file)$&#x2F;i,cc=&#x2F;^(?:input|select|textarea|keygen)&#x2F;i;function dc(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||_b.test(a)?d(a,e):dc(a+&quot;[&quot;+(&quot;object&quot;==typeof e&amp;&amp;null!=e?b:&quot;&quot;)+&quot;]&quot;,e,c,d)});else if(c||&quot;object&quot;!==n.type(b))d(a,b);else for(e in b)dc(a+&quot;[&quot;+e+&quot;]&quot;,b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?&quot;&quot;:b,d[d.length]=encodeURIComponent(a)+&quot;=&quot;+encodeURIComponent(b)};if(void 0===b&amp;&amp;(b=n.ajaxSettings&amp;&amp;n.ajaxSettings.traditional),n.isArray(a)||a.jquery&amp;&amp;!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)dc(c,a[c],b,e);return d.join(&quot;&amp;&quot;).replace($b,&quot;+&quot;)},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,&quot;elements&quot;);return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&amp;&amp;!n(this).is(&quot;:disabled&quot;)&amp;&amp;cc.test(this.nodeName)&amp;&amp;!bc.test(a)&amp;&amp;(this.checked||!Z.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(ac,&quot;\\r\\n&quot;)}}):{name:b.name,value:c.replace(ac,&quot;\\r\\n&quot;)}}).get()}}),n.ajaxSettings.xhr=void 0!==a.ActiveXObject?function(){return this.isLocal?ic():d.documentMode&gt;8?hc():&#x2F;^(get|post|head|put|delete|options)$&#x2F;i.test(this.type)&amp;&amp;hc()||ic()}:hc;var ec=0,fc={},gc=n.ajaxSettings.xhr();a.attachEvent&amp;&amp;a.attachEvent(&quot;onunload&quot;,function(){for(var a in fc)fc[a](void 0,!0)}),l.cors=!!gc&amp;&amp;&quot;withCredentials&quot;in gc,gc=l.ajax=!!gc,gc&amp;&amp;n.ajaxTransport(function(b){if(!b.crossDomain||l.cors){var c;return{send:function(d,e){var f,g=b.xhr(),h=++ec;if(g.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(f in b.xhrFields)g[f]=b.xhrFields[f];b.mimeType&amp;&amp;g.overrideMimeType&amp;&amp;g.overrideMimeType(b.mimeType),b.crossDomain||d[&quot;X-Requested-With&quot;]||(d[&quot;X-Requested-With&quot;]=&quot;XMLHttpRequest&quot;);for(f in d)void 0!==d[f]&amp;&amp;g.setRequestHeader(f,d[f]+&quot;&quot;);g.send(b.hasContent&amp;&amp;b.data||null),c=function(a,d){var f,i,j;if(c&amp;&amp;(d||4===g.readyState))if(delete fc[h],c=void 0,g.onreadystatechange=n.noop,d)4!==g.readyState&amp;&amp;g.abort();else{j={},f=g.status,&quot;string&quot;==typeof g.responseText&amp;&amp;(j.text=g.responseText);try{i=g.statusText}catch(k){i=&quot;&quot;}f||!b.isLocal||b.crossDomain?1223===f&amp;&amp;(f=204):f=j.text?200:404}j&amp;&amp;e(f,i,j,g.getAllResponseHeaders())},b.async?4===g.readyState?a.setTimeout(c):g.onreadystatechange=fc[h]=c:c()},abort:function(){c&amp;&amp;c(void 0,!0)}}}});function hc(){try{return new a.XMLHttpRequest}catch(b){}}function ic(){try{return new a.ActiveXObject(&quot;Microsoft.XMLHTTP&quot;)}catch(b){}}n.ajaxSetup({accepts:{script:&quot;text&#x2F;javascript, application&#x2F;javascript, application&#x2F;ecmascript, application&#x2F;x-ecmascript&quot;},contents:{script:&#x2F;\\b(?:java|ecma)script\\b&#x2F;},converters:{&quot;text script&quot;:function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter(&quot;script&quot;,function(a){void 0===a.cache&amp;&amp;(a.cache=!1),a.crossDomain&amp;&amp;(a.type=&quot;GET&quot;,a.global=!1)}),n.ajaxTransport(&quot;script&quot;,function(a){if(a.crossDomain){var b,c=d.head||n(&quot;head&quot;)[0]||d.documentElement;return{send:function(e,f){b=d.createElement(&quot;script&quot;),b.async=!0,a.scriptCharset&amp;&amp;(b.charset=a.scriptCharset),b.src=a.url,b.onload=b.onreadystatechange=function(a,c){(c||!b.readyState||&#x2F;loaded|complete&#x2F;.test(b.readyState))&amp;&amp;(b.onload=b.onreadystatechange=null,b.parentNode&amp;&amp;b.parentNode.removeChild(b),b=null,c||f(200,&quot;success&quot;))},c.insertBefore(b,c.firstChild)},abort:function(){b&amp;&amp;b.onload(void 0,!0)}}}});var jc=[],kc=&#x2F;(=)\\?(?=&amp;|$)|\\?\\?&#x2F;;n.ajaxSetup({jsonp:&quot;callback&quot;,jsonpCallback:function(){var a=jc.pop()||n.expando+&quot;_&quot;+Eb++;return this[a]=!0,a}}),n.ajaxPrefilter(&quot;json jsonp&quot;,function(b,c,d){var e,f,g,h=b.jsonp!==!1&amp;&amp;(kc.test(b.url)?&quot;url&quot;:&quot;string&quot;==typeof b.data&amp;&amp;0===(b.contentType||&quot;&quot;).indexOf(&quot;application&#x2F;x-www-form-urlencoded&quot;)&amp;&amp;kc.test(b.data)&amp;&amp;&quot;data&quot;);return h||&quot;jsonp&quot;===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(kc,&quot;$1&quot;+e):b.jsonp!==!1&amp;&amp;(b.url+=(Fb.test(b.url)?&quot;&amp;&quot;:&quot;?&quot;)+b.jsonp+&quot;=&quot;+e),b.converters[&quot;script json&quot;]=function(){return g||n.error(e+&quot; was not called&quot;),g[0]},b.dataTypes[0]=&quot;json&quot;,f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?n(a).removeProp(e):a[e]=f,b[e]&amp;&amp;(b.jsonpCallback=c.jsonpCallback,jc.push(e)),g&amp;&amp;n.isFunction(f)&amp;&amp;f(g[0]),g=f=void 0}),&quot;script&quot;):void 0}),n.parseHTML=function(a,b,c){if(!a||&quot;string&quot;!=typeof a)return null;&quot;boolean&quot;==typeof b&amp;&amp;(c=b,b=!1),b=b||d;var e=x.exec(a),f=!c&amp;&amp;[];return e?[b.createElement(e[1])]:(e=ja([a],b,f),f&amp;&amp;f.length&amp;&amp;n(f).remove(),n.merge([],e.childNodes))};var lc=n.fn.load;n.fn.load=function(a,b,c){if(&quot;string&quot;!=typeof a&amp;&amp;lc)return lc.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(&quot; &quot;);return h&gt;-1&amp;&amp;(d=n.trim(a.slice(h,a.length)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&amp;&amp;&quot;object&quot;==typeof b&amp;&amp;(e=&quot;POST&quot;),g.length&gt;0&amp;&amp;n.ajax({url:a,type:e||&quot;GET&quot;,dataType:&quot;html&quot;,data:b}).done(function(a){f=arguments,g.html(d?n(&quot;&lt;div&gt;&quot;).append(n.parseHTML(a)).find(d):a)}).always(c&amp;&amp;function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},n.each([&quot;ajaxStart&quot;,&quot;ajaxStop&quot;,&quot;ajaxComplete&quot;,&quot;ajaxError&quot;,&quot;ajaxSuccess&quot;,&quot;ajaxSend&quot;],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};function mc(a){return n.isWindow(a)?a:9===a.nodeType?a.defaultView||a.parentWindow:!1}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,&quot;position&quot;),l=n(a),m={};&quot;static&quot;===k&amp;&amp;(a.style.position=&quot;relative&quot;),h=l.offset(),f=n.css(a,&quot;top&quot;),i=n.css(a,&quot;left&quot;),j=(&quot;absolute&quot;===k||&quot;fixed&quot;===k)&amp;&amp;n.inArray(&quot;auto&quot;,[f,i])&gt;-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&amp;&amp;(b=b.call(a,c,n.extend({},h))),null!=b.top&amp;&amp;(m.top=b.top-h.top+g),null!=b.left&amp;&amp;(m.left=b.left-h.left+e),&quot;using&quot;in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d={top:0,left:0},e=this[0],f=e&amp;&amp;e.ownerDocument;if(f)return b=f.documentElement,n.contains(b,e)?(&quot;undefined&quot;!=typeof e.getBoundingClientRect&amp;&amp;(d=e.getBoundingClientRect()),c=mc(f),{top:d.top+(c.pageYOffset||b.scrollTop)-(b.clientTop||0),left:d.left+(c.pageXOffset||b.scrollLeft)-(b.clientLeft||0)}):d},position:function(){if(this[0]){var a,b,c={top:0,left:0},d=this[0];return&quot;fixed&quot;===n.css(d,&quot;position&quot;)?b=d.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],&quot;html&quot;)||(c=a.offset()),c.top+=n.css(a[0],&quot;borderTopWidth&quot;,!0),c.left+=n.css(a[0],&quot;borderLeftWidth&quot;,!0)),{top:b.top-c.top-n.css(d,&quot;marginTop&quot;,!0),left:b.left-c.left-n.css(d,&quot;marginLeft&quot;,!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&amp;&amp;!n.nodeName(a,&quot;html&quot;)&amp;&amp;&quot;static&quot;===n.css(a,&quot;position&quot;))a=a.offsetParent;return a||Qa})}}),n.each({scrollLeft:&quot;pageXOffset&quot;,scrollTop:&quot;pageYOffset&quot;},function(a,b){var c=&#x2F;Y&#x2F;.test(b);n.fn[a]=function(d){return Y(this,function(a,d,e){var f=mc(a);return void 0===e?f?b in f?f[b]:f.document.documentElement[d]:a[d]:void(f?f.scrollTo(c?n(f).scrollLeft():e,c?e:n(f).scrollTop()):a[d]=e)},a,d,arguments.length,null)}}),n.each([&quot;top&quot;,&quot;left&quot;],function(a,b){n.cssHooks[b]=Ua(l.pixelPosition,function(a,c){return c?(c=Sa(a,b),Oa.test(c)?n(a).position()[b]+&quot;px&quot;:c):void 0})}),n.each({Height:&quot;height&quot;,Width:&quot;width&quot;},function(a,b){n.each({padding:&quot;inner&quot;+a,content:b,&quot;&quot;:&quot;outer&quot;+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&amp;&amp;(c||&quot;boolean&quot;!=typeof d),g=c||(d===!0||e===!0?&quot;margin&quot;:&quot;border&quot;);return Y(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement[&quot;client&quot;+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body[&quot;scroll&quot;+a],e[&quot;scroll&quot;+a],b.body[&quot;offset&quot;+a],e[&quot;offset&quot;+a],e[&quot;client&quot;+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,&quot;**&quot;):this.off(b,a||&quot;**&quot;,c)}}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,&quot;function&quot;==typeof define&amp;&amp;define.amd&amp;&amp;define(&quot;jquery&quot;,[],function(){return n});var nc=a.jQuery,oc=a.$;return n.noConflict=function(b){return a.$===n&amp;&amp;(a.$=oc),b&amp;&amp;a.jQuery===n&amp;&amp;(a.jQuery=nc),n},b||(a.jQuery=a.$=n),n});</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">3</div>
        <div class="line-num2">3</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">4</div>
        <div class="line-num2">4</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">&#x2F;* timeago.js - https:&#x2F;&#x2F;github.com&#x2F;hustcc&#x2F;timeago.js *&#x2F;</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">5</div>
        <div class="line-num2">5</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">!function(e,t){&quot;object&quot;==typeof module&amp;&amp;module.exports?module.exports=t(e):e.timeago=t(e)}(&quot;undefined&quot;!=typeof window?window:this,function(){function e(e){return e instanceof Date?e:isNaN(e)?&#x2F;^\\d+$&#x2F;.test(e)?new Date(t(e,10)):(e=(e||&quot;&quot;).trim().replace(&#x2F;\\.\\d+&#x2F;,&quot;&quot;).replace(&#x2F;-&#x2F;,&quot;&#x2F;&quot;).replace(&#x2F;-&#x2F;,&quot;&#x2F;&quot;).replace(&#x2F;T&#x2F;,&quot; &quot;).replace(&#x2F;Z&#x2F;,&quot; UTC&quot;).replace(&#x2F;([\\+\\-]\\d\\d)\\:?(\\d\\d)&#x2F;,&quot; $1$2&quot;),new Date(e)):new Date(t(e))}function t(e){return parseInt(e)}function n(e,n,r){n=d[n]?n:d[r]?r:&quot;en&quot;;var i=0;for(agoin=e&lt;0?1:0,e=Math.abs(e);e&gt;=l[i]&amp;&amp;i&lt;p;i++)e&#x2F;=l[i];return e=t(e),i*=2,e&gt;(0===i?9:1)&amp;&amp;(i+=1),d[n](e,i)[agoin].replace(&quot;%s&quot;,e)}function r(t,n){return n=n?e(n):new Date,(n-e(t))&#x2F;1e3}function i(e){for(var t=1,n=0,r=e;e&gt;=l[n]&amp;&amp;n&lt;p;n++)e&#x2F;=l[n],t*=l[n];return r%=t,r=r?t-r:t,Math.ceil(r)}function o(e){return e.getAttribute?e.getAttribute(_):e.attr?e.attr(_):void 0}function u(e,t){function u(o,c,f,s){var d=r(c,e);o.innerHTML=n(d,f,t),a[&quot;k&quot;+s]=setTimeout(function(){u(o,c,f,s)},1e3*i(d))}var a={};return t||(t=&quot;en&quot;),this.format=function(i,o){return n(r(i,e),o,t)},this.render=function(e,t){void 0===e.length&amp;&amp;(e=[e]);for(var n=0;n&lt;e.length;n++)u(e[n],o(e[n]),t,++c)},this.cancel=function(){for(var e in a)clearTimeout(a[e]);a={}},this.setLocale=function(e){t=e},this}function a(e,t){return new u(e,t)}var c=0,f=&quot;second_minute_hour_day_week_month_year&quot;.split(&quot;_&quot;),s=&quot;秒_分钟_小时_天_周_月_年&quot;.split(&quot;_&quot;),d={en:function(e,t){if(0===t)return[&quot;just now&quot;,&quot;right now&quot;];var n=f[parseInt(t&#x2F;2)];return e&gt;1&amp;&amp;(n+=&quot;s&quot;),[e+&quot; &quot;+n+&quot; ago&quot;,&quot;in &quot;+e+&quot; &quot;+n]},zh_CN:function(e,t){if(0===t)return[&quot;刚刚&quot;,&quot;片刻后&quot;];var n=s[parseInt(t&#x2F;2)];return[e+n+&quot;前&quot;,e+n+&quot;后&quot;]}},l=[60,60,24,7,365&#x2F;7&#x2F;12,12],p=6,_=&quot;datetime&quot;;return a.register=function(e,t){d[e]=t},a});</span>
                </div>
            </td>
        </tr>
        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line">@@ -24,12 +24,7 @@ $(function() {</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">24</div>
        <div class="line-num2">24</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">  }</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">25</div>
        <div class="line-num2">25</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">26</div>
        <div class="line-num2">26</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">  $(document).on(&#x27;click&#x27;, &#x27;.check_all&#x27;, function() {</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del d2h-change">
              <div class="line-num1">27</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">    <del>var checked </del>= $(this).<del>attr</del>(&#x27;checked&#x27;);</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
              <div class="line-num1">28</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">    if (checked == &#x27;checked&#x27;) {</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
              <div class="line-num1">29</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">      $(&#x27;input[type=checkbox]&#x27;, $(this).closest(&#x27;table&#x27;)).attr(&#x27;checked&#x27;, checked);</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
              <div class="line-num1">30</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">    } else {</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
              <div class="line-num1">31</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">      $(&#x27;input[type=checkbox]&#x27;, $(this).closest(&#x27;table&#x27;)).removeAttr(&#x27;checked&#x27;);</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
              <div class="line-num1">32</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">-</span>
                    <span class="d2h-code-line-ctn">    }</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins d2h-change">
              <div class="line-num1"></div>
        <div class="line-num2">27</div>
            </td>
            <td class="d2h-ins d2h-change">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">+</span>
                    <span class="d2h-code-line-ctn">    <ins>$(&#x27;input[type</ins>=<ins>checkbox]&#x27;,</ins> $(this).<ins>closest</ins>(&#x27;<ins>table&#x27;)).prop(&#x27;</ins>checked&#x27;<ins>, this.checked</ins>);</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">33</div>
        <div class="line-num2">28</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">  });</span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">34</div>
        <div class="line-num2">29</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn"><br></span>
                </div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
              <div class="line-num1">35</div>
        <div class="line-num2">30</div>
            </td>
            <td class="d2h-cntx">
                <div class="d2h-code-line">
                    <span class="d2h-code-line-prefix">&nbsp;</span>
                    <span class="d2h-code-line-ctn">  $(document).on(&quot;click&quot;, &quot;[data-confirm]&quot;, function() {</span>
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
      /* eslint-enable no-irregular-whitespace */
    });

    describe('with auto colorScheme', () => {
      it('should return a html diff with auto color scheme', () => {
        const result = html(diffExample1, {
          drawFileList: false,
          colorScheme: ColorSchemeType.AUTO,
        });
        expect(result).toMatchInlineSnapshot(`
          "<div class="d2h-wrapper d2h-auto-color-scheme">
              <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
              <div class="d2h-file-diff">
                  <div class="d2h-code-wrapper">
                      <table class="d2h-diff-table">
                          <tbody class="d2h-diff-tbody">
                          <tr>
              <td class="d2h-code-linenumber d2h-info"></td>
              <td class="d2h-info">
                  <div class="d2h-code-line">@@ -1 +1 @@</div>
              </td>
          </tr><tr>
              <td class="d2h-code-linenumber d2h-del d2h-change">
                <div class="line-num1">1</div>
          <div class="line-num2"></div>
              </td>
              <td class="d2h-del d2h-change">
                  <div class="d2h-code-line">
                      <span class="d2h-code-line-prefix">-</span>
                      <span class="d2h-code-line-ctn"><del>test</del></span>
                  </div>
              </td>
          </tr><tr>
              <td class="d2h-code-linenumber d2h-ins d2h-change">
                <div class="line-num1"></div>
          <div class="line-num2">1</div>
              </td>
              <td class="d2h-ins d2h-change">
                  <div class="d2h-code-line">
                      <span class="d2h-code-line-prefix">+</span>
                      <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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

      it('should include auto colorScheme on file list', () => {
        const result = html(diffExample1, {
          drawFileList: true,
          colorScheme: ColorSchemeType.AUTO,
        });
        expect(result).toMatchInlineSnapshot(`
                  "<div class="d2h-file-list-wrapper d2h-auto-color-scheme">
                      <div class="d2h-file-list-header">
                          <span class="d2h-file-list-title">Files changed (1)</span>
                          <a class="d2h-file-switch d2h-hide">hide</a>
                          <a class="d2h-file-switch d2h-show">show</a>
                      </div>
                      <ol class="d2h-file-list">
                      <li class="d2h-file-list-line">
                      <span class="d2h-file-name-wrapper">
                        <svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"
                             viewBox="0 0 14 16" width="14">
                            <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>
                        </svg>      <a href="#d2h-675094" class="d2h-file-name">sample</a>
                        <span class="d2h-file-stats">
                            <span class="d2h-lines-added">+1</span>
                            <span class="d2h-lines-deleted">-1</span>
                        </span>
                      </span>
                  </li>
                      </ol>
                  </div><div class="d2h-wrapper d2h-auto-color-scheme">
                      <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
                      <div class="d2h-file-diff">
                          <div class="d2h-code-wrapper">
                              <table class="d2h-diff-table">
                                  <tbody class="d2h-diff-tbody">
                                  <tr>
                      <td class="d2h-code-linenumber d2h-info"></td>
                      <td class="d2h-info">
                          <div class="d2h-code-line">@@ -1 +1 @@</div>
                      </td>
                  </tr><tr>
                      <td class="d2h-code-linenumber d2h-del d2h-change">
                        <div class="line-num1">1</div>
                  <div class="line-num2"></div>
                      </td>
                      <td class="d2h-del d2h-change">
                          <div class="d2h-code-line">
                              <span class="d2h-code-line-prefix">-</span>
                              <span class="d2h-code-line-ctn"><del>test</del></span>
                          </div>
                      </td>
                  </tr><tr>
                      <td class="d2h-code-linenumber d2h-ins d2h-change">
                        <div class="line-num1"></div>
                  <div class="line-num2">1</div>
                      </td>
                      <td class="d2h-ins d2h-change">
                          <div class="d2h-code-line">
                              <span class="d2h-code-line-prefix">+</span>
                              <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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
    });

    describe('with dark colorScheme', () => {
      it('should return a html diff with dark mode', () => {
        const result = html(diffExample1, {
          drawFileList: false,
          colorScheme: ColorSchemeType.DARK,
        });
        expect(result).toMatchInlineSnapshot(`
          "<div class="d2h-wrapper d2h-dark-color-scheme">
              <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
              <div class="d2h-file-diff">
                  <div class="d2h-code-wrapper">
                      <table class="d2h-diff-table">
                          <tbody class="d2h-diff-tbody">
                          <tr>
              <td class="d2h-code-linenumber d2h-info"></td>
              <td class="d2h-info">
                  <div class="d2h-code-line">@@ -1 +1 @@</div>
              </td>
          </tr><tr>
              <td class="d2h-code-linenumber d2h-del d2h-change">
                <div class="line-num1">1</div>
          <div class="line-num2"></div>
              </td>
              <td class="d2h-del d2h-change">
                  <div class="d2h-code-line">
                      <span class="d2h-code-line-prefix">-</span>
                      <span class="d2h-code-line-ctn"><del>test</del></span>
                  </div>
              </td>
          </tr><tr>
              <td class="d2h-code-linenumber d2h-ins d2h-change">
                <div class="line-num1"></div>
          <div class="line-num2">1</div>
              </td>
              <td class="d2h-ins d2h-change">
                  <div class="d2h-code-line">
                      <span class="d2h-code-line-prefix">+</span>
                      <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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

      it('should include dark colorScheme on file list', () => {
        const result = html(diffExample1, {
          drawFileList: true,
          colorScheme: ColorSchemeType.DARK,
        });
        expect(result).toMatchInlineSnapshot(`
                  "<div class="d2h-file-list-wrapper d2h-dark-color-scheme">
                      <div class="d2h-file-list-header">
                          <span class="d2h-file-list-title">Files changed (1)</span>
                          <a class="d2h-file-switch d2h-hide">hide</a>
                          <a class="d2h-file-switch d2h-show">show</a>
                      </div>
                      <ol class="d2h-file-list">
                      <li class="d2h-file-list-line">
                      <span class="d2h-file-name-wrapper">
                        <svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"
                             viewBox="0 0 14 16" width="14">
                            <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>
                        </svg>      <a href="#d2h-675094" class="d2h-file-name">sample</a>
                        <span class="d2h-file-stats">
                            <span class="d2h-lines-added">+1</span>
                            <span class="d2h-lines-deleted">-1</span>
                        </span>
                      </span>
                  </li>
                      </ol>
                  </div><div class="d2h-wrapper d2h-dark-color-scheme">
                      <div id="d2h-675094" class="d2h-file-wrapper" data-lang="">
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
                      <div class="d2h-file-diff">
                          <div class="d2h-code-wrapper">
                              <table class="d2h-diff-table">
                                  <tbody class="d2h-diff-tbody">
                                  <tr>
                      <td class="d2h-code-linenumber d2h-info"></td>
                      <td class="d2h-info">
                          <div class="d2h-code-line">@@ -1 +1 @@</div>
                      </td>
                  </tr><tr>
                      <td class="d2h-code-linenumber d2h-del d2h-change">
                        <div class="line-num1">1</div>
                  <div class="line-num2"></div>
                      </td>
                      <td class="d2h-del d2h-change">
                          <div class="d2h-code-line">
                              <span class="d2h-code-line-prefix">-</span>
                              <span class="d2h-code-line-ctn"><del>test</del></span>
                          </div>
                      </td>
                  </tr><tr>
                      <td class="d2h-code-linenumber d2h-ins d2h-change">
                        <div class="line-num1"></div>
                  <div class="line-num2">1</div>
                      </td>
                      <td class="d2h-ins d2h-change">
                          <div class="d2h-code-line">
                              <span class="d2h-code-line-prefix">+</span>
                              <span class="d2h-code-line-ctn"><ins>test1</ins></span>
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
    });
  });
});
