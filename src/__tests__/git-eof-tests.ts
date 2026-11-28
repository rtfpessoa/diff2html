import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { html, parse } from '../diff2html';
import { type OutputFormatType } from '../types';

const marker = '\\ No newline at end of file';
const message = 'No newline at end of file';

function gitDiff(before: string, after: string): string {
  const cwd = mkdtempSync(join(tmpdir(), 'diff2html-eof-'));
  try {
    writeFileSync(join(cwd, 'before.txt'), before);
    writeFileSync(join(cwd, 'after.txt'), after);
    const args = [
      'diff',
      '--no-index',
      '--no-color',
      '--no-ext-diff',
      '--no-textconv',
      '--unified=3',
      '--src-prefix=a/',
      '--dst-prefix=b/',
      'before.txt',
      'after.txt',
    ];
    const diff = execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, LC_ALL: 'C' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    throw new Error(`Expected git diff to exit 1, got 0: ${diff}`);
  } catch (error) {
    const result = error as { status?: number; stdout?: string };
    if (result.status !== 1 || typeof result.stdout !== 'string') throw error;
    return result.stdout;
  } finally {
    rmSync(cwd, { force: true, recursive: true });
  }
}

const count = (output: string, value: string) => output.split(value).length - 1;
const layouts: OutputFormatType[] = ['line-by-line', 'side-by-side'];

describe('Git EOF metadata', () => {
  it.each([
    ['old-only', 'old', 'new\n', [marker, undefined]],
    ['new-only', 'old\n', 'new', [undefined, marker]],
    ['both changed', 'old', 'new', [marker, marker]],
    ['shared context', 'old\nshared', 'new\nshared', [undefined, undefined, marker]],
  ] as const)('retains metadata and original line numbers: %s', (_, before, after, markers) => {
    const diff = gitDiff(before, after);
    const [file] = parse(diff);
    expect([file.addedLines, file.deletedLines]).toEqual([1, 1]);
    const lines = file.blocks[0].lines;
    expect(lines.map(line => line.noNewline)).toEqual(markers);
    expect(lines.map(line => [line.oldNumber, line.newNumber])).toEqual(
      markers.length === 3
        ? [
            [1, undefined],
            [undefined, 1],
            [2, 2],
          ]
        : [
            [1, undefined],
            [undefined, 1],
          ],
    );
    for (const wrapLines of [false, true]) {
      for (const outputFormat of layouts) {
        const output = html(diff, { outputFormat, wrapLines });
        const tables = Array.from(output.matchAll(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/g), match => match[1]);
        if (outputFormat === 'line-by-line') {
          expect(count(output, message)).toBe(markers.filter(Boolean).length);
          for (const [row] of output.matchAll(/<tr>[\s\S]*?<\/tr>/g)) {
            if (row.includes(message)) expect(row).not.toMatch(/line-num[12]">\s*\d/);
          }
        } else if (wrapLines) {
          const markerRow = [...tables[0].matchAll(/<tr>[\s\S]*?<\/tr>/g)].find(([row]) => row.includes(message))?.[0];
          expect(markerRow).toBeDefined();
          const cells = Array.from(markerRow!.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g), match => match[1]);
          expect(cells.map(cell => cell.includes(message))).toEqual([
            false,
            Boolean(markers[0] || markers[2]),
            false,
            Boolean(markers[1] || markers[2]),
          ]);
          expect([cells[0].trim(), cells[2].trim()]).toEqual(['', '']);
        } else {
          expect(tables.map(table => count(table, message))).toEqual([
            Number(Boolean(markers[0] || markers[2])),
            Number(Boolean(markers[1] || markers[2])),
          ]);
        }
      }
    }
  });

  it('escapes a translated marker and ignores one without an adjacent hunk line', () => {
    const translated = '\\ Sin nueva línea <al final>';
    const diff = `${translated}\n${gitDiff('old', 'new\n').replace(marker, translated)}`;
    expect(parse(diff)[0].blocks[0].lines.map(line => line.noNewline)).toEqual([translated, undefined]);
    expect(html(diff)).toContain('Sin nueva línea &lt;al final&gt;');
    expect(html(diff)).not.toContain('<al final>');
  });

  it.each([false, true])('keeps literal nested diff text on both sides (wrapLines=%s)', wrapLines => {
    const diff = gitDiff(`old\n${marker}\n`, `new\n${marker}\n`);
    expect(parse(diff)[0].blocks[0].lines[2]).toEqual({
      content: ` ${marker}`,
      type: 'context',
      oldNumber: 2,
      newNumber: 2,
    });
    expect(count(html(diff, { outputFormat: 'side-by-side', wrapLines }), message)).toBe(2);
  });
});
