const HoganJsUtils = new (require("../hoganjs-utils.js")).HoganJsUtils();
const diffParser = require("../diff-parser.js").DiffParser;

describe("HoganJsUtils", function() {
  describe("render", function() {
    const emptyDiffHtml =
      "<tr>\n" +
      '    <td class="d2h-info">\n' +
      '        <div class="d2h-code-line d2h-info">\n' +
      "            File without changes\n" +
      "        </div>\n" +
      "    </td>\n" +
      "</tr>";

    it("should render view", function() {
      const result = HoganJsUtils.render("generic", "empty-diff", {
        contentClass: "d2h-code-line",
        diffParser: diffParser
      });
      expect(emptyDiffHtml).toEqual(result);
    });

    it("should render view without cache", function() {
      const result = HoganJsUtils.render(
        "generic",
        "empty-diff",
        {
          contentClass: "d2h-code-line",
          diffParser: diffParser
        },
        { noCache: true }
      );
      expect(emptyDiffHtml).toEqual(result);
    });

    it("should return null if template is missing", function() {
      const hoganUtils = new (require("../hoganjs-utils.js")).HoganJsUtils({ noCache: true });
      const result = hoganUtils.render("generic", "missing-template", {});
      expect(null).toEqual(result);
    });

    it("should allow templates to be overridden with compiled templates", function() {
      const emptyDiffTemplate = HoganJsUtils.compile("<p>{{myName}}</p>");

      const config = { templates: { "generic-empty-diff": emptyDiffTemplate } };
      const hoganUtils = new (require("../hoganjs-utils.js")).HoganJsUtils(config);
      const result = hoganUtils.render("generic", "empty-diff", { myName: "Rodrigo Fernandes" });
      expect("<p>Rodrigo Fernandes</p>").toEqual(result);
    });

    it("should allow templates to be overridden with uncompiled templates", function() {
      const emptyDiffTemplate = "<p>{{myName}}</p>";

      const config = { rawTemplates: { "generic-empty-diff": emptyDiffTemplate } };
      const hoganUtils = new (require("../hoganjs-utils.js")).HoganJsUtils(config);
      const result = hoganUtils.render("generic", "empty-diff", { myName: "Rodrigo Fernandes" });
      expect("<p>Rodrigo Fernandes</p>").toEqual(result);
    });

    it("should allow templates to be overridden giving priority to compiled templates", function() {
      const emptyDiffTemplate = HoganJsUtils.compile("<p>{{myName}}</p>");
      const emptyDiffTemplateUncompiled = "<p>Not used!</p>";

      const config = {
        templates: { "generic-empty-diff": emptyDiffTemplate },
        rawTemplates: { "generic-empty-diff": emptyDiffTemplateUncompiled }
      };
      const hoganUtils = new (require("../hoganjs-utils.js")).HoganJsUtils(config);
      const result = hoganUtils.render("generic", "empty-diff", { myName: "Rodrigo Fernandes" });
      expect("<p>Rodrigo Fernandes</p>").toEqual(result);
    });
  });
});
