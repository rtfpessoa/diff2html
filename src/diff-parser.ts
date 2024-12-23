import { DiffFile, DiffBlock, DiffLine, LineType } from './types';
import { escapeForRegExp } from './utils';

export interface DiffParserConfig {
  srcPrefix?: string;
  dstPrefix?: string;
  diffMaxChanges?: number;
  diffMaxLineLength?: number;
  diffTooBigMessage?: (fileIndex: number) => string;
}

function getExtension(filename: string, language: string): string {
  const filenameParts = filename.split('.');
  return filenameParts.length > 1 ? filenameParts[filenameParts.length - 1] : language;
}

function startsWithAny(str: string, prefixes: string[]): boolean {
  return prefixes.reduce<boolean>((startsWith, prefix) => startsWith || str.startsWith(prefix), false);
}

const baseDiffFilenamePrefixes = ['a/', 'b/', 'i/', 'w/', 'c/', 'o/'];
function getFilename(line: string, linePrefix?: string, extraPrefix?: string): string {
  const prefixes = extraPrefix !== undefined ? [...baseDiffFilenamePrefixes, extraPrefix] : baseDiffFilenamePrefixes;

  const FilenameRegExp = linePrefix
    ? new RegExp(`^${escapeForRegExp(linePrefix)} "?(.+?)"?$`)
    : new RegExp('^"?(.+?)"?$');

  const [, filename = ''] = FilenameRegExp.exec(line) || [];
  const matchingPrefix = prefixes.find(p => filename.indexOf(p) === 0);
  const fnameWithoutPrefix = matchingPrefix ? filename.slice(matchingPrefix.length) : filename;

  // Cleanup timestamps generated by the unified diff (diff command) as specified in
  // https://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html
  // Ie: 2016-10-25 11:37:14.000000000 +0200
  return fnameWithoutPrefix.replace(/\s+\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? [+-]\d{4}.*$/, '');
}

function getSrcFilename(line: string, srcPrefix?: string): string | undefined {
  return getFilename(line, '---', srcPrefix);
}

function getDstFilename(line: string, dstPrefix?: string): string | undefined {
  return getFilename(line, '+++', dstPrefix);
}

/**
 *
 * Docs:
 *   - Unified: https://www.gnu.org/software/diffutils/manual/html_node/Unified-Format.html
 *   - Git Diff: https://git-scm.com/docs/git-diff-tree#_raw_output_format
 *   - Git Combined Diff: https://git-scm.com/docs/git-diff-tree#_combined_diff_format
 *
 */
