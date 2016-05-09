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

  var diffJson = null;
  var defaultTarget = "body";
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
    var $target = this._getTarget(targetId);
    $target.html(Diff2Html.getPrettyHtml(diffJson, cfg));
  };

  Diff2HtmlUI.prototype.fileListCloseable = function(targetId, startVisible) {
    var $target = this._getTarget(targetId);

    var hashTag = this._getHashTag();

    var $showBtn = $target.find(".d2h-show");
    var $hideBtn = $target.find(".d2h-hide");
    var $fileList = $target.find(".d2h-file-list");

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
    var $files = $target.find(".d2h-file-wrapper");
    $files.map(function(i, file) {
      var state;
      var $file = $(file);
      var language = $file.data("lang");

      // collect all the code lines and execute the highlight on them
      var $codeLines = $file.find(".d2h-code-line-ctn");
      $codeLines.map(function(i, line) {
        var text = line.textContent;
        var result = hljs.getLanguage(language) ? hljs.highlight(language, text, true, state) : hljs.highlightAuto(text);
        state = result.top;

        var originalStream = nodeStream(line);
        if (originalStream.length) {
          var resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
          resultNode.innerHTML = result.value;
          result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
        }

        var $line = $(line);
        buildClassName(line.className, result.language)
          .split(" ")
          .map(function(className) {
            $line.addClass(className);
          });
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
      console.log("Please provide a jQuery object or a valid DOM query string.");
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

  /*
   * Copied from Highlight.js Private API
   * Will be removed when this part of the API is exposed
   */

  function buildClassName(prevClassName, language) {
    var result = [prevClassName.trim()];

    if (!prevClassName.match(/\bhljs\b/)) {
      result.push('hljs');
    }

    if (prevClassName.indexOf(language) === -1) {
      result.push(language);
    }

    return result.join(' ').trim();
  }

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          // Prevent void elements from having an end tag that would actually
          // double them in the output. There are more void elements in HTML
          // but we list only those realistically expected in code display.
          if (!tag(child).match(/br|hr|img|input/)) {
            result.push({
              event: 'stop',
              offset: offset,
              node: child
            });
          }
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset != highlighted[0].offset) {
        return (original[0].offset < highlighted[0].offset) ? original : highlighted;
      }

      /*
       To avoid starting the stream just before it should stop the order is
       ensured that original always starts first and closes last:
       if (event1 == 'start' && event2 == 'start')
       return original;
       if (event1 == 'start' && event2 == 'stop')
       return highlighted;
       if (event1 == 'stop' && event2 == 'start')
       return original;
       if (event1 == 'stop' && event2 == 'stop')
       return highlighted;
       ... which is collapsed to:
       */
      return highlighted[0].event == 'start' ? original : highlighted;
    }

    function open(node) {
      function attrStr(a) {
        return ' ' + a.nodeName + '="' + escape(a.value) + '"';
      }

      result += '<' + tag(node) + Array.prototype.map.call(node.attributes, attrStr).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event == 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substr(processed, stream[0].offset - processed));
      processed = stream[0].offset;
      if (stream == original) {
        /*
         On any opening or closing tag of the original markup we first close
         the entire highlighted node stack, then render the original tag along
         with all the following original tags at the same offset and then
         reopen all the tags on the highlighted stack.
         */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (stream == original && stream.length && stream[0].offset == processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event == 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  }

  /* **** Highlight.js Private API **** */

  module.exports.Diff2HtmlUI = Diff2HtmlUI;

  // Expose diff2html in the browser
  global.Diff2HtmlUI = Diff2HtmlUI;

})();
