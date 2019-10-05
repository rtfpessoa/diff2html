var assert = require('assert');

var PrinterUtils = require('../src/printer-utils.js').PrinterUtils;

describe('Utils', function() {
  describe('getHtmlId', function() {
    it('should generate file unique id', function() {
      var result = PrinterUtils.getHtmlId({
        oldName: 'sample.js',
        newName: 'sample.js'
      });
      assert.equal('d2h-960013', result);
    });
    it('should generate file unique id for empty hashes', function() {
      var result = PrinterUtils.getHtmlId({
        oldName: 'sample.js',
        newName: 'sample.js'
      });
      assert.equal('d2h-960013', result);
    });
  });

  describe('getDiffName', function() {
    it('should generate the file name for a changed file', function() {
      var result = PrinterUtils.getDiffName({
        oldName: 'sample.js',
        newName: 'sample.js'
      });
      assert.equal('sample.js', result);
    });
    it('should generate the file name for a changed file and full rename', function() {
      var result = PrinterUtils.getDiffName({
        oldName: 'sample1.js',
        newName: 'sample2.js'
      });
      assert.equal('sample1.js → sample2.js', result);
    });
    it('should generate the file name for a changed file and prefix rename', function() {
      var result = PrinterUtils.getDiffName({
        oldName: 'src/path/sample.js',
        newName: 'source/path/sample.js'
      });
      assert.equal('{src → source}/path/sample.js', result);
    });
    it('should generate the file name for a changed file and suffix rename', function() {
      var result = PrinterUtils.getDiffName({
        oldName: 'src/path/sample1.js',
        newName: 'src/path/sample2.js'
      });
      assert.equal('src/path/{sample1.js → sample2.js}', result);
    });
    it('should generate the file name for a changed file and middle rename', function() {
      var result = PrinterUtils.getDiffName({
        oldName: 'src/really/big/path/sample.js',
        newName: 'src/small/path/sample.js'
      });
      assert.equal('src/{really/big → small}/path/sample.js', result);
    });
    it('should generate the file name for a deleted file', function() {
      var result = PrinterUtils.getDiffName({
        oldName: 'src/my/file.js',
        newName: '/dev/null'
      });
      assert.equal('src/my/file.js', result);
    });
    it('should generate the file name for a new file', function() {
      var result = PrinterUtils.getDiffName({
        oldName: '/dev/null',
        newName: 'src/my/file.js'
      });
      assert.equal('src/my/file.js', result);
    });
    it('should generate handle undefined filename', function() {
      var result = PrinterUtils.getDiffName({});
      assert.equal('unknown/file/path', result);
    });
  });

  describe('diffHighlight', function() {
    it('should highlight two lines', function() {
      var result = PrinterUtils.diffHighlight(
        '-var myVar = 2;',
        '+var myVariable = 3;',
        {matching: 'words'}
      );

      assert.deepEqual({
        first: {
          prefix: '-',
          line: 'var <del>myVar</del> = <del>2</del>;'
        },
        second: {
          prefix: '+',
          line: 'var <ins>myVariable</ins> = <ins>3</ins>;'
        }
      }, result);
    });
    it('should highlight two lines char by char', function() {
      var result = PrinterUtils.diffHighlight(
        '-var myVar = 2;',
        '+var myVariable = 3;',
        { diffStyle: 'char' }
      );

      assert.deepEqual({
        first: {
          prefix: '-',
          line: 'var myVar = <del>2</del>;'
        },
        second: {
          prefix: '+',
          line: 'var myVar<ins>iable</ins> = <ins>3</ins>;'
        }
      }, result);
    });
    it('should highlight combined diff lines', function() {
      var result = PrinterUtils.diffHighlight(
        ' -var myVar = 2;',
        ' +var myVariable = 3;',
        {
          diffStyle: 'word',
          isCombined: true,
          matching: 'words',
          matchWordsThreshold: 1.00
        }
      );

      assert.deepEqual({
        first: {
          prefix: ' -',
          line: 'var <del class="d2h-change">myVar</del> = <del class="d2h-change">2</del>;'
        },
        second: {
          prefix: ' +',
          line: 'var <ins class="d2h-change">myVariable</ins> = <ins class="d2h-change">3</ins>;'
        }
      }, result);
    });
  });
});
