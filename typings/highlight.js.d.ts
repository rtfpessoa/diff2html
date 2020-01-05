declare module 'highlight.js/lib/highlight.js' {
  import hljs from 'highlight.js';

  export type HighlightJS = typeof hljs;

  export default hljs;

  export const highlight: typeof hljs.highlight;
  export const highlightAuto: typeof hljs.highlightAuto;
  export const fixMarkup: typeof hljs.fixMarkup;
  export const highlightBlock: typeof hljs.highlightBlock;
  export const configure: typeof hljs.configure;
  export const initHighlighting: typeof hljs.initHighlighting;
  export const initHighlightingOnLoad: typeof hljs.initHighlightingOnLoad;
  export const registerLanguage: typeof hljs.registerLanguage;
  export const listLanguages: typeof hljs.listLanguages;
  export const getLanguage: typeof hljs.getLanguage;
  export const inherit: typeof hljs.inherit;
  export const COMMENT: typeof hljs.COMMENT;

  export const IDENT_RE: typeof hljs.IDENT_RE;
  export const UNDERSCORE_IDENT_RE: typeof hljs.UNDERSCORE_IDENT_RE;
  export const NUMBER_RE: typeof hljs.NUMBER_RE;
  export const C_NUMBER_RE: typeof hljs.C_NUMBER_RE;
  export const BINARY_NUMBER_RE: typeof hljs.BINARY_NUMBER_RE;
  export const RE_STARTERS_RE: typeof hljs.RE_STARTERS_RE;

  export const BACKSLASH_ESCAPE: typeof hljs.BACKSLASH_ESCAPE;
  export const APOS_STRING_MODE: typeof hljs.APOS_STRING_MODE;
  export const QUOTE_STRING_MODE: typeof hljs.QUOTE_STRING_MODE;
  export const PHRASAL_WORDS_MODE: typeof hljs.PHRASAL_WORDS_MODE;
  export const C_LINE_COMMENT_MODE: typeof hljs.C_LINE_COMMENT_MODE;
  export const C_BLOCK_COMMENT_MODE: typeof hljs.C_BLOCK_COMMENT_MODE;
  export const HASH_COMMENT_MODE: typeof hljs.HASH_COMMENT_MODE;
  export const NUMBER_MODE: typeof hljs.NUMBER_MODE;
  export const C_NUMBER_MODE: typeof hljs.C_NUMBER_MODE;
  export const BINARY_NUMBER_MODE: typeof hljs.BINARY_NUMBER_MODE;
  export const CSS_NUMBER_MODE: typeof hljs.CSS_NUMBER_MODE;
  export const REGEX_MODE: typeof hljs.REGEX_MODE;
  export const TITLE_MODE: typeof hljs.TITLE_MODE;
  export const UNDERSCORE_TITLE_MODE: typeof hljs.UNDERSCORE_TITLE_MODE;
}
