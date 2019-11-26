import HoganJsUtils from "./hoganjs-utils";
import * as Rematch from "./rematch";
import * as renderUtils from "./render-utils";
import { DiffLine, LineType, DiffFile } from "./types";

export interface SideBySideRendererConfig extends renderUtils.RenderConfig {
  renderNothingWhenEmpty?: boolean;
  matchingMaxComparisons?: number;
  maxLineSizeInBlockForComparison?: number;
}

export const defaultSideBySideRendererConfig = {
  ...renderUtils.defaultRenderConfig,
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200
};

const genericTemplatesPath = "generic";
const baseTemplatesPath = "side-by-side";
const iconsBaseTemplatesPath = "icon";
const tagsBaseTemplatesPath = "tag";

export default class SideBySideRenderer {
  private readonly hoganUtils: HoganJsUtils;
  private readonly config: typeof defaultSideBySideRendererConfig;

  constructor(hoganUtils: HoganJsUtils, config: SideBySideRendererConfig = {}) {
    this.hoganUtils = hoganUtils;
    this.config = { ...defaultSideBySideRendererConfig, ...config };
  }

  render(diffFiles: DiffFile[]): string | undefined {
    const diffsHtml = diffFiles
      .map(file => {
        let diffs;
        if (file.blocks.length) {
          diffs = this.generateSideBySideFileHtml(file);
        } else {
          diffs = this.generateEmptyDiff();
        }
        return this.makeFileDiffHtml(file, diffs);
      })
      .join("\n");

    return this.hoganUtils.render(genericTemplatesPath, "wrapper", { content: diffsHtml });
  }

  // TODO: Make this private after improving tests
  makeFileDiffHtml(file: DiffFile, diffs: FileHtml): string {
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
  generateEmptyDiff(): FileHtml {
    return {
      right: "",
      left: this.hoganUtils.render(genericTemplatesPath, "empty-diff", {
        contentClass: "d2h-code-side-line",
        CSSLineClass: renderUtils.CSSLineClass
      })
    };
  }

  // TODO: Make this private after improving tests
  generateSideBySideFileHtml(file: DiffFile): FileHtml {
    const matcher = Rematch.newMatcherFn(
      Rematch.newDistanceFn((e: DiffLine) => renderUtils.deconstructLine(e.content, file.isCombined).content)
    );

    const fileHtml = {
      right: "",
      left: ""
    };

    file.blocks.forEach(block => {
      fileHtml.left += this.makeSideHtml(block.header);
      fileHtml.right += this.makeSideHtml("");

      let oldLines: DiffLine[] = [];
      let newLines: DiffLine[] = [];

      const processChangeBlock = (): void => {
        let matches;
        let insertType: renderUtils.CSSLineClass;
        let deleteType: renderUtils.CSSLineClass;

        const comparisons = oldLines.length * newLines.length;

        const maxLineSizeInBlock = Math.max.apply(
          null,
          oldLines.concat(newLines).map(elem => elem.content.length)
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

          const common = Math.min(oldLines.length, newLines.length);
          const max = Math.max(oldLines.length, newLines.length);

          for (let j = 0; j < common; j++) {
            const oldLine = oldLines[j];
            const newLine = newLines[j];

            const diff = renderUtils.diffHighlight(oldLine.content, newLine.content, file.isCombined, this.config);

            fileHtml.left += this.generateSingleLineHtml(
              file.isCombined,
              deleteType,
              diff.oldLine.content,
              oldLine.oldNumber,
              diff.oldLine.prefix
            );
            fileHtml.right += this.generateSingleLineHtml(
              file.isCombined,
              insertType,
              diff.newLine.content,
              newLine.newNumber,
              diff.newLine.prefix
            );
          }

          if (max > common) {
            const oldSlice = oldLines.slice(common);
            const newSlice = newLines.slice(common);

            const tmpHtml = this.processLines(file.isCombined, oldSlice, newSlice);
            fileHtml.left += tmpHtml.left;
            fileHtml.right += tmpHtml.right;
          }
        });

        oldLines = [];
        newLines = [];
      };

      for (let i = 0; i < block.lines.length; i++) {
        const diffLine = block.lines[i];
        const { prefix, content } = renderUtils.deconstructLine(diffLine.content, file.isCombined);

        if (
          diffLine.type !== LineType.INSERT &&
          (newLines.length > 0 || (diffLine.type !== LineType.DELETE && oldLines.length > 0))
        ) {
          processChangeBlock();
        }

        if (diffLine.type === LineType.CONTEXT) {
          fileHtml.left += this.generateSingleLineHtml(
            file.isCombined,
            renderUtils.toCSSClass(diffLine.type),
            content,
            diffLine.oldNumber,
            prefix
          );
          fileHtml.right += this.generateSingleLineHtml(
            file.isCombined,
            renderUtils.toCSSClass(diffLine.type),
            content,
            diffLine.newNumber,
            prefix
          );
        } else if (diffLine.type === LineType.INSERT && !oldLines.length) {
          fileHtml.left += this.generateSingleLineHtml(file.isCombined, renderUtils.CSSLineClass.CONTEXT, "");
          fileHtml.right += this.generateSingleLineHtml(
            file.isCombined,
            renderUtils.toCSSClass(diffLine.type),
            content,
            diffLine.newNumber,
            prefix
          );
        } else if (diffLine.type === LineType.DELETE) {
          oldLines.push(diffLine);
        } else if (diffLine.type === LineType.INSERT && Boolean(oldLines.length)) {
          newLines.push(diffLine);
        } else {
          console.error("unknown state in html side-by-side generator");
          processChangeBlock();
        }
      }

      processChangeBlock();
    });

    return fileHtml;
  }

