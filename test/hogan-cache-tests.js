var assert = require('assert');

var HoganJsUtils = require('../src/hoganjs-utils.js').HoganJsUtils;

describe('HoganJsUtils', function() {
  describe('render', function() {
    var emptyDiffHtml =
      '<tr>\n' +
      '    <td class="">\n' +
      '        <div class="d2h-code-line ">\n' +
      '            File without changes\n' +
      '        </div>\n' +
      '    </td>\n' +
      '</tr>';

    it('should render view', function() {
      var result = HoganJsUtils.render('line-by-line', 'empty-diff', {});
      assert.equal(emptyDiffHtml, result);
    });
    it('should render view without cache', function() {
      var result = HoganJsUtils.render('line-by-line', 'empty-diff', {}, {noCache: true});
      assert.equal(emptyDiffHtml + '\n', result);
    });
    it('should return null if template is missing', function() {
      var result = HoganJsUtils.render('line-by-line', 'missing-template', {}, {noCache: true});
      assert.equal(null, result);
    });
  });
});
