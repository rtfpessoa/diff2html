/*
 *
 * HtmlPrinter (html-printer.js)
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
  const baseTemplatesPath = "side-by-side";
  const iconsBaseTemplatesPath = "icon";
  const tagsBaseTemplatesPath = "tag";

  const matcher = Rematch.rematch(function(a, b) {
    const amod = a.content.substr(1);
    const bmod = b.content.substr(1);

    return Rematch.distance(amod, bmod);
  });

  function SideBySidePrinter(config) {
    this.config = config;

    const HoganJsUtils = require("./hoganjs-utils.js").HoganJsUtils;
    hoganUtils = new HoganJsUtils(config);
  }

  SideBySidePrinter.prototype.makeDiffHtml = function(file, diffs) {
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

  SideBySidePrinter.prototype.generateSideBySideJsonHtml = function(diffFiles) {
    const that = this;

    const content = diffFiles
      .map(function(file) {
        let diffs;
        if (file.blocks.length) {
          diffs = that.generateSideBySideFileHtml(file);
        } else {
          diffs = that.generateEmptyDiff();
        }

        return that.makeDiffHtml(file, diffs);
      })
      .join("\n");

    return hoganUtils.render(genericTemplatesPath, "wrapper", { content: content });
  };

  SideBySidePrinter.prototype.makeSideHtml = function(blockHeader) {
    return hoganUtils.render(genericTemplatesPath, "column-line-number", {
      diffParser: diffParser,
      blockHeader: utils.escape(blockHeader),
      lineClass: "d2h-code-side-linenumber",
      contentClass: "d2h-code-side-line"
    });
  };

  SideBySidePrinter.prototype.generateSideBySideFileHtml = function(file) {
    const that = this;
    const fileHtml = {};
    fileHtml.left = "";
    fileHtml.right = "";

    file.blocks.forEach(function(block) {
      fileHtml.left += that.makeSideHtml(block.header);
      fileHtml.right += that.makeSideHtml("");

      let oldLines = [];
      let newLines = [];

      function processChangeBlock() {
        let matches;
        let insertType;
        let deleteType;

        const comparisons = oldLines.length * newLines.length;

        const maxLineSizeInBlock = Math.max.apply(
          null,
          oldLines.concat(newLines).map(function(elem) {
            return elem.length;
          })
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

          const common = Math.min(oldLines.length, newLines.length);
          const max = Math.max(oldLines.length, newLines.length);

          for (let j = 0; j < common; j++) {
            const oldLine = oldLines[j];
            const newLine = newLines[j];

            that.config.isCombined = file.isCombined;

            const diff = printerUtils.diffHighlight(oldLine.content, newLine.content, that.config);

            fileHtml.left += that.generateSingleLineHtml(
              file.isCombined,
              deleteType,
              oldLine.oldNumber,
              diff.first.line,
              diff.first.prefix
            );
            fileHtml.right += that.generateSingleLineHtml(
              file.isCombined,
              insertType,
              newLine.newNumber,
              diff.second.line,
              diff.second.prefix
            );
          }

          if (max > common) {
            const oldSlice = oldLines.slice(common);
            const newSlice = newLines.slice(common);

            const tmpHtml = that.processLines(file.isCombined, oldSlice, newSlice);
            fileHtml.left += tmpHtml.left;
            fileHtml.right += tmpHtml.right;
          }
        });

        oldLines = [];
        newLines = [];
      }

      for (let i = 0; i < block.lines.length; i++) {
        const line = block.lines[i];
        const prefix = line.content[0];
        const escapedLine = utils.escape(line.content.substr(1));

        if (
          line.type !== diffParser.LINE_TYPE.INSERTS &&
          (newLines.length > 0 || (line.type !== diffParser.LINE_TYPE.DELETES && oldLines.length > 0))
        ) {
          processChangeBlock();
        }

        if (line.type === diffParser.LINE_TYPE.CONTEXT) {
          fileHtml.left += that.generateSingleLineHtml(file.isCombined, line.type, line.oldNumber, escapedLine, prefix);
          fileHtml.right += that.generateSingleLineHtml(
            file.isCombined,
            line.type,
            line.newNumber,
            escapedLine,
            prefix
          );
        } else if (line.type === diffParser.LINE_TYPE.INSERTS && !oldLines.length) {
          fileHtml.left += that.generateSingleLineHtml(file.isCombined, diffParser.LINE_TYPE.CONTEXT, "", "", "");
          fileHtml.right += that.generateSingleLineHtml(
            file.isCombined,
            line.type,
            line.newNumber,
            escapedLine,
            prefix
          );
        } else if (line.type === diffParser.LINE_TYPE.DELETES) {
          oldLines.push(line);
        } else if (line.type === diffParser.LINE_TYPE.INSERTS && Boolean(oldLines.length)) {
          newLines.push(line);
        } else {
          console.error("unknown state in html side-by-side generator");
          processChangeBlock();
        }
      }

      processChangeBlock();
    });

    return fileHtml;
  };

  SideBySidePrinter.prototype.processLines = function(isCombined, oldLines, newLines) {
    const that = this;
    const fileHtml = {};
    fileHtml.left = "";
    fileHtml.right = "";

    const maxLinesNumber = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLinesNumber; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      var oldContent;
      var newContent;
      var oldPrefix;
      var newPrefix;

      if (oldLine) {
        oldContent = utils.escape(oldLine.content.substr(1));
        oldPrefix = oldLine.content[0];
      }

      if (newLine) {
        newContent = utils.escape(newLine.content.substr(1));
        newPrefix = newLine.content[0];
      }

      if (oldLine && newLine) {
        fileHtml.left += that.generateSingleLineHtml(
          isCombined,
          oldLine.type,
          oldLine.oldNumber,
          oldContent,
          oldPrefix
        );
        fileHtml.right += that.generateSingleLineHtml(
          isCombined,
          newLine.type,
          newLine.newNumber,
          newContent,
          newPrefix
        );
      } else if (oldLine) {
        fileHtml.left += that.generateSingleLineHtml(
          isCombined,
          oldLine.type,
          oldLine.oldNumber,
          oldContent,
          oldPrefix
        );
        fileHtml.right += that.generateSingleLineHtml(isCombined, diffParser.LINE_TYPE.CONTEXT, "", "", "");
      } else if (newLine) {
        fileHtml.left += that.generateSingleLineHtml(isCombined, diffParser.LINE_TYPE.CONTEXT, "", "", "");
        fileHtml.right += that.generateSingleLineHtml(
          isCombined,
          newLine.type,
          newLine.newNumber,
          newContent,
          newPrefix
        );
      } else {
        console.error("How did it get here?");
      }
    }

    return fileHtml;
  };

  SideBySidePrinter.prototype.generateSingleLineHtml = function(isCombined, type, number, content, possiblePrefix) {
    let lineWithoutPrefix = content;
    let prefix = possiblePrefix;
    let lineClass = "d2h-code-side-linenumber";
    let contentClass = "d2h-code-side-line";

    if (!number && !content) {
      lineClass += " d2h-code-side-emptyplaceholder";
      contentClass += " d2h-code-side-emptyplaceholder";
      type += " d2h-emptyplaceholder";
      prefix = "&nbsp;";
      lineWithoutPrefix = "&nbsp;";
    } else if (!prefix) {
      const lineWithPrefix = printerUtils.separatePrefix(isCombined, content);
      prefix = lineWithPrefix.prefix;
      lineWithoutPrefix = lineWithPrefix.line;
    }

    if (prefix === " ") {
      prefix = "&nbsp;";
    }

    return hoganUtils.render(genericTemplatesPath, "line", {
      type: type,
      lineClass: lineClass,
      contentClass: contentClass,
      prefix: prefix,
      content: lineWithoutPrefix,
      lineNumber: number
    });
  };

  SideBySidePrinter.prototype.generateEmptyDiff = function() {
    const fileHtml = {};
    fileHtml.right = "";

    fileHtml.left = hoganUtils.render(genericTemplatesPath, "empty-diff", {
      contentClass: "d2h-code-side-line",
      diffParser: diffParser
    });

    return fileHtml;
  };

  module.exports.SideBySidePrinter = SideBySidePrinter;
})();
