/*
 *
 * Diff to HTML (diff2html-ui.js)
 * Author: rtfpessoa
 *
 * Depends on: [ jQuery ]
 * Optional dependencies on: [ highlight.js ]
 *
 */

/* global $, hljs, Diff2Html */

(function() {
  const highlightJS = require("./highlight.js-internals.js").HighlightJS;

  let diffJson = null;
  const defaultTarget = "body";
  let currentSelectionColumnId = -1;

  function Diff2HtmlUI(config) {
    const cfg = config || {};

    if (cfg.diff) {
      diffJson = Diff2Html.getJsonFromDiff(cfg.diff);
    } else if (cfg.json) {
      diffJson = cfg.json;
    }

    this._initSelection();
  }

  Diff2HtmlUI.prototype.draw = function(targetId, config) {
    const cfg = config || {};
    cfg.inputFormat = "json";
    const $target = this._getTarget(targetId);
    $target.html(Diff2Html.getPrettyHtml(diffJson, cfg));

    if (cfg.synchronisedScroll) {
      this.synchronisedScroll($target, cfg);
    }
  };

  Diff2HtmlUI.prototype.synchronisedScroll = function(targetId) {
    const $target = this._getTarget(targetId);
    $target.find(".d2h-file-side-diff").scroll(function() {
      const $this = $(this);
      $this
        .closest(".d2h-file-wrapper")
        .find(".d2h-file-side-diff")
        .scrollLeft($this.scrollLeft());
    });
  };

  Diff2HtmlUI.prototype.fileListCloseable = function(targetId, startVisible) {
    const $target = this._getTarget(targetId);

    const hashTag = this._getHashTag();

    const $showBtn = $target.find(".d2h-show");
    const $hideBtn = $target.find(".d2h-hide");
    const $fileList = $target.find(".d2h-file-list");

    if (hashTag === "files-summary-show") show();
    else if (hashTag === "files-summary-hide") hide();
    else if (startVisible) show();
    else hide();

    $showBtn.click(show);
    $hideBtn.click(hide);

    function show() {
      $showBtn.hide();
      $hideBtn.show();
      $fileList.show();
    }

    function hide() {
      $hideBtn.hide();
      $showBtn.show();
      $fileList.hide();
    }
  };

  Diff2HtmlUI.prototype.highlightCode = function(targetId) {
    const that = this;

    const $target = that._getTarget(targetId);

    // collect all the diff files and execute the highlight on their lines
    const $files = $target.find(".d2h-file-wrapper");
    $files.map(function(_i, file) {
      let oldLinesState;
      let newLinesState;
      const $file = $(file);
      const language = $file.data("lang");

      // collect all the code lines and execute the highlight on them
      const $codeLines = $file.find(".d2h-code-line-ctn");
      $codeLines.map(function(_j, line) {
        const $line = $(line);
        const text = line.textContent;
        const lineParent = line.parentNode;

        let lineState;
        if (lineParent.className.indexOf("d2h-del") !== -1) {
          lineState = oldLinesState;
        } else {
          lineState = newLinesState;
        }

        const result = hljs.getLanguage(language)
          ? hljs.highlight(language, text, true, lineState)
          : hljs.highlightAuto(text);

        if (lineParent.className.indexOf("d2h-del") !== -1) {
          oldLinesState = result.top;
        } else if (lineParent.className.indexOf("d2h-ins") !== -1) {
          newLinesState = result.top;
        } else {
          oldLinesState = result.top;
          newLinesState = result.top;
        }

        const originalStream = highlightJS.nodeStream(line);
        if (originalStream.length) {
          const resultNode = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
          resultNode.innerHTML = result.value;
          result.value = highlightJS.mergeStreams(originalStream, highlightJS.nodeStream(resultNode), text);
        }

        $line.addClass("hljs");
        $line.addClass(result.language);
        $line.html(result.value);
      });
    });
  };

  Diff2HtmlUI.prototype._getTarget = function(targetId) {
    let $target;

    if (typeof targetId === "object" && targetId instanceof jQuery) {
      $target = targetId;
    } else if (typeof targetId === "string") {
      $target = $(targetId);
    } else {
      console.error("Wrong target provided! Falling back to default value 'body'.");
      console.log("Please provide a jQuery object or a valid DOM query string.");
      $target = $(defaultTarget);
    }

    return $target;
  };

  Diff2HtmlUI.prototype._getHashTag = function() {
    const docUrl = document.URL;
    const hashTagIndex = docUrl.indexOf("#");

    let hashTag = null;
    if (hashTagIndex !== -1) {
      hashTag = docUrl.substr(hashTagIndex + 1);
    }

    return hashTag;
  };

  Diff2HtmlUI.prototype._distinct = function(collection) {
    return collection.filter(function(v, i) {
      return collection.indexOf(v) === i;
    });
  };

  Diff2HtmlUI.prototype._initSelection = function() {
    const body = $("body");
    const that = this;

    body.on("mousedown", ".d2h-diff-table", function(event) {
      const target = $(event.target);
      const table = target.closest(".d2h-diff-table");

      if (target.closest(".d2h-code-line,.d2h-code-side-line").length) {
        table.removeClass("selecting-left");
        table.addClass("selecting-right");
        currentSelectionColumnId = 1;
      } else if (target.closest(".d2h-code-linenumber,.d2h-code-side-linenumber").length) {
        table.removeClass("selecting-right");
        table.addClass("selecting-left");
        currentSelectionColumnId = 0;
      }
    });

    body.on("copy", ".d2h-diff-table", function(event) {
      const clipboardData = event.originalEvent.clipboardData;
      const text = that._getSelectedText();
      clipboardData.setData("text", text);
      event.preventDefault();
    });
  };

  Diff2HtmlUI.prototype._getSelectedText = function() {
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    const doc = range.cloneContents();
    const nodes = doc.querySelectorAll("tr");
    let text = "";
    const idx = currentSelectionColumnId;

    if (nodes.length === 0) {
      text = doc.textContent;
    } else {
      [].forEach.call(nodes, function(tr, i) {
        const td = tr.cells[tr.cells.length === 1 ? 0 : idx];
        text += (i ? "\n" : "") + td.textContent.replace(/(?:\r\n|\r|\n)/g, "");
      });
    }

    return text;
  };

  module.exports.Diff2HtmlUI = Diff2HtmlUI;

  // Expose diff2html in the browser
  global.Diff2HtmlUI = Diff2HtmlUI;
})();
