import { parse, html } from "../diff2html";
import { DiffFile, LineType, OutputFormatType } from "../types";

const diffExample1 =
  "diff --git a/sample b/sample\n" +
  "index 0000001..0ddf2ba\n" +
  "--- a/sample\n" +
  "+++ b/sample\n" +
  "@@ -1 +1 @@\n" +
  "-test\n" +
  "+test1\n";

const jsonExample1: DiffFile[] = [
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
            content: "+test1",
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
    language: "",
    isCombined: false,
    isGitDiff: true
  }
];

describe("Diff2Html", () => {
  describe("getJsonFromDiff", () => {
    it("should parse simple diff to json", () => {
      const diff =
        "diff --git a/sample b/sample\n" +
        "index 0000001..0ddf2ba\n" +
        "--- a/sample\n" +
        "+++ b/sample\n" +
        "@@ -1 +1 @@\n" +
        "-test\n" +
        "+test1\n";
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "addedLines": 1,
            "blocks": Array [
              Object {
                "header": "@@ -1 +1 @@",
                "lines": Array [
                  Object {
                    "content": "-test",
                    "newNumber": undefined,
                    "oldNumber": 1,
                    "type": "delete",
                  },
                  Object {
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
    it("should parse diff with added EOF", () => {
      const diff =
        "diff --git a/sample.scala b/sample.scala\n" +
        "index b583263..8b2fc3e 100644\n" +
        "--- a/b583263..8b2fc3e\n" +
        "+++ b/8b2fc3e\n" +
        "@@ -50,5 +50,7 @@ case class Response[+A](value: Option[A],\n" +
        " object ResponseErrorCode extends JsonEnumeration {\n" +
        "  val NoError, ServiceError, JsonError,\n" +
        "  InvalidPermissions, MissingPermissions, GenericError,\n" +
        "-  TokenRevoked, MissingToken = Value\n" +
        "-}\n" +
        "\\ No newline at end of file\n" +
        "+  TokenRevoked, MissingToken,\n" +
        "+  IndexLock, RepositoryError, NotValidRepo, PullRequestNotMergeable, BranchError,\n" +
        "+  PluginError, CodeParserError, EngineError = Value\n" +
        "+}\n";
      const result = parse(diff);
      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "addedLines": 4,
            "blocks": Array [
              Object {
                "header": "@@ -50,5 +50,7 @@ case class Response[+A](value: Option[A],",
                "lines": Array [
                  Object {
                    "content": " object ResponseErrorCode extends JsonEnumeration {",
                    "newNumber": 50,
                    "oldNumber": 50,
                    "type": "context",
                  },
                  Object {
                    "content": "  val NoError, ServiceError, JsonError,",
                    "newNumber": 51,
                    "oldNumber": 51,
                    "type": "context",
                  },
                  Object {
                    "content": "  InvalidPermissions, MissingPermissions, GenericError,",
                    "newNumber": 52,
                    "oldNumber": 52,
                    "type": "context",
                  },
                  Object {
                    "content": "-  TokenRevoked, MissingToken = Value",
                    "newNumber": undefined,
                    "oldNumber": 53,
                    "type": "delete",
                  },
                  Object {
                    "content": "-}",
                    "newNumber": undefined,
                    "oldNumber": 54,
                    "type": "delete",
                  },
                  Object {
                    "content": "+  TokenRevoked, MissingToken,",
                    "newNumber": 53,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  Object {
                    "content": "+  IndexLock, RepositoryError, NotValidRepo, PullRequestNotMergeable, BranchError,",
                    "newNumber": 54,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  Object {
                    "content": "+  PluginError, CodeParserError, EngineError = Value",
                    "newNumber": 55,
                    "oldNumber": undefined,
                    "type": "insert",
                  },
                  Object {
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

    it("should generate pretty line by line html from diff", () => {
      const result = html(diffExample1, { drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
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
                    <span class=\\"d2h-code-line-ctn\\"><ins>test1</ins></span>
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

    it("should generate pretty line by line html from json", () => {
      const result = html(jsonExample1, { drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
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
                    <span class=\\"d2h-code-line-ctn\\"><ins>test1</ins></span>
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

    it("should generate pretty diff with files summary", () => {
      const result = html(diffExample1, { drawFileList: true });
      expect(result).toMatchInlineSnapshot(`
        "<div class=\\"d2h-file-list-wrapper\\">
            <div class=\\"d2h-file-list-header\\">
                <span class=\\"d2h-file-list-title\\">Files changed (1)</span>
                <a class=\\"d2h-file-switch d2h-hide\\">hide</a>
                <a class=\\"d2h-file-switch d2h-show\\">show</a>
            </div>
            <ol class=\\"d2h-file-list\\">
            <li class=\\"d2h-file-list-line\\">
            <span class=\\"d2h-file-name-wrapper\\">
              <svg aria-hidden=\\"true\\" class=\\"d2h-icon d2h-changed\\" height=\\"16\\" title=\\"modified\\" version=\\"1.1\\"
                   viewBox=\\"0 0 14 16\\" width=\\"14\\">
                  <path d=\\"M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z\\"></path>
              </svg>      <a href=\\"#d2h-675094\\" class=\\"d2h-file-name\\">sample</a>
              <span class=\\"d2h-file-stats\\">
                  <span class=\\"d2h-lines-added\\">+1</span>
                  <span class=\\"d2h-lines-deleted\\">-1</span>
              </span>
            </span>
        </li>
            </ol>
        </div><div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
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
                    <span class=\\"d2h-code-line-ctn\\"><ins>test1</ins></span>
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

    it("should generate pretty side by side html from diff", () => {
      const result = html(diffExample1, { outputFormat: OutputFormatType.SIDE_BY_SIDE, drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"\\">
            <div class=\\"d2h-file-header\\">
              <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
            </div>
            <div class=\\"d2h-files-diff\\">
                <div class=\\"d2h-file-side-diff\\">
                    <div class=\\"d2h-code-wrapper\\">
                        <table class=\\"d2h-diff-table\\">
                            <tbody class=\\"d2h-diff-tbody\\">
                            <tr>
            <td class=\\"d2h-code-side-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-side-line d2h-info\\">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-side-linenumber d2h-del d2h-change\\">
              1
            </td>
            <td class=\\"d2h-del d2h-change\\">
                <div class=\\"d2h-code-side-line d2h-del d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">-</span>
                    <span class=\\"d2h-code-line-ctn\\"><del>test</del></span>
                </div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class=\\"d2h-file-side-diff\\">
                    <div class=\\"d2h-code-wrapper\\">
                        <table class=\\"d2h-diff-table\\">
                            <tbody class=\\"d2h-diff-tbody\\">
                            <tr>
            <td class=\\"d2h-code-side-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-side-line d2h-info\\"></div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-side-linenumber d2h-ins d2h-change\\">
              1
            </td>
            <td class=\\"d2h-ins d2h-change\\">
                <div class=\\"d2h-code-side-line d2h-ins d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\"><ins>test1</ins></span>
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

    it("should generate pretty side by side html from json", () => {
      const result = html(jsonExample1, { outputFormat: OutputFormatType.SIDE_BY_SIDE, drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"\\">
            <div class=\\"d2h-file-header\\">
              <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
            </div>
            <div class=\\"d2h-files-diff\\">
                <div class=\\"d2h-file-side-diff\\">
                    <div class=\\"d2h-code-wrapper\\">
                        <table class=\\"d2h-diff-table\\">
                            <tbody class=\\"d2h-diff-tbody\\">
                            <tr>
            <td class=\\"d2h-code-side-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-side-line d2h-info\\">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-side-linenumber d2h-del d2h-change\\">
              1
            </td>
            <td class=\\"d2h-del d2h-change\\">
                <div class=\\"d2h-code-side-line d2h-del d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">-</span>
                    <span class=\\"d2h-code-line-ctn\\"><del>test</del></span>
                </div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class=\\"d2h-file-side-diff\\">
                    <div class=\\"d2h-code-wrapper\\">
                        <table class=\\"d2h-diff-table\\">
                            <tbody class=\\"d2h-diff-tbody\\">
                            <tr>
            <td class=\\"d2h-code-side-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-side-line d2h-info\\"></div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-side-linenumber d2h-ins d2h-change\\">
              1
            </td>
            <td class=\\"d2h-ins d2h-change\\">
                <div class=\\"d2h-code-side-line d2h-ins d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\"><ins>test1</ins></span>
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

    it("should generate pretty side by side html from diff 2", () => {
      const result = html(diffExample1, { outputFormat: OutputFormatType.SIDE_BY_SIDE, drawFileList: true });
      expect(result).toMatchInlineSnapshot(`
        "<div class=\\"d2h-file-list-wrapper\\">
            <div class=\\"d2h-file-list-header\\">
                <span class=\\"d2h-file-list-title\\">Files changed (1)</span>
                <a class=\\"d2h-file-switch d2h-hide\\">hide</a>
                <a class=\\"d2h-file-switch d2h-show\\">show</a>
            </div>
            <ol class=\\"d2h-file-list\\">
            <li class=\\"d2h-file-list-line\\">
            <span class=\\"d2h-file-name-wrapper\\">
              <svg aria-hidden=\\"true\\" class=\\"d2h-icon d2h-changed\\" height=\\"16\\" title=\\"modified\\" version=\\"1.1\\"
                   viewBox=\\"0 0 14 16\\" width=\\"14\\">
                  <path d=\\"M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z\\"></path>
              </svg>      <a href=\\"#d2h-675094\\" class=\\"d2h-file-name\\">sample</a>
              <span class=\\"d2h-file-stats\\">
                  <span class=\\"d2h-lines-added\\">+1</span>
                  <span class=\\"d2h-lines-deleted\\">-1</span>
              </span>
            </span>
        </li>
            </ol>
        </div><div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-675094\\" class=\\"d2h-file-wrapper\\" data-lang=\\"\\">
            <div class=\\"d2h-file-header\\">
              <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">sample</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
            </div>
            <div class=\\"d2h-files-diff\\">
                <div class=\\"d2h-file-side-diff\\">
                    <div class=\\"d2h-code-wrapper\\">
                        <table class=\\"d2h-diff-table\\">
                            <tbody class=\\"d2h-diff-tbody\\">
                            <tr>
            <td class=\\"d2h-code-side-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-side-line d2h-info\\">@@ -1 +1 @@</div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-side-linenumber d2h-del d2h-change\\">
              1
            </td>
            <td class=\\"d2h-del d2h-change\\">
                <div class=\\"d2h-code-side-line d2h-del d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">-</span>
                    <span class=\\"d2h-code-line-ctn\\"><del>test</del></span>
                </div>
            </td>
        </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class=\\"d2h-file-side-diff\\">
                    <div class=\\"d2h-code-wrapper\\">
                        <table class=\\"d2h-diff-table\\">
                            <tbody class=\\"d2h-diff-tbody\\">
                            <tr>
            <td class=\\"d2h-code-side-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-side-line d2h-info\\"></div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-side-linenumber d2h-ins d2h-change\\">
              1
            </td>
            <td class=\\"d2h-ins d2h-change\\">
                <div class=\\"d2h-code-side-line d2h-ins d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\"><ins>test1</ins></span>
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

    it("should generate pretty side by side html from diff with html on headers", () => {
      const diffExample2 =
        "diff --git a/CHANGELOG.md b/CHANGELOG.md\n" +
        "index fc3e3f4..b486d10 100644\n" +
        "--- a/CHANGELOG.md\n" +
        "+++ b/CHANGELOG.md\n" +
        "@@ -1,7 +1,6 @@\n" +
        " # Change Log\n" +
        " All notable changes to this project will be documented in this file.\n" +
        " This project adheres to [Semantic Versioning](http://semver.org/).\n" +
        '-$a="<table><tr><td>Use the following format for additions: ` - VERSION: [feature/patch (if applicable)] Short description of change. Links to relevant issues/PRs.`\n' +
        ' $a="<table><tr><td>\n' +
        " $a=\"<table><tr><td>- 1.1.9: Fix around ubuntu's inability to cache promises. [#877](https://github.com/FredrikNoren/ungit/pull/878)\n" +
        " - 1.1.8:\n" +
        "@@ -11,7 +10,7 @@ $a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;- 1.1.9: Fix around ubuntu&#x27;s inability to cache promises. [#8\n" +
        " - 1.1.7:\n" +
        "     - Fix diff flickering issue and optimization [#865](https://github.com/FredrikNoren/ungit/pull/865)\n" +
        "     - Fix credential dialog issue [#864](https://github.com/FredrikNoren/ungit/pull/864)\n" +
        "-    - Fix HEAD branch order when redraw [#858](https://github.com/FredrikNoren/ungit/issues/858)\n" +
        "+4    - Fix HEAD branch order when redraw [#858](https://github.com/FredrikNoren/ungit/issues/858)\n" +
        " - 1.1.6: Fix path auto complete [#861](https://github.com/FredrikNoren/ungit/issues/861)\n" +
        ' - 1.1.5: Update "Toggle all" button after commit or changing selected files [#859](https://github.com/FredrikNoren/ungit/issues/859)\n' +
        " - 1.1.4: [patch] Promise refactoring\n" +
        " \n";
      const result = html(diffExample2, { drawFileList: false });
      expect(result).toMatchInlineSnapshot(`
        "<div class=\\"d2h-wrapper\\">
            <div id=\\"d2h-211439\\" class=\\"d2h-file-wrapper\\" data-lang=\\"md\\">
            <div class=\\"d2h-file-header\\">
            <span class=\\"d2h-file-name-wrapper\\">
            <svg aria-hidden=\\"true\\" class=\\"d2h-icon\\" height=\\"16\\" version=\\"1.1\\" viewBox=\\"0 0 12 16\\" width=\\"12\\">
                <path d=\\"M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z\\"></path>
            </svg>    <span class=\\"d2h-file-name\\">CHANGELOG.md</span>
            <span class=\\"d2h-tag d2h-changed d2h-changed-tag\\">CHANGED</span></span>
            </div>
            <div class=\\"d2h-file-diff\\">
                <div class=\\"d2h-code-wrapper\\">
                    <table class=\\"d2h-diff-table\\">
                        <tbody class=\\"d2h-diff-tbody\\">
                        <tr>
            <td class=\\"d2h-code-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-line d2h-info\\">@@ -1,7 +1,6 @@</div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">1</div>
        <div class=\\"line-num2\\">1</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\"># Change Log</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">2</div>
        <div class=\\"line-num2\\">2</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">All notable changes to this project will be documented in this file.</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">3</div>
        <div class=\\"line-num2\\">3</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">This project adheres to [Semantic Versioning](http:&#x2F;&#x2F;semver.org&#x2F;).</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-del\\">
              <div class=\\"line-num1\\">4</div>
        <div class=\\"line-num2\\"></div>
            </td>
            <td class=\\"d2h-del\\">
                <div class=\\"d2h-code-line d2h-del\\">
                    <span class=\\"d2h-code-line-prefix\\">-</span>
                    <span class=\\"d2h-code-line-ctn\\">$a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;Use the following format for additions: \` - VERSION: [feature&#x2F;patch (if applicable)] Short description of change. Links to relevant issues&#x2F;PRs.\`</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">5</div>
        <div class=\\"line-num2\\">4</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">$a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">6</div>
        <div class=\\"line-num2\\">5</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">$a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;- 1.1.9: Fix around ubuntu&#x27;s inability to cache promises. [#877](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;pull&#x2F;878)</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">7</div>
        <div class=\\"line-num2\\">6</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">- 1.1.8:</span>
                </div>
            </td>
        </tr>
        <tr>
            <td class=\\"d2h-code-linenumber d2h-info\\"></td>
            <td class=\\"d2h-info\\">
                <div class=\\"d2h-code-line d2h-info\\">@@ -11,7 +10,7 @@ $a=&quot;&lt;table&gt;&lt;tr&gt;&lt;td&gt;- 1.1.9: Fix around ubuntu&#x27;s inability to cache promises. [#8</div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">11</div>
        <div class=\\"line-num2\\">10</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">- 1.1.7:</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">12</div>
        <div class=\\"line-num2\\">11</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">    - Fix diff flickering issue and optimization [#865](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;pull&#x2F;865)</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">13</div>
        <div class=\\"line-num2\\">12</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">    - Fix credential dialog issue [#864](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;pull&#x2F;864)</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-del d2h-change\\">
              <div class=\\"line-num1\\">14</div>
        <div class=\\"line-num2\\"></div>
            </td>
            <td class=\\"d2h-del d2h-change\\">
                <div class=\\"d2h-code-line d2h-del d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">-</span>
                    <span class=\\"d2h-code-line-ctn\\">    - Fix HEAD branch order when redraw [#858](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;issues&#x2F;858)</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-ins d2h-change\\">
              <div class=\\"line-num1\\"></div>
        <div class=\\"line-num2\\">13</div>
            </td>
            <td class=\\"d2h-ins d2h-change\\">
                <div class=\\"d2h-code-line d2h-ins d2h-change\\">
                    <span class=\\"d2h-code-line-prefix\\">+</span>
                    <span class=\\"d2h-code-line-ctn\\"><ins>4</ins>    - Fix HEAD branch order when redraw [#858](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;issues&#x2F;858)</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">15</div>
        <div class=\\"line-num2\\">14</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">- 1.1.6: Fix path auto complete [#861](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;issues&#x2F;861)</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">16</div>
        <div class=\\"line-num2\\">15</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">- 1.1.5: Update &quot;Toggle all&quot; button after commit or changing selected files [#859](https:&#x2F;&#x2F;github.com&#x2F;FredrikNoren&#x2F;ungit&#x2F;issues&#x2F;859)</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">17</div>
        <div class=\\"line-num2\\">16</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
                    <span class=\\"d2h-code-line-ctn\\">- 1.1.4: [patch] Promise refactoring</span>
                </div>
            </td>
        </tr><tr>
            <td class=\\"d2h-code-linenumber d2h-cntx\\">
              <div class=\\"line-num1\\">18</div>
        <div class=\\"line-num2\\">17</div>
            </td>
            <td class=\\"d2h-cntx\\">
                <div class=\\"d2h-code-line d2h-cntx\\">
                    <span class=\\"d2h-code-line-prefix\\">&nbsp;</span>
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
