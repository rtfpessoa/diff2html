import HoganJsUtils from "./hoganjs-utils";
import * as Rematch from "./rematch";
import * as renderUtils from "./render-utils";
import { DiffFile, DiffLine, LineType } from "./types";

export interface LineByLineRendererConfig extends renderUtils.RenderConfig {
  renderNothingWhenEmpty?: boolean;
  matchingMaxComparisons?: number;
  maxLineSizeInBlockForComparison?: number;
}

export const defaultLineByLineRendererConfig = {
  ...renderUtils.defaultRenderConfig,
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200
};

const genericTemplatesPath = "generic";
const baseTemplatesPath = "line-by-line";
const iconsBaseTemplatesPath = "icon";
const tagsBaseTemplatesPath = "tag";

export default class LineByLineRenderer {
  private readonly hoganUtils: HoganJsUtils;
  private readonly config: typeof defaultLineByLineRendererConfig;

  constructor(hoganUtils: HoganJsUtils, config: LineByLineRendererConfig = {}) {
    this.hoganUtils = hoganUtils;
    this.config = { ...defaultLineByLineRendererConfig, ...config };
  }

  render(diffFiles: DiffFile[]): string | undefined {
    const diffsHtml = diffFiles
      .map(file => {
        let diffs;
        if (file.blocks.length) {
          diffs = this.generateFileHtml(file);
        } else {
          diffs = this.generateEmptyDiff();
        }
        return this.makeFileDiffHtml(file, diffs);
      })
      .join("\n");

    return this.hoganUtils.render(genericTemplatesPath, "wrapper", { content: diffsHtml });
  }

  // TODO: Make this private after improving tests
  makeFileDiffHtml(file: DiffFile, diffs: string): string {
    if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0) return "";

