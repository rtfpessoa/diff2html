import { readFileSync, writeFileSync } from 'node:fs';

import GithubSlugger from 'github-slugger';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: true });

function headingText(tokens) {
  return tokens
    .map(token => {
      if (token.type === 'text' || token.type === 'code_inline') return token.content;
      if (token.type === 'image') return headingText(token.children);
      if (token.type === 'softbreak' || token.type === 'hardbreak') return ' ';
      return '';
    })
    .join('');
}

function updateToc(source) {
  const tokens = markdown.parse(source, {});
  const markerLines = marker =>
    tokens
      .filter(token => token.level === 0 && token.type === 'html_block' && token.content.trim() === marker)
      .map(token => token.map[0]);
  const starts = markerLines('<!-- toc -->');
  const ends = markerLines('<!-- tocstop -->');
  if (starts.length !== 1 || ends.length !== 1 || starts[0] >= ends[0]) {
    throw new Error('Expected one ordered pair of <!-- toc --> and <!-- tocstop --> markers');
  }

  // Markdown-it normalizes CRLF and bare CR. Map its line numbers to original offsets.
  const breaks = [...source.matchAll(/\r\n|[\r\n]/g)];
  const openBreak = breaks[starts[0]];
  const closeBreak = breaks[ends[0] - 1];
  const eol = openBreak[0];
  const start = openBreak.index + eol.length;
  const end = closeBreak.index + closeBreak[0].length;
  const beforeOpen = breaks[starts[0] - 1];
  const opening = beforeOpen ? beforeOpen.index + beforeOpen[0].length : 0;
  if (source[opening] !== '<' || source[end] !== '<') {
    throw new Error('Place TOC markers at the start of their lines');
  }

  const slugger = new GithubSlugger();
  const headings = tokens.flatMap((token, index) => {
    if (token.level !== 0 || token.type !== 'heading_open') return [];
    if (token.map[0] > starts[0] && token.map[0] < ends[0]) return [];
    const title = headingText(tokens[index + 1].children).trim();
    const slug = slugger.slug(title);
    const depth = Number(token.tag[1]);
    if (!title || depth > 3 || token.map[0] < ends[0]) return [];
    return [{ title, slug, depth }];
  });

  const minDepth = Math.min(...headings.map(heading => heading.depth));
  const items = headings.map(({ title, slug, depth }) => {
    const label = title.replace(/[\\[\]`*_~<>&!]/g, '\\$&');
    return `${'  '.repeat(depth - minDepth)}- [${label}](#${slug})`;
  });
  return source.slice(0, start) + ['', ...items, '', ''].join(eol) + source.slice(end);
}

const files = process.argv.slice(2);
if (files.length === 0) throw new Error('Provide the Markdown file to update');
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const updated = updateToc(source);
  if (updated !== source) writeFileSync(file, updated);
}
