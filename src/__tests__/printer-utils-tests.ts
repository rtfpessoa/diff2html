import * as renderUtils from "../render-utils";
import { DiffStyleType, LineMatchingType } from "../types";

describe("Utils", function() {
  describe("getHtmlId", function() {
    it("should generate file unique id", function() {
      const result = renderUtils.getHtmlId({
        oldName: "sample.js",
        newName: "sample.js"
      });
      expect("d2h-960013").toEqual(result);
    });
    it("should generate file unique id for empty hashes", function() {
      const result = renderUtils.getHtmlId({
        oldName: "sample.js",
        newName: "sample.js"
      });
      expect("d2h-960013").toEqual(result);
    });
  });

  describe("getDiffName", function() {
    it("should generate the file name for a changed file", function() {
      const result = renderUtils.filenameDiff({
        oldName: "sample.js",
        newName: "sample.js"
      });
      expect("sample.js").toEqual(result);
    });
    it("should generate the file name for a changed file and full rename", function() {
      const result = renderUtils.filenameDiff({
        oldName: "sample1.js",
        newName: "sample2.js"
      });
      expect("sample1.js → sample2.js").toEqual(result);
    });
    it("should generate the file name for a changed file and prefix rename", function() {
      const result = renderUtils.filenameDiff({
        oldName: "src/path/sample.js",
        newName: "source/path/sample.js"
      });
      expect("{src → source}/path/sample.js").toEqual(result);
    });
    it("should generate the file name for a changed file and suffix rename", function() {
      const result = renderUtils.filenameDiff({
        oldName: "src/path/sample1.js",
        newName: "src/path/sample2.js"
      });
      expect("src/path/{sample1.js → sample2.js}").toEqual(result);
    });
    it("should generate the file name for a changed file and middle rename", function() {
      const result = renderUtils.filenameDiff({
        oldName: "src/really/big/path/sample.js",
        newName: "src/small/path/sample.js"
      });
      expect("src/{really/big → small}/path/sample.js").toEqual(result);
    });
    it("should generate the file name for a deleted file", function() {
      const result = renderUtils.filenameDiff({
        oldName: "src/my/file.js",
        newName: "/dev/null"
      });
      expect("src/my/file.js").toEqual(result);
    });
    it("should generate the file name for a new file", function() {
      const result = renderUtils.filenameDiff({
        oldName: "/dev/null",
        newName: "src/my/file.js"
      });
      expect("src/my/file.js").toEqual(result);
    });
  });

  describe("diffHighlight", function() {
    it("should highlight two lines", function() {
      const result = renderUtils.diffHighlight("-var myVar = 2;", "+var myVariable = 3;", false, {
        matching: LineMatchingType.WORDS
      });

      expect(result).toEqual({
        oldLine: {
          prefix: "-",
          content: "var <del>myVar</del> = <del>2</del>;"
        },
        newLine: {
          prefix: "+",
          content: "var <ins>myVariable</ins> = <ins>3</ins>;"
        }
      });
    });
    it("should highlight two lines char by char", function() {
      const result = renderUtils.diffHighlight("-var myVar = 2;", "+var myVariable = 3;", false, {
        diffStyle: DiffStyleType.CHAR
      });

      expect({
        oldLine: {
          prefix: "-",
          content: "var myVar = <del>2</del>;"
        },
        newLine: {
          prefix: "+",
          content: "var myVar<ins>iable</ins> = <ins>3</ins>;"
        }
      }).toEqual(result);
    });
    it("should highlight combined diff lines", function() {
      const result = renderUtils.diffHighlight(" -var myVar = 2;", " +var myVariable = 3;", true, {
        diffStyle: DiffStyleType.WORD,
        matching: LineMatchingType.WORDS,
        matchWordsThreshold: 1.0
      });

      expect({
        oldLine: {
          prefix: " -",
          content: 'var <del class="d2h-change">myVar</del> = <del class="d2h-change">2</del>;'
        },
        newLine: {
          prefix: " +",
          content: 'var <ins class="d2h-change">myVariable</ins> = <ins class="d2h-change">3</ins>;'
        }
      }).toEqual(result);
    });
  });
});
