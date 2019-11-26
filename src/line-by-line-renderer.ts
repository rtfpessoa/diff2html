import HoganJsUtils from "./hoganjs-utils";
import * as Rematch from "./rematch";
import * as renderUtils from "./render-utils";
import { DiffFile, DiffLine, LineType, DiffBlock } from "./types";

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

        this.applyLineGroupping(block).forEach(([contextLines, oldLines, newLines]) => {
          if (oldLines.length && newLines.length && !contextLines.length) {
            lines += this.applyRematchMatching(oldLines, newLines, matcher)
              .map(([oldLines, newLines]) => this.applyLineDiff(file, oldLines, newLines))
              .join("");
          } else if (oldLines.length || newLines.length || contextLines.length) {
            lines += (contextLines || [])
              .concat((oldLines || []).concat(newLines || []))
              .map(line => {
                const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
                return this.makeLineHtml(
                  renderUtils.toCSSClass(line.type),
                  prefix,
                  content,
                  line.oldNumber,
                  line.newNumber
                );
              })
              .join("");
          } else {
            console.error("Unknown state reached while processing groups of lines", contextLines, oldLines, newLines);
          }
        });

        return lines;
      })
      .join("\n");
  }

  applyLineGroupping(block: DiffBlock): DiffLine[][][] {
    const blockLinesGroups: DiffLine[][][] = [];

    let oldLines: DiffLine[] = [];
    let newLines: DiffLine[] = [];

    for (let i = 0; i < block.lines.length; i++) {
      const diffLine = block.lines[i];

      if (
        (diffLine.type !== LineType.INSERT && newLines.length) ||
        (diffLine.type === LineType.CONTEXT && oldLines.length > 0)
      ) {
        blockLinesGroups.push([[], oldLines, newLines]);
        oldLines = [];
        newLines = [];
      }

      if (diffLine.type === LineType.CONTEXT) {
        blockLinesGroups.push([[diffLine], [], []]);
      } else if (diffLine.type === LineType.INSERT && oldLines.length === 0) {
        blockLinesGroups.push([[], [], [diffLine]]);
      } else if (diffLine.type === LineType.INSERT && oldLines.length > 0) {
        newLines.push(diffLine);
      } else if (diffLine.type === LineType.DELETE) {
        oldLines.push(diffLine);
      }
    }

    if (oldLines.length || newLines.length) {
      blockLinesGroups.push([[], oldLines, newLines]);
      oldLines = [];
      newLines = [];
    }

    return blockLinesGroups;
  }

  applyRematchMatching(
    oldLines: DiffLine[],
    newLines: DiffLine[],
    matcher: Rematch.MatcherFn<DiffLine>
  ): DiffLine[][][] {
    const comparisons = oldLines.length * newLines.length;
    const maxLineSizeInBlock = Math.max.apply(
      null,
      [0].concat(oldLines.concat(newLines).map(elem => elem.content.length))
    );
    const doMatching =
      comparisons < this.config.matchingMaxComparisons &&
      maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison &&
      (this.config.matching === "lines" || this.config.matching === "words");

    const matches = doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];

    return matches;
  }

  applyLineDiff(file: DiffFile, oldLines: DiffLine[], newLines: DiffLine[]): string {
    let oldLinesHtml = "";
    let newLinesHtml = "";

    const common = Math.min(oldLines.length, newLines.length);

    let oldLine, newLine;
    for (let j = 0; j < common; j++) {
      oldLine = oldLines[j];
      newLine = newLines[j];

      const diff = renderUtils.diffHighlight(oldLine.content, newLine.content, file.isCombined, this.config);

      oldLinesHtml += this.makeLineHtml(
        renderUtils.CSSLineClass.DELETE_CHANGES,
        diff.oldLine.prefix,
        diff.oldLine.content,
        oldLine.oldNumber,
        oldLine.newNumber
      );
      newLinesHtml += this.makeLineHtml(
        renderUtils.CSSLineClass.INSERT_CHANGES,
        diff.newLine.prefix,
        diff.newLine.content,
        newLine.oldNumber,
        newLine.newNumber
      );
    }

    const remainingLines = oldLines
      .slice(common)
      .concat(newLines.slice(common))
      .map(line => {
        const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
        return this.makeLineHtml(renderUtils.toCSSClass(line.type), prefix, content, line.oldNumber, line.newNumber);
      })
      .join("");

    return oldLinesHtml + newLinesHtml + remainingLines;
  }

  // TODO: Make this private after improving tests
  makeLineHtml(
    type: renderUtils.CSSLineClass,
    prefix: string,
    content: string,
    oldNumber?: number,
    newNumber?: number
  ): string {
    const lineNumberHtml = this.hoganUtils.render(baseTemplatesPath, "numbers", {
      oldNumber: oldNumber || "",
      newNumber: newNumber || ""
    });

    return this.hoganUtils.render(genericTemplatesPath, "line", {
      type: type,
      lineClass: "d2h-code-linenumber",
      contentClass: "d2h-code-line",
      prefix: prefix === " " ? "&nbsp;" : prefix,
      content: content,
      lineNumber: lineNumberHtml
    });
  }
}
