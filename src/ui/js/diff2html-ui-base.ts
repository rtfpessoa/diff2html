import * as HighlightJS from 'highlight.js/lib/core';
// import { CompiledMode, HighlightResult, AutoHighlightResult } from 'highlight.js/lib/core.js';
import { nodeStream, mergeStreams } from './highlight.js-helpers';

import { html, Diff2HtmlConfig, defaultDiff2HtmlConfig } from '../../diff2html';
import { DiffFile } from '../../types';

export interface Diff2HtmlUIConfig extends Diff2HtmlConfig {
  synchronisedScroll?: boolean;
  highlight?: boolean;
  fileListToggle?: boolean;
  fileListStartVisible?: boolean;
  /**
   * @deprecated since version 3.1.0
   * Smart selection is now enabled by default with vanilla CSS
   */
  smartSelection?: boolean;
  fileContentToggle?: boolean;
}

export const defaultDiff2HtmlUIConfig = {
  ...defaultDiff2HtmlConfig,
  synchronisedScroll: true,
  highlight: true,
  fileListToggle: true,
  fileListStartVisible: false,
  /**
   * @deprecated since version 3.1.0
   * Smart selection is now enabled by default with vanilla CSS
   */
  smartSelection: true,
  fileContentToggle: true,
};

export class Diff2HtmlUI {
  readonly config: typeof defaultDiff2HtmlUIConfig;
  readonly diffHtml: string;
  readonly targetElement: HTMLElement;
  readonly hljs: typeof HighlightJS | null = null;

  currentSelectionColumnId = -1;

  constructor(
    target: HTMLElement,
    diffInput?: string | DiffFile[],
    config: Diff2HtmlUIConfig = {},
    hljs?: typeof HighlightJS,
  ) {
    this.config = { ...defaultDiff2HtmlUIConfig, ...config };
    this.diffHtml = diffInput !== undefined ? html(diffInput, this.config) : target.innerHTML;
    this.targetElement = target;
    if (hljs !== undefined) this.hljs = hljs;
  }

  draw(): void {
    this.targetElement.innerHTML = this.diffHtml;
    if (this.config.synchronisedScroll) this.synchronisedScroll();
    if (this.config.highlight) this.highlightCode();
    if (this.config.fileListToggle) this.fileListToggle(this.config.fileListStartVisible);
    if (this.config.fileContentToggle) this.fileContentToggle();
  }

  synchronisedScroll(): void {
    this.targetElement.querySelectorAll('.d2h-file-wrapper').forEach(wrapper => {
      const [left, right] = Array<Element>().slice.call(wrapper.querySelectorAll('.d2h-file-side-diff'));

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
    const showBtn: HTMLElement | null = this.targetElement.querySelector('.d2h-show');
    const hideBtn: HTMLElement | null = this.targetElement.querySelector('.d2h-hide');
    const fileList: HTMLElement | null = this.targetElement.querySelector('.d2h-file-list');

    if (showBtn === null || hideBtn === null || fileList === null) return;

    const show: () => void = () => {
      showBtn.style.display = 'none';
      hideBtn.style.display = 'inline';
      fileList.style.display = 'block';
    };

    const hide: () => void = () => {
      showBtn.style.display = 'inline';
      hideBtn.style.display = 'none';
      fileList.style.display = 'none';
    };

    showBtn.addEventListener('click', () => show());
    hideBtn.addEventListener('click', () => hide());

    const hashTag = this.getHashTag();
    if (hashTag === 'files-summary-show') show();
    else if (hashTag === 'files-summary-hide') hide();
    else if (startVisible) show();
    else hide();
  }

  fileContentToggle(): void {
    this.targetElement.querySelectorAll('.d2h-file-collapse').forEach(fileContentToggleBtn => {
      const toggle: (e: Event) => void = e => {
        if (fileContentToggleBtn === e.target) return;

        const fileContentLineByLine: HTMLElement | null | undefined = fileContentToggleBtn
          .closest('.d2h-file-wrapper')
          ?.querySelector('.d2h-file-diff');
        const fileContentSideBySide: HTMLElement | null | undefined = fileContentToggleBtn
          .closest('.d2h-file-wrapper')
          ?.querySelector('.d2h-files-diff');

        if (fileContentLineByLine !== null && fileContentLineByLine !== undefined)
          fileContentLineByLine.style.display = fileContentLineByLine.style.display === 'none' ? '' : 'none';

        if (fileContentSideBySide !== null && fileContentSideBySide !== undefined)
          fileContentSideBySide.style.display = fileContentSideBySide.style.display === 'none' ? '' : 'none';
      };

      fileContentToggleBtn.addEventListener('click', e => toggle(e));
    });
  }

  highlightCode(): void {
    if (this.hljs === null) {
      throw new Error('Missing a `highlight.js` implementation. Please provide one when instantiating Diff2HtmlUI.');
    }

    // Collect all the diff files and execute the highlight on their lines
    const files = this.targetElement.querySelectorAll('.d2h-file-wrapper');
    files.forEach(file => {
      let oldLinesState: CompiledMode | Language | undefined;
      let newLinesState: CompiledMode | Language | undefined;

      // Collect all the code lines and execute the highlight on them
      const codeLines = file.querySelectorAll('.d2h-code-line-ctn');
      codeLines.forEach(line => {
        // HACK: help Typescript know that `this.hljs` is defined since we already checked it
        if (this.hljs === null) return;

        const text = line.textContent;
        const lineParent = line.parentNode;

        if (text === null || lineParent === null || !this.isElement(lineParent)) return;

        const lineState = lineParent.classList.contains('d2h-del') ? oldLinesState : newLinesState;

        const language = file.getAttribute('data-lang');
        const result: HighlightResult =
          language && this.hljs.getLanguage(language)
            ? this.hljs.highlight(language, text, true, lineState)
            : this.hljs.highlightAuto(text);

        if (this.instanceOfHighlightResult(result)) {
          if (lineParent.classList.contains('d2h-del')) {
            oldLinesState = result.top;
          } else if (lineParent.classList.contains('d2h-ins')) {
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
        if (result.language) {
          line.classList.add(result.language);
        }
        line.innerHTML = result.value;
      });
    });
  }

  /**
   * @deprecated since version 3.1.0
   */
  smartSelection(): void {
    console.warn('Smart selection is now enabled by default with CSS. No need to call this method anymore.');
  }

  private instanceOfHighlightResult(object: HighlightResult | AutoHighlightResult): object is HighlightResult {
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

  private isElement(arg?: unknown): arg is Element {
    return arg !== null && (arg as Element)?.classList !== undefined;
  }
}
