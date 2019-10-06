const FileListPrinter = require("../file-list-printer.js").FileListPrinter;

describe("FileListPrinter", function() {
  describe("generateFileList", function() {
    it("should expose old and new files to templates", function() {
      const files = [
        {
          addedlines: 12,
          deletedlines: 41,
          language: "js",
          oldName: "my/file/name.js",
          newName: "my/file/name.js"
        },
        {
          addedLines: 12,
          deletedLines: 41,
          language: "js",
          oldName: "my/file/name1.js",
          newName: "my/file/name2.js"
        },
        {
          addedLines: 12,
          deletedLines: 0,
          language: "js",
          oldName: "dev/null",
          newName: "my/file/name.js",
          isNew: true
        },
        {
          addedLines: 0,
          deletedLines: 41,
          language: "js",
          oldName: "my/file/name.js",
          newName: "dev/null",
          isDeleted: true
        }
      ];

      const fileListPrinter = new FileListPrinter({
        rawTemplates: {
          "file-summary-wrapper": "{{{files}}}",
          "file-summary-line": "{{oldName}}, {{newName}}, {{fileName}}"
        }
      });

      const fileHtml = fileListPrinter.generateFileList(files);
      const expected =
        "my/file/name.js, my/file/name.js, my/file/name.js\n" +
        "my/file/name1.js, my/file/name2.js, my/file/{name1.js → name2.js}\n" +
        "dev/null, my/file/name.js, my/file/name.js\n" +
        "my/file/name.js, dev/null, my/file/name.js";

      expect(expected).toEqual(fileHtml);
    });

    it("should work for all kinds of files", function() {
      const files = [
        {
          addedLines: 12,
          deletedLines: 41,
          language: "js",
          oldName: "my/file/name.js",
          newName: "my/file/name.js"
        },
        {
          addedLines: 12,
          deletedLines: 41,
          language: "js",
          oldName: "my/file/name1.js",
          newName: "my/file/name2.js"
        },
        {
          addedLines: 12,
          deletedLines: 0,
          language: "js",
          oldName: "dev/null",
          newName: "my/file/name.js",
          isNew: true
        },
        {
          addedLines: 0,
          deletedLines: 41,
          language: "js",
          oldName: "my/file/name.js",
          newName: "dev/null",
          isDeleted: true
        }
      ];

      const fileListPrinter = new FileListPrinter();
      const fileHtml = fileListPrinter.generateFileList(files);

      const expected =
        '<div class="d2h-file-list-wrapper">\n' +
        '    <div class="d2h-file-list-header">\n' +
        '        <span class="d2h-file-list-title">Files changed (4)</span>\n' +
        '        <a class="d2h-file-switch d2h-hide">hide</a>\n' +
        '        <a class="d2h-file-switch d2h-show">show</a>\n' +
        "    </div>\n" +
        '    <ol class="d2h-file-list">\n' +
        '    <li class="d2h-file-list-line">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '      <svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"\n' +
        '           viewBox="0 0 14 16" width="14">\n' +
        '          <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>\n' +
        '      </svg>      <a href="#d2h-781444" class="d2h-file-name">my/file/name.js</a>\n' +
        '      <span class="d2h-file-stats">\n' +
        '          <span class="d2h-lines-added">+12</span>\n' +
        '          <span class="d2h-lines-deleted">-41</span>\n' +
        "      </span>\n" +
        "    </span>\n" +
        "</li>\n" +
        '<li class="d2h-file-list-line">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '      <svg aria-hidden="true" class="d2h-icon d2h-moved" height="16" title="renamed" version="1.1"\n' +
        '           viewBox="0 0 14 16" width="14">\n' +
        '          <path d="M6 9H3V7h3V4l5 4-5 4V9z m8-7v12c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h12c0.55 0 1 0.45 1 1z m-1 0H1v12h12V2z"></path>\n' +
        '      </svg>      <a href="#d2h-662683" class="d2h-file-name">my/file/{name1.js → name2.js}</a>\n' +
        '      <span class="d2h-file-stats">\n' +
        '          <span class="d2h-lines-added">+12</span>\n' +
        '          <span class="d2h-lines-deleted">-41</span>\n' +
        "      </span>\n" +
        "    </span>\n" +
        "</li>\n" +
        '<li class="d2h-file-list-line">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '      <svg aria-hidden="true" class="d2h-icon d2h-added" height="16" title="added" version="1.1" viewBox="0 0 14 16"\n' +
        '           width="14">\n' +
        '          <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM6 9H3V7h3V4h2v3h3v2H8v3H6V9z"></path>\n' +
        '      </svg>      <a href="#d2h-781444" class="d2h-file-name">my/file/name.js</a>\n' +
        '      <span class="d2h-file-stats">\n' +
        '          <span class="d2h-lines-added">+12</span>\n' +
        '          <span class="d2h-lines-deleted">-0</span>\n' +
        "      </span>\n" +
        "    </span>\n" +
        "</li>\n" +
        '<li class="d2h-file-list-line">\n' +
        '    <span class="d2h-file-name-wrapper">\n' +
        '      <svg aria-hidden="true" class="d2h-icon d2h-deleted" height="16" title="removed" version="1.1"\n' +
        '           viewBox="0 0 14 16" width="14">\n' +
        '          <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM11 9H3V7h8v2z"></path>\n' +
        '      </svg>      <a href="#d2h-781444" class="d2h-file-name">my/file/name.js</a>\n' +
        '      <span class="d2h-file-stats">\n' +
        '          <span class="d2h-lines-added">+0</span>\n' +
        '          <span class="d2h-lines-deleted">-41</span>\n' +
        "      </span>\n" +
        "    </span>\n" +
        "</li>\n" +
        "    </ol>\n" +
        "</div>";

      expect(expected).toEqual(fileHtml);
    });
  });
});
