import HighlightJS from "highlight.js";
import * as HighlightJSInternals from "./highlight.js-internals";
import { html, Diff2HtmlConfig, defaultDiff2HtmlConfig } from "../../diff2html";
import { DiffFile } from "../../render-utils";

interface Diff2HtmlUIConfig extends Diff2HtmlConfig {
  synchronisedScroll?: boolean;
}

const defaultDiff2HtmlUIConfig = {
  ...defaultDiff2HtmlConfig,
  synchronisedScroll: true
};

export default class Diff2HtmlUI {
  readonly config: typeof defaultDiff2HtmlUIConfig;
  readonly diffHtml: string;
  targetElement: HTMLElement;
  currentSelectionColumnId = -1;

  constructor(diffInput: string | DiffFile[], target: HTMLElement, config: Diff2HtmlUIConfig = {}) {
    this.config = { ...defaultDiff2HtmlUIConfig, ...config };
    this.diffHtml = html(diffInput, this.config);
    this.targetElement = target;
  }

  draw(): void {
    this.targetElement.innerHTML = this.diffHtml;
    this.initSelection();
    if (this.config.synchronisedScroll) this.synchronisedScroll();
  }

  synchronisedScroll(): void {
    this.targetElement.querySelectorAll(".d2h-file-wrapper").forEach(wrapper => {
      const [left, right] = [].slice.call(wrapper.querySelectorAll(".d2h-file-side-diff")) as HTMLElement[];

      if (left === undefined || right === undefined) return;

      const onScroll = (event: Event): void => {
        if (event === null || event.target === null) return;

        if (event.target === left) {
          right.scrollTop = left.scrollTop;
        } else {
          left.scrollTop = right.scrollTop;
        }
      };

      left.addEventListener("scroll", onScroll);
      right.addEventListener("scroll", onScroll);
    });
  }

  fileListCloseable(startVisible: boolean): void {
    const hashTag = this.getHashTag();

    const showBtn = this.targetElement.querySelector(".d2h-show") as HTMLElement;
    const hideBtn = this.targetElement.querySelector(".d2h-hide") as HTMLElement;
    const fileList = this.targetElement.querySelector(".d2h-file-list") as HTMLElement;

    if (showBtn === null || hideBtn === null || fileList === null) return;

    function show(): void {
      showBtn.style.display = "";
      hideBtn.style.display = "";
      fileList.style.display = "";
    }

    function hide(): void {
      showBtn.style.display = "none";
      hideBtn.style.display = "none";
      fileList.style.display = "none";
    }

    showBtn.addEventListener("click", () => show());
    hideBtn.addEventListener("click", () => hide());

    if (hashTag === "files-summary-show") show();
    else if (hashTag === "files-summary-hide") hide();
    else if (startVisible) show();
    else hide();
  }

  highlightCode(): void {
    // Collect all the diff files and execute the highlight on their lines
    const files = this.targetElement.querySelectorAll(".d2h-file-wrapper");
    files.forEach(file => {
      let oldLinesState: HighlightJS.ICompiledMode;
      let newLinesState: HighlightJS.ICompiledMode;

      // Collect all the code lines and execute the highlight on them
      const codeLines = file.querySelectorAll(".d2h-code-line-ctn");
      codeLines.forEach(line => {
        const text = line.textContent;
        const lineParent = line.parentNode as HTMLElement;

        if (lineParent === null || text === null) return;

        const lineState = lineParent.className.indexOf("d2h-del") !== -1 ? oldLinesState : newLinesState;

        const language = file.getAttribute("data-lang");
        const result =
          language && HighlightJS.getLanguage(language)
            ? HighlightJS.highlight(language, text, true, lineState)
            : HighlightJS.highlightAuto(text);

        if (this.instanceOfIHighlightResult(result)) {
          if (lineParent.className.indexOf("d2h-del") !== -1) {
            oldLinesState = result.top;
          } else if (lineParent.className.indexOf("d2h-ins") !== -1) {
            newLinesState = result.top;
          } else {
            oldLinesState = result.top;
            newLinesState = result.top;
          }
        }

        const originalStream = HighlightJSInternals.nodeStream(line);
        if (originalStream.length) {
          const resultNode = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
          resultNode.innerHTML = result.value;
          result.value = HighlightJSInternals.mergeStreams(
            originalStream,
            HighlightJSInternals.nodeStream(resultNode),
            text
          );
        }

        line.classList.add("hljs");
        line.classList.add("result.language");
        line.innerHTML = result.value;
      });
    });
  }

  private instanceOfIHighlightResult(
    object: HighlightJS.IHighlightResult | HighlightJS.IAutoHighlightResult
  ): object is HighlightJS.IHighlightResult {
    return "top" in object;
  }

  private getHashTag(): string | null {
    const docUrl = document.URL;
    const hashTagIndex = docUrl.indexOf("#");

    let hashTag = null;
    if (hashTagIndex !== -1) {
      hashTag = docUrl.substr(hashTagIndex + 1);
    }

    return hashTag;
  }

  private initSelection(): void {
    const body = document.getElementsByTagName("body")[0];
    const diffTable = body.getElementsByClassName("d2h-diff-table")[0];

    diffTable.addEventListener("mousedown", event => {
      if (event === null || event.target === null) return;

      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      const table = target.closest(".d2h-diff-table");

      if (table !== null) {
        if (target.closest(".d2h-code-line,.d2h-code-side-line") !== null) {
          table.classList.remove("selecting-left");
          table.classList.add("selecting-right");
          this.currentSelectionColumnId = 1;
        } else if (target.closest(".d2h-code-linenumber,.d2h-code-side-linenumber") !== null) {
          table.classList.remove("selecting-right");
          table.classList.add("selecting-left");
          this.currentSelectionColumnId = 0;
        }
      }
    });

    diffTable.addEventListener("copy", event => {
      const clipboardEvent = event as ClipboardEvent;
      const clipboardData = clipboardEvent.clipboardData;
      const text = this.getSelectedText();

      if (clipboardData === null || text === undefined) return;

      clipboardData.setData("text", text);
      event.preventDefault();
    });
  }

  private getSelectedText(): string | undefined {
    const sel = window.getSelection();

    if (sel === null) return;

    const range = sel.getRangeAt(0);
    const doc = range.cloneContents();
    const nodes = doc.querySelectorAll("tr");
    const idx = this.currentSelectionColumnId;

    let text = "";
    if (nodes.length === 0) {
      text = doc.textContent || "";
    } else {
      nodes.forEach((tr, i) => {
        const td = tr.cells[tr.cells.length === 1 ? 0 : idx];

        if (td === null || td.textContent === null) return;

        text += (i ? "\n" : "") + td.textContent.replace(/(?:\r\n|\r|\n)/g, "");
      });
    }

    return text;
  }
}

// TODO: Avoid disabling types
// eslint-disable-next-line
// @ts-ignore
global.Diff2HtmlUI = Diff2HtmlUI;
