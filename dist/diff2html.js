/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*
	 *
	 * Diff to HTML (diff2html.js)
	 * Author: rtfpessoa
	 *
	 */

	(function(ctx, undefined) {

	  var diffParser = __webpack_require__(1).DiffParser;
	  var fileLister = __webpack_require__(3).FileListPrinter;
	  var htmlPrinter = __webpack_require__(6).HtmlPrinter;

	  function Diff2Html() {
	  }

	  /*
	   * Line diff type configuration
	   var config = {
	   "wordByWord": true, // (default)
	   // OR
	   "charByChar": true
	   };
	   */

	  /*
	   * Generates json object from string diff input
	   */
	  Diff2Html.prototype.getJsonFromDiff = function(diffInput) {
	    return diffParser.generateDiffJson(diffInput);
	  };

	  /*
	   * Generates the html diff. The config parameter configures the output/input formats and other options
	   */
	  Diff2Html.prototype.getPrettyHtml = function(diffInput, config) {
	    var configOrEmpty = config || {};

	    var diffJson = diffInput;
	    if(!configOrEmpty.inputFormat || configOrEmpty.inputFormat === 'diff') {
	      diffJson = diffParser.generateDiffJson(diffInput);
	    }

	    var fileList = "";
	    if(configOrEmpty.showFiles === true) {
	      fileList = fileLister.generateFileList(diffJson, configOrEmpty);
	    }

	    var diffOutput = "";
	    if(configOrEmpty.outputFormat === 'side-by-side') {
	      diffOutput = htmlPrinter.generateSideBySideJsonHtml(diffJson, configOrEmpty);
	    } else {
	      diffOutput = htmlPrinter.generateLineByLineJsonHtml(diffJson, configOrEmpty);
	    }

	    return fileList + diffOutput
	  };


	  /*
	   * Deprecated methods - The following methods exist only to maintain compatibility with previous versions
	   */

	  /*
	   * Generates pretty html from string diff input
	   */
	  Diff2Html.prototype.getPrettyHtmlFromDiff = function(diffInput, config) {
	    var configOrEmpty = config || {};
	    configOrEmpty['inputFormat'] = 'diff';
	    configOrEmpty['outputFormat'] = 'line-by-line';
	    return this.getPrettyHtml(diffInput, configOrEmpty)
	  };

	  /*
	   * Generates pretty html from a json object
	   */
	  Diff2Html.prototype.getPrettyHtmlFromJson = function(diffJson, config) {
	    var configOrEmpty = config || {};
	    configOrEmpty['inputFormat'] = 'json';
	    configOrEmpty['outputFormat'] = 'line-by-line';
	    return this.getPrettyHtml(diffJson, configOrEmpty)
	  };

	  /*
	   * Generates pretty side by side html from string diff input
	   */
	  Diff2Html.prototype.getPrettySideBySideHtmlFromDiff = function(diffInput, config) {
	    var configOrEmpty = config || {};
	    configOrEmpty['inputFormat'] = 'diff';
	    configOrEmpty['outputFormat'] = 'side-by-side';
	    return this.getPrettyHtml(diffInput, configOrEmpty)
	  };

	  /*
	   * Generates pretty side by side html from a json object
	   */
	  Diff2Html.prototype.getPrettySideBySideHtmlFromJson = function(diffJson, config) {
	    var configOrEmpty = config || {};
	    configOrEmpty['inputFormat'] = 'json';
	    configOrEmpty['outputFormat'] = 'side-by-side';
	    return this.getPrettyHtml(diffJson, configOrEmpty)
	  };

	  var diffName = 'Diff2Html';
	  var diffObject = new Diff2Html();
	  module.exports[diffName] = diffObject;
	  // Expose diff2html in the browser
	  global[diffName] = diffObject;

	})(this);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *
	 * Diff Parser (diff-parser.js)
	 * Author: rtfpessoa
	 *
	 */

	(function(ctx, undefined) {

	  var utils = __webpack_require__(2).Utils;

	  var LINE_TYPE = {
	    INSERTS: 'd2h-ins',
	    DELETES: 'd2h-del',
	    CONTEXT: 'd2h-cntx',
	    INFO: 'd2h-info'
	  };

	  function DiffParser() {
	  }

	  DiffParser.prototype.LINE_TYPE = LINE_TYPE;

	  DiffParser.prototype.generateDiffJson = function(diffInput) {
	    var files = [];
	    var currentFile = null;
	    var currentBlock = null;
	    var oldLine = null;
	    var newLine = null;

	    var saveBlock = function() {
	      /* Add previous block(if exists) before start a new file */
	      if (currentBlock) {
	        currentFile.blocks.push(currentBlock);
	        currentBlock = null;
	      }
	    };

	    var saveFile = function() {
	      /*
	       * Add previous file(if exists) before start a new one
	       * if it has name (to avoid binary files errors)
	       */
	      if (currentFile && currentFile.newName) {
	        files.push(currentFile);
	        currentFile = null;
	      }
	    };

	    var startFile = function() {
	      saveBlock();
	      saveFile();

	      /* Create file structure */
	      currentFile = {};
	      currentFile.blocks = [];
	      currentFile.deletedLines = 0;
	      currentFile.addedLines = 0;
	    };

	    var startBlock = function(line) {
	      saveBlock();

	      var values;

	      if (values = /^@@ -(\d+),\d+ \+(\d+),\d+ @@.*/.exec(line)) {
	        currentFile.isCombined = false;
	      } else if (values = /^@@@ -(\d+),\d+ -\d+,\d+ \+(\d+),\d+ @@@.*/.exec(line)) {
	        currentFile.isCombined = true;
	      } else {
	        values = [0, 0];
	        currentFile.isCombined = false;
	      }

	      oldLine = values[1];
	      newLine = values[2];

	      /* Create block metadata */
	      currentBlock = {};
	      currentBlock.lines = [];
	      currentBlock.oldStartLine = oldLine;
	      currentBlock.newStartLine = newLine;
	      currentBlock.header = line;
	    };

	    var createLine = function(line) {
	      var currentLine = {};
	      currentLine.content = line;

	      var newLinePrefixes = !currentFile.isCombined ? ['+'] : ['+', ' +'];
	      var delLinePrefixes = !currentFile.isCombined ? ['-'] : ['-', ' -'];

	      /* Fill the line data */
	      if (utils.startsWith(line, newLinePrefixes)) {
	        currentFile.addedLines++;

	        currentLine.type = LINE_TYPE.INSERTS;
	        currentLine.oldNumber = null;
	        currentLine.newNumber = newLine++;

	        currentBlock.lines.push(currentLine);

	      } else if (utils.startsWith(line, delLinePrefixes)) {
	        currentFile.deletedLines++;

	        currentLine.type = LINE_TYPE.DELETES;
	        currentLine.oldNumber = oldLine++;
	        currentLine.newNumber = null;

	        currentBlock.lines.push(currentLine);

	      } else {
	        currentLine.type = LINE_TYPE.CONTEXT;
	        currentLine.oldNumber = oldLine++;
	        currentLine.newNumber = newLine++;

	        currentBlock.lines.push(currentLine);
	      }
	    };

	    var diffLines = diffInput.split('\n');

	    /* Diff */
	    var oldMode = /^old mode (\d{6})/;
	    var newMode = /^new mode (\d{6})/;
	    var deletedFileMode = /^deleted file mode (\d{6})/;
	    var newFileMode = /^new file mode (\d{6})/;

	    var copyFrom = /^copy from (.+)/;
	    var copyTo = /^copy to (.+)/;

	    var renameFrom = /^rename from (.+)/;
	    var renameTo = /^rename to (.+)/;

	    var similarityIndex = /^similarity index (\d+)%/;
	    var dissimilarityIndex = /^dissimilarity index (\d+)%/;
	    var index = /^index ([0-9a-z]+)..([0-9a-z]+) (\d{6})?/;

	    /* Combined Diff */
	    var combinedIndex = /^index ([0-9a-z]+),([0-9a-z]+)..([0-9a-z]+)/;
	    var combinedMode = /^mode (\d{6}),(\d{6})..(\d{6})/;
	    var combinedNewFile = /^new file mode (\d{6})/;
	    var combinedDeletedFile = /^deleted file mode (\d{6}),(\d{6})/;

	    diffLines.forEach(function(line) {
	      // Unmerged paths, and possibly other non-diffable files
	      // https://github.com/scottgonzalez/pretty-diff/issues/11
	      // Also, remove some useless lines
	      if (!line || utils.startsWith(line, '*')) {
	        return;
	      }

	      var values = [];
	      if (utils.startsWith(line, 'diff')) {
	        startFile();
	      } else if (currentFile && !currentFile.oldName && (values = /^--- [aiwco]\/(.+)$/.exec(line))) {
	        currentFile.oldName = values[1];
	        currentFile.language = getExtension(currentFile.oldName, currentFile.language);
	      } else if (currentFile && !currentFile.newName && (values = /^\+\+\+ [biwco]?\/(.+)$/.exec(line))) {
	        currentFile.newName = values[1];
	        currentFile.language = getExtension(currentFile.newName, currentFile.language);
	      } else if (currentFile && utils.startsWith(line, '@@')) {
	        startBlock(line);
	      } else if ((values = oldMode.exec(line))) {
	        currentFile.oldMode = values[1];
	      } else if ((values = newMode.exec(line))) {
	        currentFile.newMode = values[1];
	      } else if ((values = deletedFileMode.exec(line))) {
	        currentFile.deletedFileMode = values[1];
	      } else if ((values = newFileMode.exec(line))) {
	        currentFile.newFileMode = values[1];
	      } else if ((values = copyFrom.exec(line))) {
	        currentFile.oldName = values[1];
	        currentFile.isCopy = true;
	      } else if ((values = copyTo.exec(line))) {
	        currentFile.newName = values[1];
	        currentFile.isCopy = true;
	      } else if ((values = renameFrom.exec(line))) {
	        currentFile.oldName = values[1];
	        currentFile.isRename = true;
	      } else if ((values = renameTo.exec(line))) {
	        currentFile.newName = values[1];
	        currentFile.isRename = true;
	      } else if ((values = similarityIndex.exec(line))) {
	        currentFile.unchangedPercentage = values[1];
	      } else if ((values = dissimilarityIndex.exec(line))) {
	        currentFile.changedPercentage = values[1];
	      } else if ((values = index.exec(line))) {
	        currentFile.checksumBefore = values[1];
	        currentFile.checksumAfter = values[2];
	        values[2] && (currentFile.mode = values[3]);
	      } else if ((values = combinedIndex.exec(line))) {
	        currentFile.checksumBefore = [values[2], values[3]];
	        currentFile.checksumAfter = values[1];
	      } else if ((values = combinedMode.exec(line))) {
	        currentFile.oldMode = [values[2], values[3]];
	        currentFile.newMode = values[1];
	      } else if ((values = combinedNewFile.exec(line))) {
	        currentFile.newFileMode = values[1];
	      } else if ((values = combinedDeletedFile.exec(line))) {
	        currentFile.deletedFileMode = values[1];
	      } else if (currentBlock) {
	        createLine(line);
	      }
	    });

	    saveBlock();
	    saveFile();

	    return files;
	  };

	  function getExtension(filename, language) {
	    var nameSplit = filename.split('.');
	    if (nameSplit.length > 1) {
	      return nameSplit[nameSplit.length - 1];
	    } else {
	      return language;
	    }
	  }

	  module.exports['DiffParser'] = new DiffParser();

	})(this);


