# diff2html

[![Codacy Code Badge](https://api.codacy.com/project/badge/grade/06412dc3f5a14f568778d0db8a1f7dc8)](https://www.codacy.com/app/Codacy/diff2html)
[![Codacy Coverage Badge](https://api.codacy.com/project/badge/coverage/06412dc3f5a14f568778d0db8a1f7dc8)](https://www.codacy.com/app/Codacy/diff2html)
[![Circle CI](https://circleci.com/gh/rtfpessoa/diff2html.svg?style=svg)](https://circleci.com/gh/rtfpessoa/diff2html)
[![Dependency Status](https://dependencyci.com/github/rtfpessoa/diff2html/badge)](https://dependencyci.com/github/rtfpessoa/diff2html)

[![npm](https://img.shields.io/npm/v/diff2html.svg)](https://www.npmjs.com/package/diff2html)
[![Dependency Status](https://david-dm.org/rtfpessoa/diff2html.svg)](https://david-dm.org/rtfpessoa/diff2html)
[![devDependency Status](https://david-dm.org/rtfpessoa/diff2html/dev-status.svg)](https://david-dm.org/rtfpessoa/diff2html#info=devDependencies)

[![node](https://img.shields.io/node/v/diff2html.svg)]()
[![npm](https://img.shields.io/npm/l/diff2html.svg)]()
[![npm](https://img.shields.io/npm/dm/diff2html.svg)](https://www.npmjs.com/package/diff2html)
[![Gitter](https://badges.gitter.im/rtfpessoa/diff2html.svg)](https://gitter.im/rtfpessoa/diff2html?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

diff2html generates pretty HTML diffs from git or unified diff output.

[![NPM](https://nodei.co/npm/diff2html.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/diff2html/)

## Features

* Supports git and unified diffs

* Line by line and Side by side diff

* New and old line numbers

* Inserted and removed lines

* GitHub like style

* Code syntax highlight

* Line similarity matching

* Easy code selection

## Online Example

> Go to [diff2html](https://diff2html.xyz/)

## Distributions

* [WebJar](http://www.webjars.org/)

* [Node Module](https://www.npmjs.org/package/diff2html)

* [Bower Package](http://bower.io/search/?q=diff2html)

* [Node CLI](https://www.npmjs.org/package/diff2html-cli)

* Manually download and import `dist/diff2html.min.js` into your page

## How to use

### Browser Library

Import the stylesheet and the library code

```html
<!-- CSS -->
<link rel="stylesheet" type="text/css" href="dist/diff2html.css">

<!-- Javascripts -->
<script type="text/javascript" src="dist/diff2html.js"></script>
```

It will now be available as a global variable named `Diff2Html`.

### Node Module

```js
let dif2html = require("diff2html").Diff2Html
```

## API

> Pretty HTML diff

    getJsonFromDiff(input: string, configuration?: Options): Result

> Intermediate Json From Git Word Diff Output

    getPrettyHtml(input: any, configuration?: Options): string

> Check out the `docs/diff2html.d.ts` for a complete API definition in TypeScript.

> Check out the `docs/demo.html` for a demo example.

## Configuration
The HTML output accepts a Javascript object with configuration. Possible options:

  - `inputFormat`: the format of the input data: `'diff'` or `'json'`, default is `'diff'`
  - `outputFormat`: the format of the output data: `'line-by-line'` or `'side-by-side'`, default is `'line-by-line'`
  - `showFiles`: show a file list before the diff: `true` or `false`, default is `false`
  - `matching`: matching level: `'lines'` for matching lines, `'words'` for matching lines and words or `'none'`, default is `none`
  - `synchronisedScroll`: scroll both panes in side-by-side mode: `true` or `false`, default is `false`
  - `matchWordsThreshold`: similarity threshold for word matching, default is 0.25
  - `matchingMaxComparisons`: perform at most this much comparisons for line matching a block of changes, default is `2500`
  - `templates`: object with previously compiled templates to replace parts of the html
  - `rawTemplates`: object with raw not compiled templates to replace parts of the html
  > For more information regarding the possible templates look into [src/templates](https://github.com/rtfpessoa/diff2html/tree/master/src/templates)

## Diff2HtmlUI Helper

> Simple wrapper to ease simple tasks in the browser such as: code highlight and js effects

* Invoke Diff2html
* Inject output in DOM element
* Enable collapsible file summary list
* Enable syntax highlight of the code in the diffs

### How to use

#### Mandatory HTML resource imports

```html
<!-- CSS -->
<link rel="stylesheet" type="text/css" href="dist/diff2html.css">

<!-- Javascripts -->
<script type="text/javascript" src="dist/diff2html.js"></script>
<script type="text/javascript" src="dist/diff2html-ui.js"></script>
```

#### Init

```js
var diff2htmlUi = new Diff2HtmlUI({diff: diffString});
// or
var diff2htmlUi = new Diff2HtmlUI({json: diffJson});
```

#### Draw

```js
diff2htmlUi.draw('html-target-elem', {inputFormat: 'json', showFiles: true, matching: 'lines'});
```

#### Syntax Highlight

> Add the dependencies.
Choose one color scheme, and add the main highlight code. Note that the stylesheet for the color scheme must come **before** the main diff2html stylesheet.
If your favourite language is not included in the default package also add its javascript highlight file.

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.6.0/styles/github.min.css">
<link rel="stylesheet" type="text/css" href="dist/diff2html.css">

<!-- Javascripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.6.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.6.0/languages/scala.min.js"></script>
<script type="text/javascript" src="dist/diff2html-ui.js"></script>
```

> Invoke the Diff2HtmlUI helper

```js
$(document).ready(function() {
    var diff2htmlUi = new Diff2HtmlUI({diff: lineDiffExample});
    diff2htmlUi.draw('#line-by-line', {inputFormat: 'json', showFiles: true, matching: 'lines'});
    diff2htmlUi.highlightCode('#line-by-line');
});
```

#### Collapsable File Summary List

> Add the dependencies.

```html
<!-- Javascripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.js"></script>
<script type="text/javascript" src="dist/diff2html-ui.js"></script>
```

> Invoke the Diff2HtmlUI helper

```js
$(document).ready(function() {
    var diff2htmlUi = new Diff2HtmlUI({diff: lineDiffExample});
    diff2htmlUi.draw('#line-by-line', {inputFormat: 'json', showFiles: true, matching: 'lines'});
    diff2htmlUi.fileListCloseable('#line-by-line', false);
});
```

# Troubleshooting

### 1. Out of memory or Slow execution

#### Causes:
* Big files
* Big lines

#### Fix:
* Disable the line matching algorithm, by setting the option `{"matching": "none"}` when invoking diff2html

## Contributions

This is a developer friendly project, all the contributions are welcome.
To contribute just send a pull request with your changes following the guidelines described in `CONTRIBUTING.md`.
I will try to review them as soon as possible.

## License

Copyright 2014-2016 Rodrigo Fernandes. Released under the terms of the MIT license.

## Thanks

This project is inspired in [pretty-diff](https://github.com/scottgonzalez/pretty-diff) by [Scott González](https://github.com/scottgonzalez).

---
