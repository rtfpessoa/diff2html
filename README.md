# diff2html

[![Circle CI](https://circleci.com/gh/rtfpessoa/diff2html.svg?style=svg)](https://circleci.com/gh/rtfpessoa/diff2html)
[![Codacy Code Badge](https://api.codacy.com/project/badge/grade/06412dc3f5a14f568778d0db8a1f7dc8)](https://www.codacy.com/app/Codacy/diff2html)
[![Codacy Coverage Badge](https://api.codacy.com/project/badge/coverage/06412dc3f5a14f568778d0db8a1f7dc8)](https://www.codacy.com/app/Codacy/diff2html)

[![npm](https://img.shields.io/npm/v/diff2html.svg)](https://www.npmjs.com/package/diff2html)
[![David](https://img.shields.io/david/rtfpessoa/diff2html.svg)](https://david-dm.org/rtfpessoa/diff2html)
[![David](https://img.shields.io/david/dev/rtfpessoa/diff2html.svg)](https://david-dm.org/rtfpessoa/diff2html)

[![node](https://img.shields.io/node/v/diff2html.svg)]()
[![npm](https://img.shields.io/npm/l/diff2html.svg)]()
[![npm](https://img.shields.io/npm/dm/diff2html.svg)](https://www.npmjs.com/package/diff2html)
[![Gitter](https://badges.gitter.im/rtfpessoa/diff2html.svg)](https://gitter.im/rtfpessoa/diff2html?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

diff2html generates pretty HTML diffs from git diff output.

[![NPM](https://nodei.co/npm/diff2html.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/diff2html/)

## Features

* `line-by-line` and `side-by-side` diff

* new and old line numbers

* inserted and removed lines

* GitHub like style

* Code syntax highlight

* Line similarity matching

## Online Example

> Go to [diff2html](http://rtfpessoa.github.io/diff2html/)

## Distributions

* [WebJar](http://www.webjars.org/)

* [Node Module](https://www.npmjs.org/package/diff2html)

* [Bower Package](http://bower.io/search/?q=diff2html)

* [Node CLI](https://www.npmjs.org/package/diff2html-cli)

* Manually download and import `dist/diff2html.min.js` into your page

## How to use

> Pretty HTML diff

    Diff2Html.getPrettyHtml(exInput, configuration)

> Intermediate Json From Git Word Diff Output

    Diff2Html.getJsonFromDiff(exInput)

> Check out the `index.html` for a complete example.

## Configuration
The HTML output accepts a Javascript object with configuration. Possible options:

  - `inputFormat`: the format of the input data: `'diff'` or `'json'`, default is `'diff'`
  - `outputFormat`: the format of the output data: `'line-by-line'` or `'side-by-side'`, default is `'line-by-line'`
  - `showFiles`: show a file list before the diff: `true` or `false`, default is `false`
  - `matching`: matching level: `'lines'` for matching lines, `'words'` for matching lines and words or `'none'`, default is `none`
  - `matchWordsThreshold`: similarity threshold for word matching, default is 0.25


## Syntax Highlight

> Add the dependencies.
Choose one color scheme, and add the main highlight code.
If your favourite language is not included in the default package also add its javascript highlight file.

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/styles/github.min.css">

<!-- Javascripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/languages/scala.min.js"></script>
```

> Invoke the highlightjs plugin

```js
document.addEventListener("DOMContentLoaded", function () {
    // parse the diff to json
    var diffJson = Diff2Html.getJsonFromDiff(lineDiffExample);

    // collect all the file extensions in the json
    var allFileLanguages = diffJson.map(function (line) {
        return line.language;
    });

    // remove duplicated languages
    var distinctLanguages = allFileLanguages.filter(function (v, i) {
        return allFileLanguages.indexOf(v) == i;
    });

    // pass the languages to the highlightjs plugin
    hljs.configure({languages: distinctLanguages});

    // generate and inject the diff HTML into the desired place
    document.getElementById("line-by-line").innerHTML = Diff2Html.getPrettyHtml(diffJson, { inputFormat: 'json' });
    document.getElementById("side-by-side").innerHTML = Diff2Html.getPrettyHtml(diffJson, { inputFormat: 'json', outputFormat: 'side-by-side' });

    // collect all the code lines and execute the highlight on them
    var codeLines = document.getElementsByClassName("d2h-code-line-ctn");
    [].forEach.call(codeLines, function (line) {
        hljs.highlightBlock(line);
    });
});
```

## Contributions

This is a developer friendly project, all the contributions are welcome.
To contribute just send a pull request with your changes following the guidelines described in `CONTRIBUTING.md`.
I will try to review them as soon as possible.

## License

Copyright 2014 Rodrigo Fernandes. Released under the terms of the MIT license.

## Thanks

This project is inspired in [pretty-diff](https://github.com/scottgonzalez/pretty-diff) by [Scott González](https://github.com/scottgonzalez).

---