  // TODO: Make this private after improving tests
  makeSideHtml(blockHeader: string): string {
    return this.hoganUtils.render(genericTemplatesPath, "block-header", {
      CSSLineClass: renderUtils.CSSLineClass,
      blockHeader: blockHeader,
      lineClass: "d2h-code-side-linenumber",
      contentClass: "d2h-code-side-line"
    });
  }

  // TODO: Make this private after improving tests
  processLines(isCombined: boolean, oldLines: DiffLine[], newLines: DiffLine[]): FileHtml {
    const fileHtml = {
      right: "",
      left: ""
    };

    const maxLinesNumber = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLinesNumber; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      let oldContent;
      let newContent;
      let oldPrefix;
      let newPrefix;

      if (oldLine) {
        const { prefix, content } = renderUtils.deconstructLine(oldLine.content, isCombined);
        oldContent = content;
        oldPrefix = prefix;
      } else {
        oldContent = "";
        oldPrefix = "";
      }

      if (newLine) {
        const { prefix, content } = renderUtils.deconstructLine(newLine.content, isCombined);
        newContent = content;
        newPrefix = prefix;
      } else {
        newContent = "";
        oldPrefix = "";
      }

      if (oldLine && newLine) {
        fileHtml.left += this.generateSingleLineHtml(
          isCombined,
          renderUtils.toCSSClass(oldLine.type),
          oldContent,
          oldLine.oldNumber,
          oldPrefix
        );
        fileHtml.right += this.generateSingleLineHtml(
          isCombined,
          renderUtils.toCSSClass(newLine.type),
          newContent,
          newLine.newNumber,
          newPrefix
        );
      } else if (oldLine) {
        fileHtml.left += this.generateSingleLineHtml(
          isCombined,
          renderUtils.toCSSClass(oldLine.type),
          oldContent,
          oldLine.oldNumber,
          oldPrefix
        );
        fileHtml.right += this.generateSingleLineHtml(isCombined, renderUtils.CSSLineClass.CONTEXT, "");
      } else if (newLine) {
        fileHtml.left += this.generateSingleLineHtml(isCombined, renderUtils.CSSLineClass.CONTEXT, "");
        fileHtml.right += this.generateSingleLineHtml(
          isCombined,
          renderUtils.toCSSClass(newLine.type),
          newContent,
          newLine.newNumber,
          newPrefix
        );
      }
    }

    return fileHtml;
  }

  // TODO: Make this private after improving tests
  generateSingleLineHtml(
    isCombined: boolean,
    type: renderUtils.CSSLineClass,
    content: string,
    number?: number,
    possiblePrefix?: string
  ): string {
    let lineWithoutPrefix = content;
    let prefix = possiblePrefix;
    let lineClass = "d2h-code-side-linenumber";
    let contentClass = "d2h-code-side-line";
    let preparedType: string = type;

    if (!number && !content) {
      lineClass += " d2h-code-side-emptyplaceholder";
      contentClass += " d2h-code-side-emptyplaceholder";
      preparedType += " d2h-emptyplaceholder";
      prefix = "&nbsp;";
      lineWithoutPrefix = "&nbsp;";
    } else if (!prefix) {
      const lineWithPrefix = renderUtils.deconstructLine(content, isCombined);
      prefix = lineWithPrefix.prefix;
      lineWithoutPrefix = lineWithPrefix.content;
    }

    if (prefix === " ") {
      prefix = "&nbsp;";
    }

    return this.hoganUtils.render(genericTemplatesPath, "line", {
      type: preparedType,
      lineClass: lineClass,
      contentClass: contentClass,
      prefix: prefix,
      content: lineWithoutPrefix,
      lineNumber: number
    });
  }
}

type FileHtml = {
  right: string;
  left: string;
};
