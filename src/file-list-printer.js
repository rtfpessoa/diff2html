/*
 *
 * FileListPrinter (file-list-printer.js)
 * Author: nmatpt
 *
 */

(function() {

  var printerUtils = require('./printer-utils.js').PrinterUtils;
  var utils = require('./utils.js').Utils;

  function FileListPrinter() {
  }

  FileListPrinter.prototype.generateFileList = function(diffFiles) {
    var hideId = utils.getRandomId('d2h-hide'); // Necessary if there are 2 elements like this in the same page
    var showId = utils.getRandomId('d2h-show');
    return '<div class="d2h-file-list-wrapper">\n' +
      '     <div class="d2h-file-list-header">Files changed (' + diffFiles.length + ')&nbsp&nbsp</div>\n' +
      '     <a id="' + hideId + '" class="d2h-hide" href="#' + hideId + '">+</a>\n' +
      '     <a id="' + showId + 'd2h-show" class="d2h-show" href="#' + showId + '">-</a>\n' +
      '     <div class="d2h-clear"></div>\n' +
      '     <table class="d2h-file-list">\n' +


      diffFiles.map(function(file) {
        return '     <tr class="d2h-file-list-line">\n' +
          '       <td class="d2h-lines-added">\n' +
          '         <span>+' + file.addedLines + '</span>\n' +
          '       </td>\n' +
          '       <td class="d2h-lines-deleted">\n' +
          '         <span>-' + file.deletedLines + '</span>\n' +
          '       </td>\n' +
          '       <td class="d2h-file-name"><a href="#' + printerUtils.getHtmlId(file) + '">' +
          '&nbsp;' + printerUtils.getDiffName(file) + '</a></td>\n' +
          '     </tr>\n';
      }).join('\n') +
      '</table></div>\n';
  };

  module.exports.FileListPrinter = new FileListPrinter();

})();