    const fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, "file-diff");
    const filePathTemplate = this.hoganUtils.template(genericTemplatesPath, "file-path");
    const fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, "file");
    const fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));

    return fileDiffTemplate.render({
      file: file,
      fileHtmlId: renderUtils.getHtmlId(file),
      diffs: diffs,
      filePath: filePathTemplate.render(
        {
          fileDiffName: renderUtils.filenameDiff(file)
        },
        {
          fileIcon: fileIconTemplate,
          fileTag: fileTagTemplate
        }
      )
    });
  }

  // TODO: Make this private after improving tests
  generateEmptyDiff(): string {
    return this.hoganUtils.render(genericTemplatesPath, "empty-diff", {
      contentClass: "d2h-code-line",
      CSSLineClass: renderUtils.CSSLineClass
    });
  }

  // TODO: Make this private after improving tests
  generateFileHtml(file: DiffFile): string {
    const matcher = Rematch.newMatcherFn(
      Rematch.newDistanceFn((e: DiffLine) => renderUtils.deconstructLine(e.content, file.isCombined).content)
    );

    return file.blocks
      .map(block => {
        let lines = this.hoganUtils.render(genericTemplatesPath, "block-header", {
          CSSLineClass: renderUtils.CSSLineClass,
          blockHeader: block.header,
          lineClass: "d2h-code-linenumber",
          contentClass: "d2h-code-line"
        });
        let oldLines: DiffLine[] = [];
        let newLines: DiffLine[] = [];

        for (let i = 0; i < block.lines.length; i++) {
          const diffLine = block.lines[i];
          const { prefix, content } = renderUtils.deconstructLine(diffLine.content, file.isCombined);

          if (
            diffLine.type !== LineType.INSERT &&
            (newLines.length > 0 || (diffLine.type !== LineType.DELETE && oldLines.length > 0))
          ) {
            lines += this.processChangeBlock(file, oldLines, newLines, matcher);
            oldLines = [];
            newLines = [];
          }

          if (diffLine.type === LineType.CONTEXT || (diffLine.type === LineType.INSERT && !oldLines.length)) {
            lines += this.makeLineHtml(
              file.isCombined,
              renderUtils.toCSSClass(diffLine.type),
              content,
              diffLine.oldNumber,
              diffLine.newNumber,
              prefix
            );
          } else if (diffLine.type === LineType.DELETE) {
            oldLines.push(diffLine);
          } else if (diffLine.type === LineType.INSERT && Boolean(oldLines.length)) {
            newLines.push(diffLine);
          } else {
            console.error("Unknown state in html line-by-line generator");
            lines += this.processChangeBlock(file, oldLines, newLines, matcher);
            oldLines = [];
            newLines = [];
          }
        }

        lines += this.processChangeBlock(file, oldLines, newLines, matcher);
        oldLines = [];
        newLines = [];

        return lines;
      })
      .join("\n");
  }

  processChangeBlock(
    file: DiffFile,
    oldLines: DiffLine[],
    newLines: DiffLine[],
    matcher: Rematch.MatcherFn<DiffLine>
  ): string {
    const comparisons = oldLines.length * newLines.length;
    const maxLineSizeInBlock = Math.max.apply(
      null,
      [0].concat(oldLines.concat(newLines).map(elem => elem.content.length))
    );
    const doMatching =
      comparisons < this.config.matchingMaxComparisons &&
      maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison &&
      (this.config.matching === "lines" || this.config.matching === "words");

    const [matches, insertType, deleteType] = doMatching
      ? [matcher(oldLines, newLines), renderUtils.CSSLineClass.INSERT_CHANGES, renderUtils.CSSLineClass.DELETE_CHANGES]
      : [[[oldLines, newLines]], renderUtils.CSSLineClass.INSERTS, renderUtils.CSSLineClass.DELETES];

    let lines = "";
    matches.forEach(match => {
      oldLines = match[0];
      newLines = match[1];

      let processedOldLines = "";
      let processedNewLines = "";

      const common = Math.min(oldLines.length, newLines.length);

      let oldLine, newLine;
      for (let j = 0; j < common; j++) {
        oldLine = oldLines[j];
        newLine = newLines[j];

        const diff = renderUtils.diffHighlight(oldLine.content, newLine.content, file.isCombined, this.config);

        processedOldLines += this.makeLineHtml(
          file.isCombined,
          deleteType,
          diff.oldLine.content,
          oldLine.oldNumber,
          oldLine.newNumber,
          diff.oldLine.prefix
        );
        processedNewLines += this.makeLineHtml(
          file.isCombined,
          insertType,
          diff.newLine.content,
          newLine.oldNumber,
          newLine.newNumber,
          diff.newLine.prefix
        );
      }

      lines += processedOldLines + processedNewLines;
      lines += this.processLines(file.isCombined, oldLines.slice(common), newLines.slice(common));
    });

    return lines;
  }

  // TODO: Make this private after improving tests
  makeLineHtml(
    isCombined: boolean,
    type: renderUtils.CSSLineClass,
    content: string,
    oldNumber?: number,
    newNumber?: number,
    possiblePrefix?: string
  ): string {
    const lineNumberTemplate = this.hoganUtils.render(baseTemplatesPath, "numbers", {
      oldNumber: oldNumber || "",
      newNumber: newNumber || ""
    });

    let lineWithoutPrefix = content;
    let prefix = possiblePrefix;

    if (!prefix) {
      const lineWithPrefix = renderUtils.deconstructLine(content, isCombined);
      prefix = lineWithPrefix.prefix;
      lineWithoutPrefix = lineWithPrefix.content;
    }

    if (prefix === " ") {
      prefix = "&nbsp;";
    }

    return this.hoganUtils.render(genericTemplatesPath, "line", {
      type: type,
      lineClass: "d2h-code-linenumber",
      contentClass: "d2h-code-line",
      prefix: prefix,
      content: lineWithoutPrefix,
      lineNumber: lineNumberTemplate
    });
  }

  // TODO: Make this private after improving tests
  processLines(isCombined: boolean, oldLines: DiffLine[], newLines: DiffLine[]): string {
    let lines = "";

    for (let i = 0; i < oldLines.length; i++) {
      const oldLine = oldLines[i];
      lines += this.makeLineHtml(
        isCombined,
        renderUtils.toCSSClass(oldLine.type),
        oldLine.content,
        oldLine.oldNumber,
        oldLine.newNumber
      );
    }

    for (let j = 0; j < newLines.length; j++) {
      const newLine = newLines[j];
      lines += this.makeLineHtml(
        isCombined,
        renderUtils.toCSSClass(newLine.type),
        newLine.content,
        newLine.oldNumber,
        newLine.newNumber
      );
    }

    return lines;
  }
}
