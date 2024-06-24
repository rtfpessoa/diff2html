import * as jsDiff from 'diff';

import { unifyPath, hashCode } from './utils';
import * as rematch from './rematch';
import {
  ColorSchemeType,
  DiffFile,
  DiffFileName,
  DiffLineParts,
  DiffStyleType,
  LineMatchingType,
  LineType,
} from './types';

export type CSSLineClass =
  | 'd2h-ins'
  | 'd2h-del'
  | 'd2h-cntx'
  | 'd2h-info'
  | 'd2h-ins d2h-change'
  | 'd2h-del d2h-change';

export const CSSLineClass: { [_: string]: CSSLineClass } = {
  INSERTS: 'd2h-ins',
  DELETES: 'd2h-del',
  CONTEXT: 'd2h-cntx',
  INFO: 'd2h-info',
  INSERT_CHANGES: 'd2h-ins d2h-change',
  DELETE_CHANGES: 'd2h-del d2h-change',
};

export type HighlightedLines = {
  oldLine: {
    prefix: string;
    content: string;
  };
  newLine: {
    prefix: string;
    content: string;
  };
};

export interface RenderConfig {
  matching?: LineMatchingType;
  matchWordsThreshold?: number;
  maxLineLengthHighlight?: number;
  diffStyle?: DiffStyleType;
  colorScheme?: ColorSchemeType;
  lineFolding?: boolean;
}

export const defaultRenderConfig = {
  matching: LineMatchingType.NONE,
  matchWordsThreshold: 0.25,
  maxLineLengthHighlight: 10000,
  diffStyle: DiffStyleType.WORD,
  colorScheme: ColorSchemeType.LIGHT,
};

const separator = '/';
const distance = rematch.newDistanceFn((change: jsDiff.Change) => change.value);
const matcher = rematch.newMatcherFn(distance);

function isDevNullName(name: string): boolean {
  return name.indexOf('dev/null') !== -1;
}

function removeInsElements(line: string): string {
  return line.replace(/(<ins[^>]*>((.|\n)*?)<\/ins>)/g, '');
}

function removeDelElements(line: string): string {
  return line.replace(/(<del[^>]*>((.|\n)*?)<\/del>)/g, '');
}

/**
 * Convert from LineType to CSSLineClass
 */
export function toCSSClass(lineType: LineType): CSSLineClass {
  switch (lineType) {
    case LineType.CONTEXT:
      return CSSLineClass.CONTEXT;
    case LineType.INSERT:
      return CSSLineClass.INSERTS;
    case LineType.DELETE:
      return CSSLineClass.DELETES;
  }
}

export function colorSchemeToCss(colorScheme: ColorSchemeType): string {
  switch (colorScheme) {
    case ColorSchemeType.DARK:
      return 'd2h-dark-color-scheme';
    case ColorSchemeType.AUTO:
      return 'd2h-auto-color-scheme';
    case ColorSchemeType.LIGHT:
    default:
      return 'd2h-light-color-scheme';
  }
}

/**
 * Prefix length of the hunk lines in the diff
 */
function prefixLength(isCombined: boolean): number {
  return isCombined ? 2 : 1;
}

/**
 * Escapes all required characters for safe HTML rendering
 */
