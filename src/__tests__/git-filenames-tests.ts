import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from '../diff-parser';

it.each([true, false])('parses filenames with spaces from Git (core.quotePath=%s)', quotePath => {
  const cwd = mkdtempSync(join(tmpdir(), 'diff2html-git-'));
  const filenames = ['plain space.js', 'ünï space.txt'];

  try {
    mkdirSync(join(cwd, 'before'));
    mkdirSync(join(cwd, 'after'));
    for (const name of filenames) {
      writeFileSync(join(cwd, 'before', name), 'before\n');
      writeFileSync(join(cwd, 'after', name), 'after\n');
    }

    const result = spawnSync(
      'git',
      [
        '-c',
        `core.quotePath=${quotePath}`,
        'diff',
        '--no-index',
        '--no-color',
        '--no-ext-diff',
        '--no-textconv',
        '--src-prefix=a/',
        '--dst-prefix=b/',
        '--',
        'before',
        'after',
      ],
      { cwd, encoding: 'utf8' },
    );
    if (result.error) throw result.error;
    expect(result.status).toBe(1); // Git found differences.

    expect(parse(result.stdout).map(({ oldName, newName, language }) => [oldName, newName, language])).toEqual([
      ['before/plain space.js', 'after/plain space.js', 'js'],
      ['before/ünï space.txt', 'after/ünï space.txt', 'txt'],
    ]);
  } finally {
    rmSync(cwd, { force: true, recursive: true });
  }
});

it.each(['rename', 'copy'])('uses Git %s metadata when only the next file has a hunk', operation => {
  const cwd = mkdtempSync(join(tmpdir(), 'diff2html-git-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' });
  const oldName = 'a-old.txt';
  const newName = 'a b/new.txt'; // Git does not quote this path; ` b/` makes its diff header ambiguous.
  const content = 'unchanged contents\n';

  try {
    git('init', '--quiet');
    writeFileSync(join(cwd, oldName), content);
    writeFileSync(join(cwd, 'z-text.txt'), 'before\n');
    git('add', '--all');
    const base = git('write-tree').trim();

    mkdirSync(join(cwd, 'a b'));
    if (operation === 'rename') git('mv', oldName, newName);
    else writeFileSync(join(cwd, newName), content);
    writeFileSync(join(cwd, 'z-text.txt'), 'after\n');
    git('add', '--all');

    const diff = git(
      'diff',
      '--cached',
      '--find-renames',
      '--find-copies-harder',
      '--src-prefix=a/',
      '--dst-prefix=b/',
      '--no-color',
      '--no-ext-diff',
      '--no-textconv',
      base,
    );
    expect(diff).toContain(`${operation} from ${oldName}\n${operation} to ${newName}\n`);
    expect(parse(diff).map(({ oldName, newName }) => [oldName, newName])).toEqual([
      [oldName, newName],
      ['z-text.txt', 'z-text.txt'],
    ]);
  } finally {
    rmSync(cwd, { force: true, recursive: true });
  }
});
