import HoganJsUtils from './hoganjs-utils';
import * as Rematch from './rematch';
import * as renderUtils from './render-utils';
import {
  DiffFile,
  DiffLine,
  LineType,
  DiffBlock,
  DiffLineDeleted,
  DiffLineContent,
  DiffLineContext,
  DiffLineInserted,
} from './types';
import { max } from './utils';

export interface WrappedSideBySideRendererConfig extends renderUtils.RenderConfig {
  renderNothingWhenEmpty?: boolean;
  matchingMaxComparisons?: number;
  maxLineSizeInBlockForComparison?: number;
}

export const defaultWrappedSideBySideRendererConfig = {
  ...renderUtils.defaultRenderConfig,
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200,
};

const genericTemplatesPath = 'generic';
const baseTemplatesPath = 'wrapped-side-by-side';
const iconsBaseTemplatesPath = 'icon';
const tagsBaseTemplatesPath = 'tag';

export default class WrappedSideBySideRenderer {
  private readonly hoganUtils: HoganJsUtils;
  private readonly config: typeof defaultWrappedSideBySideRendererConfig;

  constructor(hoganUtils: HoganJsUtils, config: WrappedSideBySideRendererConfig = {}) {
    this.hoganUtils = hoganUtils;
    this.config = { ...defaultWrappedSideBySideRendererConfig, ...config };
  }

  render(diffFiles: DiffFile[]): string {
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
      .join('\n');

    return this.hoganUtils.render(genericTemplatesPath, 'wrapper', {
      colorScheme: renderUtils.colorSchemeToCss(this.config.colorScheme),
      content: diffsHtml,
    });
  }

  makeFileDiffHtml(file: DiffFile, diffs: string): string {
    if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0) return '';

