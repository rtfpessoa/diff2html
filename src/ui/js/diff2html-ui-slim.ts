import { hljs } from './highlight.js-slim';

import { DiffFile } from '../../types';
import { Diff2HtmlUI as Diff2HtmlUIBase, Diff2HtmlUIConfig, defaultDiff2HtmlUIConfig } from './diff2html-ui-base';

export class Diff2HtmlUI extends Diff2HtmlUIBase {
  constructor(target: HTMLElement, diffInput?: string | DiffFile[], config: Diff2HtmlUIConfig = {}) {
    super(target, diffInput, config, hljs);
  }
}

export { defaultDiff2HtmlUIConfig };
export type { Diff2HtmlUIConfig };
