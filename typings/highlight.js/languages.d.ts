declare module 'highlight.js/lib/languages/*' {
  import { HLJSStatic, IModeBase } from 'highlight.js';

  export default function(hljs?: HLJSStatic): IModeBase;
}
