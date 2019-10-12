import * as jsDiff from "diff";

import { unifyPath, escapeForHtml, hashCode } from "./utils";
import * as rematch from "./rematch";

export type DiffLineParts = {
  prefix: string;
  line: string;
};

export enum CSSLineClass {
  INSERTS = "d2h-ins",
  DELETES = "d2h-del",
  CONTEXT = "d2h-cntx",
  INFO = "d2h-info",
  INSERT_CHANGES = "d2h-ins d2h-change",
  DELETE_CHANGES = "d2h-del d2h-change"
}

export enum LineType {
  INSERT = "insert",
  DELETE = "delete",
  CONTEXT = "context"
}

interface DiffLineDeleted {
  type: LineType.DELETE;
  oldNumber: number;
  newNumber: undefined;
}

interface DiffLineInserted {
  type: LineType.INSERT;
  oldNumber: undefined;
  newNumber: number;
}

interface DiffLineContext {
  type: LineType.CONTEXT;
  oldNumber: number;
  newNumber: number;
}

export type DiffLine = (DiffLineDeleted | DiffLineInserted | DiffLineContext) & {
  content: string;
};

export interface DiffBlock {
  oldStartLine: number;
  oldStartLine2?: number;
  newStartLine: number;
  header: string;
  lines: DiffLine[];
}

interface DiffFileName {
  oldName: string;
  newName: string;
}

export interface DiffFile extends DiffFileName {
  addedLines: number;
  deletedLines: number;
  isCombined: boolean;
  isGitDiff: boolean;
  language: string;
  blocks: DiffBlock[];
  oldMode?: string | string[];
  newMode?: string;
  deletedFileMode?: string;
  newFileMode?: string;
  isDeleted?: boolean;
  isNew?: boolean;
  isCopy?: boolean;
  isRename?: boolean;
  isBinary?: boolean;
  unchangedPercentage?: number;
  changedPercentage?: number;
  checksumBefore?: string | string[];
  checksumAfter?: string;
  mode?: string;
}

export type LineMatchingType = "lines" | "words" | "none";
export type DiffStyleType = "word" | "char";

export interface RenderConfig {
  matching?: LineMatchingType;
  matchWordsThreshold?: number;
  maxLineLengthHighlight?: number;
  diffStyle?: DiffStyleType;
}

export const defaultRenderConfig = {
  matching: "none" as LineMatchingType,
  matchWordsThreshold: 0.25,
  maxLineLengthHighlight: 10000,
  diffStyle: "word" as DiffStyleType
};

type HighlightedLines = {
  oldLine: {
    prefix: string;
    content: string;
  };
  newLine: {
    prefix: string;
    content: string;
  };
};

const separator = "/";
const distance = rematch.newDistanceFn((change: jsDiff.Change) => change.value);
const matcher = rematch.newMatcherFn(distance);

function isDevNullName(name: string): boolean {
  return name.indexOf("dev/null") !== -1;
}

function removeInsElements(line: string): string {
  return line.replace(/(<ins[^>]*>((.|\n)*?)<\/ins>)/g, "");
}

function removeDelElements(line: string): string {
  return line.replace(/(<del[^>]*>((.|\n)*?)<\/del>)/g, "");
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

/**
 * Prefix length of the hunk lines in the diff
 */
export function prefixLength(isCombined: boolean): number {
  return isCombined ? 2 : 1;
}

/**
 * Deconstructs diff @line by separating the content from the prefix type
 */
export function deconstructLine(line: string, isCombined: boolean): DiffLineParts {
  const indexToSplit = prefixLength(isCombined);
  return {
    prefix: line.substring(0, indexToSplit),
    line: line.substring(indexToSplit)
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
  // TODO: Review this huuuuuge piece of code, do we need this?
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
        finalPrefix + separator + "{" + oldRemainingPath + " → " + newRemainingPath + "}" + separator + finalSuffix
      );
    } else if (finalPrefix.length) {
      return finalPrefix + separator + "{" + oldRemainingPath + " → " + newRemainingPath + "}";
    } else if (finalSuffix.length) {
      return "{" + oldRemainingPath + " → " + newRemainingPath + "}" + separator + finalSuffix;
    }

    return oldFilename + " → " + newFilename;
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
  return `d2h-${hashCode(filenameDiff(file))
    .toString()
    .slice(-6)}`;
}

/**
 * Selects the correct icon name for the file
 */
export function getFileIcon(file: DiffFile): string {
  let templateName = "file-changed";

  if (file.isRename) {
    templateName = "file-renamed";
  } else if (file.isCopy) {
    templateName = "file-renamed";
  } else if (file.isNew) {
    templateName = "file-added";
  } else if (file.isDeleted) {
    templateName = "file-deleted";
  } else if (file.newName !== file.oldName) {
    // If file is not Added, not Deleted and the names changed it must be a rename :)
    templateName = "file-renamed";
  }

  return templateName;
}

/**
 * Generates a unique string numerical identifier based on the names of the file diff
 */
export function diffHighlight(
  diffLine1: string,
  diffLine2: string,
  isCombined: boolean,
  config: RenderConfig
): HighlightedLines {
  const { matching, maxLineLengthHighlight, matchWordsThreshold, diffStyle } = { ...defaultRenderConfig, ...config };
  const prefixLengthVal = prefixLength(isCombined);

  const linePrefix1 = diffLine1.substr(0, prefixLengthVal);
  const unprefixedLine1 = diffLine1.substr(prefixLengthVal);

  const linePrefix2 = diffLine2.substr(0, prefixLengthVal);
  const unprefixedLine2 = diffLine2.substr(prefixLengthVal);

  if (unprefixedLine1.length > maxLineLengthHighlight || unprefixedLine2.length > maxLineLengthHighlight) {
    return {
      oldLine: {
        prefix: linePrefix1,
        content: escapeForHtml(unprefixedLine1)
      },
      newLine: {
        prefix: linePrefix2,
        content: escapeForHtml(unprefixedLine2)
      }
    };
  }

  const diff =
    diffStyle === "char"
      ? jsDiff.diffChars(unprefixedLine1, unprefixedLine2)
      : jsDiff.diffWordsWithSpace(unprefixedLine1, unprefixedLine2);

  const changedWords: jsDiff.Change[] = [];
  if (diffStyle === "word" && matching === "words") {
    let treshold = 0.25;

    if (typeof matchWordsThreshold !== "undefined") {
      treshold = matchWordsThreshold;
    }

    const removed = diff.filter(element => element.removed);
    const added = diff.filter(element => element.added);
    const chunks = matcher(added, removed);
    chunks.forEach(chunk => {
      if (chunk[0].length === 1 && chunk[1].length === 1) {
        const dist = distance(chunk[0][0], chunk[1][0]);
        if (dist < treshold) {
          changedWords.push(chunk[0][0]);
          changedWords.push(chunk[1][0]);
        }
      }
    });
  }

  const highlightedLine = diff.reduce((highlightedLine, part) => {
    const elemType = part.added ? "ins" : part.removed ? "del" : null;
    const addClass = changedWords.indexOf(part) > -1 ? ' class="d2h-change"' : "";
    const escapedValue = escapeForHtml(part.value);

    return elemType !== null
      ? `${highlightedLine}<${elemType}${addClass}>${escapedValue}</${elemType}>`
      : `${highlightedLine}${escapedValue}`;
  }, "");

  return {
    oldLine: {
      prefix: linePrefix1,
      content: removeInsElements(highlightedLine)
    },
    newLine: {
      prefix: linePrefix2,
      content: removeDelElements(highlightedLine)
    }
  };
}
