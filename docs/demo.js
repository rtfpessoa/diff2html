(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status === undefined ? 200 : options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],2:[function(require,module,exports){
/* global Diff2HtmlUI */

/*
 * Example URLs:
 *
 * https://github.com/rtfpessoa/diff2html/commit/7d02e67f3b3386ac5d804f974d025cd7a1165839
 * https://github.com/rtfpessoa/diff2html/pull/106
 *
 * https://gitlab.com/gitlab-org/gitlab-ce/commit/4e963fed42ad518caa7353d361a38a1250c99c41
 * https://gitlab.com/gitlab-org/gitlab-ce/merge_requests/6763
 *
 * https://bitbucket.org/atlassian/amps/commits/52c38116f12475f75af4a147b7a7685478b83eca
 * https://bitbucket.org/atlassian/amps/pull-requests/236
 */

$(document).ready(function() {
  // Improves browser compatibility
  require('whatwg-fetch');
  var searchParam = 'diff';

  var $container = $('.container');
  var $url = $('#url');
  var $outputFormat = $('#diff-url-options-output-format');
  var $showFiles = $('#diff-url-options-show-files');
  var $matching = $('#diff-url-options-matching');
  var $wordsThreshold = $('#diff-url-options-match-words-threshold');
  var $matchingMaxComparisons = $('#diff-url-options-matching-max-comparisons');

  if (window.location.search) {
    var url = getUrlFromSearch(window.location.search);
    $url.val(url);
    smartDraw(url);
  }

  bind();

  $outputFormat
    .add($showFiles)
    .add($matching)
    .add($wordsThreshold)
    .add($matchingMaxComparisons)
    .change(function(e) {
      console.log('');
      console.log(e);
      console.log('');
      smartDraw(null, true);
    });

  function getUrlFromSearch(search) {
    try {
      return search
        .split('?')[1]
        .split(searchParam + '=')[1]
        .split('&')[0];
    } catch (_ignore) {
    }

    return null;
  }

  function getParamsFromSearch(search) {
    var map = {};
    try {
      search
        .split('?')[1]
        .split('&')
        .map(function(e) {
          var values = e.split('=');
          map[values[0]] = values[1];
        });
    } catch (_ignore) {
    }

    return map;
  }

  function bind() {
    $('#url-btn').click(function(e) {
      e.preventDefault();
      var url = $url.val();
      smartDraw(url);
    });

    $url.on('paste', function(e) {
      var url = e.originalEvent.clipboardData.getData('Text');
      smartDraw(url);
    });
  }

  function prepareUrl(url) {
    var fetchUrl;
    var headers = new Headers();

    var githubCommitUrl = /^https?:\/\/(?:www\.)?github\.com\/(.*?)\/(.*?)\/commit\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;
    var githubPrUrl = /^https?:\/\/(?:www\.)?github\.com\/(.*?)\/(.*?)\/pull\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;

    var gitlabCommitUrl = /^https?:\/\/(?:www\.)?gitlab\.com\/(.*?)\/(.*?)\/commit\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;
    var gitlabPrUrl = /^https?:\/\/(?:www\.)?gitlab\.com\/(.*?)\/(.*?)\/merge_requests\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;

    var bitbucketCommitUrl = /^https?:\/\/(?:www\.)?bitbucket\.org\/(.*?)\/(.*?)\/commits\/(.*?)(?:\/raw)?(?:\/.*)?$/;
    var bitbucketPrUrl = /^https?:\/\/(?:www\.)?bitbucket\.org\/(.*?)\/(.*?)\/pull-requests\/(.*?)(?:\/.*)?$/;

    function gitLabUrlGen(userName, projectName, type, value) {
      return 'https://crossorigin.me/https://gitlab.com/' + userName + '/' + projectName + '/' + type + '/' + value + '.diff';
    }

    function gitHubUrlGen(userName, projectName, type, value) {
      headers.append('Accept', 'application/vnd.github.v3.diff');
      return 'https://api.github.com/repos/' + userName + '/' + projectName + '/' + type + '/' + value;
    }

    function bitbucketUrlGen(userName, projectName, type, value) {
      var baseUrl = 'https://bitbucket.org/api/2.0/repositories/';
      if (type === 'pullrequests') {
        return baseUrl + userName + '/' + projectName + '/pullrequests/' + value + '/diff';
      }
      return baseUrl + userName + '/' + projectName + '/diff/' + value;
    }

    var values;
    if ((values = githubCommitUrl.exec(url))) {
      fetchUrl = gitHubUrlGen(values[1], values[2], 'commits', values[3]);
    } else if ((values = githubPrUrl.exec(url))) {
      fetchUrl = gitHubUrlGen(values[1], values[2], 'pulls', values[3]);
    } else if ((values = gitlabCommitUrl.exec(url))) {
      fetchUrl = gitLabUrlGen(values[1], values[2], 'commit', values[3]);
    } else if ((values = gitlabPrUrl.exec(url))) {
      fetchUrl = gitLabUrlGen(values[1], values[2], 'merge_requests', values[3]);
    } else if ((values = bitbucketCommitUrl.exec(url))) {
      fetchUrl = bitbucketUrlGen(values[1], values[2], 'commit', values[3]);
    } else if ((values = bitbucketPrUrl.exec(url))) {
      fetchUrl = bitbucketUrlGen(values[1], values[2], 'pullrequests', values[3]);
    } else {
      console.info('Could not parse url, using the provided url.');
      fetchUrl = 'https://crossorigin.me/' + url;
    }

    return {
      originalUrl: url,
      url: fetchUrl,
      headers: headers
    };
  }

  function smartDraw(urlOpt, forced) {
    var url = urlOpt || $url.val();
    var req = prepareUrl(url);
    draw(req, forced);
  }

  function draw(req, forced) {
    if (!validateUrl(req.url)) {
      console.error('Invalid url provided!');
      return;
    }

    if (validateUrl(req.originalUrl)) updateUrl(req.originalUrl);

    var outputFormat = $outputFormat.val();
    var showFiles = $showFiles.is(':checked');
    var matching = $matching.val();
    var wordsThreshold = $wordsThreshold.val();
    var matchingMaxComparisons = $matchingMaxComparisons.val();

    fetch(req.url, {
      method: 'GET',
      headers: req.headers,
      mode: 'cors',
      cache: 'default'
    })
      .then(function(res) {
        //   return res.text();
        return "diff --git a/README b/README\nindex 771ef03..1f8b36b 100644\n--- a/README\n+++ b/README\n@@ -8,16 +8,17 @@\n matchingMaxComparisons: perform at most this much comparisons for line matching a block of changes, default is 2500\n maxLineLengthHighlight: only perform diff changes highlight if lines are smaller than this, default is 10000\n templates: object with previously compiled templates to replace parts of the html\n-rawTemplates: object with raw not compiled templates to replace parts of the html\n+\n+Transpilation\n+\n+CoffeeScript 2 generates JavaScript that uses the latest, modern syntax. The runtime or browsers where you want your code to run might not support all of that syntax. In that case, we want to convert modern JavaScript into older JavaScript that will run in older versions of Node or older browsers; for example, { a } = obj into a = obj.a. This is done via transpilers like Babel, Bublé or Traceur Compiler.\n+\n+Quickstart\n+\n+From the root of your project:\n+\n+npm install --save-dev babel-core babel-preset-env\n+echo '{ \"presets\": [\"env\"] }' > .babelrc\n+coffee --compile --transpile --inline-map some-file.coffee\n For more information regarding the possible templates look into src/templates\n \n-character_length characters characterset charindex charset charsetform charsetid check checksum checksum_agg child \n-\n-choose chr chunk class cleanup clear client clob clob_base clone close cluster\t\t\n-id cluster_probability cluster_set clustering coalesce \n-\t\t\n-coercibility col collate collation collect colu colum column column_value columns columns_updated comment \n-\n-commit compact compatibility compiled complete composite_limit compound compress compute concat concat_ws \n-\n-concurrent confirm conn connec connect connect_by_iscycle connect_by_isleaf connect_by_root connect_time connection consider consistent constant constraint constraints constructor container content contents context contributors controlfile conv convert convert_tz corr corr_k corr_s corresponding corruption cos cost count count_big counted covar_pop covar_samp cpu_per_call cpu_per_session crc32 create creation critical cross cube cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime customdatum cycle data database databases datafile datafiles datalength date_add date_cache date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts day day_to_second dayname dayofmonth dayofweek dayofyear days db_role_change dbtimezone ddl deallocate declare decode decompose decrement decrypt deduplicate def defa defau defaul default defaults deferred defi defin define degrees \n";
      })
      .then(function(data) {
        var container = 'url-diff-container';
        
        var diffJson = Diff2Html.getJsonFromDiff(data);
        var diff2html = Diff2Html.getPrettyHtml(diffJson, {
                    inputFormat: 'json',
                    outputFormat: "side-by-side",
                    matching: 'none',
                    lineFolding: true,
                    matchWordsThreshold: 1
                });
        document.getElementById(container).innerHTML = diff2html;
        var codeLines = document.getElementById(container).getElementsByClassName("d2h-code-line-ctn");
        [].forEach.call(codeLines, function(line) {
            hljs.highlightBlock(line);
        });        
        // var diff2htmlUi = new Diff2HtmlUI({diff: data});

        if (outputFormat === 'side-by-side') {
          $container.css({'width': '100%'});
        } else {
          $container.css({'width': ''});
        }

        var params = getParamsFromSearch(window.location.search);
        delete params[searchParam];

        if (forced) {
          params['outputFormat'] = outputFormat;
          params['showFiles'] = showFiles;
          params['matching'] = matching;
          params['wordsThreshold'] = wordsThreshold;
          params['matchingMaxComparisons'] = matchingMaxComparisons;
        } else {
          params['outputFormat'] = params['outputFormat'] || outputFormat;
          params['showFiles'] = String(params['showFiles']) !== 'false' || (params['showFiles'] === null && showFiles);
          params['matching'] = params['matching'] || matching;
          params['wordsThreshold'] = params['wordsThreshold'] || wordsThreshold;
          params['matchingMaxComparisons'] = params['matchingMaxComparisons'] || matchingMaxComparisons;

          $outputFormat.val(params['outputFormat']);
          $showFiles.prop('checked', params['showFiles']);
          $matching.val(params['matching']);
          $wordsThreshold.val(params['wordsThreshold']);
          $matchingMaxComparisons.val(params['matchingMaxComparisons']);
        }

        params['synchronisedScroll'] = params['synchronisedScroll'] || true;

        // diff2htmlUi.draw(container, params);
        // diff2htmlUi.fileListCloseable(container, params['fileListCloseable'] || false);
        // params['highlight'] && diff2htmlUi.highlightCode(container);
      });
  }

  function validateUrl(url) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
  }

  function updateUrl(url) {
    var params = getParamsFromSearch(window.location.search);

    if (params[searchParam] === url) return;

    params[searchParam] = url;

    var paramString = Object.keys(params).map(function(k) { return k + '=' + params[k]; }).join('&');

    window.location = 'demo.html?' + paramString;
  }
});

},{"whatwg-fetch":1}]},{},[2]);
