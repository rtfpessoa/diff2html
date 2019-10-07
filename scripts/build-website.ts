#!/usr/bin/env node

import * as fs from "fs";

import * as hogan from "hogan.js";

type OptionsType = {
  all: object;
  [page: string]: object;
};

const templatesRoot = "website/templates";
const pagesRoot = `${templatesRoot}/pages`;
const options: OptionsType = {
  all: {
    demoUrl: "demo.html?diff=https://github.com/rtfpessoa/diff2html/pull/106"
  },
  demo: {
    extraClass: "template-index-min"
  }
};

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (_ignore) {}

  return "";
}

function writeFile(filePath: string, content: string): void {
  return fs.writeFileSync(filePath, content);
}

const websitePages = fs.readdirSync(pagesRoot);

const template = hogan.compile(readFile(`${templatesRoot}/template.mustache`));

websitePages.map(page => {
  const baseOptions = { ...(options.all || {}), ...(options[page] || {}) };

  const pagePartialTemplate = hogan.compile(readFile(`${pagesRoot}/${page}/${page}.partial.mustache`));
  const pageAssetsTemplate = hogan.compile(readFile(`${pagesRoot}/${page}/${page}-assets.partial.mustache`));
  const pageScriptsTemplate = hogan.compile(readFile(`${pagesRoot}/${page}/${page}-scripts.partial.mustache`));

  const pagePartial = pagePartialTemplate.render(baseOptions);
  const pageAssets = pageAssetsTemplate.render(baseOptions);
  const pageScripts = pageScriptsTemplate.render(baseOptions);

  const pageOptions = { ...baseOptions, assets: pageAssets, scripts: pageScripts, content: pagePartial };

  const pageHtml = template.render(pageOptions);
  writeFile(`docs/${page}.html`, pageHtml);
});
