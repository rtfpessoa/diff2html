var assert = require('assert');

var HoganJsUtils = new (require('../src/hoganjs-utils.js').HoganJsUtils)();
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
      assert.equal(emptyDiffHtml, result);
    });

    it('should return null if template is missing', function() {
      var hoganUtils = new (require('../src/hoganjs-utils.js').HoganJsUtils)({noCache: true});
      var result = hoganUtils.render('generic', 'missing-template', {});
      assert.equal(null, result);
    });

    it('should allow templates to be overridden with compiled templates', function() {
      var emptyDiffTemplate = HoganJsUtils.compile('<p>{{myName}}</p>');

      var config = {templates: {'generic-empty-diff': emptyDiffTemplate}};
      var hoganUtils = new (require('../src/hoganjs-utils.js').HoganJsUtils)(config);
      var result = hoganUtils.render('generic', 'empty-diff', {myName: 'Rodrigo Fernandes'});
      assert.equal('<p>Rodrigo Fernandes</p>', result);
    });

    it('should allow templates to be overridden with uncompiled templates', function() {
      var emptyDiffTemplate = '<p>{{myName}}</p>';

      var config = {rawTemplates: {'generic-empty-diff': emptyDiffTemplate}};
      var hoganUtils = new (require('../src/hoganjs-utils.js').HoganJsUtils)(config);
      var result = hoganUtils.render('generic', 'empty-diff', {myName: 'Rodrigo Fernandes'});
      assert.equal('<p>Rodrigo Fernandes</p>', result);
    });

    it('should allow templates to be overridden giving priority to compiled templates', function() {
      var emptyDiffTemplate = HoganJsUtils.compile('<p>{{myName}}</p>');
      var emptyDiffTemplateUncompiled = '<p>Not used!</p>';

      var config = {
        templates: {'generic-empty-diff': emptyDiffTemplate},
        rawTemplates: {'generic-empty-diff': emptyDiffTemplateUncompiled}
      };
      var hoganUtils = new (require('../src/hoganjs-utils.js').HoganJsUtils)(config);
      var result = hoganUtils.render('generic', 'empty-diff', {myName: 'Rodrigo Fernandes'});
      assert.equal('<p>Rodrigo Fernandes</p>', result);
    });
  });
});
