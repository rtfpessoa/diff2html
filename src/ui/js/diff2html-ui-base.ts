import { HighlightJS, ICompiledMode, IHighlightResult, IAutoHighlightResult } from './highlight.js-interface';
import { nodeStream, mergeStreams } from './highlight.js-helpers';

import { html, Diff2HtmlConfig, defaultDiff2HtmlConfig } from '../../diff2html';
import { DiffFile } from '../../types';

export interface Diff2HtmlUIConfig extends Diff2HtmlConfig {
  synchronisedScroll?: boolean;
  highlight?: boolean;
  fileListToggle?: boolean;
  fileListStartVisible?: boolean;
  smartSelection?: boolean;
}

export const defaultDiff2HtmlUIConfig = {
  ...defaultDiff2HtmlConfig,
  synchronisedScroll: true,
  highlight: true,
  fileListToggle: true,
  fileListStartVisible: false,
  smartSelection: true,
};

export class Diff2HtmlUI {
  readonly config: typeof defaultDiff2HtmlUIConfig;
  readonly diffHtml: string;
  readonly targetElement: HTMLElement;
  readonly hljs: HighlightJS | null = null;

  currentSelectionColumnId = -1;

  constructor(
    target: HTMLElement,
    diffInput?: string | DiffFile[],
    config: Diff2HtmlUIConfig = {},
    hljs?: HighlightJS,
  ) {
    this.config = { ...defaultDiff2HtmlUIConfig, ...config };
    this.diffHtml = diffInput !== undefined ? html(diffInput, this.config) : target.innerHTML;
    this.targetElement = target;
    if (hljs !== undefined) this.hljs = hljs;
  }

  draw(): void {
    this.targetElement.innerHTML = this.diffHtml;
    if (this.config.smartSelection) this.smartSelection();
    if (this.config.synchronisedScroll) this.synchronisedScroll();
    if (this.config.highlight) this.highlightCode();
    if (this.config.fileListToggle) this.fileListToggle(this.config.fileListStartVisible);
  }

  synchronisedScroll(): void {
    this.targetElement.querySelectorAll('.d2h-file-wrapper').forEach(wrapper => {
      const [left, right] = [].slice.call(wrapper.querySelectorAll('.d2h-file-side-diff')) as HTMLElement[];
      if (left === undefined || right === undefined) return;
      const onScroll = (event: Event): void => {
        if (event === null || event.target === null) return;
        if (event.target === left) {
          right.scrollTop = left.scrollTop;
          right.scrollLeft = left.scrollLeft;
        } else {
          left.scrollTop = right.scrollTop;
          left.scrollLeft = right.scrollLeft;
        }
      };
      left.addEventListener('scroll', onScroll);
      right.addEventListener('scroll', onScroll);
    });
  }

  fileListToggle(startVisible: boolean): void {
    const hashTag = this.getHashTag();

    const showBtn = this.targetElement.querySelector('.d2h-show') as HTMLElement;
    const hideBtn = this.targetElement.querySelector('.d2h-hide') as HTMLElement;
    const fileList = this.targetElement.querySelector('.d2h-file-list') as HTMLElement;

    if (showBtn === null || hideBtn === null || fileList === null) return;

    function show(): void {
      showBtn.style.display = 'none';
      hideBtn.style.display = 'inline';
      fileList.style.display = 'block';
    }

    function hide(): void {
      showBtn.style.display = 'inline';
      hideBtn.style.display = 'none';
      fileList.style.display = 'none';
    }

    showBtn.addEventListener('click', () => show());
    hideBtn.addEventListener('click', () => hide());

    if (hashTag === 'files-summary-show') show();
    else if (hashTag === 'files-summary-hide') hide();
    else if (startVisible) show();
    else hide();
  }

