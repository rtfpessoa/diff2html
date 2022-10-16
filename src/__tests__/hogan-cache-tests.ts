import HoganJsUtils from '../hoganjs-utils';
import { CSSLineClass } from '../render-utils';

describe('HoganJsUtils', () => {
  describe('render', () => {
    it('should render view', () => {
      const hoganJsUtils = new HoganJsUtils({});
      const result = hoganJsUtils.render('generic', 'empty-diff', {
        contentClass: 'd2h-code-line',
        CSSLineClass: CSSLineClass,
      });
      expect(result).toMatchInlineSnapshot(`
        "<tr>
            <td class="d2h-info">
                <div class="d2h-code-line">
                    File without changes
                </div>
            </td>
        </tr>"
      `);
    });

    it('should throw exception if template is missing', () => {
      const hoganJsUtils = new HoganJsUtils({});
      expect(() => hoganJsUtils.render('generic', 'missing-template', {})).toThrow(Error);
    });

    it('should allow templates to be overridden with compiled templates', () => {
      const emptyDiffTemplate = HoganJsUtils.compile('<p>{{myName}}</p>');
      const hoganJsUtils = new HoganJsUtils({ compiledTemplates: { 'generic-empty-diff': emptyDiffTemplate } });

      const result = hoganJsUtils.render('generic', 'empty-diff', { myName: 'Rodrigo Fernandes' });
      expect(result).toMatchInlineSnapshot(`"<p>Rodrigo Fernandes</p>"`);
    });

    it('should allow templates to be overridden with uncompiled templates', () => {
      const emptyDiffTemplate = '<p>{{myName}}</p>';
      const hoganJsUtils = new HoganJsUtils({ rawTemplates: { 'generic-empty-diff': emptyDiffTemplate } });

      const result = hoganJsUtils.render('generic', 'empty-diff', { myName: 'Rodrigo Fernandes' });
      expect(result).toMatchInlineSnapshot(`"<p>Rodrigo Fernandes</p>"`);
    });

    it('should allow templates to be overridden giving priority to raw templates', () => {
      const emptyDiffTemplate = HoganJsUtils.compile('<p>Not used!</p>');
      const emptyDiffTemplateUncompiled = '<p>{{myName}}</p>';
      const hoganJsUtils = new HoganJsUtils({
        compiledTemplates: { 'generic-empty-diff': emptyDiffTemplate },
        rawTemplates: { 'generic-empty-diff': emptyDiffTemplateUncompiled },
      });

      const result = hoganJsUtils.render('generic', 'empty-diff', { myName: 'Rodrigo Fernandes' });
      expect(result).toMatchInlineSnapshot(`"<p>Rodrigo Fernandes</p>"`);
    });
  });
});
