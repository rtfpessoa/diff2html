import { escapeForHtml, getHtmlId, filenameDiff, diffHighlight } from '../render-utils';
import { DiffStyleType, LineMatchingType } from '../types';

describe('Utils', () => {
  describe('escapeForHtml', () => {
    it('should escape & with &amp;', () => {
      const result = escapeForHtml('&');
      expect(result).toBe('&amp;');
    });
    it('should escape < with &lt;', () => {
      const result = escapeForHtml('<');
      expect(result).toBe('&lt;');
    });
    it('should escape > with &gt;', () => {
      const result = escapeForHtml('>');
      expect(result).toBe('&gt;');
    });
    it('should escape " with &quot;', () => {
      const result = escapeForHtml('"');
      expect(result).toBe('&quot;');
    });
    it("should escape ' with &#x27;", () => {
      const result = escapeForHtml("'");
      expect(result).toBe('&#x27;');
    });
    it('should escape / with &#x2F;', () => {
      const result = escapeForHtml('/');
      expect(result).toBe('&#x2F;');
    });
    it('should escape a string containing HTML code', () => {
      const result = escapeForHtml(`<a href="/search?q=diff2html">Search 'Diff2Html'</a>`);
      expect(result).toBe(
        '&lt;a href=&quot;&#x2F;search?q=diff2html&quot;&gt;Search &#x27;Diff2Html&#x27;&lt;&#x2F;a&gt;',
      );
    });
  });

  describe('getHtmlId', () => {
    it('should generate file unique id', () => {
      const result = getHtmlId({
        oldName: 'sample.js',
        newName: 'sample.js',
      });
      expect(result).toBe('d2h-960013');
    });
  });

  describe('getDiffName', () => {
    it('should generate the file name for a changed file', () => {
      const result = filenameDiff({
        oldName: 'sample.js',
        newName: 'sample.js',
      });
      expect(result).toBe('sample.js');
    });
    it('should generate the file name for a changed file and full rename', () => {
      const result = filenameDiff({
        oldName: 'sample1.js',
        newName: 'sample2.js',
      });
      expect(result).toBe('sample1.js → sample2.js');
    });
    it('should generate the file name for a changed file and prefix rename', () => {
      const result = filenameDiff({
        oldName: 'src/path/sample.js',
        newName: 'source/path/sample.js',
      });
      expect(result).toBe('{src → source}/path/sample.js');
    });
    it('should generate the file name for a changed file and suffix rename', () => {
      const result = filenameDiff({
        oldName: 'src/path/sample1.js',
        newName: 'src/path/sample2.js',
      });
      expect(result).toBe('src/path/{sample1.js → sample2.js}');
    });
    it('should generate the file name for a changed file and middle rename', () => {
      const result = filenameDiff({
        oldName: 'src/really/big/path/sample.js',
        newName: 'src/small/path/sample.js',
      });
      expect(result).toBe('src/{really/big → small}/path/sample.js');
    });
    it('should generate the file name for a deleted file', () => {
      const result = filenameDiff({
        oldName: 'src/my/file.js',
        newName: '/dev/null',
      });
      expect(result).toBe('src/my/file.js');
    });
    it('should generate the file name for a new file', () => {
      const result = filenameDiff({
        oldName: '/dev/null',
        newName: 'src/my/file.js',
      });
      expect(result).toBe('src/my/file.js');
    });
  });

  describe('diffHighlight', () => {
    it('should highlight two lines', () => {
      const result = diffHighlight('-var myVar = 2;', '+var myVariable = 3;', false, {
        matching: LineMatchingType.WORDS,
      });

      expect(result).toEqual({
        oldLine: {
          prefix: '-',
          content: 'var <del>myVar</del> = <del>2</del>;',
        },
        newLine: {
          prefix: '+',
          content: 'var <ins>myVariable</ins> = <ins>3</ins>;',
        },
      });
    });
    it('should highlight two lines char by char', () => {
      const result = diffHighlight('-var myVar = 2;', '+var myVariable = 3;', false, {
        diffStyle: DiffStyleType.CHAR,
      });

      expect(result).toEqual({
        oldLine: {
          prefix: '-',
          content: 'var myVar = <del>2</del>;',
        },
        newLine: {
          prefix: '+',
          content: 'var myVar<ins>iable</ins> = <ins>3</ins>;',
        },
      });
    });
    it('should highlight combined diff lines', () => {
      const result = diffHighlight(' -var myVar = 2;', ' +var myVariable = 3;', true, {
        diffStyle: DiffStyleType.WORD,
        matching: LineMatchingType.WORDS,
        matchWordsThreshold: 1.0,
      });

      expect(result).toEqual({
        oldLine: {
          prefix: ' -',
          content: 'var <del class="d2h-change">myVar</del> = <del class="d2h-change">2</del>;',
        },
        newLine: {
          prefix: ' +',
          content: 'var <ins class="d2h-change">myVariable</ins> = <ins class="d2h-change">3</ins>;',
        },
      });
    });
  });
});
