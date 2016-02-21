var assert = require('assert');

var Utils = require('../src/utils.js').Utils;

describe('Utils', function() {
  describe('escape', function() {
    it('should escape & with &amp;', function() {
      var result = Utils.escape('&');
      assert.equal('&amp;', result);
    });
    it('should escape < with &lt;', function() {
      var result = Utils.escape('<');
      assert.equal('&lt;', result);
    });
    it('should escape > with &gt;', function() {
      var result = Utils.escape('>');
      assert.equal('&gt;', result);
    });
    it('should escape a string with multiple problematic characters', function() {
      var result = Utils.escape('<a href="#">\tlink text</a>');
      var expected = '&lt;a href="#"&gt;    link text&lt;/a&gt;';
      assert.equal(expected, result);
    });
  });
  describe('convertWhiteSpaceToNonBreakingSpace', function() {
    it('should escape 1 whitespaces with &nbsp;', function() {
      var result = Utils.convertWhiteSpaceToNonBreakingSpace(' ');
      assert.equal('&nbsp;', result);
    });
    it('should escape 2 whitespaces with &nbsp;', function() {
      var result = Utils.convertWhiteSpaceToNonBreakingSpace('  ');
      assert.equal('&nbsp;&nbsp;', result);
    });
    it('should escape 4 whitespaces with &nbsp;', function() {
      var result = Utils.convertWhiteSpaceToNonBreakingSpace('    ');
      assert.equal('&nbsp;&nbsp;&nbsp;&nbsp;', result);
    });
  });
});
