import { hljs } from './highlight.js-slim';

import { DiffFile } from '../../types';
import { Diff2HtmlUI as Diff2HtmlUIBase, Diff2HtmlUIConfig, defaultDiff2HtmlUIConfig } from './diff2html-ui-base';

export class Diff2HtmlUI extends Diff2HtmlUIBase {
  constructor(diffInput: string | DiffFile[], target: HTMLElement, config: Diff2HtmlUIConfig = {}) {
    super(diffInput, target, config, hljs);
  }
}

export { Diff2HtmlUIConfig, defaultDiff2HtmlUIConfig };
