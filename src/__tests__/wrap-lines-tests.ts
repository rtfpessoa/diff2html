import { html, parse } from '../diff2html';
import HoganJsUtils from '../hoganjs-utils';
import LineByLineRenderer from '../line-by-line-renderer';
import SideBySideRenderer from '../side-by-side-renderer';
import { OutputFormatType } from '../types';

const diff = [
  'diff --git a/example.js b/example.js',
  '--- a/example.js',
  '+++ b/example.js',
  '@@ -10,3 +20,4 @@ <hunk>',
  '-  old <token>',
  '+  new <token>',
  '+insert only',
  ' \tfollowing  context ',
  ' context',
  '@@ -30,2 +41 @@ second',
  '-delete only',
  ' tail',
].join('\n');

const config = { drawFileList: false, matching: 'words' as const };
const wrapped = { ...config, wrapLines: true };
const codeContents = (output: string): string[] =>
  Array.from(output.matchAll(/<span class="d2h-code-line-ctn">(.*?)<\/span>/g), match => match[1]);

const layouts = [
  { outputFormat: OutputFormatType.LINE_BY_LINE, Renderer: LineByLineRenderer, tables: 1 },
  { outputFormat: OutputFormatType.SIDE_BY_SIDE, Renderer: SideBySideRenderer, tables: 2 },
];

describe.each(layouts)('$outputFormat wrapping', ({ outputFormat, Renderer, tables }) => {
  it('keeps omitted and false output identical, including direct renderer defaults', () => {
    const legacy = html(diff, { outputFormat, drawFileList: false });
    const off = { outputFormat, drawFileList: false, wrapLines: false };
    expect(html(diff, off)).toBe(legacy);
    expect(new Renderer(new HoganJsUtils({})).render(parse(diff))).toBe(legacy);
    expect(new Renderer(new HoganJsUtils({}), off).render(parse(diff))).toBe(legacy);
    expect(legacy.match(/<table\b/g)).toHaveLength(tables);
    expect(legacy).not.toContain('d2h-wrap-lines');
  });

  it('keeps the legacy custom wrapper and line template inputs when off', () => {
    const rawTemplates = {
      [`${outputFormat}-file-diff`]:
        '<section>{{file.language}}|{{#wrapLines}}wrap|{{/wrapLines}}' +
        (tables === 1 ? '{{{diffs}}}' : '{{{diffs.left}}}|{{{diffs.right}}}') +
        '</section>',
      'generic-line': '<p>{{lineClass}}:{{prefix}}:{{{content}}}</p>',
    };
    const omitted = { outputFormat, rawTemplates, ...config };
    const off = { ...omitted, wrapLines: false };
    const legacy = html(diff, omitted);
    expect(html(diff, off)).toBe(legacy);
    expect(legacy).toContain('<section>js|<tr>');
    expect(legacy).not.toContain('wrap|');
    expect(legacy).toContain('<p>d2h-code-' + (tables === 1 ? '' : 'side-') + 'linenumber:-:');
  });

  it('opts in through either public HTML or the direct renderer and preserves file hooks', () => {
    const output = html(diff, { ...wrapped, outputFormat });
    expect(new Renderer(new HoganJsUtils({}), wrapped).render(parse(diff))).toBe(output);
    expect(output.match(/<table\b/g)).toHaveLength(1);
    expect(output).toContain(tables === 1 ? 'd2h-file-diff d2h-wrap-lines' : 'd2h-files-diff d2h-wrap-lines');
    expect(output).toMatch(/id="d2h-\d+" class="d2h-file-wrapper" data-lang="js"/);
    expect(output).toContain('class="d2h-file-header"');
    expect(output).toContain('@@ -10,3 +20,4 @@ &lt;hunk&gt;');
    expect(output).not.toContain('<hunk>');
  });

  it.each([
    ['an empty parsed file', parse('diff --git a/empty b/empty'), 'File without changes'],
    ['a mode-only file', parse('diff --git a/mode b/mode\nold mode 100644\nnew mode 100755'), 'File without changes'],
    ['a binary file', parse('diff --git a/img b/img\nBinary files a/img and b/img differ'), 'Binary file'],
  ] as const)('uses one table and preserves the message for %s', (_name, input, message) => {
    const output = html(input, { ...wrapped, outputFormat });
    expect(output.match(/<table\b/g)).toHaveLength(1);
    expect(output).toContain(message);
    const hidden = { ...wrapped, outputFormat, renderNothingWhenEmpty: true };
    if (message === 'File without changes') expect(html(input, hidden)).not.toContain('d2h-file-wrapper');
    else expect(html(input, hidden)).toContain(message);
  });

  it('preserves configured too-big HTML without rendering code rows', () => {
    const message = '<a href="example.html">Open raw diff</a>';
    const tooBig = { ...wrapped, outputFormat, diffMaxLineLength: 20, diffTooBigMessage: () => message };
    const output = html(diff, tooBig);
    expect(output.match(/<table\b/g)).toHaveLength(1);
    expect(output).toContain(message);
    expect(codeContents(output)).toEqual([]);
  });
});

it('only adds the wrapping modifier to the default line-by-line HTML', () => {
  const output = html(diff, wrapped);
  expect(output.replace('d2h-file-diff d2h-wrap-lines', 'd2h-file-diff')).toBe(html(diff, config));
});

it('renders each prepared side-by-side pair in a single four-cell row', () => {
  const outputFormat = OutputFormatType.SIDE_BY_SIDE;
  const output = html(diff, { ...wrapped, outputFormat });
  const [oldPane, newPane] = html(diff, { ...config, outputFormat })
    .split('class="d2h-file-side-diff"')
    .slice(1);
  const oldContents = codeContents(oldPane);
  const newContents = codeContents(newPane);
  const rows = Array.from(output.matchAll(/<tr>([\s\S]*?)<\/tr>/g), match => match[1]);
  const codeRows = rows.filter(row => row.includes('d2h-code-line-ctn'));
  expect(codeRows.map(codeContents)).toEqual(oldContents.map((old, i) => [old, newContents[i]]));
  expect(codeRows.map(row => row.match(/<td\b/g)?.length)).toEqual([4, 4, 4, 4, 4, 4]);
  expect(
    codeRows.map(row => Array.from(row.matchAll(/<td[^>]*linenumber[^>]*>\s*(\d*)\s*<\/td>/g), m => m[1])),
  ).toEqual([
    ['10', '20'],
    ['', '21'],
    ['11', '22'],
    ['12', '23'],
    ['30', ''],
    ['31', '41'],
  ]);
  expect(codeRows[0]).toContain('<del>old</del> &lt;token&gt;');
  expect(codeRows[0]).toContain('<ins>new</ins> &lt;token&gt;');
  expect(codeRows[1]).toContain('d2h-emptyplaceholder');
  expect(codeRows[2].match(/\tfollowing {2}context /g)).toHaveLength(2);
  expect(codeRows[4]).toContain('d2h-emptyplaceholder');
  expect(rows.map(row => row.includes('@@'))).toEqual([true, false, false, false, false, true, false, false]);
});
