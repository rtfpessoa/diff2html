import HoganJsUtils from './hoganjs-utils';
import * as Rematch from './rematch';
import * as renderUtils from './render-utils';
import {
  DiffLine,
  LineType,
  DiffOverflowType,
  DiffFile,
  DiffBlock,
  DiffLineContext,
  DiffLineDeleted,
  DiffLineInserted,
  DiffLineContent,
} from './types';

export interface SideBySideRendererConfig extends renderUtils.RenderConfig {
  renderNothingWhenEmpty?: boolean;
  matchingMaxComparisons?: number;
  maxLineSizeInBlockForComparison?: number;
}

export const defaultSideBySideRendererConfig = {
  ...renderUtils.defaultRenderConfig,
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200,
};

const genericTemplatesPath = 'generic';
const baseTemplatesPath = 'side-by-side';
const iconsBaseTemplatesPath = 'icon';
const tagsBaseTemplatesPath = 'tag';

export default class SideBySideRenderer {
  private readonly hoganUtils: HoganJsUtils;
  private readonly config: typeof defaultSideBySideRendererConfig;

  constructor(hoganUtils: HoganJsUtils, config: SideBySideRendererConfig = {}) {
    this.hoganUtils = hoganUtils;
    this.config = { ...defaultSideBySideRendererConfig, ...config };
  }

  render(diffFiles: DiffFile[]): string {
    const diffsHtml = diffFiles
      .map(file => {
        let diffsFileHtml;
        if (file.blocks.length) {
          diffsFileHtml = this.generateFileHtml(file);
        } else {
          diffsFileHtml = this.generateEmptyDiff();
        }
        return this.makeFileDiffHtml(file, diffsFileHtml);
      })
      .join('\n');

    return this.hoganUtils.render(genericTemplatesPath, 'wrapper', { content: diffsHtml });
  }

  makeFileDiffHtml(file: DiffFile, diffsFileHtml: FileHtml): string {
    if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0) return '';

    if (this.config.diffOverflow === DiffOverflowType.SCROLL) {
      return this.makeScrollFileDiffHtml(file, diffsFileHtml);
    }

    if (this.config.diffOverflow === DiffOverflowType.WRAP) {
      return this.makeWrappedFileDiffHtml(file, diffsFileHtml);
    }

