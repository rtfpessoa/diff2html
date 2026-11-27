import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./update-readme-toc.mjs', import.meta.url));

function checkUpdate(t, before, stale, after, expected) {
  const directory = mkdtempSync(join(tmpdir(), 'diff2html-toc-'));
  t.after(() => rmSync(directory, { recursive: true }));
  const file = join(directory, 'README.md');
  const run = () => execFileSync(process.execPath, [generator, file]);
  writeFileSync(file, before + stale + after);
  run();
  assert.deepEqual(readFileSync(file), Buffer.from(before + expected + after));
  run();
  assert.deepEqual(readFileSync(file), Buffer.from(before + expected + after));
}

for (const [name, before, after, eol] of [
  ['LF', '# Title\n\n<!-- toc -->\n', '<!-- tocstop -->\n\n## Keep me\n', '\n'],
  ['CRLF', '# Title\r\n\r\n<!-- toc -->\r\n', '<!-- tocstop -->\r\n\r\n## Keep me\r\n', '\r\n'],
  ['mixed', '# Title\n\n<!-- toc -->\r\n', '<!-- tocstop -->\r\n\r\n## Keep me\nuntouched\r', '\r\n'],
  ['CR', '# Title\r\r<!-- toc -->\r', '<!-- tocstop -->\r\r## Keep me', '\r'],
]) {
  test(`${name}: update only between markers and remain idempotent`, t => {
    checkUpdate(t, before, `${eol}- stale${eol}${eol}`, after, `${eol}- [Keep me](#keep-me)${eol}${eol}`);
  });
}

test('reject indented markers without modifying the file', t => {
  const directory = mkdtempSync(join(tmpdir(), 'diff2html-toc-'));
  t.after(() => rmSync(directory, { recursive: true }));
  const file = join(directory, 'README.md');
  for (const markers of ['  <!-- toc -->\n\n<!-- tocstop -->', '<!-- toc -->\n\n  <!-- tocstop -->']) {
    const source = `# Title\n\n${markers}\n\n## Keep me\n`;
    writeFileSync(file, source);
    assert.throws(() => execFileSync(process.execPath, [generator, file], { stdio: 'pipe' }), /start of their lines/);
    assert.deepEqual(readFileSync(file), Buffer.from(source));
  }
});

test('exclude discarded headings from slug allocation and escape literal labels', t => {
  checkUpdate(
    t,
    '# Example\n\n<!-- toc -->\n',
    '\n## Example\n\n',
    '<!-- tocstop -->\n\n## Example\n\n## `Link <https://example.com>`\n',
    '\n- [Example](#example-1)\n- [Link \\<https://example.com\\>](#link-httpsexamplecom)\n\n',
  );
});
