import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from '../diff-parser';

it('ignores custom signatures in real Git mail without dropping deletions or the next patch', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'diff2html-format-patch-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' });
  const commit = (message: string, ...parents: string[]) =>
    git('commit-tree', git('write-tree').trim(), ...parents, '-m', message).trim();

  try {
    git('init', '--quiet');
    git('config', 'user.name', 'Diff Fixture');
    git('config', 'user.email', 'diff@example.invalid');
    git('config', 'commit.gpgSign', 'false');
    writeFileSync(join(cwd, 'dash.txt'), '- \n');
    git('add', '--all');
    const base = commit('Original');

    writeFileSync(join(cwd, 'dash.txt'), 'replacement\n');
    git('add', '--all');
    const edit = commit('Replace dash-space', '-p', base);
    writeFileSync(join(cwd, 'new.txt'), 'new file\n');
    git('add', '--all');
    const tip = commit('Add another file', '-p', edit);

    const patch = git(
      'format-patch',
      '--stdout',
      '--no-cover-letter',
      '--no-color',
      '-U0',
      '--signature',
      'custom signature\n+not added\n-not deleted\n not context',
      `${base}..${tip}`,
    );
    expect(patch).toContain('-- \ncustom signature\n+not added\n-not deleted\n not context\n');
    const files = parse(patch);
    expect(files.map(({ newName, addedLines, deletedLines }) => [newName, addedLines, deletedLines])).toEqual([
      ['dash.txt', 1, 1],
      ['new.txt', 1, 0],
    ]);
    expect(files.map(file => file.blocks.flatMap(block => block.lines.map(line => line.content)))).toEqual([
      ['-- ', '+replacement'],
      ['+new file'],
    ]);
    expect(parse(patch.replace(/\n/g, '\r\n'))).toEqual(files);

    const raw = git('diff', '--no-color', '--no-ext-diff', '--no-textconv', '-U0', base, edit);
    const wrongCounts = raw.replace('@@ -1 +1 @@', '@@ -1,0 +1,0 @@');
    expect(wrongCounts).not.toBe(raw);
    expect(parse(wrongCounts)[0].blocks[0].lines.map(line => line.content)).toEqual(['-- ', '+replacement']);
  } finally {
    rmSync(cwd, { force: true, recursive: true });
  }
});
