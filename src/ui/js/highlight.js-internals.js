/*
 *
 * highlight.js
 * Author: isagalaev
 *
 */

(function() {
  function HighlightJS() {
  }

  /*
   * Copied from Highlight.js Private API
   * Will be removed when this part of the API is exposed
   */

  /* Utility vars */

  var ArrayProto = [];

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  /* Stream merging */

  HighlightJS.prototype.nodeStream = function(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === 3) {
          offset += child.nodeValue.length;
        } else if (child.nodeType === 1) {
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
  };

  HighlightJS.prototype.mergeStreams = function(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset !== highlighted[0].offset) {
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
      return highlighted[0].event === 'start' ? original : highlighted;
    }

    function open(node) {
      function attr_str(a) {
        return ' ' + a.nodeName + '="' + escape(a.value) + '"';
      }

      result += '<' + tag(node) + ArrayProto.map.call(node.attributes, attr_str).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event === 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substring(processed, stream[0].offset));
      processed = stream[0].offset;
      if (stream === original) {
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
        } while (stream === original && stream.length && stream[0].offset === processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event === 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  };

  /* **** Highlight.js Private API **** */

  module.exports.HighlightJS = new HighlightJS();
})();
