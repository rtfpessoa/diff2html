/*
 * Adapted Highlight.js Internal APIs
 * Used to highlight selected html elements using context
 */

import { HighlightResult } from 'highlight.js';

/* Utility functions */

function escapeHTML(value: string): string {
  return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
}

function tag(node: Node): string {
  return node.nodeName.toLowerCase();
}

/* Stream merging */

type NodeEvent = {
  event: 'start' | 'stop';
  offset: number;
  node: Node;
};

export function nodeStream(node: Node): NodeEvent[] {
  const result: NodeEvent[] = [];

  const nodeStream = (node: Node, offset: number): number => {
    for (let child = node.firstChild; child; child = child.nextSibling) {
      if (child.nodeType === 3 && child.nodeValue !== null) {
        offset += child.nodeValue.length;
      } else if (child.nodeType === 1) {
        result.push({
          event: 'start',
          offset: offset,
          node: child,
        });
        offset = nodeStream(child, offset);
        // Prevent void elements from having an end tag that would actually
        // double them in the output. There are more void elements in HTML
        // but we list only those realistically expected in code display.
        if (!tag(child).match(/br|hr|img|input/)) {
          result.push({
            event: 'stop',
            offset: offset,
            node: child,
          });
        }
      }
    }
    return offset;
  };

  nodeStream(node, 0);

  return result;
}

export function mergeStreams(original: NodeEvent[], highlighted: NodeEvent[], value: string): string {
  let processed = 0;
  let result = '';
  const nodeStack = [];

  function isElement(arg?: unknown): arg is Element {
    return arg !== null && (arg as Element)?.attributes !== undefined;
  }

  function selectStream(): NodeEvent[] {
    if (!original.length || !highlighted.length) {
      return original.length ? original : highlighted;
    }
    if (original[0].offset !== highlighted[0].offset) {
      return original[0].offset < highlighted[0].offset ? original : highlighted;
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

  function open(node: Node): void {
    if (!isElement(node)) {
      throw new Error('Node is not an Element');
    }

    result += `<${tag(node)} ${Array<Attr>()
      .map.call(node.attributes, attr => `${attr.nodeName}="${escapeHTML(attr.value).replace(/"/g, '&quot;')}"`)
      .join(' ')}>`;
  }

  function close(node: Node): void {
    result += '</' + tag(node) + '>';
  }

  function render(event: NodeEvent): void {
    (event.event === 'start' ? open : close)(event.node);
  }

  while (original.length || highlighted.length) {
    let stream = selectStream();
    result += escapeHTML(value.substring(processed, stream[0].offset));
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

  return result + escapeHTML(value.substr(processed));
}

// https://github.com/hexojs/hexo-util/blob/979873b63a725377c2bd6ad834d790023496130d/lib/highlight.js#L123
export function closeTags(res: HighlightResult): HighlightResult {
  const tokenStack = new Array<string>();

  res.value = res.value
    .split('\n')
    .map(line => {
      const prepend = tokenStack.map(token => `<span class="${token}">`).join('');
      const matches = line.matchAll(/(<span class="(.*?)">|<\/span>)/g);
      Array.from(matches).forEach(match => {
        if (match[0] === '</span>') tokenStack.shift();
        else tokenStack.unshift(match[2]);
      });
      const append = '</span>'.repeat(tokenStack.length);
      return prepend + line + append;
    })
    .join('\n');

  return res;
}
