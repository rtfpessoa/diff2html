/*
 *
 * FileListPrinter (file-list-printer.js)
 * Author: nmatpt
 *
 */

(function() {

  var printerUtils = require('./printer-utils.js').PrinterUtils;

  var hoganUtils = require('./hoganjs-utils.js').HoganJsUtils;
  var baseTemplatesPath = 'file-summary';

  function FileListPrinter() {
  }

  FileListPrinter.prototype.generateFileList = function(diffFiles) {
    var files = diffFiles.map(function(file) {
      return hoganUtils.render(baseTemplatesPath, 'line', {
        fileHtmlId: printerUtils.getHtmlId(file),
        fileName: printerUtils.getDiffName(file),
        deletedLines: '-' + file.deletedLines,
        addedLines: '+' + file.addedLines
      });
    }).join('\n');

    return hoganUtils.render(baseTemplatesPath, 'wrapper', {
      filesNumber: diffFiles.length,
      files: files
    });
  };

  module.exports.FileListPrinter = new FileListPrinter();

})();