    const fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, 'file-diff');
    const filePathTemplate = this.hoganUtils.template(genericTemplatesPath, 'file-path');
    const fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, 'file');
    const fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));

    return fileDiffTemplate.render({
      file: file,
      fileHtmlId: renderUtils.getHtmlId(file),
      diffs: diffs,
      filePath: filePathTemplate.render(
        {
          fileDiffName: renderUtils.filenameDiff(file),
        },
        {
          fileIcon: fileIconTemplate,
          fileTag: fileTagTemplate,
        },
      ),
    });
  }

  generateEmptyDiff(): string {
    return this.hoganUtils.render(genericTemplatesPath, 'empty-diff', {
      emptyHeaderSpan: 4,
      contentClass: 'd2h-code-wrapped-side-line',
      CSSLineClass: renderUtils.CSSLineClass,
    });
  }

  generateFileHtml(file: DiffFile): string {
    const matcher = Rematch.newMatcherFn(
      Rematch.newDistanceFn((e: DiffLine) => renderUtils.deconstructLine(e.content, file.isCombined).content),
    );

    return file.blocks
      .map(block => {
        let lines = this.hoganUtils.render(genericTemplatesPath, 'block-header', {
          CSSLineClass: renderUtils.CSSLineClass,
          blockHeader: file.isTooBig ? block.header : renderUtils.escapeForHtml(block.header),
          blockHeaderSpan: 3,
          lineClass: 'd2h-code-wrapped-side-linenumber',
          contentClass: 'd2h-code-wrapped-side-line',
        });

        this.applyLineGroupping(block).forEach(([contextLines, oldLines, newLines]) => {
          if (oldLines.length && newLines.length && !contextLines.length) {
            this.applyRematchMatching(oldLines, newLines, matcher).map(([oldLines, newLines]) => {
              lines += this.processChangedLines(file, file.isCombined, oldLines, newLines);
            });
          } else if (contextLines.length) {
            contextLines.forEach(line => {
              const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
              lines += this.generateLineHtml(
                file,
                {
                  type: renderUtils.CSSLineClass.CONTEXT,
                  prefix: prefix,
                  content: content,
                  number: line.oldNumber,
                },
                {
                  type: renderUtils.CSSLineClass.CONTEXT,
                  prefix: prefix,
                  content: content,
                  number: line.newNumber,
                },
              );
            });
          } else if (oldLines.length || newLines.length) {
            lines += this.processChangedLines(file, file.isCombined, oldLines, newLines);
          } else {
            console.error('Unknown state reached while processing groups of lines', contextLines, oldLines, newLines);
          }
        });

        return lines;
      })
      .join('\n');
  }

  applyLineGroupping(block: DiffBlock): DiffLineGroups {
    const blockLinesGroups: DiffLineGroups = [];

    let oldLines: (DiffLineDeleted & DiffLineContent)[] = [];
    let newLines: (DiffLineInserted & DiffLineContent)[] = [];

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
    matcher: Rematch.MatcherFn<DiffLine>,
  ): DiffLine[][][] {
    const comparisons = oldLines.length * newLines.length;
    const maxLineSizeInBlock = max(oldLines.concat(newLines).map(elem => elem.content.length));
    const doMatching =
      comparisons < this.config.matchingMaxComparisons &&
      maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison &&
      (this.config.matching === 'lines' || this.config.matching === 'words');

    return doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];
  }

  processChangedLines(file: DiffFile, isCombined: boolean, oldLines: DiffLine[], newLines: DiffLine[]): string {
    let lines = '';

    const maxLinesNumber = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLinesNumber; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      const diff =
        oldLine !== undefined && newLine !== undefined
          ? renderUtils.diffHighlight(oldLine.content, newLine.content, isCombined, this.config)
          : undefined;

      const preparedOldLine =
        oldLine !== undefined && oldLine.oldNumber !== undefined
          ? {
              ...(diff !== undefined
                ? {
                    prefix: diff.oldLine.prefix,
                    content: diff.oldLine.content,
                    type: renderUtils.CSSLineClass.DELETE_CHANGES,
                  }
                : {
                    ...renderUtils.deconstructLine(oldLine.content, isCombined),
                    type: renderUtils.toCSSClass(oldLine.type),
                  }),
              number: oldLine.oldNumber,
            }
          : undefined;

      const preparedNewLine =
        newLine !== undefined && newLine.newNumber !== undefined
          ? {
              ...(diff !== undefined
                ? {
                    prefix: diff.newLine.prefix,
                    content: diff.newLine.content,
                    type: renderUtils.CSSLineClass.INSERT_CHANGES,
                  }
                : {
                    ...renderUtils.deconstructLine(newLine.content, isCombined),
                    type: renderUtils.toCSSClass(newLine.type),
                  }),
              number: newLine.newNumber,
            }
          : undefined;

      lines += this.generateLineHtml(file, preparedOldLine, preparedNewLine);
    }

    return lines;
  }

  generateLineHtml(file: DiffFile, oldLine?: DiffPreparedLine, newLine?: DiffPreparedLine): string {
    return this.hoganUtils.render(baseTemplatesPath, 'line', {
      left: this.generateSingleHtml(file, oldLine),
      right: this.generateSingleHtml(file, newLine),
    });
  }

  generateSingleHtml(file: DiffFile, line?: DiffPreparedLine): string {
    const lineClass = 'd2h-code-wrapped-side-linenumber';
    const contentClass = 'd2h-code-wrapped-side-line';

    return this.hoganUtils.render(baseTemplatesPath, 'half-line', {
      type: line?.type || `${renderUtils.CSSLineClass.CONTEXT} d2h-emptyplaceholder`,
      lineClass: line !== undefined ? lineClass : `${lineClass} d2h-code-side-emptyplaceholder`,
      contentClass: line !== undefined ? contentClass : `${contentClass} d2h-code-side-emptyplaceholder`,
      prefix: line?.prefix === ' ' ? '&nbsp;' : line?.prefix,
      content: line?.content,
      lineNumber: line?.number,
      line,
      file,
    });
  }
}

type DiffLineGroups = [
  (DiffLineContext & DiffLineContent)[],
  (DiffLineDeleted & DiffLineContent)[],
  (DiffLineInserted & DiffLineContent)[],
][];

type DiffPreparedLine = {
  type: renderUtils.CSSLineClass;
  prefix: string;
  content: string;
  number: number;
};
