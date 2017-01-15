/*
 *
 * Diff to HTML (diff2html-ui.js)
 * Author: rtfpessoa
 *
 * Depends on: [ jQuery ]
 * Optional dependencies on: [ highlight.js ]
 *
 */

/*global $, hljs, Diff2Html*/

(function() {
  var highlightJS = require('./highlight.js-internals.js').HighlightJS;

  var diffJson = null;
  var defaultTarget = 'body';
  var currentSelectionColumnId = -1;

  function Diff2HtmlUI(config) {
    var cfg = config || {};

    if (cfg.diff) {
      diffJson = Diff2Html.getJsonFromDiff(cfg.diff);
    } else if (cfg.json) {
      diffJson = cfg.json;
    }

    this._initSelection();
  }

  Diff2HtmlUI.prototype.draw = function(targetId, config) {
    var cfg = config || {};
    cfg.inputFormat = 'json';
    var $target = this._getTarget(targetId);
    $target.html(Diff2Html.getPrettyHtml(diffJson, cfg));

    if (cfg.synchronisedScroll) {
      this.synchronisedScroll($target, cfg);
    }
  };

  Diff2HtmlUI.prototype.synchronisedScroll = function(targetId) {
    var $target = this._getTarget(targetId);
    $target.find('.d2h-file-side-diff').scroll(function() {
      var $this = $(this);
      $this.closest('.d2h-file-wrapper').find('.d2h-file-side-diff')
        .scrollLeft($this.scrollLeft());
    });
  };

  Diff2HtmlUI.prototype.fileListCloseable = function(targetId, startVisible) {
    var $target = this._getTarget(targetId);

    var hashTag = this._getHashTag();

    var $showBtn = $target.find('.d2h-show');
    var $hideBtn = $target.find('.d2h-hide');
    var $fileList = $target.find('.d2h-file-list');

    if (hashTag === 'files-summary-show') show();
    else if (hashTag === 'files-summary-hide') hide();
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
    var that = this;

    var $target = that._getTarget(targetId);

    // collect all the diff files and execute the highlight on their lines
    var $files = $target.find('.d2h-file-wrapper');
    $files.map(function(_i, file) {
      var oldLinesState;
      var newLinesState;
      var $file = $(file);
      var language = $file.data('lang');

      // collect all the code lines and execute the highlight on them
      var $codeLines = $file.find('.d2h-code-line-ctn');
      $codeLines.map(function(_j, line) {
        var $line = $(line);
        var text = line.textContent;
        var lineParent = line.parentNode;

        var lineState;
        if (lineParent.className.indexOf('d2h-del') !== -1) {
          lineState = oldLinesState;
        } else {
          lineState = newLinesState;
        }

        var result = hljs.getLanguage(language) ? hljs.highlight(language, text, true, lineState) : hljs.highlightAuto(text);

        if (lineParent.className.indexOf('d2h-del') !== -1) {
          oldLinesState = result.top;
        } else if (lineParent.className.indexOf('d2h-ins') !== -1) {
          newLinesState = result.top;
        } else {
          oldLinesState = result.top;
          newLinesState = result.top;
        }

        var originalStream = highlightJS.nodeStream(line);
        if (originalStream.length) {
          var resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
          resultNode.innerHTML = result.value;
          result.value = highlightJS.mergeStreams(originalStream, highlightJS.nodeStream(resultNode), text);
        }

        $line.addClass('hljs');
        $line.addClass(result.language);
        $line.html(result.value);
      });
    });
  };

  Diff2HtmlUI.prototype._getTarget = function(targetId) {
    var $target;

    if (typeof targetId === 'object' && targetId instanceof jQuery) {
      $target = targetId;
    } else if (typeof targetId === 'string') {
      $target = $(targetId);
    } else {
      console.error("Wrong target provided! Falling back to default value 'body'.");
      console.log('Please provide a jQuery object or a valid DOM query string.');
      $target = $(defaultTarget);
    }

    return $target;
  };

  Diff2HtmlUI.prototype._getHashTag = function() {
    var docUrl = document.URL;
    var hashTagIndex = docUrl.indexOf('#');

    var hashTag = null;
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
    var body = $('body');
    var that = this;

    body.on('mousedown', '.d2h-diff-table', function(event) {
      var target = $(event.target);
      var table = target.closest('.d2h-diff-table');

      if (target.closest('.d2h-code-line,.d2h-code-side-line').length) {
        table.removeClass('selecting-left');
        table.addClass('selecting-right');
        currentSelectionColumnId = 1;
      } else if (target.closest('.d2h-code-linenumber,.d2h-code-side-linenumber').length) {
        table.removeClass('selecting-right');
        table.addClass('selecting-left');
        currentSelectionColumnId = 0;
      }
    });

    body.on('copy', '.d2h-diff-table', function(event) {
      var clipboardData = event.originalEvent.clipboardData;
      var text = that._getSelectedText();
      clipboardData.setData('text', text);
      event.preventDefault();
    });
  };

  Diff2HtmlUI.prototype._getSelectedText = function() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var doc = range.cloneContents();
    var nodes = doc.querySelectorAll('tr');
    var text = '';
    var idx = currentSelectionColumnId;

    if (nodes.length === 0) {
      text = doc.textContent;
    } else {
      [].forEach.call(nodes, function(tr, i) {
        var td = tr.cells[tr.cells.length === 1 ? 0 : idx];
        text += (i ? '\n' : '') + td.textContent.replace(/(?:\r\n|\r|\n)/g, '');
      });
    }

    return text;
  };

  module.exports.Diff2HtmlUI = Diff2HtmlUI;

  // Expose diff2html in the browser
  global.Diff2HtmlUI = Diff2HtmlUI;
})();
