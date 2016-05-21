var assert = require('assert');

var HoganJsUtils = require('../src/hoganjs-utils.js').HoganJsUtils;
var diffParser = require('../src/diff-parser.js').DiffParser;

describe('HoganJsUtils', function() {
  describe('render', function() {
    var emptyDiffHtml =
      '<tr>\n' +
      '    <td class="d2h-info">\n' +
      '        <div class="d2h-code-line d2h-info">\n' +
      '            File without changes\n' +
      '        </div>\n' +
      '    </td>\n' +
      '</tr>';

    it('should render view', function() {
      var result = HoganJsUtils.render('generic', 'empty-diff', {
        contentClass: 'd2h-code-line',
        diffParser: diffParser
      });
      assert.equal(emptyDiffHtml, result);
    });
    it('should render view without cache', function() {
      var result = HoganJsUtils.render('generic', 'empty-diff', {
        contentClass: 'd2h-code-line',
        diffParser: diffParser
      }, {noCache: true});
      assert.equal(emptyDiffHtml + '\n', result);
    });
    it('should return null if template is missing', function() {
      var result = HoganJsUtils.render('generic', 'missing-template', {}, {noCache: true});
      assert.equal(null, result);
    });
  });
});
