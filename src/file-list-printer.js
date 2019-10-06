/*
 *
 * FileListPrinter (file-list-printer.js)
 * Author: nmatpt
 *
 */

(function() {
  const printerUtils = require("./printer-utils.js").PrinterUtils;

  let hoganUtils;

  const baseTemplatesPath = "file-summary";
  const iconsBaseTemplatesPath = "icon";

  function FileListPrinter(config) {
    this.config = config;

    const HoganJsUtils = require("./hoganjs-utils.js").HoganJsUtils;
    hoganUtils = new HoganJsUtils(config);
  }

  FileListPrinter.prototype.generateFileList = function(diffFiles) {
    const lineTemplate = hoganUtils.template(baseTemplatesPath, "line");

    const files = diffFiles
      .map(function(file) {
        const fileTypeName = printerUtils.getFileTypeIcon(file);
        const iconTemplate = hoganUtils.template(iconsBaseTemplatesPath, fileTypeName);

        return lineTemplate.render(
          {
            fileHtmlId: printerUtils.getHtmlId(file),
            oldName: file.oldName,
            newName: file.newName,
            fileName: printerUtils.getDiffName(file),
            deletedLines: "-" + file.deletedLines,
            addedLines: "+" + file.addedLines
          },
          {
            fileIcon: iconTemplate
          }
        );
      })
      .join("\n");

    return hoganUtils.render(baseTemplatesPath, "wrapper", {
      filesNumber: diffFiles.length,
      files: files
    });
  };

  module.exports.FileListPrinter = FileListPrinter;
})();
