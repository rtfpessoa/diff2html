/*
 *
 * Diff to HTML (diff2html.js)
 * Author: rtfpessoa
 * Date: Friday 29 August 2014
 * Last Update: Saturday 6 September 2014
 *
 * Diff command:
 *   git diff --word-diff-regex=. HEAD~1
 */

(function (window) {
    var ClassVariable;

    ClassVariable = (function () {

        var LINE_TYPE = {
            INSERTS: "d2h-ins",
            ALL_NEW: "d2h-all-ins",

            DELETES: "d2h-del",
            ALL_DELETED: "d2h-all-del",

            INSERTS_AND_DELETES: "d2h-ins-and-del",
            CONTEXT: "d2h-cntx",

            INFO: "d2h-info"
        };

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

        /*
         * Generates pretty side by side html from a json object
         */
        Diff2Html.prototype.getPrettySideBySideHtmlFromJson = function (diffJson) {
            return generateSideBySideJsonHtml(diffJson);
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

                var values;
                if (values = /^(@@ -(\d+),(\d+) \+(\d+),(\d+) @@).*/.exec(line)) {
                    oldLine = values[2];
                    newLine = values[4];
                } else {
                    oldLine = 0;
                    newLine = 0;
                }

                /* create block metadata */
                currentBlock = {};
                currentBlock.lines = [];
                currentBlock.oldStartLine = oldLine;
                currentBlock.newStartLine = newLine;
                currentBlock.header = line;
            };

            var createLine = function (line) {
                /* Line Types */
                var isLineWithInserts = /{\+.*?\+}/.exec(line);
                var isNewLine = /^{\+.*?\+}$/.exec(line);

                var isLineWithDeletes = /\[-.*?-\]/.exec(line);
                var isRemovedLine = /^\[-.*?-\]$/.exec(line);

                var isLineWithBoth = isLineWithInserts && isLineWithDeletes;
                var isContextLine = !isLineWithInserts && !isLineWithDeletes;

                var currentLine = {};
                currentLine.content = line;

                /* fill the line data */
                if (isLineWithBoth) {
                    currentFile.deletedLines++;
                    currentFile.addedLines++;

                    currentLine.type = LINE_TYPE.INSERTS_AND_DELETES;
                    currentLine.oldNumber = oldLine++;
                    currentLine.newNumber = newLine++;

                    currentBlock.lines.push(currentLine);

                } else if (isContextLine) {

                    currentLine.type = LINE_TYPE.CONTEXT;
                    currentLine.oldNumber = oldLine++;
                    currentLine.newNumber = newLine++;

                    currentBlock.lines.push(currentLine);

                } else if (isNewLine) {
                    currentFile.addedLines++;

                    currentLine.type = LINE_TYPE.ALL_NEW;
                    currentLine.oldNumber = null;
                    currentLine.newNumber = newLine++;

                    currentBlock.lines.push(currentLine);

                } else if (isRemovedLine) {
                    currentFile.deletedLines++;

                    currentLine.type = LINE_TYPE.ALL_DELETED;
                    currentLine.oldNumber = oldLine++;
                    currentLine.newNumber = null;

                    currentBlock.lines.push(currentLine);

                } else if (isLineWithInserts) {
                    currentFile.addedLines++;

                    currentLine.type = LINE_TYPE.INSERTS;
                    currentLine.oldNumber = oldLine++;
                    currentLine.newNumber = newLine++;

                    currentBlock.lines.push(currentLine);

                } else if (isLineWithDeletes) {
                    currentFile.deletedLines++;

                    currentLine.type = LINE_TYPE.DELETES;
                    currentLine.oldNumber = oldLine++;
                    currentLine.newNumber = newLine++;

                    currentBlock.lines.push(currentLine);

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

        /*
         * Line By Line HTML
         */

        var generateJsonHtml = function (diffFiles) {
            return "<div class=\"d2h-wrapper\">\n" +
                diffFiles.map(function (file) {
                    return "<div class=\"d2h-file-wrapper\">\n" +
                        "     <div class=\"d2h-file-header\">\n" +
                        "       <div class=\"d2h-file-stats\">\n" +
                        "         <span class=\"d2h-lines-added\">+" + file.addedLines + "</span>\n" +
                        "         <span class=\"d2h-lines-deleted\">-" + file.deletedLines + "</span>\n" +
                        "       </div>\n" +
                        "       <div class=\"d2h-file-name\">" + getDiffName(file.oldName, file.newName) + "</div>\n" +
                        "     </div>\n" +
                        "     <div class=\"d2h-file-diff\">\n" +
                        "       <div class=\"d2h-code-wrapper\">\n" +
                        "         <table class=\"d2h-diff-table\">\n" +
                        "           <tbody class=\"d2h-diff-tbody\">\n" +
                        "         " + generateFileHtml(file) +
                        "           </tbody>\n" +
                        "         </table>\n" +
                        "       </div>\n" +
                        "     </div>\n" +
                        "   </div>\n";
                }).join("\n") +
                "</div>\n";
        };

        var generateFileHtml = function (file) {
            return file.blocks.map(function (block) {

                return "<tr>\n" +
                    "  <td class=\"d2h-code-linenumber " + LINE_TYPE.INFO + "\" colspan=\"2\"></td>\n" +
                    "  <td class=\"" + LINE_TYPE.INFO + "\">" +
                    "    <div class=\"d2h-code-line " + LINE_TYPE.INFO + "\">" + escape(block.header) + "</div>" +
                    "  </td>\n" +
                    "</tr>\n" +

                    block.lines.map(function (line) {

                        var newLine = function () {
                            var lineData = {};
                            lineData.oldLine = valueOrEmpty(line.oldNumber);
                            lineData.newLine = valueOrEmpty(line.newNumber);

                            return lineData;
                        };

                        var escapedLine = escape(line.content);

                        var lines = [];
                        var lineData = {};

                        switch (line.type) {
                            case LINE_TYPE.INSERTS:
                            case LINE_TYPE.ALL_NEW:
                                lineData = newLine();
                                lineData.content = generateLineInsertions(escapedLine);
                                lineData.type = LINE_TYPE.INSERTS;
                                lines.push(lineData);
                                break;
                            case LINE_TYPE.DELETES:
                            case LINE_TYPE.ALL_DELETED:
                                lineData = newLine();
                                lineData.content = generateLineDeletions(escapedLine);
                                lineData.type = LINE_TYPE.DELETES;
                                lines.push(lineData);
                                break;
                            case LINE_TYPE.INSERTS_AND_DELETES:
                                lineData = newLine();
                                lineData.content = generateLineDeletions(escapedLine);
                                lineData.type = LINE_TYPE.DELETES;
                                lines.push(lineData);

                                lineData = newLine();
                                lineData.content = generateLineInsertions(escapedLine);
                                lineData.type = LINE_TYPE.INSERTS;
                                lines.push(lineData);
                                break;
                            default:
                                lineData = newLine();
                                lineData.content = escapedLine;
                                lineData.type = LINE_TYPE.CONTEXT;
                                lines.push(lineData);
                                break;
                        }

                        return lines.map(generateLineHtml).join("\n");
                    }).join("\n");
            }).join("\n");
        };

        var generateLineHtml = function (line) {
            return "<tr>\n" +
                "  <td class=\"d2h-code-linenumber " + line.type + "\">" +
                "    <div class=\"line-num1\">" + line.oldLine + "</div>" +
                "    <div class=\"line-num2\">" + line.newLine + "</div>" +
                "  </td>\n" +
                "  <td class=\"" + line.type + "\">" +
                "    <div class=\"d2h-code-line " + line.type + "\">" + line.content + "</div>" +
                "  </td>\n" +
                "</tr>\n";
        };

        /*
         * Side By Side HTML (work in progress)
         */

        var generateSideBySideJsonHtml = function (diffFiles) {
            return "<div class=\"d2h-wrapper\">\n" +
                diffFiles.map(function (file) {
                    return "<div class=\"d2h-file-wrapper\">\n" +
                        "     <div class=\"d2h-file-header\">\n" +
                        "       <div class=\"d2h-file-stats\">\n" +
                        "         <span class=\"d2h-lines-added\">+" + file.addedLines + "</span>\n" +
                        "         <span class=\"d2h-lines-deleted\">-" + file.deletedLines + "</span>\n" +
                        "       </div>\n" +
                        "       <div class=\"d2h-file-name\">" + getDiffName(file.oldName, file.newName) + "</div>\n" +
                        "     </div>\n" +
                        "     <div class=\"d2h-files-diff\">\n" +
                        "       <div class=\"d2h-file-side-diff\">\n" +
                        "         <div class=\"d2h-code-wrapper\">\n" +
                        "           <table class=\"d2h-diff-table\">\n" +
                        "             <tbody class=\"d2h-diff-tbody\">\n" +
                        "           " + generateLeftSideFileHtml(file) +
                        "             </tbody>\n" +
                        "           </table>\n" +
                        "         </div>\n" +
                        "       </div>\n" +
                        "       <div class=\"d2h-file-side-diff\">\n" +
                        "         <div class=\"d2h-code-wrapper\">\n" +
                        "           <table class=\"d2h-diff-table\">\n" +
                        "             <tbody class=\"d2h-diff-tbody\">\n" +
                        "           " + generateRightSideFileHtml(file) +
                        "             </tbody>\n" +
                        "           </table>\n" +
                        "         </div>\n" +
                        "       </div>\n" +
                        "     </div>\n" +
                        "   </div>\n";
                }).join("\n") +
                "</div>\n";
        };

        var generateLeftSideFileHtml = function (file) {
            return file.blocks.map(function (block) {

                return "<tr>\n" +
                    "  <td class=\"d2h-code-side-linenumber " + LINE_TYPE.INFO + "\"></td>\n" +
                    "  <td class=\"" + LINE_TYPE.INFO + "\" colspan=\"3\">" +
                    "    <div class=\"d2h-code-side-line " + LINE_TYPE.INFO + "\">" + escape(block.header) + "</div>" +
                    "  </td>\n" +
                    "</tr>\n" +

                    block.lines.map(function (line) {

                        var emptyLine = function () {
                            var lineData = {};
                            lineData.number = "";
                            lineData.content = "";
                            lineData.type = LINE_TYPE.CONTEXT;

                            return lineData;
                        };

                        var escapedLine = escape(line.content);

                        var lines = [];
                        var lineData = {};

                        switch (line.type) {
                            case LINE_TYPE.INSERTS:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.oldNumber);
                                lineData.content = removeInserts(escapedLine);
                                lineData.type = LINE_TYPE.CONTEXT;
                                lines.push(lineData);
                                break;
                            case LINE_TYPE.ALL_NEW:
                                lines.push(new emptyLine());
                                break;
                            case LINE_TYPE.DELETES:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.oldNumber);
                                lineData.content = generateLineDeletions(escapedLine);
                                lineData.type = LINE_TYPE.DELETES;
                                lines.push(lineData);
                                break;
                            case LINE_TYPE.ALL_DELETED:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.oldNumber);
                                lineData.content = generateLineDeletions(escapedLine);
                                lineData.type = LINE_TYPE.DELETES;
                                lines.push(lineData);
                                break;
                            case LINE_TYPE.INSERTS_AND_DELETES:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.oldNumber);
                                lineData.content = generateLineDeletions(escapedLine);
                                lineData.type = LINE_TYPE.DELETES;
                                lines.push(lineData);
                                break;
                            default:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.oldNumber);
                                lineData.content = escapedLine;
                                lineData.type = LINE_TYPE.CONTEXT;
                                lines.push(lineData);
                                break;
                        }

                        return "<tr>\n" + lines.map(generateSingleLineHtml).join("\n") + "</tr>\n";
                    }).join("\n");
            }).join("\n");
        };

        var generateRightSideFileHtml = function (file) {
            return file.blocks.map(function (block) {

                return "<tr>\n" +
                    "  <td class=\"d2h-code-side-linenumber " + LINE_TYPE.INFO + "\"></td>\n" +
                    "  <td class=\"" + LINE_TYPE.INFO + "\" colspan=\"3\">" +
                    "    <div class=\"d2h-code-side-line " + LINE_TYPE.INFO + "\">" + escape(block.header) + "</div>" +
                    "  </td>\n" +
                    "</tr>\n" +

                    block.lines.map(function (line) {

                        var emptyLine = function () {
                            var lineData = {};
                            lineData.number = "";
                            lineData.content = "";
                            lineData.type = LINE_TYPE.CONTEXT;

                            return lineData;
                        };

                        var escapedLine = escape(line.content);

                        var lines = [];
                        var lineData = {};

                        switch (line.type) {
                            case LINE_TYPE.INSERTS:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.newNumber);
                                lineData.content = generateLineInsertions(escapedLine);
                                lineData.type = LINE_TYPE.INSERTS;
                                lines.push(lineData);
                                break;
                            case LINE_TYPE.ALL_NEW:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.newNumber);
                                lineData.content = generateLineInsertions(escapedLine);
                                lineData.type = LINE_TYPE.INSERTS;
                                lines.push(lineData);
                                break;
                            case LINE_TYPE.DELETES:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.newNumber);
                                lineData.content = removeDeletes(escapedLine);
                                lineData.type = LINE_TYPE.CONTEXT;
                                lines.push(lineData);
                                break;
                            case LINE_TYPE.ALL_DELETED:
                                lines.push(new emptyLine());
                                break;
                            case LINE_TYPE.INSERTS_AND_DELETES:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.newNumber);
                                lineData.content = generateLineInsertions(escapedLine);
                                lineData.type = LINE_TYPE.INSERTS;
                                lines.push(lineData);
                                break;
                            default:
                                lineData = {};
                                lineData.number = valueOrEmpty(line.newNumber);
                                lineData.content = escapedLine;
                                lineData.type = LINE_TYPE.CONTEXT;
                                lines.push(lineData);
                                break;
                        }

                        return "<tr>\n" + lines.map(generateSingleLineHtml).join("\n") + "</tr>\n";
                    }).join("\n");
            }).join("\n");
        };

        var generateSingleLineHtml = function (line) {
            return "<td class=\"d2h-code-side-linenumber " + line.type + "\">" + line.number + "</td>\n" +
                "   <td class=\"" + line.type + "\">" +
                "     <div class=\"d2h-code-side-line " + line.type + "\">" + line.content + "</div>" +
                "   </td>\n";
        };

        /*
         * HTML Helpers
         */

        var getDiffName = function (oldFilename, newFilename) {
            return oldFilename === newFilename ? newFilename : oldFilename + " -> " + newFilename;
        };

        var generateLineInsertions = function (line) {
            return line.slice(0).replace(/(\[-.*?-\])/g, "").
                replace(/({\+(.*?)\+})/g, "<ins>$2</ins>");
        };

        var generateLineDeletions = function (line) {
            return line.slice(0).replace(/({\+.*?\+})/g, "").
                replace(/(\[-(.*?)-\])/g, "<del>$2</del>");
        };

        var removeDeletes = function (line) {
            return line.slice(0).replace(/({\+.*?\+})/g, "").
                replace(/(\[-.*?-\])/g, "");
        };

        var removeInserts = function (line) {
            return line.slice(0).replace(/({\+.*?\+})/g, "").
                replace(/(\[-.*?-\])/g, "");
        };

        var cleanLine = function (line) {
            return line.slice(0).replace(/({\+(.*?)\+})/g, "$2").
                replace(/(\[-(.*?)-\])/g, "$2");
        };

        /*
         * Utils
         */

        function escape(str) {
            return str.slice(0)
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
