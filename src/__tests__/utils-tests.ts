import { escapeForRegExp, unifyPath, hashCode } from "../utils";

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
