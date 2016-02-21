/*
 *
 * FileListPrinter (file-list-printer.js)
 * Author: nmatpt
 *
 */

(function() {

  var printerUtils = require('./printer-utils.js').PrinterUtils;

  function FileListPrinter() {
  }

  FileListPrinter.prototype.generateFileList = function(diffFiles) {
    return '<div class="d2h-file-list-wrapper">\n' +
      '     <div class="d2h-file-list-header">\n' +
      '         <span class="d2h-file-list-title">Files changed (' + diffFiles.length + ')&nbsp&nbsp</span>\n' +
      '         <a class="d2h-file-switch d2h-hide">hide</a>\n' +
      '         <a class="d2h-file-switch d2h-show">show</a>\n' +
      '     </div>\n' +
      '     <table class="d2h-file-list">\n' +

      diffFiles.map(function(file) {
        return '     <tr class="d2h-file-list-line">\n' +
          '       <td class="d2h-lines-added">\n' +
          '         <span>+' + file.addedLines + '</span>\n' +
          '       </td>\n' +
          '       <td class="d2h-lines-deleted">\n' +
          '         <span>-' + file.deletedLines + '</span>\n' +
          '       </td>\n' +
          '       <td class="d2h-file-name-wrapper">\n' +
          '         <a href="#' + printerUtils.getHtmlId(file) + '" class="d2h-file-name">' +
          '&nbsp;' + printerUtils.getDiffName(file) +
          '         </a>\n' +
          '       </td>\n' +
          '     </tr>\n';
      }).join('\n') +
      '</table></div>\n';
  };

  module.exports.FileListPrinter = new FileListPrinter();

})();
