/*
 *
 * LineByLinePrinter (line-by-line-printer.js)
 * Author: rtfpessoa
 *
 */

(function() {
  const diffParser = require("./diff-parser.js").DiffParser;
  const printerUtils = require("./printer-utils.js").PrinterUtils;
  const utils = require("./utils.js").Utils;
  const Rematch = require("./rematch.js").Rematch;

  let hoganUtils;

  const genericTemplatesPath = "generic";
  const baseTemplatesPath = "line-by-line";
  const iconsBaseTemplatesPath = "icon";
  const tagsBaseTemplatesPath = "tag";

  function LineByLinePrinter(config) {
    this.config = config;

    const HoganJsUtils = require("./hoganjs-utils.js").HoganJsUtils;
    hoganUtils = new HoganJsUtils(config);
  }

  LineByLinePrinter.prototype.makeFileDiffHtml = function(file, diffs) {
    if (this.config.renderNothingWhenEmpty && file.blocks && !file.blocks.length) return "";

    const fileDiffTemplate = hoganUtils.template(baseTemplatesPath, "file-diff");
    const filePathTemplate = hoganUtils.template(genericTemplatesPath, "file-path");
    const fileIconTemplate = hoganUtils.template(iconsBaseTemplatesPath, "file");
    const fileTagTemplate = hoganUtils.template(tagsBaseTemplatesPath, printerUtils.getFileTypeIcon(file));

    return fileDiffTemplate.render({
      file: file,
      fileHtmlId: printerUtils.getHtmlId(file),
      diffs: diffs,
      filePath: filePathTemplate.render(
        {
          fileDiffName: printerUtils.getDiffName(file)
        },
        {
          fileIcon: fileIconTemplate,
          fileTag: fileTagTemplate
        }
      )
    });
  };

  LineByLinePrinter.prototype.makeLineByLineHtmlWrapper = function(content) {
    return hoganUtils.render(genericTemplatesPath, "wrapper", { content: content });
  };

  LineByLinePrinter.prototype.generateLineByLineJsonHtml = function(diffFiles) {
    const that = this;
    const htmlDiffs = diffFiles.map(function(file) {
      let diffs;
      if (file.blocks.length) {
        diffs = that._generateFileHtml(file);
      } else {
        diffs = that._generateEmptyDiff();
      }
      return that.makeFileDiffHtml(file, diffs);
    });

    return this.makeLineByLineHtmlWrapper(htmlDiffs.join("\n"));
  };

  const matcher = Rematch.rematch(function(a, b) {
    const amod = a.content.substr(1);
    const bmod = b.content.substr(1);

    return Rematch.distance(amod, bmod);
  });

  LineByLinePrinter.prototype.makeColumnLineNumberHtml = function(block) {
    return hoganUtils.render(genericTemplatesPath, "column-line-number", {
      diffParser: diffParser,
      blockHeader: utils.escape(block.header),
      lineClass: "d2h-code-linenumber",
      contentClass: "d2h-code-line"
    });
  };

  LineByLinePrinter.prototype._generateFileHtml = function(file) {
    const that = this;
    return file.blocks
      .map(function(block) {
        let lines = that.makeColumnLineNumberHtml(block);
        let oldLines = [];
        let newLines = [];

        function processChangeBlock() {
          let matches;
          let insertType;
          let deleteType;

          const comparisons = oldLines.length * newLines.length;

          const maxLineSizeInBlock = Math.max.apply(
            null,
            [0].concat(
              oldLines.concat(newLines).map(function(elem) {
                return elem.content.length;
              })
            )
          );

          const doMatching =
            comparisons < that.config.matchingMaxComparisons &&
            maxLineSizeInBlock < that.config.maxLineSizeInBlockForComparison &&
            (that.config.matching === "lines" || that.config.matching === "words");

          if (doMatching) {
            matches = matcher(oldLines, newLines);
            insertType = diffParser.LINE_TYPE.INSERT_CHANGES;
            deleteType = diffParser.LINE_TYPE.DELETE_CHANGES;
          } else {
            matches = [[oldLines, newLines]];
            insertType = diffParser.LINE_TYPE.INSERTS;
            deleteType = diffParser.LINE_TYPE.DELETES;
          }

          matches.forEach(function(match) {
            oldLines = match[0];
            newLines = match[1];

            let processedOldLines = [];
            let processedNewLines = [];

            const common = Math.min(oldLines.length, newLines.length);

            let oldLine, newLine;
            for (let j = 0; j < common; j++) {
              oldLine = oldLines[j];
              newLine = newLines[j];

              that.config.isCombined = file.isCombined;
              const diff = printerUtils.diffHighlight(oldLine.content, newLine.content, that.config);

              processedOldLines += that.makeLineHtml(
                file.isCombined,
                deleteType,
                oldLine.oldNumber,
                oldLine.newNumber,
                diff.first.line,
                diff.first.prefix
              );
              processedNewLines += that.makeLineHtml(
                file.isCombined,
                insertType,
                newLine.oldNumber,
                newLine.newNumber,
                diff.second.line,
                diff.second.prefix
              );
            }

            lines += processedOldLines + processedNewLines;
            lines += that._processLines(file.isCombined, oldLines.slice(common), newLines.slice(common));
          });

          oldLines = [];
          newLines = [];
        }

        for (let i = 0; i < block.lines.length; i++) {
          const line = block.lines[i];
          const escapedLine = utils.escape(line.content);

          if (
            line.type !== diffParser.LINE_TYPE.INSERTS &&
            (newLines.length > 0 || (line.type !== diffParser.LINE_TYPE.DELETES && oldLines.length > 0))
          ) {
            processChangeBlock();
          }

          if (line.type === diffParser.LINE_TYPE.CONTEXT) {
            lines += that.makeLineHtml(file.isCombined, line.type, line.oldNumber, line.newNumber, escapedLine);
          } else if (line.type === diffParser.LINE_TYPE.INSERTS && !oldLines.length) {
            lines += that.makeLineHtml(file.isCombined, line.type, line.oldNumber, line.newNumber, escapedLine);
          } else if (line.type === diffParser.LINE_TYPE.DELETES) {
            oldLines.push(line);
          } else if (line.type === diffParser.LINE_TYPE.INSERTS && Boolean(oldLines.length)) {
            newLines.push(line);
          } else {
            console.error("Unknown state in html line-by-line generator");
            processChangeBlock();
          }
        }

        processChangeBlock();

        return lines;
      })
      .join("\n");
  };

  LineByLinePrinter.prototype._processLines = function(isCombined, oldLines, newLines) {
    let lines = "";

    for (let i = 0; i < oldLines.length; i++) {
      const oldLine = oldLines[i];
      const oldEscapedLine = utils.escape(oldLine.content);
      lines += this.makeLineHtml(isCombined, oldLine.type, oldLine.oldNumber, oldLine.newNumber, oldEscapedLine);
    }

    for (let j = 0; j < newLines.length; j++) {
      const newLine = newLines[j];
      const newEscapedLine = utils.escape(newLine.content);
      lines += this.makeLineHtml(isCombined, newLine.type, newLine.oldNumber, newLine.newNumber, newEscapedLine);
    }

    return lines;
  };

  LineByLinePrinter.prototype.makeLineHtml = function(isCombined, type, oldNumber, newNumber, content, possiblePrefix) {
    const lineNumberTemplate = hoganUtils.render(baseTemplatesPath, "numbers", {
      oldNumber: utils.valueOrEmpty(oldNumber),
      newNumber: utils.valueOrEmpty(newNumber)
    });

    let lineWithoutPrefix = content;
    let prefix = possiblePrefix;

    if (!prefix) {
      const lineWithPrefix = printerUtils.separatePrefix(isCombined, content);
      prefix = lineWithPrefix.prefix;
      lineWithoutPrefix = lineWithPrefix.line;
    }

    if (prefix === " ") {
      prefix = "&nbsp;";
    }

    return hoganUtils.render(genericTemplatesPath, "line", {
      type: type,
      lineClass: "d2h-code-linenumber",
      contentClass: "d2h-code-line",
      prefix: prefix,
      content: lineWithoutPrefix,
      lineNumber: lineNumberTemplate
    });
  };

  LineByLinePrinter.prototype._generateEmptyDiff = function() {
    return hoganUtils.render(genericTemplatesPath, "empty-diff", {
      contentClass: "d2h-code-line",
      diffParser: diffParser
    });
  };

  module.exports.LineByLinePrinter = LineByLinePrinter;
})();
