import { FileListRenderer } from '../file-list-renderer';
import HoganJsUtils from '../hoganjs-utils';
import { ColorSchemeType } from '../types';

describe('FileListRenderer', () => {
  describe('render', () => {
    it('should expose old and new files to templates', () => {
      const hoganUtils = new HoganJsUtils({
        rawTemplates: {
          'file-summary-wrapper': '{{{files}}}',
          'file-summary-line': '{{oldName}}, {{newName}}, {{fileName}}',
        },
      });
      const fileListRenderer = new FileListRenderer(hoganUtils);
      const files = [
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name.js',
          newName: 'my/file/name.js',
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name1.js',
          newName: 'my/file/name2.js',
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 0,
          language: 'js',
          oldName: 'dev/null',
          newName: 'my/file/name.js',
          isNew: true,
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 0,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name.js',
          newName: 'dev/null',
          isDeleted: true,
        },
      ];

      const fileHtml = fileListRenderer.render(files);

      expect(fileHtml).toMatchInlineSnapshot(`
        "my/file/name.js, my/file/name.js, my/file/name.js
        my/file/name1.js, my/file/name2.js, my/file/{name1.js → name2.js}
        dev/null, my/file/name.js, my/file/name.js
        my/file/name.js, dev/null, my/file/name.js"
      `);
    });

    it('should work for all kinds of files', () => {
      const hoganUtils = new HoganJsUtils({});
      const fileListRenderer = new FileListRenderer(hoganUtils);

      const files = [
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name.js',
          newName: 'my/file/name.js',
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name1.js',
          newName: 'my/file/name2.js',
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 0,
          language: 'js',
          oldName: 'dev/null',
          newName: 'my/file/name.js',
          isNew: true,
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 0,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name.js',
          newName: 'dev/null',
          isDeleted: true,
        },
      ];
      const fileHtml = fileListRenderer.render(files);
      expect(fileHtml).toMatchInlineSnapshot(`
        "<div class="d2h-file-list-wrapper">
            <div class="d2h-file-list-header">
                <span class="d2h-file-list-title">Files changed (4)</span>
                <a class="d2h-file-switch d2h-hide">hide</a>
                <a class="d2h-file-switch d2h-show">show</a>
            </div>
            <ol class="d2h-file-list">
            <li class="d2h-file-list-line">
            <span class="d2h-file-name-wrapper">
              <svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"
                   viewBox="0 0 14 16" width="14">
                  <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>
              </svg>      <a href="#d2h-781444" class="d2h-file-name">my/file/name.js</a>
              <span class="d2h-file-stats">
                  <span class="d2h-lines-added">+12</span>
                  <span class="d2h-lines-deleted">-41</span>
              </span>
            </span>
        </li>
        <li class="d2h-file-list-line">
            <span class="d2h-file-name-wrapper">
              <svg aria-hidden="true" class="d2h-icon d2h-moved" height="16" title="renamed" version="1.1"
                   viewBox="0 0 14 16" width="14">
                  <path d="M6 9H3V7h3V4l5 4-5 4V9z m8-7v12c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h12c0.55 0 1 0.45 1 1z m-1 0H1v12h12V2z"></path>
              </svg>      <a href="#d2h-662683" class="d2h-file-name">my/file/{name1.js → name2.js}</a>
              <span class="d2h-file-stats">
                  <span class="d2h-lines-added">+12</span>
                  <span class="d2h-lines-deleted">-41</span>
              </span>
            </span>
        </li>
        <li class="d2h-file-list-line">
            <span class="d2h-file-name-wrapper">
              <svg aria-hidden="true" class="d2h-icon d2h-added" height="16" title="added" version="1.1" viewBox="0 0 14 16"
                   width="14">
                  <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM6 9H3V7h3V4h2v3h3v2H8v3H6V9z"></path>
              </svg>      <a href="#d2h-781444" class="d2h-file-name">my/file/name.js</a>
              <span class="d2h-file-stats">
                  <span class="d2h-lines-added">+12</span>
                  <span class="d2h-lines-deleted">-0</span>
              </span>
            </span>
        </li>
        <li class="d2h-file-list-line">
            <span class="d2h-file-name-wrapper">
              <svg aria-hidden="true" class="d2h-icon d2h-deleted" height="16" title="removed" version="1.1"
                   viewBox="0 0 14 16" width="14">
                  <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM11 9H3V7h8v2z"></path>
              </svg>      <a href="#d2h-781444" class="d2h-file-name">my/file/name.js</a>
              <span class="d2h-file-stats">
                  <span class="d2h-lines-added">+0</span>
                  <span class="d2h-lines-deleted">-41</span>
              </span>
            </span>
        </li>
            </ol>
        </div>"
      `);
    });

    describe('with dark colorScheme', () => {
      it('should should include dark colorScheme', () => {
        const hoganUtils = new HoganJsUtils({});
        const fileListRenderer = new FileListRenderer(hoganUtils, {
          colorScheme: ColorSchemeType.DARK,
        });

        const files = [
          {
            isCombined: false,
            isGitDiff: false,
            blocks: [],
            addedLines: 12,
            deletedLines: 41,
            language: 'js',
            oldName: 'my/file/name.js',
            newName: 'my/file/name.js',
          },
        ];
        const fileHtml = fileListRenderer.render(files);
        expect(fileHtml).toMatchInlineSnapshot(`
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
                </svg>      <a href="#d2h-781444" class="d2h-file-name">my/file/name.js</a>
                <span class="d2h-file-stats">
                    <span class="d2h-lines-added">+12</span>
                    <span class="d2h-lines-deleted">-41</span>
                </span>
              </span>
          </li>
              </ol>
          </div>"
        `);
      });
    });

    describe('with auto colorScheme', () => {
      it('should should include auto colorScheme', () => {
        const hoganUtils = new HoganJsUtils({});
        const fileListRenderer = new FileListRenderer(hoganUtils, {
          colorScheme: ColorSchemeType.AUTO,
        });

        const files = [
          {
            isCombined: false,
            isGitDiff: false,
            blocks: [],
            addedLines: 12,
            deletedLines: 41,
            language: 'js',
            oldName: 'my/file/name.js',
            newName: 'my/file/name.js',
          },
        ];
        const fileHtml = fileListRenderer.render(files);
        expect(fileHtml).toMatchInlineSnapshot(`
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
                </svg>      <a href="#d2h-781444" class="d2h-file-name">my/file/name.js</a>
                <span class="d2h-file-stats">
                    <span class="d2h-lines-added">+12</span>
                    <span class="d2h-lines-deleted">-41</span>
                </span>
              </span>
          </li>
              </ol>
          </div>"
        `);
      });
    });
  });
});
