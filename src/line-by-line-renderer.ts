import * as utils from "./utils";
import HoganJsUtils from "./hoganjs-utils";
import * as Rematch from "./rematch";
import * as renderUtils from "./render-utils";

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

  constructor(hoganUtils: HoganJsUtils, config: LineByLineRendererConfig) {
    this.hoganUtils = hoganUtils;
    this.config = { ...defaultLineByLineRendererConfig, ...config };
  }

  render(diffFiles: renderUtils.DiffFile[]): string | undefined {
    const htmlDiffs = diffFiles.map(file => {
      let diffs;
      if (file.blocks.length) {
        diffs = this.generateFileHtml(file);
      } else {
        diffs = this.generateEmptyDiff();
      }
      return this.makeFileDiffHtml(file, diffs);
    });

    return this.makeLineByLineHtmlWrapper(htmlDiffs.join("\n"));
  }

  // TODO: Make this private after improving tests
  makeFileDiffHtml(file: renderUtils.DiffFile, diffs: string): string {
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
  makeLineByLineHtmlWrapper(content: string): string {
    return this.hoganUtils.render(genericTemplatesPath, "wrapper", { content: content });
  }

  // TODO: Make this private after improving tests
  makeColumnLineNumberHtml(block: renderUtils.DiffBlock): string {
    return this.hoganUtils.render(genericTemplatesPath, "column-line-number", {
      CSSLineClass: renderUtils.CSSLineClass,
      blockHeader: utils.escapeForHtml(block.header),
      lineClass: "d2h-code-linenumber",
      contentClass: "d2h-code-line"
    });
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
      lineWithoutPrefix = lineWithPrefix.line;
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
  generateEmptyDiff(): string {
    return this.hoganUtils.render(genericTemplatesPath, "empty-diff", {
      contentClass: "d2h-code-line",
      CSSLineClass: renderUtils.CSSLineClass
    });
  }

  // TODO: Make this private after improving tests
  processLines(isCombined: boolean, oldLines: renderUtils.DiffLine[], newLines: renderUtils.DiffLine[]): string {
    let lines = "";

    for (let i = 0; i < oldLines.length; i++) {
      const oldLine = oldLines[i];
      const oldEscapedLine = utils.escapeForHtml(oldLine.content);
      lines += this.makeLineHtml(
        isCombined,
        renderUtils.toCSSClass(oldLine.type),
        oldEscapedLine,
        oldLine.oldNumber,
        oldLine.newNumber
      );
    }

    for (let j = 0; j < newLines.length; j++) {
      const newLine = newLines[j];
      const newEscapedLine = utils.escapeForHtml(newLine.content);
      lines += this.makeLineHtml(
        isCombined,
        renderUtils.toCSSClass(newLine.type),
        newEscapedLine,
        newLine.oldNumber,
        newLine.newNumber
      );
    }

    return lines;
  }

  // TODO: Make this private after improving tests
  generateFileHtml(file: renderUtils.DiffFile): string {
    const prefixSize = renderUtils.prefixLength(file.isCombined);
    const distance = Rematch.newDistanceFn((e: renderUtils.DiffLine) => e.content.substring(prefixSize));
    const matcher = Rematch.newMatcherFn(distance);

    return file.blocks
      .map(block => {
        let lines = this.makeColumnLineNumberHtml(block);
        let oldLines: renderUtils.DiffLine[] = [];
        let newLines: renderUtils.DiffLine[] = [];

        const processChangeBlock = (): void => {
          let matches;
          let insertType: renderUtils.CSSLineClass;
          let deleteType: renderUtils.CSSLineClass;

          const comparisons = oldLines.length * newLines.length;

          const maxLineSizeInBlock = Math.max.apply(
            null,
            [0].concat(oldLines.concat(newLines).map(elem => elem.content.length))
          );

          const doMatching =
            comparisons < this.config.matchingMaxComparisons &&
            maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison &&
            (this.config.matching === "lines" || this.config.matching === "words");

          if (doMatching) {
            matches = matcher(oldLines, newLines);
            insertType = renderUtils.CSSLineClass.INSERT_CHANGES;
            deleteType = renderUtils.CSSLineClass.DELETE_CHANGES;
          } else {
            matches = [[oldLines, newLines]];
            insertType = renderUtils.CSSLineClass.INSERTS;
            deleteType = renderUtils.CSSLineClass.DELETES;
          }

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

          oldLines = [];
          newLines = [];
        };

        for (let i = 0; i < block.lines.length; i++) {
          const diffLine = block.lines[i];
          const { prefix, line } = renderUtils.deconstructLine(diffLine.content, file.isCombined);
          const escapedLine = utils.escapeForHtml(line);

          if (
            diffLine.type !== renderUtils.LineType.INSERT &&
            (newLines.length > 0 || (diffLine.type !== renderUtils.LineType.DELETE && oldLines.length > 0))
          ) {
            processChangeBlock();
          }

          if (diffLine.type === renderUtils.LineType.CONTEXT) {
            lines += this.makeLineHtml(
              file.isCombined,
              renderUtils.toCSSClass(diffLine.type),
              escapedLine,
              diffLine.oldNumber,
              diffLine.newNumber,
              prefix
            );
          } else if (diffLine.type === renderUtils.LineType.INSERT && !oldLines.length) {
            lines += this.makeLineHtml(
              file.isCombined,
              renderUtils.toCSSClass(diffLine.type),
              escapedLine,
              diffLine.oldNumber,
              diffLine.newNumber,
              prefix
            );
          } else if (diffLine.type === renderUtils.LineType.DELETE) {
            oldLines.push(diffLine);
          } else if (diffLine.type === renderUtils.LineType.INSERT && Boolean(oldLines.length)) {
            newLines.push(diffLine);
          } else {
            console.error("Unknown state in html line-by-line generator");
            processChangeBlock();
          }
        }

        processChangeBlock();

        return lines;
      })
      .join("\n");
  }
}
