# Diff to Html by [rtfpessoa](https://github.com/rtfpessoa)

Diff to Html generates pretty HTML diffs from git diff output.

## Features

* `line-by-line` and `side-by-side` diff

* new and old line numbers

* inserted and removed lines

* GitHub like style

* Code syntax highlight

## Online Example

> Go to [Diff2HTML](http://rtfpessoa.github.io/diff2html/)

## Distributions

* [WebJar](http://www.webjars.org/)

* [Node Module](https://www.npmjs.org/package/diff2html)

* [Bower Package](http://bower.io/search/?q=diff2html)

* [Node CLI](https://www.npmjs.org/package/diff2html-cli)

* Manually download and import `dist/diff2html.min.js` into your page

## How to use

> Pretty Line-by-Line Html From Git Word Diff Output

    Diff2Html.getPrettyHtmlFromDiff(exInput)

> Pretty Side-by-Side Html From Git Word Diff Output

    Diff2Html.getPrettySideBySideHtmlFromDiff(exInput)

> Intermediate Json From Git Word Diff Output

    Diff2Html.getJsonFromDiff(exInput)

> Pretty Line-by-Line Html From Json

    Diff2Html.getPrettyHtmlFromJson(exInput)

> Pretty Side-by-Side Html From Json

    Diff2Html.getPrettySideBySideHtmlFromJson(exInput)

> Check out the `index.html` for a complete example.

## Sintax Hightlight

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
    document.getElementById("line-by-line").innerHTML = Diff2Html.getPrettyHtmlFromJson(diffJson);
    document.getElementById("side-by-side").innerHTML = Diff2Html.getPrettySideBySideHtmlFromJson(diffJson);

    // collect all the code lines and execute the highlight on them
    var codeLines = document.getElementsByClassName("d2h-code-line-ctn");
    [].forEach.call(codeLines, function (line) {
        hljs.highlightBlock(line);
    });
});
```

## Contributions

All the contributions are welcome.

To contribute just send a pull request with your changes and I will review it asap.

## License

Copyright 2014 Rodrigo Fernandes. Released under the terms of the MIT license.

## Thanks

This project is inspired in [pretty-diff](https://github.com/scottgonzalez/pretty-diff) by [Scott González](https://github.com/scottgonzalez).

---
