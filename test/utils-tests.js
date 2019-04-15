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
      var expected = '&lt;a href=&quot;#&quot;&gt;\tlink text&lt;&#x2F;a&gt;';
      assert.equal(expected, result);
    });
  });
});
