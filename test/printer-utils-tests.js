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
  });

  describe('getDiffName', function() {
    it('should generate the file name for a changed file', function() {
      var result = PrinterUtils.getDiffName({
        oldName: 'sample.js',
        newName: 'sample.js'
      });
      assert.equal('sample.js', result);
    });
    it('should generate the file name for a changed file and renamed', function() {
      var result = PrinterUtils.getDiffName({
        oldName: 'sample1.js',
        newName: 'sample2.js'
      });
      assert.equal('sample1.js -> sample2.js', result);
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
  });

  describe('diffHighlight', function() {
    it('should highlight two lines', function() {
      var result = PrinterUtils.diffHighlight(
        'var myVar = 2;',
        'var myVariable = 3;',
        {matching: 'words'}
      );

      assert.deepEqual({
        first: {prefix: 'v', line: 'ar <del>myVar</del> = <del>2</del>;'},
        second: {
          prefix: 'v',
          line: 'ar <ins>myVariable</ins> = <ins>3</ins>;'
        }
      }, result);
    });
    it('should highlight two lines char by char', function() {
      var result = PrinterUtils.diffHighlight(
        'var myVar = 2;',
        'var myVariable = 3;',
        {charByChar: true}
      );

      assert.deepEqual({
        first: {prefix: 'v', line: 'ar myVar = <del>2</del>;'},
        second: {
          prefix: 'v',
          line: 'ar myVar<ins>iable</ins> = <ins>3</ins>;'
        }
      }, result);
    });
  });
});