    throw new Error('Unrecognised DiffOverflow setting');
  }

  makeWrappedFileDiffHtml(file: DiffFile, diffsFileHtml: FileHtml): string {
    if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0) return '';

    const fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, 'text-wrapped-file-diff');
    const filePathTemplate = this.hoganUtils.template(genericTemplatesPath, 'file-path');
    const fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, 'file');
    const fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));

    const diffs = this.joinFileHtmlForWrappedDisplay(diffsFileHtml);

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

  makeScrollFileDiffHtml(file: DiffFile, diffsFileHtml: FileHtml): string {
    if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0) return '';

    const fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, 'file-diff');
    const filePathTemplate = this.hoganUtils.template(genericTemplatesPath, 'file-path');
    const fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, 'file');
    const fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));

    const diffs = this.joinFileHtmlForScrollDisplay(diffsFileHtml);

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

  generateEmptyDiff(): FileHtml {
    return {
      left: [
        this.hoganUtils.render(genericTemplatesPath, 'empty-diff', {
          contentClass: 'd2h-code-side-line',
          CSSLineClass: renderUtils.CSSLineClass,
        }),
      ],
      right: [
        this.hoganUtils.render(genericTemplatesPath, 'empty-diff', {
          contentClass: 'd2h-code-side-line',
          CSSLineClass: renderUtils.CSSLineClass,
        }),
      ],
    };
  }

  generateFileHtml(file: DiffFile): FileHtml {
    const matcher = Rematch.newMatcherFn(
      Rematch.newDistanceFn((e: DiffLine) => renderUtils.deconstructLine(e.content, file.isCombined).content),
    );

    return file.blocks
      .map(block => {
        const fileHtml: FileHtml = {
          left: [],
          right: [],
        };
        const header = this.makeHeaderHtml(block.header, file);
        fileHtml.left.push(header.left);
        fileHtml.right.push(header.right);

        this.applyLineGrouping(block).forEach(([contextLines, oldLines, newLines]) => {
          if (oldLines.length && newLines.length && !contextLines.length) {
            this.applyRematchMatching(oldLines, newLines, matcher).map(([oldLines, newLines]) => {
              const { left, right } = this.processChangedLines(file.isCombined, oldLines, newLines);
              fileHtml.left.push(...left);
              fileHtml.right.push(...right);
            });
          } else if (contextLines.length) {
            contextLines.forEach(line => {
              const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
              const { left, right } = this.generateLineHtml(
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
              fileHtml.left.push(left);
              fileHtml.right.push(right);
            });
          } else if (oldLines.length || newLines.length) {
            const { left, right } = this.processChangedLines(file.isCombined, oldLines, newLines);
            fileHtml.left.push(...left);
            fileHtml.right.push(...right);
          } else {
            console.error('Unknown state reached while processing groups of lines', contextLines, oldLines, newLines);
          }
        });

        return fileHtml;
      })
      .reduce(
        (accumulator: FileHtml, { left, right }) => {
          accumulator.left.push(...left);
          accumulator.right.push(...right);
          return accumulator;
        },
        { left: [], right: [] },
      );
  }

  joinFileHtmlForWrappedDisplay(fileHtml: FileHtml): string {
    let joined_string = '';
    for (let block_line_index = 0; block_line_index < fileHtml.left.length; block_line_index++) {
      joined_string = joined_string.concat(
        `<tr>${fileHtml.left[block_line_index]} ${fileHtml.right[block_line_index]}</tr>\n`,
      );
    }
    return joined_string;
  }

  joinFileHtmlForScrollDisplay(fileHtml: FileHtml): { left: string; right: string } {
    const joined_strings = {
      left: '',
      right: '',
    };
    for (let block_line_index = 0; block_line_index < fileHtml.left.length; block_line_index++) {
      joined_strings.left = joined_strings.left.concat(`<tr>${fileHtml.left[block_line_index]}</tr>\n`);
      joined_strings.right = joined_strings.right.concat(`<tr>${fileHtml.right[block_line_index]}</tr>\n`);
    }
    return joined_strings;
  }

  applyLineGrouping(block: DiffBlock): DiffLineGroups {
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
    const maxLineSizeInBlock = Math.max.apply(
      null,
      [0].concat(oldLines.concat(newLines).map(elem => elem.content.length)),
    );
    const doMatching =
      comparisons < this.config.matchingMaxComparisons &&
      maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison &&
      (this.config.matching === 'lines' || this.config.matching === 'words');

    return doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];
  }

  makeHeaderHtml(blockHeader: string, file?: DiffFile): LineHtml {
    if (this.config.diffOverflow === DiffOverflowType.WRAP) {
      return this.makeWrappedHeaderHtml(blockHeader, file);
    }

    if (this.config.diffOverflow === DiffOverflowType.SCROLL) {
      return this.makeScrollHeaderHtml(blockHeader, file);
    }

    throw new Error('Unrecognised DiffOverflow setting');
  }

  makeScrollHeaderHtml(blockHeader: string, file?: DiffFile): LineHtml {
    const left = this.hoganUtils.render(genericTemplatesPath, 'block-header', {
      CSSLineClass: renderUtils.CSSLineClass,
      margin_colspan: '1',
      colspan: '1',
      blockHeader: file?.isTooBig ? blockHeader : renderUtils.escapeForHtml(blockHeader),
      lineClass: 'd2h-code-side-linenumber',
      contentClass: 'd2h-code-side-line',
    });

    const right = this.hoganUtils.render(genericTemplatesPath, 'block-header', {
      CSSLineClass: renderUtils.CSSLineClass,
      margin_colspan: '1',
      colspan: '1',
      lineClass: 'd2h-code-side-linenumber',
      contentClass: 'd2h-code-side-line',
    });
    return { left, right };
  }

  makeWrappedHeaderHtml(blockHeader: string, file?: DiffFile): LineHtml {
    const table_element = this.hoganUtils.render(genericTemplatesPath, 'block-header', {
      CSSLineClass: renderUtils.CSSLineClass,
      margin_colspan: '1',
      colspan: '3',
      blockHeader: file?.isTooBig ? blockHeader : renderUtils.escapeForHtml(blockHeader),
      lineClass: 'd2h-code-side-linenumber',
      contentClass: 'd2h-code-side-line',
    });
    return {
      left: table_element,
      right: '',
    };
  }

  processChangedLines(isCombined: boolean, oldLines: DiffLine[], newLines: DiffLine[]): FileHtml {
    const fileHtml: FileHtml = {
      left: [],
      right: [],
    };

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

      const { left, right } = this.generateLineHtml(preparedOldLine, preparedNewLine);
      fileHtml.left.push(left);
      fileHtml.right.push(right);
    }

    return fileHtml;
  }

  generateLineHtml(oldLine?: DiffPreparedLine, newLine?: DiffPreparedLine): LineHtml {
    return {
      left: this.generateSingleHtml(oldLine),
      right: this.generateSingleHtml(newLine),
    };
  }

  generateSingleHtml(line?: DiffPreparedLine): string {
    const lineClass = 'd2h-code-side-linenumber';
    const contentClass = 'd2h-code-side-line';

    const type = line?.type || `${renderUtils.CSSLineClass.CONTEXT} d2h-emptyplaceholder`;

    const line_number_cell = this.hoganUtils.render(genericTemplatesPath, 'line-number', {
      type: type,
      lineClass: line !== undefined ? lineClass : `${lineClass} d2h-code-side-emptyplaceholder`,
      lineNumber: line?.number,
    });

    const line_content_cell = this.hoganUtils.render(genericTemplatesPath, 'line', {
      type: type,
      contentClass: line !== undefined ? contentClass : `${contentClass} d2h-code-side-emptyplaceholder`,
      prefix: line?.prefix === ' ' ? '&nbsp;' : line?.prefix,
      content: line?.content,
    });

    return line_number_cell.concat(line_content_cell);
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

type LineHtml = {
  left: string;
  right: string;
};

type FileHtml = {
  left: string[];
  right: string[];
};
