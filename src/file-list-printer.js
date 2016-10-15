/*
 *
 * FileListPrinter (file-list-printer.js)
 * Author: nmatpt
 *
 */

(function() {
  var printerUtils = require('./printer-utils.js').PrinterUtils;

  var hoganUtils;

  var baseTemplatesPath = 'file-summary';
  var iconsBaseTemplatesPath = 'icon';

  function FileListPrinter(config) {
    this.config = config;

    var HoganJsUtils = require('./hoganjs-utils.js').HoganJsUtils;
    hoganUtils = new HoganJsUtils(config);
  }

  FileListPrinter.prototype.generateFileList = function(diffFiles) {
    var lineTemplate = hoganUtils.template(baseTemplatesPath, 'line');

    var files = diffFiles.map(function(file) {
      var fileTypeName = printerUtils.getFileTypeIcon(file);
      var iconTemplate = hoganUtils.template(iconsBaseTemplatesPath, fileTypeName);

      return lineTemplate.render({
        fileHtmlId: printerUtils.getHtmlId(file),
        fileName: printerUtils.getDiffName(file),
        deletedLines: '-' + file.deletedLines,
        addedLines: '+' + file.addedLines
      }, {
        fileIcon: iconTemplate
      });
    }).join('\n');

    return hoganUtils.render(baseTemplatesPath, 'wrapper', {
      filesNumber: diffFiles.length,
      files: files
    });
  };

  module.exports.FileListPrinter = FileListPrinter;
})();
