export type DiffLineParts = {
  prefix: string;
  content: string;
};

export enum LineType {
  INSERT = "insert",
  DELETE = "delete",
  CONTEXT = "context"
}

export interface DiffLineDeleted {
  type: LineType.DELETE;
  oldNumber: number;
  newNumber: undefined;
}

export interface DiffLineInserted {
  type: LineType.INSERT;
  oldNumber: undefined;
  newNumber: number;
}

export interface DiffLineContext {
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

export interface DiffFileName {
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

export enum OutputFormatType {
  LINE_BY_LINE = "line-by-line",
  SIDE_BY_SIDE = "side-by-side"
}

export enum LineMatchingType {
  LINES = "lines",
  WORDS = "words",
  NONE = "none"
}

export enum DiffStyleType {
  WORD = "word",
  CHAR = "char"
}