  highlightCode(): void {
    if (this.hljs === null) {
      throw new Error('Missing a `highlight.js` implementation. Please provide one when instantiating Diff2HtmlUI.');
    }

    // Collect all the diff files and execute the highlight on their lines
    const files = this.targetElement.querySelectorAll('.d2h-file-wrapper');
    files.forEach(file => {
      let oldLinesState: ICompiledMode;
      let newLinesState: ICompiledMode;

      // Collect all the code lines and execute the highlight on them
      const codeLines = file.querySelectorAll('.d2h-code-line-ctn');
      codeLines.forEach(line => {
        // HACK: help Typescript know that `this.hljs` is defined since we already checked it
        if (this.hljs === null) return;

        const text = line.textContent;
        const lineParent = line.parentNode as HTMLElement;

        if (lineParent === null || text === null) return;

        const lineState = lineParent.className.indexOf('d2h-del') !== -1 ? oldLinesState : newLinesState;

        const language = file.getAttribute('data-lang');
        const result =
          language && this.hljs.getLanguage(language)
            ? this.hljs.highlight(language, text, true, lineState)
            : this.hljs.highlightAuto(text);

        if (this.instanceOfIHighlightResult(result)) {
          if (lineParent.className.indexOf('d2h-del') !== -1) {
            oldLinesState = result.top;
          } else if (lineParent.className.indexOf('d2h-ins') !== -1) {
            newLinesState = result.top;
          } else {
            oldLinesState = result.top;
            newLinesState = result.top;
          }
        }

        const originalStream = nodeStream(line);
        if (originalStream.length) {
          const resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
          resultNode.innerHTML = result.value;
          result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
        }

        line.classList.add('hljs');
        line.classList.add(result.language);
        line.innerHTML = result.value;
      });
    });
  }

  smartSelection(): void {
    const body = document.getElementsByTagName('body')[0];
    const diffTable = body.getElementsByClassName('d2h-diff-table')[0];

    diffTable.addEventListener('mousedown', event => {
      if (event === null || event.target === null) return;

      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      const table = target.closest('.d2h-diff-table');

      if (table !== null) {
        if (target.closest('.d2h-code-line,.d2h-code-side-line') !== null) {
          table.classList.remove('selecting-left');
          table.classList.add('selecting-right');
          this.currentSelectionColumnId = 1;
        } else if (target.closest('.d2h-code-linenumber,.d2h-code-side-linenumber') !== null) {
          table.classList.remove('selecting-right');
          table.classList.add('selecting-left');
          this.currentSelectionColumnId = 0;
        }
      }
    });

    diffTable.addEventListener('copy', event => {
      const clipboardEvent = event as ClipboardEvent;
      const clipboardData = clipboardEvent.clipboardData;
      const text = this.getSelectedText();

      if (clipboardData === null || text === undefined) return;

      clipboardData.setData('text', text);
      event.preventDefault();
    });
  }

  private instanceOfIHighlightResult(object: IHighlightResult | IAutoHighlightResult): object is IHighlightResult {
    return 'top' in object;
  }

  private getHashTag(): string | null {
    const docUrl = document.URL;
    const hashTagIndex = docUrl.indexOf('#');

    let hashTag = null;
    if (hashTagIndex !== -1) {
      hashTag = docUrl.substr(hashTagIndex + 1);
    }

    return hashTag;
  }

  private getSelectedText(): string | undefined {
    const sel = window.getSelection();

    if (sel === null) return;

    const range = sel.getRangeAt(0);
    const doc = range.cloneContents();
    const nodes = doc.querySelectorAll('tr');
    const idx = this.currentSelectionColumnId;

    let text = '';
    if (nodes.length === 0) {
      text = doc.textContent || '';
    } else {
      nodes.forEach((tr, i) => {
        const td = tr.cells[tr.cells.length === 1 ? 0 : idx];

        if (td === undefined || td.textContent === null) return;

        text += (i ? '\n' : '') + td.textContent.replace(/\r\n|\r|\n/g, '');
      });
    }

    return text;
  }
}
