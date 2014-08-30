/*
 *
 * Diff to HTML (diff2html.js)
 * Author: rtfpessoa
 * Date: Friday 29 August 2014
 * Last Update: Saturday 30 August 2014
 *
 * Diff command:
 *   git diff --word-diff-regex=. HEAD~1
 */

(function (window) {
    var ClassVariable;

    ClassVariable = (function () {

        var CSS_STYLES = {
            INFO: "info",
            CONTEXT: "context",
            NEW: "insert",
            DELETED: "delete"
        };

        var BLOCK_HEADER_LINE = "...";

        function Diff2Html() {
        }

        /*
         * Generates pretty html from string diff input
         */
        Diff2Html.prototype.getPrettyHtmlFromDiff = function (diffInput) {
            var diffJson = generateDiffJson(diffInput);
            return generateJsonHtml(diffJson);
        };

        /*
         * Generates json object from string diff input
         */
        Diff2Html.prototype.getJsonFromDiff = function (diffInput) {
            return generateDiffJson(diffInput);
        };

        /*
         * Generates pretty html from a json object
         */
        Diff2Html.prototype.getPrettyHtmlFromJson = function (diffJson) {
            return generateJsonHtml(diffJson);
        };

        var generateDiffJson = function (diffInput) {
            var files = [],
                currentFile = null,
                currentBlock = null,
                oldLine = null,
                newLine = null;

            var saveBlock = function () {
                /* add previous block(if exists) before start a new file */
                if (currentBlock) {
                    currentFile.blocks.push(currentBlock);
                    currentBlock = null;
                }
            };

            var saveFile = function () {
                /* add previous file(if exists) before start a new one */
                if (currentFile) {
                    files.push(currentFile);
                    currentFile = null;
                }
            };

            var startFile = function (line) {
                saveBlock();
                saveFile();

                /* create file structure */
                currentFile = {};
                currentFile.blocks = [];
                currentFile.deletedLines = 0;
                currentFile.addedLines = 0;

                /* save file paths, before and after the diff */
                var values = /^diff --git a\/(\S+) b\/(\S+).*$/.exec(line);
                currentFile.oldName = values[1];
                currentFile.newName = values[2];
            };

            var startBlock = function (line) {
                saveBlock();

                var values = /^(@@ -(\d+),(\d+) \+(\d+),(\d+) @@).*/.exec(line);

                /* create block metadata */
                currentBlock = {};
                currentBlock.lines = [];
                currentBlock.oldStartLine = oldLine = values[2];
                currentBlock.newStartLine = newLine = values[4];

                /* create block header line */
                var currentLine = {};
                currentLine.type = CSS_STYLES.INFO;
                currentLine.content = line;
                currentLine.oldNumber = BLOCK_HEADER_LINE;
                currentLine.newNumber = BLOCK_HEADER_LINE;

                /* add line to block */
                currentBlock.lines.push(currentLine);
            };

            var createLine = function (line) {
                var isLineWithInserts = /{\+.*?\+}/.exec(line);
                var isLineWithDeletes = /\[-.*?-\]/.exec(line);
                var isNewLine = /^{\+.*?\+}$/.exec(line);
                var isContextLine = !isLineWithInserts && !isLineWithDeletes;

                var currentLine = {};

                if (isContextLine) {
                    currentLine = {};
                    currentLine.type = CSS_STYLES.CONTEXT;
                    currentLine.oldNumber = oldLine++;
                    currentLine.newNumber = newLine++;
                    currentLine.content = line;

                    currentBlock.lines.push(currentLine);
                } else {

                    if (isLineWithDeletes) {
                        currentFile.deletedLines++;

                        currentLine = {};
                        currentLine.type = CSS_STYLES.DELETED;
                        currentLine.oldNumber = oldLine++;
                        currentLine.newNumber = null;
                        currentLine.content = line;

                        currentBlock.lines.push(currentLine);

                    }

                    if (isLineWithInserts) {
                        currentFile.addedLines++;

                        currentLine = {};
                        currentLine.type = CSS_STYLES.NEW;
                        currentLine.oldNumber = null;
                        currentLine.newNumber = newLine++;
                        currentLine.content = line;

                        /* fix line numbers when new chars but no deletes and no whole new line  */
                        if (isLineWithInserts && !isLineWithDeletes && !isNewLine) {
                            currentFile.deletedLines++;

                            currentLine.oldNumber = oldLine++;
                        }

                        currentBlock.lines.push(currentLine);
                    }

                }
            };

            var diffLines = diffInput.split("\n");
            diffLines.forEach(function (line) {
                // Unmerged paths, and possibly other non-diffable files
                // https://github.com/scottgonzalez/pretty-diff/issues/11
                // Also, remove some useless lines
                if (!line || startsWith(line, "*") ||
                    startsWith(line, "new") || startsWith(line, "index") ||
                    startsWith(line, "---") || startsWith(line, "+++")) {
                    return;
                }

                if (startsWith(line, "diff")) {
                    startFile(line);
                } else if (currentFile && startsWith(line, "@@")) {
                    startBlock(line);
                } else if (currentBlock) {
                    createLine(line);
                }
            });

            saveBlock();
            saveFile();

            return files;
        };

        var generateJsonHtml = function (diffFiles) {
            return "<div id=\"wrapper\">\n" +
                diffFiles.map(function (file) {
                    return "<div class=\"file-wrapper\">\n" +
                        "     <div class=\"file-header\">\n" +
                        "       <div class=\"file-stats\">\n" +
                        "         <span class=\"lines-added\">+" + file.addedLines + "</span>\n" +
                        "         <span class=\"lines-deleted\">-" + file.deletedLines + "</span>\n" +
                        "       </div>\n" +
                        "       <div class=\"file-name\">" + getDiffName(file.oldName, file.newName) + "</div>\n" +
                        "     </div>\n" +
                        "     <div class=\"file-diff\">\n" +
                        "       <div class=\"code-wrapper\">\n" +
                        "         <table class=\"diff-table\">\n" +
                        "           <tbody>\n" +
                        "         " + generateFileHtml(file) +
                        "           </tbody>\n" +
                        "         </table>\n" +
                        "       </div>\n" +
                        "     </div>\n" +
                        "   </div>\n";
                }).join("\n") +
                "</div>\n";
        };

        var getDiffName = function (oldFilename, newFilename) {
            return oldFilename === newFilename ? newFilename : oldFilename + " -> " + newFilename;
        };

        var generateFileHtml = function (file) {
            return file.blocks.map(function (block) {
                return block.lines.map(function (line) {

                    var oldLine = valueOrEmpty(line.oldNumber);
                    var newLine = valueOrEmpty(line.newNumber);

                    var escapedLine = escape(line.content);

                    if (line.type === CSS_STYLES.NEW) {
                        escapedLine = generateLineInsertions(escapedLine);
                    } else if (line.type === CSS_STYLES.DELETED) {
                        escapedLine = generateLineDeletions(escapedLine);
                    }

                    return "<tr>\n" +
                        "  <td class=\"code-linenumber " + line.type + "\">" + oldLine + "</td>\n" +
                        "  <td class=\"code-linenumber " + line.type + "\">" + newLine + "</td>\n" +
                        "  <td class=\"code-line " + line.type + "\"><pre class=\"" + line.type + "\">" + escapedLine + "</pre></td>\n" +
                        "</tr>\n";
                }).join("\n");
            }).join("\n");
        };

        var generateLineInsertions = function (line) {
            return line.replace(/(\[-.*?-\])/g, "").
                replace(/({\+(.*?)\+})/g, "<ins>$2</ins>");
        };

        var generateLineDeletions = function (line) {
            return line.replace(/({\+.*?\+})/g, "").
                replace(/(\[-(.*?)-\])/g, "<del>$2</del>");
        };

        /*
         * Utils
         */

        function escape(str) {
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\t/g, "    ");
        }

        function startsWith(str, start) {
            return str.indexOf(start) === 0;
        }

        function valueOrEmpty(value) {
            return value ? value : "";
        }

        /* singleton pattern */
        var instance;
        return {
            getInstance: function () {
                if (instance === undefined) {
                    instance = new Diff2Html();
                    /* Hide the constructor so the returned objected can't be new'd */
                    instance.constructor = null;
                }
                return instance;
            }
        };

    })();

    window.Diff2Html = ClassVariable.getInstance();
    return window.Diff2Html;

})(window);