/***/ },
/* 2 */
/***/ function(module, exports) {

	/*
	 *
	 * Utils (utils.js)
	 * Author: rtfpessoa
	 *
	 */

	(function(ctx, undefined) {

	  function Utils() {
	  }

	  Utils.prototype.escape = function(str) {
	    return str.slice(0)
	      .replace(/&/g, '&amp;')
	      .replace(/</g, '&lt;')
	      .replace(/>/g, '&gt;')
	      .replace(/\t/g, '    ');
	  };

	  Utils.prototype.getRandomId = function(prefix) {
	      return prefix + "-" + Math.random().toString(36).slice(-3);
	  };

	  Utils.prototype.startsWith = function(str, start) {
	    if (typeof start === 'object') {
	      var result = false;
	      start.forEach(function(s) {
	        if (str.indexOf(s) === 0) {
	          result = true;
	        }
	      });

	      return result;
	    }

	    return str.indexOf(start) === 0;
	  };

	  Utils.prototype.valueOrEmpty = function(value) {
	    return value ? value : '';
	  };

	  module.exports['Utils'] = new Utils();

	})(this);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *
	 * FileListPrinter (file-list-printer.js)
	 * Author: nmatpt
	 *
	 */

	(function (ctx, undefined) {

	    var printerUtils = __webpack_require__(4).PrinterUtils;
	    var utils = __webpack_require__(2).Utils;

	    function FileListPrinter() {
	    }

	    FileListPrinter.prototype.generateFileList = function (diffFiles) {
	        var hideId = utils.getRandomId("d2h-hide"); //necessary if there are 2 elements like this in the same page
	        var showId = utils.getRandomId("d2h-show");
	        return '<div class="d2h-file-list-wrapper">\n' +
	            '     <div class="d2h-file-list-header">Files changed (' + diffFiles.length + ')&nbsp&nbsp</div>\n' +
	            '     <a id="' + hideId + '" class="d2h-hide" href="#' + hideId + '">+</a>\n' +
	            '     <a id="' + showId + 'd2h-show" class="d2h-show" href="#' + showId + '">-</a>\n' +
	            '     <div class="d2h-clear"></div>\n' +
	            '     <table class="d2h-file-list">\n' +


	            diffFiles.map(function (file) {
	                return '     <tr class="d2h-file-list-line">\n' +
	                    '       <td class="d2h-lines-added">\n' +
	                    '         <span>+' + file.addedLines + '</span>\n' +
	                    '       </td>\n' +
	                    '       <td class="d2h-lines-deleted">\n' +
	                    '         <span>-' + file.deletedLines + '</span>\n' +
	                    '       </td>\n' +
	                    '       <td class="d2h-file-name"><a href="#' + printerUtils.getHtmlId(file) + '">&nbsp;' + printerUtils.getDiffName(file) + '</a></td>\n' +
	                    '     </tr>\n'
	            }).join('\n') +
	            '</table></div>\n';
	    };

	    module.exports['FileListPrinter'] = new FileListPrinter();

	})(this);


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *
	 * PrinterUtils (printer-utils.js)
	 * Author: rtfpessoa
	 *
	 */

	(function(ctx, undefined) {

	  var jsDiff = __webpack_require__(5);
	  var utils = __webpack_require__(2).Utils;

	  function PrinterUtils() {
	  }

	  PrinterUtils.prototype.getHtmlId = function(file) {
	    var hashCode =  function(text) {
	      var hash = 0, i, chr, len;
	      if (text.length == 0) return hash;
	      for (i = 0, len = text.length; i < len; i++) {
	        chr   = text.charCodeAt(i);
	        hash  = ((hash << 5) - hash) + chr;
	        hash |= 0; // Convert to 32bit integer
	      }
	      return hash;
	    };

	    return "d2h-" + hashCode(this.getDiffName(file)).toString().slice(-6);
	  };

	  PrinterUtils.prototype.getDiffName = function(file) {
	    var oldFilename = file.oldName;
	    var newFilename = file.newName;

	    if (oldFilename && newFilename
	      && oldFilename !== newFilename
	      && !isDeletedName(newFilename)) {
	      return oldFilename + ' -> ' + newFilename;
	    } else if (newFilename && !isDeletedName(newFilename)) {
	      return newFilename;
	    } else if (oldFilename) {
	      return oldFilename;
	    } else {
	      return 'Unknown filename';
	    }
	  };

	  PrinterUtils.prototype.diffHighlight = function(diffLine1, diffLine2, config) {
	    var lineStart1, lineStart2;

	    var prefixSize = 1;

	    if (config.isCombined) {
	      prefixSize = 2;
	    }

	    lineStart1 = diffLine1.substr(0, prefixSize);
	    lineStart2 = diffLine2.substr(0, prefixSize);

	    diffLine1 = diffLine1.substr(prefixSize);
	    diffLine2 = diffLine2.substr(prefixSize);

	    var diff;
	    if (config.charByChar) {
	      diff = jsDiff.diffChars(diffLine1, diffLine2);
	    } else {
	      diff = jsDiff.diffWordsWithSpace(diffLine1, diffLine2);
	    }

	    var highlightedLine = '';

	    diff.forEach(function(part) {
	      var elemType = part.added ? 'ins' : part.removed ? 'del' : null;
	      var escapedValue = utils.escape(part.value);

	      if (elemType !== null) {
	        highlightedLine += '<' + elemType + '>' + escapedValue + '</' + elemType + '>';
	      } else {
	        highlightedLine += escapedValue;
	      }
	    });

	    return {
	      first: {
	        prefix: lineStart1,
	        line: removeIns(highlightedLine)
	      },
	      second: {
	        prefix: lineStart2,
	        line: removeDel(highlightedLine)
	      }
	    }
	  };

	  function isDeletedName(name) {
	    return name === 'dev/null';
	  }

	  function removeIns(line) {
	    return line.replace(/(<ins>((.|\n)*?)<\/ins>)/g, '');
	  }

	  function removeDel(line) {
	    return line.replace(/(<del>((.|\n)*?)<\/del>)/g, '');
	  }

	  module.exports['PrinterUtils'] = new PrinterUtils();

	})(this);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* See LICENSE file for terms of use */

	/*
	 * Text diff implementation.
	 *
	 * This library supports the following APIS:
	 * JsDiff.diffChars: Character by character diff
	 * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
	 * JsDiff.diffLines: Line based diff
	 *
	 * JsDiff.diffCss: Diff targeted at CSS content
	 *
	 * These methods are based on the implementation proposed in
	 * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
	 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
	 */
	(function(global, undefined) {
	  var objectPrototypeToString = Object.prototype.toString;

	  /*istanbul ignore next*/
	  function map(arr, mapper, that) {
	    if (Array.prototype.map) {
	      return Array.prototype.map.call(arr, mapper, that);
	    }

	    var other = new Array(arr.length);

	    for (var i = 0, n = arr.length; i < n; i++) {
	      other[i] = mapper.call(that, arr[i], i, arr);
	    }
	    return other;
	  }
	  function clonePath(path) {
	    return { newPos: path.newPos, components: path.components.slice(0) };
	  }
	  function removeEmpty(array) {
	    var ret = [];
	    for (var i = 0; i < array.length; i++) {
	      if (array[i]) {
	        ret.push(array[i]);
	      }
	    }
	    return ret;
	  }
	  function escapeHTML(s) {
	    var n = s;
	    n = n.replace(/&/g, '&amp;');
	    n = n.replace(/</g, '&lt;');
	    n = n.replace(/>/g, '&gt;');
	    n = n.replace(/"/g, '&quot;');

	    return n;
	  }

	  // This function handles the presence of circular references by bailing out when encountering an
	  // object that is already on the "stack" of items being processed.
	  function canonicalize(obj, stack, replacementStack) {
	    stack = stack || [];
	    replacementStack = replacementStack || [];

	    var i;

	    for (i = 0; i < stack.length; i += 1) {
	      if (stack[i] === obj) {
	        return replacementStack[i];
	      }
	    }

	    var canonicalizedObj;

	    if ('[object Array]' === objectPrototypeToString.call(obj)) {
	      stack.push(obj);
	      canonicalizedObj = new Array(obj.length);
	      replacementStack.push(canonicalizedObj);
	      for (i = 0; i < obj.length; i += 1) {
	        canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack);
	      }
	      stack.pop();
	      replacementStack.pop();
	    } else if (typeof obj === 'object' && obj !== null) {
	      stack.push(obj);
	      canonicalizedObj = {};
	      replacementStack.push(canonicalizedObj);
	      var sortedKeys = [],
	          key;
	      for (key in obj) {
	        sortedKeys.push(key);
	      }
	      sortedKeys.sort();
	      for (i = 0; i < sortedKeys.length; i += 1) {
	        key = sortedKeys[i];
	        canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack);
	      }
	      stack.pop();
	      replacementStack.pop();
	    } else {
	      canonicalizedObj = obj;
	    }
	    return canonicalizedObj;
	  }

	  function buildValues(components, newString, oldString, useLongestToken) {
	    var componentPos = 0,
	        componentLen = components.length,
	        newPos = 0,
	        oldPos = 0;

	    for (; componentPos < componentLen; componentPos++) {
	      var component = components[componentPos];
	      if (!component.removed) {
	        if (!component.added && useLongestToken) {
	          var value = newString.slice(newPos, newPos + component.count);
	          value = map(value, function(value, i) {
	            var oldValue = oldString[oldPos + i];
	            return oldValue.length > value.length ? oldValue : value;
	          });

	          component.value = value.join('');
	        } else {
	          component.value = newString.slice(newPos, newPos + component.count).join('');
	        }
	        newPos += component.count;

	        // Common case
	        if (!component.added) {
	          oldPos += component.count;
	        }
	      } else {
	        component.value = oldString.slice(oldPos, oldPos + component.count).join('');
	        oldPos += component.count;

	        // Reverse add and remove so removes are output first to match common convention
	        // The diffing algorithm is tied to add then remove output and this is the simplest
	        // route to get the desired output with minimal overhead.
	        if (componentPos && components[componentPos - 1].added) {
	          var tmp = components[componentPos - 1];
	          components[componentPos - 1] = components[componentPos];
	          components[componentPos] = tmp;
	        }
	      }
	    }

	    return components;
	  }

	  function Diff(ignoreWhitespace) {
	    this.ignoreWhitespace = ignoreWhitespace;
	  }
	  Diff.prototype = {
	    diff: function(oldString, newString, callback) {
	      var self = this;

	      function done(value) {
	        if (callback) {
	          setTimeout(function() { callback(undefined, value); }, 0);
	          return true;
	        } else {
	          return value;
	        }
	      }

	      // Handle the identity case (this is due to unrolling editLength == 0
	      if (newString === oldString) {
	        return done([{ value: newString }]);
	      }
	      if (!newString) {
	        return done([{ value: oldString, removed: true }]);
	      }
	      if (!oldString) {
	        return done([{ value: newString, added: true }]);
	      }

	      newString = this.tokenize(newString);
	      oldString = this.tokenize(oldString);

	      var newLen = newString.length, oldLen = oldString.length;
	      var editLength = 1;
	      var maxEditLength = newLen + oldLen;
	      var bestPath = [{ newPos: -1, components: [] }];

	      // Seed editLength = 0, i.e. the content starts with the same values
	      var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
	      if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
	        // Identity per the equality and tokenizer
	        return done([{value: newString.join('')}]);
	      }

	      // Main worker method. checks all permutations of a given edit length for acceptance.
	      function execEditLength() {
	        for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
	          var basePath;
	          var addPath = bestPath[diagonalPath - 1],
	              removePath = bestPath[diagonalPath + 1],
	              oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
	          if (addPath) {
	            // No one else is going to attempt to use this value, clear it
	            bestPath[diagonalPath - 1] = undefined;
	          }

	          var canAdd = addPath && addPath.newPos + 1 < newLen,
	              canRemove = removePath && 0 <= oldPos && oldPos < oldLen;
	          if (!canAdd && !canRemove) {
	            // If this path is a terminal then prune
	            bestPath[diagonalPath] = undefined;
	            continue;
	          }

	          // Select the diagonal that we want to branch from. We select the prior
	          // path whose position in the new string is the farthest from the origin
	          // and does not pass the bounds of the diff graph
	          if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
	            basePath = clonePath(removePath);
	            self.pushComponent(basePath.components, undefined, true);
	          } else {
	            basePath = addPath;   // No need to clone, we've pulled it from the list
	            basePath.newPos++;
	            self.pushComponent(basePath.components, true, undefined);
	          }

	          oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath);

	          // If we have hit the end of both strings, then we are done
	          if (basePath.newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
	            return done(buildValues(basePath.components, newString, oldString, self.useLongestToken));
	          } else {
	            // Otherwise track this path as a potential candidate and continue.
	            bestPath[diagonalPath] = basePath;
	          }
	        }

	        editLength++;
	      }

	      // Performs the length of edit iteration. Is a bit fugly as this has to support the
	      // sync and async mode which is never fun. Loops over execEditLength until a value
	      // is produced.
	      if (callback) {
	        (function exec() {
	          setTimeout(function() {
	            // This should not happen, but we want to be safe.
	            /*istanbul ignore next */
	            if (editLength > maxEditLength) {
	              return callback();
	            }

	            if (!execEditLength()) {
	              exec();
	            }
	          }, 0);
	        }());
	      } else {
	        while (editLength <= maxEditLength) {
	          var ret = execEditLength();
	          if (ret) {
	            return ret;
	          }
	        }
	      }
	    },

	    pushComponent: function(components, added, removed) {
	      var last = components[components.length - 1];
	      if (last && last.added === added && last.removed === removed) {
	        // We need to clone here as the component clone operation is just
	        // as shallow array clone
	        components[components.length - 1] = {count: last.count + 1, added: added, removed: removed };
	      } else {
	        components.push({count: 1, added: added, removed: removed });
	      }
	    },
	    extractCommon: function(basePath, newString, oldString, diagonalPath) {
	      var newLen = newString.length,
	          oldLen = oldString.length,
	          newPos = basePath.newPos,
	          oldPos = newPos - diagonalPath,

	          commonCount = 0;
	      while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
	        newPos++;
	        oldPos++;
	        commonCount++;
	      }

	      if (commonCount) {
	        basePath.components.push({count: commonCount});
	      }

	      basePath.newPos = newPos;
	      return oldPos;
	    },

	    equals: function(left, right) {
	      var reWhitespace = /\S/;
	      return left === right || (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right));
	    },
	    tokenize: function(value) {
	      return value.split('');
	    }
	  };

	  var CharDiff = new Diff();

	  var WordDiff = new Diff(true);
	  var WordWithSpaceDiff = new Diff();
	  WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {
	    return removeEmpty(value.split(/(\s+|\b)/));
	  };

	  var CssDiff = new Diff(true);
	  CssDiff.tokenize = function(value) {
	    return removeEmpty(value.split(/([{}:;,]|\s+)/));
	  };

	  var LineDiff = new Diff();

	  var TrimmedLineDiff = new Diff();
	  TrimmedLineDiff.ignoreTrim = true;

	  LineDiff.tokenize = TrimmedLineDiff.tokenize = function(value) {
	    var retLines = [],
	        lines = value.split(/^/m);
	    for (var i = 0; i < lines.length; i++) {
	      var line = lines[i],
	          lastLine = lines[i - 1],
	          lastLineLastChar = lastLine && lastLine[lastLine.length - 1];

	      // Merge lines that may contain windows new lines
	      if (line === '\n' && lastLineLastChar === '\r') {
	          retLines[retLines.length - 1] = retLines[retLines.length - 1].slice(0, -1) + '\r\n';
	      } else {
	        if (this.ignoreTrim) {
	          line = line.trim();
	          // add a newline unless this is the last line.
	          if (i < lines.length - 1) {
	            line += '\n';
	          }
	        }
	        retLines.push(line);
	      }
	    }

	    return retLines;
	  };

	  var PatchDiff = new Diff();
	  PatchDiff.tokenize = function(value) {
	    var ret = [],
	        linesAndNewlines = value.split(/(\n|\r\n)/);

	    // Ignore the final empty token that occurs if the string ends with a new line
	    if (!linesAndNewlines[linesAndNewlines.length - 1]) {
	      linesAndNewlines.pop();
	    }

	    // Merge the content and line separators into single tokens
	    for (var i = 0; i < linesAndNewlines.length; i++) {
	      var line = linesAndNewlines[i];

	      if (i % 2) {
	        ret[ret.length - 1] += line;
	      } else {
	        ret.push(line);
	      }
	    }
	    return ret;
	  };

	  var SentenceDiff = new Diff();
	  SentenceDiff.tokenize = function(value) {
	    return removeEmpty(value.split(/(\S.+?[.!?])(?=\s+|$)/));
	  };

	  var JsonDiff = new Diff();
	  // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
	  // dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:
	  JsonDiff.useLongestToken = true;
	  JsonDiff.tokenize = LineDiff.tokenize;
	  JsonDiff.equals = function(left, right) {
	    return LineDiff.equals(left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
	  };

	  var JsDiff = {
	    Diff: Diff,

	    diffChars: function(oldStr, newStr, callback) { return CharDiff.diff(oldStr, newStr, callback); },
	    diffWords: function(oldStr, newStr, callback) { return WordDiff.diff(oldStr, newStr, callback); },
	    diffWordsWithSpace: function(oldStr, newStr, callback) { return WordWithSpaceDiff.diff(oldStr, newStr, callback); },
	    diffLines: function(oldStr, newStr, callback) { return LineDiff.diff(oldStr, newStr, callback); },
	    diffTrimmedLines: function(oldStr, newStr, callback) { return TrimmedLineDiff.diff(oldStr, newStr, callback); },

	    diffSentences: function(oldStr, newStr, callback) { return SentenceDiff.diff(oldStr, newStr, callback); },

	    diffCss: function(oldStr, newStr, callback) { return CssDiff.diff(oldStr, newStr, callback); },
	    diffJson: function(oldObj, newObj, callback) {
	      return JsonDiff.diff(
	        typeof oldObj === 'string' ? oldObj : JSON.stringify(canonicalize(oldObj), undefined, '  '),
	        typeof newObj === 'string' ? newObj : JSON.stringify(canonicalize(newObj), undefined, '  '),
	        callback
	      );
	    },

	    createTwoFilesPatch: function(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader) {
	      var ret = [];

	      if (oldFileName == newFileName) {
	        ret.push('Index: ' + oldFileName);
	      }
	      ret.push('===================================================================');
	      ret.push('--- ' + oldFileName + (typeof oldHeader === 'undefined' ? '' : '\t' + oldHeader));
	      ret.push('+++ ' + newFileName + (typeof newHeader === 'undefined' ? '' : '\t' + newHeader));

	      var diff = PatchDiff.diff(oldStr, newStr);
	      diff.push({value: '', lines: []});   // Append an empty value to make cleanup easier

	      // Formats a given set of lines for printing as context lines in a patch
	      function contextLines(lines) {
	        return map(lines, function(entry) { return ' ' + entry; });
	      }

	      // Outputs the no newline at end of file warning if needed
	      function eofNL(curRange, i, current) {
	        var last = diff[diff.length - 2],
	            isLast = i === diff.length - 2,
	            isLastOfType = i === diff.length - 3 && current.added !== last.added;

	        // Figure out if this is the last line for the given file and missing NL
	        if (!(/\n$/.test(current.value)) && (isLast || isLastOfType)) {
	          curRange.push('\\ No newline at end of file');
	        }
	      }

	      var oldRangeStart = 0, newRangeStart = 0, curRange = [],
	          oldLine = 1, newLine = 1;
	      for (var i = 0; i < diff.length; i++) {
	        var current = diff[i],
	            lines = current.lines || current.value.replace(/\n$/, '').split('\n');
	        current.lines = lines;

	        if (current.added || current.removed) {
	          // If we have previous context, start with that
	          if (!oldRangeStart) {
	            var prev = diff[i - 1];
	            oldRangeStart = oldLine;
	            newRangeStart = newLine;

	            if (prev) {
	              curRange = contextLines(prev.lines.slice(-4));
	              oldRangeStart -= curRange.length;
	              newRangeStart -= curRange.length;
	            }
	          }

	          // Output our changes
	          curRange.push.apply(curRange, map(lines, function(entry) {
	            return (current.added ? '+' : '-') + entry;
	          }));
	          eofNL(curRange, i, current);

	          // Track the updated file position
	          if (current.added) {
	            newLine += lines.length;
	          } else {
	            oldLine += lines.length;
	          }
	        } else {
	          // Identical context lines. Track line changes
	          if (oldRangeStart) {
	            // Close out any changes that have been output (or join overlapping)
	            if (lines.length <= 8 && i < diff.length - 2) {
	              // Overlapping
	              curRange.push.apply(curRange, contextLines(lines));
	            } else {
	              // end the range and output
	              var contextSize = Math.min(lines.length, 4);
	              ret.push(
	                  '@@ -' + oldRangeStart + ',' + (oldLine - oldRangeStart + contextSize)
	                  + ' +' + newRangeStart + ',' + (newLine - newRangeStart + contextSize)
	                  + ' @@');
	              ret.push.apply(ret, curRange);
	              ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));
	              if (lines.length <= 4) {
	                eofNL(ret, i, current);
	              }

	              oldRangeStart = 0;
	              newRangeStart = 0;
	              curRange = [];
	            }
	          }
	          oldLine += lines.length;
	          newLine += lines.length;
	        }
	      }

	      return ret.join('\n') + '\n';
	    },

	    createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {
	      return JsDiff.createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader);
	    },

	    applyPatch: function(oldStr, uniDiff) {
	      var diffstr = uniDiff.split('\n'),
	          hunks = [],
	          i = 0,
	          remEOFNL = false,
	          addEOFNL = false;

	      // Skip to the first change hunk
	      while (i < diffstr.length && !(/^@@/.test(diffstr[i]))) {
	        i++;
	      }

	      // Parse the unified diff
	      for (; i < diffstr.length; i++) {
	        if (diffstr[i][0] === '@') {
	          var chnukHeader = diffstr[i].split(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
	          hunks.unshift({
	            start: chnukHeader[3],
	            oldlength: +chnukHeader[2],
	            removed: [],
	            newlength: chnukHeader[4],
	            added: []
	          });
	        } else if (diffstr[i][0] === '+') {
	          hunks[0].added.push(diffstr[i].substr(1));
	        } else if (diffstr[i][0] === '-') {
	          hunks[0].removed.push(diffstr[i].substr(1));
	        } else if (diffstr[i][0] === ' ') {
	          hunks[0].added.push(diffstr[i].substr(1));
	          hunks[0].removed.push(diffstr[i].substr(1));
	        } else if (diffstr[i][0] === '\\') {
	          if (diffstr[i - 1][0] === '+') {
	            remEOFNL = true;
	          } else if (diffstr[i - 1][0] === '-') {
	            addEOFNL = true;
	          }
	        }
	      }

	      // Apply the diff to the input
	      var lines = oldStr.split('\n');
	      for (i = hunks.length - 1; i >= 0; i--) {
	        var hunk = hunks[i];
	        // Sanity check the input string. Bail if we don't match.
	        for (var j = 0; j < hunk.oldlength; j++) {
	          if (lines[hunk.start - 1 + j] !== hunk.removed[j]) {
	            return false;
	          }
	        }
	        Array.prototype.splice.apply(lines, [hunk.start - 1, hunk.oldlength].concat(hunk.added));
	      }

	      // Handle EOFNL insertion/removal
	      if (remEOFNL) {
	        while (!lines[lines.length - 1]) {
	          lines.pop();
	        }
	      } else if (addEOFNL) {
	        lines.push('');
	      }
	      return lines.join('\n');
	    },

	    convertChangesToXML: function(changes) {
	      var ret = [];
	      for (var i = 0; i < changes.length; i++) {
	        var change = changes[i];
	        if (change.added) {
	          ret.push('<ins>');
	        } else if (change.removed) {
	          ret.push('<del>');
	        }

	        ret.push(escapeHTML(change.value));

	        if (change.added) {
	          ret.push('</ins>');
	        } else if (change.removed) {
	          ret.push('</del>');
	        }
	      }
	      return ret.join('');
	    },

	    // See: http://code.google.com/p/google-diff-match-patch/wiki/API
	    convertChangesToDMP: function(changes) {
	      var ret = [],
	          change,
	          operation;
	      for (var i = 0; i < changes.length; i++) {
	        change = changes[i];
	        if (change.added) {
	          operation = 1;
	        } else if (change.removed) {
	          operation = -1;
	        } else {
	          operation = 0;
	        }

	        ret.push([operation, change.value]);
	      }
	      return ret;
	    },

	    canonicalize: canonicalize
	  };

	  /*istanbul ignore next */
	  /*global module */
	  if (typeof module !== 'undefined' && module.exports) {
	    module.exports = JsDiff;
	  } else if (true) {
	    /*global define */
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() { return JsDiff; }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof global.JsDiff === 'undefined') {
	    global.JsDiff = JsDiff;
	  }
	}(this));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *
	 * HtmlPrinter (html-printer.js)
	 * Author: rtfpessoa
	 *
	 */

	(function(ctx, undefined) {

	  var lineByLinePrinter = __webpack_require__(7).LineByLinePrinter;
	  var sideBySidePrinter = __webpack_require__(8).SideBySidePrinter;

	  function HtmlPrinter() {
	  }

	  HtmlPrinter.prototype.generateLineByLineJsonHtml = lineByLinePrinter.generateLineByLineJsonHtml;

	  HtmlPrinter.prototype.generateSideBySideJsonHtml = sideBySidePrinter.generateSideBySideJsonHtml;

	  module.exports['HtmlPrinter'] = new HtmlPrinter();

	})(this);


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *
	 * LineByLinePrinter (line-by-line-printer.js)
	 * Author: rtfpessoa
	 *
	 */

	(function(ctx, undefined) {

	  var diffParser = __webpack_require__(1).DiffParser;
	  var printerUtils = __webpack_require__(4).PrinterUtils;
	  var utils = __webpack_require__(2).Utils;

	  function LineByLinePrinter() {
	  }

	  LineByLinePrinter.prototype.generateLineByLineJsonHtml = function(diffFiles, config) {
	    return '<div class="d2h-wrapper">\n' +
	      diffFiles.map(function(file) {

	        var diffs;
	        if (file.blocks.length) {
	          diffs = generateFileHtml(file, config);
	        } else {
	          diffs = generateEmptyDiff();
	        }

	        return '<div id="' + printerUtils.getHtmlId(file) + '" class="d2h-file-wrapper" data-lang="' + file.language + '">\n' +
	          '     <div class="d2h-file-header">\n' +
	          '       <div class="d2h-file-stats">\n' +
	          '         <span class="d2h-lines-added">+' + file.addedLines + '</span>\n' +
	          '         <span class="d2h-lines-deleted">-' + file.deletedLines + '</span>\n' +
	          '       </div>\n' +
	          '       <div class="d2h-file-name">' + printerUtils.getDiffName(file) + '</div>\n' +
	          '     </div>\n' +
	          '     <div class="d2h-file-diff">\n' +
	          '       <div class="d2h-code-wrapper">\n' +
	          '         <table class="d2h-diff-table">\n' +
	          '           <tbody class="d2h-diff-tbody">\n' +
	          '         ' + diffs +
	          '           </tbody>\n' +
	          '         </table>\n' +
	          '       </div>\n' +
	          '     </div>\n' +
	          '   </div>\n';
	      }).join('\n') +
	      '</div>\n';
	  };

	  function generateFileHtml(file, config) {
	    return file.blocks.map(function(block) {

	      var lines = '<tr>\n' +
	        '  <td class="d2h-code-linenumber ' + diffParser.LINE_TYPE.INFO + '"></td>\n' +
	        '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
	        '    <div class="d2h-code-line ' + diffParser.LINE_TYPE.INFO + '">' + utils.escape(block.header) + '</div>' +
	        '  </td>\n' +
	        '</tr>\n';

	      var oldLines = [];
	      var newLines = [];
	      var processedOldLines = [];
	      var processedNewLines = [];

	      for (var i = 0; i < block.lines.length; i++) {
	        var line = block.lines[i];
	        var escapedLine = utils.escape(line.content);

	        if (line.type == diffParser.LINE_TYPE.CONTEXT && !oldLines.length && !newLines.length) {
	          lines += generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
	        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !oldLines.length && !newLines.length) {
	          lines += generateLineHtml(line.type, line.oldNumber, line.newNumber, escapedLine);
	        } else if (line.type == diffParser.LINE_TYPE.DELETES && !newLines.length) {
	          oldLines.push(line);
	        } else if (line.type == diffParser.LINE_TYPE.INSERTS && oldLines.length > newLines.length) {
	          newLines.push(line);
	        } else {
	          var j = 0;
	          var oldLine, newLine;

	          if (oldLines.length === newLines.length) {
	            for (j = 0; j < oldLines.length; j++) {
	              oldLine = oldLines[j];
	              newLine = newLines[j];

	              config.isCombined = file.isCombined;
	              var diff = printerUtils.diffHighlight(oldLine.content, newLine.content, config);

	              processedOldLines +=
	                generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber,
	                  diff.first.line, diff.first.prefix);
	              processedNewLines +=
	                generateLineHtml(newLine.type, newLine.oldNumber, newLine.newNumber,
	                  diff.second.line, diff.second.prefix);
	            }

	            lines += processedOldLines + processedNewLines;
	          } else {
	            lines += processLines(oldLines, newLines);
	          }

	          oldLines = [];
	          newLines = [];
	          processedOldLines = [];
	          processedNewLines = [];
	          i--;
	        }
	      }

	      lines += processLines(oldLines, newLines);

	      return lines;
	    }).join('\n');
	  }

	  function processLines(oldLines, newLines) {
	    var lines = '';

	    for (j = 0; j < oldLines.length; j++) {
	      var oldLine = oldLines[j];
	      var oldEscapedLine = utils.escape(oldLine.content);
	      lines += generateLineHtml(oldLine.type, oldLine.oldNumber, oldLine.newNumber, oldEscapedLine);
	    }

	    for (j = 0; j < newLines.length; j++) {
	      var newLine = newLines[j];
	      var newEscapedLine = utils.escape(newLine.content);
	      lines += generateLineHtml(newLine.type, newLine.oldNumber, newLine.newNumber, newEscapedLine);
	    }

	    return lines;
	  }

	  function generateLineHtml(type, oldNumber, newNumber, content, prefix) {
	    var htmlPrefix = '';
	    if (prefix) {
	      htmlPrefix = '<span class="d2h-code-line-prefix">' + prefix + '</span>';
	    }

	    var htmlContent = '';
	    if (content) {
	      htmlContent = '<span class="d2h-code-line-ctn">' + content + '</span>';
	    }

	    return '<tr>\n' +
	      '  <td class="d2h-code-linenumber ' + type + '">' +
	      '    <div class="line-num1">' + utils.valueOrEmpty(oldNumber) + '</div>' +
	      '    <div class="line-num2">' + utils.valueOrEmpty(newNumber) + '</div>' +
	      '  </td>\n' +
	      '  <td class="' + type + '">' +
	      '    <div class="d2h-code-line ' + type + '">' + htmlPrefix + htmlContent + '</div>' +
	      '  </td>\n' +
	      '</tr>\n';
	  }

	  function generateEmptyDiff() {
	    return '<tr>\n' +
	      '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
	      '    <div class="d2h-code-line ' + diffParser.LINE_TYPE.INFO + '">' +
	      'File without changes' +
	      '    </div>' +
	      '  </td>\n' +
	      '</tr>\n';
	  }

	  module.exports['LineByLinePrinter'] = new LineByLinePrinter();

	})(this);


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *
	 * HtmlPrinter (html-printer.js)
	 * Author: rtfpessoa
	 *
	 */

	(function(ctx, undefined) {

	  var diffParser = __webpack_require__(1).DiffParser;
	  var printerUtils = __webpack_require__(4).PrinterUtils;
	  var utils = __webpack_require__(2).Utils;

	  function SideBySidePrinter() {
	  }

	  SideBySidePrinter.prototype.generateSideBySideJsonHtml = function(diffFiles, config) {
	    return '<div class="d2h-wrapper">\n' +
	      diffFiles.map(function(file) {

	        var diffs;
	        if (file.blocks.length) {
	          diffs = generateSideBySideFileHtml(file, config);
	        } else {
	          diffs = generateEmptyDiff();
	        }

	        return '<div id="' + printerUtils.getHtmlId(file) + '" class="d2h-file-wrapper" data-lang="' + file.language + '">\n' +
	          '     <div class="d2h-file-header">\n' +
	          '       <div class="d2h-file-stats">\n' +
	          '         <span class="d2h-lines-added">+' + file.addedLines + '</span>\n' +
	          '         <span class="d2h-lines-deleted">-' + file.deletedLines + '</span>\n' +
	          '       </div>\n' +
	          '       <div class="d2h-file-name">' + printerUtils.getDiffName(file) + '</div>\n' +
	          '     </div>\n' +
	          '     <div class="d2h-files-diff">\n' +
	          '       <div class="d2h-file-side-diff">\n' +
	          '         <div class="d2h-code-wrapper">\n' +
	          '           <table class="d2h-diff-table">\n' +
	          '             <tbody class="d2h-diff-tbody">\n' +
	          '           ' + diffs.left +
	          '             </tbody>\n' +
	          '           </table>\n' +
	          '         </div>\n' +
	          '       </div>\n' +
	          '       <div class="d2h-file-side-diff">\n' +
	          '         <div class="d2h-code-wrapper">\n' +
	          '           <table class="d2h-diff-table">\n' +
	          '             <tbody class="d2h-diff-tbody">\n' +
	          '           ' + diffs.right +
	          '             </tbody>\n' +
	          '           </table>\n' +
	          '         </div>\n' +
	          '       </div>\n' +
	          '     </div>\n' +
	          '   </div>\n';
	      }).join('\n') +
	      '</div>\n';
	  };

	  function generateSideBySideFileHtml(file, config) {
	    var fileHtml = {};
	    fileHtml.left = '';
	    fileHtml.right = '';

	    file.blocks.forEach(function(block) {

	      fileHtml.left += '<tr>\n' +
	        '  <td class="d2h-code-side-linenumber ' + diffParser.LINE_TYPE.INFO + '"></td>\n' +
	        '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
	        '    <div class="d2h-code-side-line ' + diffParser.LINE_TYPE.INFO + '">' +
	        '      ' + utils.escape(block.header) +
	        '    </div>' +
	        '  </td>\n' +
	        '</tr>\n';

	      fileHtml.right += '<tr>\n' +
	        '  <td class="d2h-code-side-linenumber ' + diffParser.LINE_TYPE.INFO + '"></td>\n' +
	        '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
	        '    <div class="d2h-code-side-line ' + diffParser.LINE_TYPE.INFO + '"></div>' +
	        '  </td>\n' +
	        '</tr>\n';

	      var oldLines = [];
	      var newLines = [];
	      var tmpHtml = '';

	      for (var i = 0; i < block.lines.length; i++) {
	        var line = block.lines[i];
	        var escapedLine = utils.escape(line.content);

	        if (line.type == diffParser.LINE_TYPE.CONTEXT && !oldLines.length && !newLines.length) {
	          fileHtml.left += generateSingleLineHtml(line.type, line.oldNumber, escapedLine);
	          fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine);
	        } else if (line.type == diffParser.LINE_TYPE.INSERTS && !oldLines.length && !newLines.length) {
	          fileHtml.left += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
	          fileHtml.right += generateSingleLineHtml(line.type, line.newNumber, escapedLine);
	        } else if (line.type == diffParser.LINE_TYPE.DELETES && !newLines.length) {
	          oldLines.push(line);
	        } else if (line.type == diffParser.LINE_TYPE.INSERTS && oldLines.length > newLines.length) {
	          newLines.push(line);
	        } else {
	          var j = 0;
	          var oldLine, newLine;

	          if (oldLines.length === newLines.length) {
	            for (j = 0; j < oldLines.length; j++) {
	              oldLine = oldLines[j];
	              newLine = newLines[j];

	              config.isCombined = file.isCombined;

	              var diff = printerUtils.diffHighlight(oldLine.content, newLine.content, config);

	              fileHtml.left +=
	                generateSingleLineHtml(oldLine.type, oldLine.oldNumber,
	                  diff.first.line, diff.first.prefix);
	              fileHtml.right +=
	                generateSingleLineHtml(newLine.type, newLine.newNumber,
	                  diff.second.line, diff.second.prefix);
	            }
	          } else {
	            tmpHtml = processLines(oldLines, newLines);
	            fileHtml.left += tmpHtml.left;
	            fileHtml.right += tmpHtml.right;
	          }

	          oldLines = [];
	          newLines = [];
	          i--;
	        }
	      }

	      tmpHtml = processLines(oldLines, newLines);
	      fileHtml.left += tmpHtml.left;
	      fileHtml.right += tmpHtml.right;
	    });

	    return fileHtml;
	  }

	  function processLines(oldLines, newLines) {
	    var fileHtml = {};
	    fileHtml.left = '';
	    fileHtml.right = '';

	    var maxLinesNumber = Math.max(oldLines.length, newLines.length);
	    for (j = 0; j < maxLinesNumber; j++) {
	      var oldLine = oldLines[j];
	      var newLine = newLines[j];

	      if (oldLine && newLine) {
	        fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, utils.escape(oldLine.content));
	        fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, utils.escape(newLine.content));
	      } else if (oldLine) {
	        fileHtml.left += generateSingleLineHtml(oldLine.type, oldLine.oldNumber, utils.escape(oldLine.content));
	        fileHtml.right += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
	      } else if (newLine) {
	        fileHtml.left += generateSingleLineHtml(diffParser.LINE_TYPE.CONTEXT, '', '', '');
	        fileHtml.right += generateSingleLineHtml(newLine.type, newLine.newNumber, utils.escape(newLine.content));
	      } else {
	        console.error('How did it get here?');
	      }
	    }

	    return fileHtml;
	  }

	  function generateSingleLineHtml(type, number, content, prefix) {
	    var htmlPrefix = '';
	    if (prefix) {
	      htmlPrefix = '<span class="d2h-code-line-prefix">' + prefix + '</span>';
	    }

	    var htmlContent = '';
	    if (content) {
	      htmlContent = '<span class="d2h-code-line-ctn">' + content + '</span>';
	    }

	    return '<tr>\n' +
	      '    <td class="d2h-code-side-linenumber ' + type + '">' + number + '</td>\n' +
	      '    <td class="' + type + '">' +
	      '      <div class="d2h-code-side-line ' + type + '">' + htmlPrefix + htmlContent + '</div>' +
	      '    </td>\n' +
	      '  </tr>\n';
	  }

	  function generateEmptyDiff() {
	    var fileHtml = {};
	    fileHtml.right = '';

	    fileHtml.left = '<tr>\n' +
	      '  <td class="' + diffParser.LINE_TYPE.INFO + '">' +
	      '    <div class="d2h-code-side-line ' + diffParser.LINE_TYPE.INFO + '">' +
	      'File without changes' +
	      '    </div>' +
	      '  </td>\n' +
	      '</tr>\n';

	    return fileHtml;
	  }

	  module.exports['SideBySidePrinter'] = new SideBySidePrinter();

	})(this);


/***/ }
/******/ ]);