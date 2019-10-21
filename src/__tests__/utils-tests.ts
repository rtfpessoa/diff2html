import { escapeForRegExp, escapeForHtml, unifyPath, hashCode } from "../utils";

describe("Utils", () => {
  describe("escapeForRegExp", () => {
    it("should escape markdown link text", () => {
      const result = escapeForRegExp("[Link](https://diff2html.xyz)");
      expect(result).toEqual("\\[Link\\]\\(https:\\/\\/diff2html\\.xyz\\)");
    });
    it("should escape all dangerous characters", () => {
      const result = escapeForRegExp("-[]/{}()*+?.\\^$|");
      expect(result).toEqual("\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\\\\\^\\$\\|");
    });
  });

  describe("escapeForHtml", () => {
    it("should escape & with &amp;", () => {
      const result = escapeForHtml("&");
      expect(result).toEqual("&amp;");
    });
    it("should escape < with &lt;", () => {
      const result = escapeForHtml("<");
      expect(result).toEqual("&lt;");
    });
    it("should escape > with &gt;", () => {
      const result = escapeForHtml(">");
      expect(result).toEqual("&gt;");
    });
    it('should escape " with &quot;', () => {
      const result = escapeForHtml('"');
      expect(result).toEqual("&quot;");
    });
    it("should escape ' with &#x27;", () => {
      const result = escapeForHtml("'");
      expect(result).toEqual("&#x27;");
    });
    it("should escape / with &#x2F;", () => {
      const result = escapeForHtml("/");
      expect(result).toEqual("&#x2F;");
    });
    it("should escape a string containing HTML code", () => {
      const result = escapeForHtml(`<a href="/search?q=diff2html">Search 'Diff2Html'</a>`);
      expect(result).toEqual(
        "&lt;a href=&quot;&#x2F;search?q=diff2html&quot;&gt;Search &#x27;Diff2Html&#x27;&lt;&#x2F;a&gt;"
      );
    });

    describe("unifyPath", () => {
      it("should unify windows style path", () => {
        const result = unifyPath("\\Users\\Downloads\\diff.html");
        expect(result).toEqual("/Users/Downloads/diff.html");
      });
    });

    describe("hashCode", () => {
      it("should create consistent hash for a text piece", () => {
        const string = "/home/diff2html/diff.html";
        expect(hashCode(string)).toEqual(hashCode(string));
      });
      it("should create different hash for different text pieces", () => {
        expect(hashCode("/home/diff2html/diff1.html")).not.toEqual(hashCode("/home/diff2html/diff2.html"));
      });
    });
  });
});
