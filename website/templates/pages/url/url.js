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

  var $container = $('.container');
  var $url = $('#url');
  var $outputFormat = $('#diff-url-options-output-format');
  var $showFiles = $('#diff-url-options-show-files');
  var $matching = $('#diff-url-options-matching');
  var $wordThreshold = $('#diff-url-options-match-words-threshold');
  var $matchingMaxComparisons = $('#diff-url-options-matching-max-comparisons');

  var hash = window.location.hash
    .replace(/^(#!?\/?)/, '');

  var search = window.location.search;

  if (hash) {
    $url.val(hash);
    smartDraw(hash);
  } else if (search) {
    try {
      var url = search
        .split('?')[1]
        .split('diff=')[1]
        .split('&')[0];
      $url.val(url);
      smartDraw(url);
    } catch (_ignore) {
    }
  }

  bind();

  $outputFormat
    .add($showFiles)
    .add($matching)
    .add($wordThreshold)
    .add($matchingMaxComparisons)
    .change(function() {
      smartDraw();
    });

  function smartDraw(urlOpt) {
    var url = urlOpt | $url.val();
    var req = prepareUrl(url);
    draw(req);
  }

  function updateHash(url) {
    window.location.hash = '#!' + url;
  }

  function bind() {
    $('#url-btn').click(function(e) {
      e.preventDefault();
      var url = $url.val();
      smartDraw(url);
      updateHash(url);
    });

    $url.on('paste', function(e) {
      var url = e.originalEvent.clipboardData.getData('Text');
      smartDraw(url);
      updateHash(url);
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
      fetchUrl = url;
    }

    return {
      url: fetchUrl,
      headers: headers
    };
  }

  function draw(req) {
    var outputFormat = $outputFormat.val();
    var showFiles = $showFiles.is(':checked');
    var matching = $matching.val();
    var wordThreshold = $wordThreshold.val();
    var matchingMaxComparisons = $matchingMaxComparisons.val();

    fetch(req.url, {
      method: 'GET',
      headers: req.headers,
      mode: 'cors',
      cache: 'default'
    })
      .then(function(res) {
        return res.text();
      })
      .then(function(data) {
        var container = '#url-diff-container';
        var diff2htmlUi = new Diff2HtmlUI({diff: data});

        if (outputFormat === 'side-by-side') {
          $container.css({'width': '1400px'});
        } else {
          $container.css({'width': ''});
        }

        diff2htmlUi.draw(container, {
          outputFormat: outputFormat,
          showFiles: showFiles,
          matching: matching,
          matchWordsThreshold: wordThreshold,
          matchingMaxComparisons: matchingMaxComparisons,
          synchronisedScroll: true
        });
        diff2htmlUi.fileListCloseable(container, false);
        diff2htmlUi.highlightCode(container);
      });
  }
});
