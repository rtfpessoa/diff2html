#!/usr/bin/env node

const fs = require("fs");

const hogan = require("hogan.js");

const root = "website/templates";
const pagesRoot = root + "/pages";

const websitePages = fs.readdirSync(root + "/pages");

const template = hogan.compile(readFile(root + "/template.mustache"));

const options = {
  all: {
    demoUrl: "demo.html?diff=https://github.com/rtfpessoa/diff2html/pull/106"
  },
  demo: {
    extraClass: "template-index-min"
  }
};

websitePages.map(function(page) {
  const pagePartialTemplate = hogan.compile(readFile(pagesRoot + "/" + page + "/" + page + ".partial.mustache"));
  const pageAssetsTemplate = hogan.compile(readFile(pagesRoot + "/" + page + "/" + page + "-assets.partial.mustache"));
  const pageScriptsTemplate = hogan.compile(
    readFile(pagesRoot + "/" + page + "/" + page + "-scripts.partial.mustache")
  );

  const templateOptions = {};

  let key;

  // Allow the pages to share common options
  const genericOptions = options.all || {};
  for (key in genericOptions) {
    if (genericOptions.hasOwnProperty(key)) {
      templateOptions[key] = genericOptions[key];
    }
  }

  // Allow each page to have custom options
  const pageOptions = options[page] || {};
  for (key in pageOptions) {
    if (pageOptions.hasOwnProperty(key)) {
      templateOptions[key] = pageOptions[key];
    }
  }

  const pagePartial = pagePartialTemplate.render(templateOptions);
  const pageAssets = pageAssetsTemplate.render(templateOptions);
  const pageScripts = pageScriptsTemplate.render(templateOptions);

  templateOptions.assets = pageAssets;
  templateOptions.scripts = pageScripts;
  templateOptions.content = pagePartial;

  const pageHtml = template.render(templateOptions);
  writeFile("docs/" + page + ".html", pageHtml);
});

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (_ignore) {}

  return "";
}

function writeFile(filePath, content) {
  return fs.writeFileSync(filePath, content);
}