// TODO: Test this method inside deconstructLine since it should not be used anywhere else
export function escapeForHtml(str: string): string {
  return str
    .slice(0)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Deconstructs diff @line by separating the content from the prefix type
 */
export function deconstructLine(line: string, isCombined: boolean, escape = true): DiffLineParts {
  const indexToSplit = prefixLength(isCombined);
  return {
    prefix: line.substring(0, indexToSplit),
    content: escape ? escapeForHtml(line.substring(indexToSplit)) : line.substring(indexToSplit),
  };
}

/**
 * Generates pretty filename diffs
 *
 *   e.g.:
 *     1. file = { oldName: "my/path/to/file.js", newName: "my/path/to/new-file.js" }
 *        returns "my/path/to/{file.js → new-file.js}"
 *     2. file = { oldName: "my/path/to/file.js", newName: "very/new/path/to/new-file.js" }
 *        returns "my/path/to/file.js → very/new/path/to/new-file.js"
 *     3. file = { oldName: "my/path/to/file.js", newName: "my/path/for/file.js" }
 *        returns "my/path/{to → for}/file.js"
 */
export function filenameDiff(file: DiffFileName): string {
  // TODO: Move unify path to parsing
  const oldFilename = unifyPath(file.oldName);
  const newFilename = unifyPath(file.newName);

  if (oldFilename !== newFilename && !isDevNullName(oldFilename) && !isDevNullName(newFilename)) {
    const prefixPaths = [];
    const suffixPaths = [];

    const oldFilenameParts = oldFilename.split(separator);
    const newFilenameParts = newFilename.split(separator);

    const oldFilenamePartsSize = oldFilenameParts.length;
    const newFilenamePartsSize = newFilenameParts.length;

    let i = 0;
    let j = oldFilenamePartsSize - 1;
    let k = newFilenamePartsSize - 1;

    while (i < j && i < k) {
      if (oldFilenameParts[i] === newFilenameParts[i]) {
        prefixPaths.push(newFilenameParts[i]);
        i += 1;
      } else {
        break;
      }
    }

    while (j > i && k > i) {
      if (oldFilenameParts[j] === newFilenameParts[k]) {
        suffixPaths.unshift(newFilenameParts[k]);
        j -= 1;
        k -= 1;
      } else {
        break;
      }
    }

    const finalPrefix = prefixPaths.join(separator);
    const finalSuffix = suffixPaths.join(separator);

    const oldRemainingPath = oldFilenameParts.slice(i, j + 1).join(separator);
    const newRemainingPath = newFilenameParts.slice(i, k + 1).join(separator);

    if (finalPrefix.length && finalSuffix.length) {
      return (
        finalPrefix + separator + '{' + oldRemainingPath + ' → ' + newRemainingPath + '}' + separator + finalSuffix
      );
    } else if (finalPrefix.length) {
      return finalPrefix + separator + '{' + oldRemainingPath + ' → ' + newRemainingPath + '}';
    } else if (finalSuffix.length) {
      return '{' + oldRemainingPath + ' → ' + newRemainingPath + '}' + separator + finalSuffix;
    }

    return oldFilename + ' → ' + newFilename;
  } else if (!isDevNullName(newFilename)) {
    return newFilename;
  } else {
    return oldFilename;
  }
}

/**
 * Generates a unique string numerical identifier based on the names of the file diff
 */
export function getHtmlId(file: DiffFileName): string {
  return `d2h-${hashCode(filenameDiff(file)).toString().slice(-6)}`;
}

/**
 * Selects the correct icon name for the file
 */
export function getFileIcon(file: DiffFile): string {
  let templateName = 'file-changed';

  if (file.isRename) {
    templateName = 'file-renamed';
  } else if (file.isCopy) {
    templateName = 'file-renamed';
  } else if (file.isNew) {
    templateName = 'file-added';
  } else if (file.isDeleted) {
    templateName = 'file-deleted';
  } else if (file.newName !== file.oldName) {
    // If file is not Added, not Deleted and the names changed it must be a rename :)
    templateName = 'file-renamed';
  }

  return templateName;
}

/**
 * Highlight differences between @diffLine1 and @diffLine2 using <ins> and <del> tags
 */
export function diffHighlight(
  diffLine1: string,
  diffLine2: string,
  isCombined: boolean,
  config: RenderConfig = {},
): HighlightedLines {
  const { matching, maxLineLengthHighlight, matchWordsThreshold, diffStyle } = { ...defaultRenderConfig, ...config };

  const line1 = deconstructLine(diffLine1, isCombined, false);
  const line2 = deconstructLine(diffLine2, isCombined, false);

  if (line1.content.length > maxLineLengthHighlight || line2.content.length > maxLineLengthHighlight) {
    return {
      oldLine: {
        prefix: line1.prefix,
        content: escapeForHtml(line1.content),
      },
      newLine: {
        prefix: line2.prefix,
        content: escapeForHtml(line2.content),
      },
    };
  }

  const diff =
    diffStyle === 'char'
      ? jsDiff.diffChars(line1.content, line2.content)
      : jsDiff.diffWordsWithSpace(line1.content, line2.content);

  const changedWords: jsDiff.Change[] = [];
  if (diffStyle === 'word' && matching === 'words') {
    const removed = diff.filter(element => element.removed);
    const added = diff.filter(element => element.added);
    const chunks = matcher(added, removed);
    chunks.forEach(chunk => {
      if (chunk[0].length === 1 && chunk[1].length === 1) {
        const dist = distance(chunk[0][0], chunk[1][0]);
        if (dist < matchWordsThreshold) {
          changedWords.push(chunk[0][0]);
          changedWords.push(chunk[1][0]);
        }
      }
    });
  }

  const highlightedLine = diff.reduce((highlightedLine, part) => {
    const elemType = part.added ? 'ins' : part.removed ? 'del' : null;
    const addClass = changedWords.indexOf(part) > -1 ? ' class="d2h-change"' : '';
    const escapedValue = escapeForHtml(part.value);

    return elemType !== null
      ? `${highlightedLine}<${elemType}${addClass}>${escapedValue}</${elemType}>`
      : `${highlightedLine}${escapedValue}`;
  }, '');

  return {
    oldLine: {
      prefix: line1.prefix,
      content: removeInsElements(highlightedLine),
    },
    newLine: {
      prefix: line2.prefix,
      content: removeDelElements(highlightedLine),
    },
  };
}