export function parse(diffInput: string, config: DiffParserConfig = {}): DiffFile[] {
  const files: DiffFile[] = [];
  let currentFile: DiffFile | null = null;
  let currentBlock: DiffBlock | null = null;
  let oldLine: number | null = null;
  let oldLine2: number | null = null; // Used for combined diff
  let newLine: number | null = null;

  let possibleOldName: string | null = null;
  let possibleNewName: string | null = null;

  /* Diff Header */
  const oldFileNameHeader = '--- ';
  const newFileNameHeader = '+++ ';
  const hunkHeaderPrefix = '@@';

  /* Diff */
  const oldMode = /^old mode (\d{6})/;
  const newMode = /^new mode (\d{6})/;
  const deletedFileMode = /^deleted file mode (\d{6})/;
  const newFileMode = /^new file mode (\d{6})/;

  const copyFrom = /^copy from "?(.+)"?/;
  const copyTo = /^copy to "?(.+)"?/;

  const renameFrom = /^rename from "?(.+)"?/;
  const renameTo = /^rename to "?(.+)"?/;

  const similarityIndex = /^similarity index (\d+)%/;
  const dissimilarityIndex = /^dissimilarity index (\d+)%/;
  const index = /^index ([\da-z]+)\.\.([\da-z]+)\s*(\d{6})?/;

  const binaryFiles = /^Binary files (.*) and (.*) differ/;
  const binaryDiff = /^GIT binary patch/;

  /* Combined Diff */
  const combinedIndex = /^index ([\da-z]+),([\da-z]+)\.\.([\da-z]+)/;
  const combinedMode = /^mode (\d{6}),(\d{6})\.\.(\d{6})/;
  const combinedNewFile = /^new file mode (\d{6})/;
  const combinedDeletedFile = /^deleted file mode (\d{6}),(\d{6})/;

  const diffLines = diffInput
    .replace(/\\ No newline at end of file/g, '')
    .replace(/\r\n?/g, '\n')
    .split('\n');

  /* Add previous block(if exists) before start a new file */
  function saveBlock(): void {
    if (currentBlock !== null && currentFile !== null) {
      currentFile.blocks.push(currentBlock);
      currentBlock = null;
    }
  }

  /*
   * Add previous file(if exists) before start a new one
   * if it has name (to avoid binary files errors)
   */
  function saveFile(): void {
    if (currentFile !== null) {
      if (!currentFile.oldName && possibleOldName !== null) {
        currentFile.oldName = possibleOldName;
      }

      if (!currentFile.newName && possibleNewName !== null) {
        currentFile.newName = possibleNewName;
      }

      if (currentFile.newName) {
        files.push(currentFile);
        currentFile = null;
      }
    }

    possibleOldName = null;
    possibleNewName = null;
  }

  /* Create file structure */
  function startFile(): void {
    saveBlock();
    saveFile();

    // eslint-disable-next-line
    // @ts-ignore
    currentFile = {
      blocks: [],
      deletedLines: 0,
      addedLines: 0,
    };
  }

  function startBlock(line: string): void {
    saveBlock();

    let values;

    /**
     * From Range:
     * -<start line>[,<number of lines>]
     *
     * To Range:
     * +<start line>[,<number of lines>]
     *
     * @@ from-file-range to-file-range @@
     *
     * @@@ from-file-range from-file-range to-file-range @@@
     *
     * number of lines is optional, if omited consider 0
     */

    if (currentFile !== null) {
      if ((values = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@.*/.exec(line))) {
        currentFile.isCombined = false;
        oldLine = parseInt(values[1], 10);
        newLine = parseInt(values[2], 10);
      } else if ((values = /^@@@ -(\d+)(?:,\d+)? -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@@.*/.exec(line))) {
        currentFile.isCombined = true;
        oldLine = parseInt(values[1], 10);
        oldLine2 = parseInt(values[2], 10);
        newLine = parseInt(values[3], 10);
      } else {
        if (line.startsWith(hunkHeaderPrefix)) {
          console.error('Failed to parse lines, starting in 0!');
        }

        oldLine = 0;
        newLine = 0;
        currentFile.isCombined = false;
      }
    }

    /* Create block metadata */
    currentBlock = {
      lines: [],
      // eslint-disable-next-line
      // @ts-ignore
      oldStartLine: oldLine,
      // eslint-disable-next-line
      // @ts-ignore
      oldStartLine2: oldLine2,
      // eslint-disable-next-line
      // @ts-ignore
      newStartLine: newLine,
      header: line,
    };
  }

  function createLine(line: string): void {
    if (currentFile === null || currentBlock === null || oldLine === null || newLine === null) return;

    // eslint-disable-next-line
    // @ts-ignore
    const currentLine: DiffLine = {
      content: line,
    };

    const addedPrefixes = currentFile.isCombined ? ['+ ', ' +', '++'] : ['+'];
    const deletedPrefixes = currentFile.isCombined ? ['- ', ' -', '--'] : ['-'];

    if (startsWithAny(line, addedPrefixes)) {
      currentFile.addedLines++;
      currentLine.type = LineType.INSERT;
      currentLine.oldNumber = undefined;
      currentLine.newNumber = newLine++;
    } else if (startsWithAny(line, deletedPrefixes)) {
      currentFile.deletedLines++;
      currentLine.type = LineType.DELETE;
      currentLine.oldNumber = oldLine++;
      currentLine.newNumber = undefined;
    } else {
      currentLine.type = LineType.CONTEXT;
      currentLine.oldNumber = oldLine++;
      currentLine.newNumber = newLine++;
    }
    currentBlock.lines.push(currentLine);
  }

  /*
   * Checks if there is a hunk header coming before a new file starts
   *
   * Hunk header is a group of three lines started by ( `--- ` , `+++ ` , `@@` )
   */
  function existHunkHeader(line: string, lineIdx: number): boolean {
    let idx = lineIdx;

    while (idx < diffLines.length - 3) {
      if (line.startsWith('diff')) {
        return false;
      }

      if (
        diffLines[idx].startsWith(oldFileNameHeader) &&
        diffLines[idx + 1].startsWith(newFileNameHeader) &&
        diffLines[idx + 2].startsWith(hunkHeaderPrefix)
      ) {
        return true;
      }

      idx++;
    }

    return false;
  }

  diffLines.forEach((line, lineIndex) => {
    // Unmerged paths, and possibly other non-diffable files
    // https://github.com/scottgonzalez/pretty-diff/issues/11
    // Also, remove some useless lines
    if (!line || line.startsWith('*')) {
      return;
    }

    // Used to store regex capture groups
    let values;

    const prevLine = diffLines[lineIndex - 1];
    const nxtLine = diffLines[lineIndex + 1];
    const afterNxtLine = diffLines[lineIndex + 2];

    if (line.startsWith('diff --git') || line.startsWith('diff --combined')) {
      startFile();

      // diff --git a/blocked_delta_results.png b/blocked_delta_results.png
      const gitDiffStart = /^diff --git "?([a-ciow]\/.+)"? "?([a-ciow]\/.+)"?/;
      if ((values = gitDiffStart.exec(line))) {
        possibleOldName = getFilename(values[1], undefined, config.dstPrefix);
        possibleNewName = getFilename(values[2], undefined, config.srcPrefix);
      }

      if (currentFile === null) {
        throw new Error('Where is my file !!!');
      }

      currentFile.isGitDiff = true;
      return;
    }

    if (line.startsWith('Binary files') && !currentFile?.isGitDiff) {
      startFile();
      const unixDiffBinaryStart = /^Binary files "?([a-ciow]\/.+)"? and "?([a-ciow]\/.+)"? differ/;
      if ((values = unixDiffBinaryStart.exec(line))) {
        possibleOldName = getFilename(values[1], undefined, config.dstPrefix);
        possibleNewName = getFilename(values[2], undefined, config.srcPrefix);
      }

      if (currentFile === null) {
        throw new Error('Where is my file !!!');
      }

      currentFile.isBinary = true;
      return;
    }

    if (
      !currentFile || // If we do not have a file yet, we should crete one
      (!currentFile.isGitDiff &&
        currentFile && // If we already have some file in progress and
        line.startsWith(oldFileNameHeader) && // If we get to an old file path header line
        // And is followed by the new file path header line and the hunk header line
        nxtLine.startsWith(newFileNameHeader) &&
        afterNxtLine.startsWith(hunkHeaderPrefix))
    ) {
      startFile();
    }

    // Ignore remaining diff for current file if marked as too big
    if (currentFile?.isTooBig) {
      return;
    }

    if (
      currentFile &&
      ((typeof config.diffMaxChanges === 'number' &&
        currentFile.addedLines + currentFile.deletedLines > config.diffMaxChanges) ||
        (typeof config.diffMaxLineLength === 'number' && line.length > config.diffMaxLineLength))
    ) {
      currentFile.isTooBig = true;
      currentFile.addedLines = 0;
      currentFile.deletedLines = 0;
      currentFile.blocks = [];
      currentBlock = null;

      const message =
        typeof config.diffTooBigMessage === 'function'
          ? config.diffTooBigMessage(files.length)
          : 'Diff too big to be displayed';
      startBlock(message);
      return;
    }

    /*
     * We need to make sure that we have the three lines of the header.
     * This avoids cases like the ones described in:
     *   - https://github.com/rtfpessoa/diff2html/issues/87
     */
    if (
      (line.startsWith(oldFileNameHeader) && nxtLine.startsWith(newFileNameHeader)) ||
      (line.startsWith(newFileNameHeader) && prevLine.startsWith(oldFileNameHeader))
    ) {
      /*
       * --- Date Timestamp[FractionalSeconds] TimeZone
       * --- 2002-02-21 23:30:39.942229878 -0800
       */
      if (
        currentFile &&
        !currentFile.oldName &&
        line.startsWith('--- ') &&
        (values = getSrcFilename(line, config.srcPrefix))
      ) {
        currentFile.oldName = values;
        currentFile.language = getExtension(currentFile.oldName, currentFile.language);
        return;
      }

      /*
       * +++ Date Timestamp[FractionalSeconds] TimeZone
       * +++ 2002-02-21 23:30:39.942229878 -0800
       */
      if (
        currentFile &&
        !currentFile.newName &&
        line.startsWith('+++ ') &&
        (values = getDstFilename(line, config.dstPrefix))
      ) {
        currentFile.newName = values;
        currentFile.language = getExtension(currentFile.newName, currentFile.language);
        return;
      }
    }

    if (
      currentFile &&
      (line.startsWith(hunkHeaderPrefix) ||
        (currentFile.isGitDiff && currentFile.oldName && currentFile.newName && !currentBlock))
    ) {
      startBlock(line);
      return;
    }

    /*
     * There are three types of diff lines. These lines are defined by the way they start.
     * 1. New line     starts with: +
     * 2. Old line     starts with: -
     * 3. Context line starts with: <SPACE>
     */
    if (currentBlock && (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))) {
      createLine(line);
      return;
    }

    const doesNotExistHunkHeader = !existHunkHeader(line, lineIndex);

    if (currentFile === null) {
      throw new Error('Where is my file !!!');
    }

    /*
     * Git diffs provide more information regarding files modes, renames, copies,
     * commits between changes and similarity indexes
     */
    if ((values = oldMode.exec(line))) {
      currentFile.oldMode = values[1];
    } else if ((values = newMode.exec(line))) {
      currentFile.newMode = values[1];
    } else if ((values = deletedFileMode.exec(line))) {
      currentFile.deletedFileMode = values[1];
      currentFile.isDeleted = true;
    } else if ((values = newFileMode.exec(line))) {
      currentFile.newFileMode = values[1];
      currentFile.isNew = true;
    } else if ((values = copyFrom.exec(line))) {
      if (doesNotExistHunkHeader) {
        currentFile.oldName = values[1];
      }
      currentFile.isCopy = true;
    } else if ((values = copyTo.exec(line))) {
      if (doesNotExistHunkHeader) {
        currentFile.newName = values[1];
      }
      currentFile.isCopy = true;
    } else if ((values = renameFrom.exec(line))) {
      if (doesNotExistHunkHeader) {
        currentFile.oldName = values[1];
      }
      currentFile.isRename = true;
    } else if ((values = renameTo.exec(line))) {
      if (doesNotExistHunkHeader) {
        currentFile.newName = values[1];
      }
      currentFile.isRename = true;
    } else if ((values = binaryFiles.exec(line))) {
      currentFile.isBinary = true;
      currentFile.oldName = getFilename(values[1], undefined, config.srcPrefix);
      currentFile.newName = getFilename(values[2], undefined, config.dstPrefix);
      startBlock('Binary file');
    } else if (binaryDiff.test(line)) {
      currentFile.isBinary = true;
      startBlock(line);
    } else if ((values = similarityIndex.exec(line))) {
      currentFile.unchangedPercentage = parseInt(values[1], 10);
    } else if ((values = dissimilarityIndex.exec(line))) {
      currentFile.changedPercentage = parseInt(values[1], 10);
    } else if ((values = index.exec(line))) {
      currentFile.checksumBefore = values[1];
      currentFile.checksumAfter = values[2];
      if (values[3]) currentFile.mode = values[3];
    } else if ((values = combinedIndex.exec(line))) {
      currentFile.checksumBefore = [values[2], values[3]];
      currentFile.checksumAfter = values[1];
    } else if ((values = combinedMode.exec(line))) {
      currentFile.oldMode = [values[2], values[3]];
      currentFile.newMode = values[1];
    } else if ((values = combinedNewFile.exec(line))) {
      currentFile.newFileMode = values[1];
      currentFile.isNew = true;
    } else if ((values = combinedDeletedFile.exec(line))) {
      currentFile.deletedFileMode = values[1];
      currentFile.isDeleted = true;
    }
  });

  saveBlock();
  saveFile();

  return files;
}
