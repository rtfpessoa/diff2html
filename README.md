# diff2html

[![Codacy Quality Badge](https://api.codacy.com/project/badge/Grade/06412dc3f5a14f568778d0db8a1f7dc8)](https://www.codacy.com/app/rtfpessoa/diff2html?utm_source=github.com&utm_medium=referral&utm_content=rtfpessoa/diff2html&utm_campaign=Badge_Grade)
[![Codacy Coverage Badge](https://api.codacy.com/project/badge/Coverage/06412dc3f5a14f568778d0db8a1f7dc8)](https://www.codacy.com/app/rtfpessoa/diff2html?utm_source=github.com&utm_medium=referral&utm_content=rtfpessoa/diff2html&utm_campaign=Badge_Coverage)
[![CircleCI](https://circleci.com/gh/rtfpessoa/diff2html.svg?style=svg)](https://circleci.com/gh/rtfpessoa/diff2html)

[![npm](https://img.shields.io/npm/v/diff2html?style=flat)](https://www.npmjs.com/package/diff2html)
[![Dependency Status](https://david-dm.org/rtfpessoa/diff2html.svg)](https://david-dm.org/rtfpessoa/diff2html)
[![devDependency Status](https://david-dm.org/rtfpessoa/diff2html/dev-status.svg)](https://david-dm.org/rtfpessoa/diff2html#info=devDependencies)
[![jsdelivr CDN Downloads](https://data.jsdelivr.com/v1/package/npm/diff2html/badge)](https://www.jsdelivr.com/package/npm/diff2html)

[![node](https://img.shields.io/node/v/diff2html.svg)]() [![npm](https://img.shields.io/npm/l/diff2html.svg)]()
[![npm](https://img.shields.io/npm/dm/diff2html.svg)](https://www.npmjs.com/package/diff2html)
[![All Contributors](https://img.shields.io/badge/all_contributors-22-orange.svg?style=flat-square)](#contributors)
[![Gitter](https://badges.gitter.im/rtfpessoa/diff2html.svg)](https://gitter.im/rtfpessoa/diff2html?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

diff2html generates pretty HTML diffs from git diff or unified diff output.

[![NPM](https://nodei.co/npm/diff2html.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/diff2html/)

## Table of Contents

<!-- toc -->

- [Features](#features)
- [Online Example](#online-example)
- [Distributions](#distributions)
- [Usage](#usage)
- [Diff Text Input](#diff-text-input)
- [Diff2HtmlUI Usage](#diff2htmlui-usage)
  - [Diff2HtmlUI API](#diff2htmlui-api)
  - [Diff2HtmlUI Configuration](#diff2htmlui-configuration)
  - [Diff2HtmlUI Browser](#diff2htmlui-browser)
  - [Diff2HtmlUI Examples](#diff2htmlui-examples)
- [Diff2Html Usage](#diff2html-usage)
  - [Diff2Html API](#diff2html-api)
  - [Diff2Html Configuration](#diff2html-configuration)
  - [Diff2Html Browser](#diff2html-browser)
  - [Diff2Html NPM / Node.js Library](#diff2html-npm--nodejs-library)
  - [Diff2Html Examples](#diff2html-examples)
- [Troubleshooting](#troubleshooting)
  - [1. Out of memory or Slow execution](#1-out-of-memory-or-slow-execution)
- [Contribute](#contribute)
- [Contributors](#contributors)
- [License](#license)
- [Thanks](#thanks)

<!-- tocstop -->

## Features

- Supports git and unified diffs

- Line by line and Side by side diff

- New and old line numbers

- Inserted and removed lines

- GitHub like visual style

- Code syntax highlight

- Line similarity matching

- Easy code selection

## Online Example

> Go to [diff2html](https://diff2html.xyz/demo.html)

## Distributions

- [jsdelivr CDN](https://www.jsdelivr.com/package/npm/diff2html)
- [WebJar](http://www.webjars.org/)
- [Node Library](https://www.npmjs.org/package/diff2html)
- [NPM CLI](https://www.npmjs.org/package/diff2html-cli)
- Manually use from jsdelivr or build the project:
  - Browser / Bundle
    - Parser and HTML Generator
      - [bundles/js/diff2html.min.js](https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html.min.js) - includes the
        diff parser and html generator
    - Wrapper and helper adding syntax highlight, synchronized scroll, and other nice features
      - [bundles/js/diff2html-ui.min.js](https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js) -
        includes the wrapper of diff2html with highlight for all `highlight.js` supported languages
      - [bundles/js/diff2html-ui-slim.min.js](https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui-slim.min.js) -
        includes the wrapper of diff2html with "the most common" `highlight.js` supported languages
      - [bundles/js/diff2html-ui-base.min.js](https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui-base.min.js) -
        includes the wrapper of diff2html without including a `highlight.js` implementation. You can use it without
        syntax highlight or by passing your own implementation with the languages you prefer
  - NPM / Node.js library
    - ES5
      - [lib/diff2html.js](https://cdn.jsdelivr.net/npm/diff2html/lib/diff2html.js) - includes the diff parser and html
        generator
      - [lib/ui/js/diff2html-ui.js](https://cdn.jsdelivr.net/npm/diff2html/lib/ui/js/diff2html-ui.js) - includes the
        wrapper of diff2html with highlight for all `highlight.js` supported languages
      - [lib/ui/js/diff2html-ui-slim.js](https://cdn.jsdelivr.net/npm/diff2html/lib/ui/js/diff2html-ui-slim.js) -
        includes the wrapper of diff2html with "the most common" `highlight.js` supported languages
      - [lib/ui/js/diff2html-ui-base.js](https://cdn.jsdelivr.net/npm/diff2html/lib/ui/js/diff2html-ui-base.js)
    - ES6
      - [lib-esm/diff2html.js](https://cdn.jsdelivr.net/npm/diff2html/lib-esm/diff2html.js) - includes the diff parser
        and html generator
      - [lib/ui/js/diff2html-ui.js](https://cdn.jsdelivr.net/npm/diff2html/lib/ui/js/diff2html-ui.js) - includes the
        wrapper of diff2html with highlight for all `highlight.js` supported languages
      - [lib/ui/js/diff2html-ui-slim.js](https://cdn.jsdelivr.net/npm/diff2html/lib/ui/js/diff2html-ui-slim.js) -
        includes the wrapper of diff2html with "the most common" `highlight.js` supported languages
      - [lib/ui/js/diff2html-ui-base.js](https://cdn.jsdelivr.net/npm/diff2html/lib/ui/js/diff2html-ui-base.js) -
        includes the wrapper of diff2html without including a `highlight.js` implementation. You can use it without
        syntax highlight or by passing your own implementation with the languages you prefer

## Usage

Diff2Html can be used in various ways as listed in the [distributions](#distributions) section. The two main ways are:

- [Diff2HtmlUI](#diff2htmlui-usage): using this wrapper makes it easy to inject the html in the DOM and adds some nice
  features to the diff, like syntax highlight.
- [Diff2Html](#diff2html-usage): using the parser and html generator directly from the library gives you complete
  control about what you can do with the json or html generated.

Below you can find more details and examples about each option.

## Diff Text Input

diff2html accepts the text contents of a
[unified diff](https://www.gnu.org/software/diffutils/manual/html_node/Unified-Format.html) or the superset format git
diff (https://git-scm.com/docs/git-diff) (not combined or word diff). To provide multiples files as input just
concatenate the diffs (just like the output of git diff).

## Diff2HtmlUI Usage

> Simple wrapper to ease simple tasks in the browser such as: code highlight and js effects

- Invoke Diff2html
- Inject output in DOM element
- Enable collapsible file summary list
- Enable syntax highlight of the code in the diffs

### Diff2HtmlUI API

> Create a Diff2HtmlUI instance

```ts
constructor(target: HTMLElement, diffInput?: string | DiffFile[]) // diff2html-ui, diff2html-ui-slim
constructor(target: HTMLElement, diffInput?: string | DiffFile[], config: Diff2HtmlUIConfig = {}, hljs?: HighlightJS) // diff2html-ui-base
```

> Generate and inject in the document the Pretty HTML representation of the diff

```ts
draw(): void
```

> Enable extra features

```ts
synchronisedScroll(): void
fileListToggle(startVisible: boolean): void
highlightCode(): void
```

### Diff2HtmlUI Configuration

- `synchronisedScroll`: scroll both panes in side-by-side mode: `true` or `false`, default is `true`
- `highlight`: syntax highlight the code on the diff: `true` or `false`, default is `true`
- `fileListToggle`: allow the file summary list to be toggled: `true` or `false`, default is `true`
- `fileListStartVisible`: choose if the file summary list starts visible: `true` or `false`, default is `false`
- `fileContentToggle`: allow each file contents to be toggled: `true` or `false`, default is `true`
- [All the options](#diff2html-configuration) from Diff2Html are also valid configurations in Diff2HtmlUI

### Diff2HtmlUI Browser

#### Mandatory HTML resource imports

```html
<!-- CSS -->
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css" />

<!-- Javascripts -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js"></script>
```

#### Init

```js
const targetElement = document.getElementById('destination-elem-id');
const configuration = { drawFileList: true, matching: 'lines' };

const diff2htmlUi = new Diff2HtmlUI(targetElement, diffString, configuration);
// or
const diff2htmlUi = new Diff2HtmlUI(targetElement, diffJson, configuration);
```

#### Draw

```js
diff2htmlUi.draw();
```

#### Syntax Highlight

**NOTE:** The highlight.js css should come before the diff2html css

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/styles/github.min.css" />
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css" />

<!-- Javascripts -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js"></script>
```

> Pass the option `highlight` with value true or invoke `diff2htmlUi.highlightCode()` after `diff2htmlUi.draw()`.

```js
document.addEventListener('DOMContentLoaded', () => {
  const diffString = `diff --git a/sample.js b/sample.js
  index 0000001..0ddf2ba
  --- a/sample.js
  +++ b/sample.js
  @@ -1 +1 @@
  -console.log("Hello World!")
  +console.log("Hello from Diff2Html!")`;
  const targetElement = document.getElementById('myDiffElement');
  const configuration = { drawFileList: true, matching: 'lines', highlight: true };
  const diff2htmlUi = new Diff2HtmlUI(targetElement, diffString, configuration);
  diff2htmlUi.draw();
  diff2htmlUi.highlightCode();
});
```

#### Collapsable File Summary List

> Add the dependencies.

```html
<!-- Javascripts -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js"></script>
```

> Invoke the Diff2HtmlUI helper Pass the option `fileListToggle` with value true or invoke
> `diff2htmlUi.fileListToggle()` after `diff2htmlUi.draw()`.

```js
document.addEventListener('DOMContentLoaded', () => {
  const targetElement = document.getElementById('myDiffElement');
  var diff2htmlUi = new Diff2HtmlUI(targetElement, lineDiffExample, { drawFileList: true, matching: 'lines' });
  diff2htmlUi.draw();
  diff2htmlUi.fileListToggle(false);
});
```

### Diff2HtmlUI Examples

#### Example with plain HTML+CSS+JS

```html
<!DOCTYPE html>
<html lang="en-us">
  <head>
    <meta charset="utf-8" />
    <!-- Make sure to load the highlight.js CSS file before the Diff2Html CSS file -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.1/styles/github.min.css" />
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css"
    />
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js"></script>
  </head>
  <script>
    const diffString = `diff --git a/sample.js b/sample.js
index 0000001..0ddf2ba
--- a/sample.js
+++ b/sample.js
@@ -1 +1 @@
-console.log("Hello World!")
+console.log("Hello from Diff2Html!")`;

    document.addEventListener('DOMContentLoaded', function () {
      var targetElement = document.getElementById('myDiffElement');
      var configuration = {
        drawFileList: true,
        fileListToggle: false,
        fileListStartVisible: false,
        fileContentToggle: false,
        matching: 'lines',
        outputFormat: 'side-by-side',
        synchronisedScroll: true,
        highlight: true,
        renderNothingWhenEmpty: false,
      };
      var diff2htmlUi = new Diff2HtmlUI(targetElement, diffString, configuration);
      diff2htmlUi.draw();
      diff2htmlUi.highlightCode();
    });
  </script>
  <body>
    <div id="myDiffElement"></div>
  </body>
</html>
```

#### StimulusJS with TypeScript

```ts
import { Controller } from '@hotwired/stimulus';

import { Diff2HtmlUI, Diff2HtmlUIConfig } from 'diff2html/lib/ui/js/diff2html-ui-slim.js';

// Requires `yarn add highlight.js`
import 'highlight.js/styles/github.css';
import 'diff2html/bundles/css/diff2html.min.css';

export default class extends Controller {
  connect(): void {
    const diff2htmlUi = new Diff2HtmlUI(this.diffElement, this.unifiedDiff, this.diffConfiguration);

    diff2htmlUi.draw();
  }

  get unifiedDiff(): string {
    return this.data.get('unifiedDiff') || '';
  }

  get diffElement(): HTMLElement {
    return this.element as HTMLElement;
  }

  get diffConfiguration(): Diff2HtmlUIConfig {
    return {
      drawFileList: true,
      matching: 'lines',
    };
  }
}
```

## Diff2Html Usage

### Diff2Html API

> JSON representation of the diff

```ts
function parse(diffInput: string, configuration: Diff2HtmlConfig = {}): DiffFile[];
```

> Pretty HTML representation of the diff

```ts
function html(diffInput: string | DiffFile[], configuration: Diff2HtmlConfig = {}): string;
```

### Diff2Html Configuration

The HTML output accepts a Javascript object with configuration. Possible options:

- `outputFormat`: the format of the output data: `'line-by-line'` or `'side-by-side'`, default is `'line-by-line'`
- `drawFileList`: show a file list before the diff: `true` or `false`, default is `true`
- `srcPrefix`: add a prefix to all source (before changes) filepaths, default is `''`. Should match the prefix used when
  [generating the diff](https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---src-prefixltprefixgt).
- `dstPrefix`: add a prefix to all destination (after changes) filepaths, default is `''`. Should match the prefix used
  when [generating the diff](https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---dst-prefixltprefixgt)
- `diffMaxChanges`: number of changed lines after which a file diff is deemed as too big and not displayed, default is
  `undefined`
- `diffMaxLineLength`: number of characters in a diff line after which a file diff is deemed as too big and not
  displayed, default is `undefined`
- `diffTooBigMessage`: function allowing to customize the message in case of file diff too big (if `diffMaxChanges` or
  `diffMaxLineLength` is set). Will be given a file index as a number and should return a string.
- `matching`: matching level: `'lines'` for matching lines, `'words'` for matching lines and words or `'none'`, default
  is `none`
- `matchWordsThreshold`: similarity threshold for word matching, default is `0.25`
- `maxLineLengthHighlight`: only perform diff changes highlight if lines are smaller than this, default is `10000`
- `diffStyle`: show differences level in each line: `'word'` or `'char'`, default is `'word'`
- `renderNothingWhenEmpty`: render nothing if the diff shows no change in its comparison: `true` or `false`, default is
  `false`
- `matchingMaxComparisons`: perform at most this much comparisons for line matching a block of changes, default is
  `2500`
- `maxLineSizeInBlockForComparison`: maximum number os characters of the bigger line in a block to apply comparison,
  default is `200`
- `compiledTemplates`: object ([Hogan.js](https://github.com/twitter/hogan.js/) template values) with previously
  compiled templates to replace parts of the html, default is `{}`. For example:
  `{ "tag-file-changed": Hogan.compile("<span class="d2h-tag d2h-changed d2h-changed-tag">MODIFIED</span>") }`
- `rawTemplates`: object (string values) with raw not compiled templates to replace parts of the html, default is `{}`.
  For example: `{ "tag-file-changed": "<span class="d2h-tag d2h-changed d2h-changed-tag">MODIFIED</span>" }`
  > For more information regarding the possible templates look into
  > [src/templates](https://github.com/rtfpessoa/diff2html/tree/master/src/templates)

### Diff2Html Browser

Import the stylesheet and the library code.

To load correctly in the Browser you need to include the stylesheet in the final HTML.

```html
<!-- CSS -->
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css" />

<!-- Javascripts -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html.min.js"></script>
```

It will now be available as a global variable named `Diff2Html`.

```js
document.addEventListener('DOMContentLoaded', () => {
  var diffHtml = Diff2Html.html('<Unified Diff String>', {
    drawFileList: true,
    matching: 'lines',
    outputFormat: 'side-by-side',
  });
  document.getElementById('destination-elem-id').innerHTML = diffHtml;
});
```

### Diff2Html NPM / Node.js Library

```js
const Diff2html = require('diff2html');
const diffJson = Diff2html.parse('<Unified Diff String>');
const diffHtml = Diff2html.html(diffJson, { drawFileList: true });
console.log(diffHtml);
```

### Diff2Html Examples

#### Example with Angular

- Typescript

```typescript
import * as Diff2Html from 'diff2html';
import { Component, OnInit } from '@angular/core';

export class AppDiffComponent implements OnInit {
  outputHtml: string;
  constructor() {
    this.init();
  }

  ngOnInit() {}

  init() {
    let strInput =
      '--- a/server/vendor/golang.org/x/sys/unix/zsyscall_linux_mipsle.go\n+++ b/server/vendor/golang.org/x/sys/unix/zsyscall_linux_mipsle.go\n@@ -1035,6 +1035,17 @@ func Prctl(option int, arg2 uintptr, arg3 uintptr, arg4 uintptr, arg5 uintptr) (\n \n // THIS FILE IS GENERATED BY THE COMMAND AT THE TOP; DO NOT EDIT\n \n+func Pselect(nfd int, r *FdSet, w *FdSet, e *FdSet, timeout *Timespec, sigmask *Sigset_t) (n int, err error) {\n+\tr0, _, e1 := Syscall6(SYS_PSELECT6, uintptr(nfd), uintptr(unsafe.Pointer(r)), uintptr(unsafe.Pointer(w)), uintptr(unsafe.Pointer(e)), uintptr(unsafe.Pointer(timeout)), uintptr(unsafe.Pointer(sigmask)))\n+\tn = int(r0)\n+\tif e1 != 0 {\n+\t\terr = errnoErr(e1)\n+\t}\n+\treturn\n+}\n+\n+// THIS FILE IS GENERATED BY THE COMMAND AT THE TOP; DO NOT EDIT\n+\n func read(fd int, p []byte) (n int, err error) {\n \tvar _p0 unsafe.Pointer\n \tif len(p) > 0 {\n';
    let outputHtml = Diff2Html.html(strInput, { drawFileList: true, matching: 'lines' });
    this.outputHtml = outputHtml;
  }
}
```

- HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>diff2html</title>
  </head>
  <body>
    <div [innerHtml]="outputHtml"></div>
  </body>
</html>
```

- `.angular-cli.json` - Add styles

```json
"styles": [
  "diff2html.min.css"
]
```

#### Example with Vue.js

```vue
<template>
  <div v-html="prettyHtml" />
</template>

<script>
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';

export default {
  data() {
    return {
      diffs:
        '--- a/server/vendor/golang.org/x/sys/unix/zsyscall_linux_mipsle.go\n+++ b/server/vendor/golang.org/x/sys/unix/zsyscall_linux_mipsle.go\n@@ -1035,6 +1035,17 @@ func Prctl(option int, arg2 uintptr, arg3 uintptr, arg4 uintptr, arg5 uintptr) (\n \n // THIS FILE IS GENERATED BY THE COMMAND AT THE TOP; DO NOT EDIT\n \n+func Pselect(nfd int, r *FdSet, w *FdSet, e *FdSet, timeout *Timespec, sigmask *Sigset_t) (n int, err error) {\n+\tr0, _, e1 := Syscall6(SYS_PSELECT6, uintptr(nfd), uintptr(unsafe.Pointer(r)), uintptr(unsafe.Pointer(w)), uintptr(unsafe.Pointer(e)), uintptr(unsafe.Pointer(timeout)), uintptr(unsafe.Pointer(sigmask)))\n+\tn = int(r0)\n+\tif e1 != 0 {\n+\t\terr = errnoErr(e1)\n+\t}\n+\treturn\n+}\n+\n+// THIS FILE IS GENERATED BY THE COMMAND AT THE TOP; DO NOT EDIT\n+\n func read(fd int, p []byte) (n int, err error) {\n \tvar _p0 unsafe.Pointer\n \tif len(p) > 0 {\n',
    };
  },
  computed: {
    prettyHtml() {
      return Diff2Html.html(this.diffs, {
        drawFileList: true,
        matching: 'lines',
        outputFormat: 'side-by-side',
      });
    },
  },
};
</script>
```

## Troubleshooting

### 1. Out of memory or Slow execution

#### Causes:

- Big files
- Big lines

#### Fix:

- Disable the line matching algorithm, by setting the option `{"matching": "none"}` when invoking diff2html

## Contribute

This is a developer friendly project, all the contributions are welcome. To contribute just send a pull request with
your changes following the guidelines described in `CONTRIBUTING.md`. I will try to review them as soon as possible.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://rtfpessoa.xyz"><img src="https://avatars0.githubusercontent.com/u/902384?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rodrigo Fernandes</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=rtfpessoa" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/stockmind"><img src="https://avatars3.githubusercontent.com/u/5653847?v=4?s=100" width="100px;" alt=""/><br /><sub><b>stockmind</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=stockmind" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/lantian"><img src="https://avatars3.githubusercontent.com/u/535545?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ivan Vorontsov</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=lantian" title="Code">💻</a></td>
    <td align="center"><a href="http://www.nick-brewer.com"><img src="https://avatars1.githubusercontent.com/u/129300?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nick Brewer</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=brewern" title="Code">💻</a></td>
    <td align="center"><a href="http://heyitsmattwade.com"><img src="https://avatars0.githubusercontent.com/u/8504000?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matt Wade</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/issues?q=author%3Aromellem" title="Bug reports">🐛</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=romellem" title="Code">💻</a></td>
    <td align="center"><a href="http://mrfyda.github.io"><img src="https://avatars1.githubusercontent.com/u/593860?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rafael Cortês</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=mrfyda" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/nmatpt"><img src="https://avatars2.githubusercontent.com/u/5034733?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nuno Teixeira</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=nmatpt" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://saino.me/"><img src="https://avatars0.githubusercontent.com/u/1567423?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Koki Oyatsu</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/issues?q=author%3Akaishuu0123" title="Bug reports">🐛</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=kaishuu0123" title="Code">💻</a></td>
    <td align="center"><a href="http://www.jamesmonger.com"><img src="https://avatars2.githubusercontent.com/u/2037007?v=4?s=100" width="100px;" alt=""/><br /><sub><b>James Monger</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=Jameskmonger" title="Documentation">📖</a></td>
    <td align="center"><a href="http://wesssel.github.io/"><img src="https://avatars2.githubusercontent.com/u/7767299?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Wessel van der Pal</b></sub></a><br /><a href="#security-wesssel" title="Security">🛡️</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=wesssel" title="Code">💻</a></td>
    <td align="center"><a href="https://jung-kim.github.io"><img src="https://avatars2.githubusercontent.com/u/5281068?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jk-kim</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=jung-kim" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/sss0791"><img src="https://avatars1.githubusercontent.com/u/1446970?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sergey Semenov</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/issues?q=author%3Asss0791" title="Bug reports">🐛</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=sss0791" title="Code">💻</a></td>
    <td align="center"><a href="http://researcher.watson.ibm.com/researcher/view.php?person=us-nickm"><img src="https://avatars3.githubusercontent.com/u/4741620?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nick Mitchell</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/issues?q=author%3Astarpit" title="Bug reports">🐛</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=starpit" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/samiraguiar"><img src="https://avatars0.githubusercontent.com/u/13439135?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Samir Aguiar</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=samiraguiar" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://twitter.com/pubkeypubkey"><img src="https://avatars3.githubusercontent.com/u/8926560?v=4?s=100" width="100px;" alt=""/><br /><sub><b>pubkey</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=pubkey" title="Documentation">📖</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=pubkey" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/iliyaZelenko"><img src="https://avatars1.githubusercontent.com/u/13103045?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Илья</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=iliyaZelenko" title="Documentation">📖</a></td>
    <td align="center"><a href="https://akr.am"><img src="https://avatars0.githubusercontent.com/u/1823771?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mohamed Akram</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/issues?q=author%3Amohd-akram" title="Bug reports">🐛</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=mohd-akram" title="Documentation">📖</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=mohd-akram" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/emarcotte"><img src="https://avatars0.githubusercontent.com/u/249390?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eugene Marcotte</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=emarcotte" title="Code">💻</a></td>
    <td align="center"><a href="http://twitter.com/dimasabanin"><img src="https://avatars0.githubusercontent.com/u/8316?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dima Sabanin</b></sub></a><br /><a href="#maintenance-dsabanin" title="Maintenance">🚧</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=dsabanin" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/benabbottnz"><img src="https://avatars2.githubusercontent.com/u/2616473?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ben Abbott</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=benabbottnz" title="Documentation">📖</a></td>
    <td align="center"><a href="http://webminer.js.org"><img src="https://avatars1.githubusercontent.com/u/2196373?v=4?s=100" width="100px;" alt=""/><br /><sub><b>弘树@阿里</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/issues?q=author%3Adickeylth" title="Bug reports">🐛</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=dickeylth" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Rantanen"><img src="https://avatars0.githubusercontent.com/u/385385?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mikko Rantanen</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/issues?q=author%3ARantanen" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/extend1994"><img src="https://avatars2.githubusercontent.com/u/13430892?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ann</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=extend1994" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/escitalopram"><img src="https://avatars0.githubusercontent.com/u/1155220?v=4?s=100" width="100px;" alt=""/><br /><sub><b>escitalopram</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=escitalopram" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/apps/dependabot"><img src="https://avatars0.githubusercontent.com/in/29110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dependabot[bot]</b></sub></a><br /><a href="#security-dependabot[bot]" title="Security">🛡️</a> <a href="#maintenance-dependabot[bot]" title="Maintenance">🚧</a></td>
    <td align="center"><a href="http://www.joshuakgoldberg.com"><img src="https://avatars1.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Josh Goldberg</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=JoshuaKGoldberg" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/apeckham"><img src="https://avatars.githubusercontent.com/u/14110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aaron</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=apeckham" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/pgrimaud"><img src="https://avatars.githubusercontent.com/u/1866496?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pierre Grimaud</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=pgrimaud" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://domdomegg.github.io/"><img src="https://avatars.githubusercontent.com/u/4953590?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adam Jones</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=domdomegg" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/charguer"><img src="https://avatars.githubusercontent.com/u/1830652?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arthur Charguéraud</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=charguer" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/pierrci"><img src="https://avatars.githubusercontent.com/u/5020707?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pierric Cistac</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=Pierrci" title="Documentation">📖</a> <a href="https://github.com/rtfpessoa/diff2html/commits?author=Pierrci" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/xlith"><img src="https://avatars.githubusercontent.com/u/510560?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Civan Yavuzşen</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=xlith" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/timgates42"><img src="https://avatars.githubusercontent.com/u/47873678?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tim Gates</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=timgates42" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/campersau"><img src="https://avatars.githubusercontent.com/u/4009570?v=4?s=100" width="100px;" alt=""/><br /><sub><b>campersau</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=campersau" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/apps/dependabot-preview"><img src="https://avatars.githubusercontent.com/in/2141?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dependabot-preview[bot]</b></sub></a><br /><a href="https://github.com/rtfpessoa/diff2html/commits?author=dependabot-preview[bot]" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.
Contributions of any kind welcome!

## License

Copyright 2014-present Rodrigo Fernandes. Released under the terms of the MIT license.

## Thanks

This project is inspired in [pretty-diff](https://github.com/scottgonzalez/pretty-diff) by
[Scott González](https://github.com/scottgonzalez).

---
