/*
 *
 * FileListPrinter (file-list-printer.js)
 * Author: nmatpt
 *
 */

(function (ctx, undefined) {

    var printerUtils = require('./printer-utils.js').PrinterUtils;
    var utils = require('./utils.js').Utils;

    function FileListPrinter() {
    }

    FileListPrinter.prototype.generateFileList = function (diffFiles) {
        var hideId = utils.getRandomId("d2h-hide");
        var showId = utils.getRandomId("d2h-show");
        return '<div class="d2h-file-list-wrapper">\n' +
            '     <div class="d2h-file-list-header">Files changed (' + diffFiles.length + ')&nbsp&nbsp</div>\n' +
            '     <a id="' + hideId + '" class="d2h-hide" href="#' + hideId + '">+</a>\n' +
            '     <a id="' + showId + 'd2h-show" class="d2h-show" href="#' + showId + '">-</a>\n' +
            '     <div class="d2h-clear"></div>\n' +
            '     <div class="d2h-file-list">\n' +


            diffFiles.map(function (file) {
                return '     <div class="d2h-file-list-line">\n' +
                    '       <div class="d2h-file-stats">\n' +
                    '         <span class="d2h-lines-added">+' + file.addedLines + '</span>\n' +
                    '         <span class="d2h-lines-deleted">-' + file.deletedLines + '</span>\n' +
                    '       </div>\n' +
                    '       <div class="d2h-file-name"><a href="#' + printerUtils.getHtmlId(file) + '">&nbsp;' + printerUtils.getDiffName(file) + '</a></div>\n' +
                    '     </div>\n'
            }).join('\n') +
            '</div></div>\n';
    };

    module.exports['FileListPrinter'] = new FileListPrinter();

})(this);
