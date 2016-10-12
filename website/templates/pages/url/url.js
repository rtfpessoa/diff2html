/*
 * Example URLs:
 *
 * github/rtfpessoa/diff2html/7d02e67f3b3386ac5d804f974d025cd7a1165839
 * https://github.com/rtfpessoa/diff2html/commit/7d02e67f3b3386ac5d804f974d025cd7a1165839
 * https://github.com/rtfpessoa/diff2html/pull/106
 *
 * gitlab/gitlab-org/gitlab-ce/4e963fed42ad518caa7353d361a38a1250c99c41
 * https://gitlab.com/gitlab-org/gitlab-ce/commit/4e963fed42ad518caa7353d361a38a1250c99c41
 * https://gitlab.com/gitlab-org/gitlab-ce/merge_requests/6763
 *
 * bitbucket/atlassian/amps/52c38116f12475f75af4a147b7a7685478b83eca
 * https://bitbucket.org/atlassian/amps/commits/52c38116f12475f75af4a147b7a7685478b83eca
 * https://bitbucket.org/atlassian/amps/pull-requests/236
 */

$(document).ready(function () {
  // Improves browser compatibility
  require('whatwg-fetch');

  var $container = $('.container');
  var $url = $("#url");
  var $outputFormat = $("#diff-url-options-output-format");
  var $showFiles = $("#diff-url-options-show-files");
  var $matching = $("#diff-url-options-matching");
  var $wordThreshold = $("#diff-url-options-match-words-threshold");
  var $matchingMaxComparisons = $("#diff-url-options-matching-max-comparisons");

  var hash = window.location.hash
    .replace(/^(#!?\/?)/, "");

  var search = window.location.search;

  if (hash) {
    $url.val(hash);
    draw(prepareUrl(hash));
  } else if (search) {
    try {
      var url = search
        .split("?")[1]
        .split("diff=")[1]
        .split("&")[0];
      $url.val(url);
      draw(prepareUrl(url));
    } catch (_ignore) {
    }
  }

  bind(prepareUrl);

  $outputFormat
    .add($showFiles)
    .add($matching)
    .add($wordThreshold)
    .add($matchingMaxComparisons)
    .change(function () {
      fastDraw();
    });

  function fastDraw() {
    var url = $url.val();
    var preparedUrl = prepareUrl(url);
    draw(preparedUrl);
  }

  function bind() {
    $("#url-btn").click(function (e) {
      e.preventDefault();
      fastDraw();
    });

    $url.on("paste", function(e) {
      fastDraw();
    });
  }

  function prepareUrl(url) {
    var githubPath = /^github\/(.*?)\/(.*?)\/(.*?)$/;
    var githubCommitUrl = /^https?:\/\/(?:www\.)?github\.com\/(.*?)\/(.*?)\/commit\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;
    var githubPrUrl = /^https?:\/\/(?:www\.)?github\.com\/(.*?)\/(.*?)\/pull\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;

    var gitlabPath = /^gitlab\/(.*?)\/(.*?)\/(.*?)$/;
    var gitlabCommitUrl = /^https?:\/\/(?:www\.)?gitlab\.com\/(.*?)\/(.*?)\/commit\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;
    var gitlabPrUrl = /^https?:\/\/(?:www\.)?gitlab\.com\/(.*?)\/(.*?)\/merge_requests\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;

    var bitbucketPath = /^bitbucket\/(.*?)\/(.*?)\/(.*?)$/;
    var bitbucketCommitUrl = /^https?:\/\/(?:www\.)?bitbucket\.org\/(.*?)\/(.*?)\/commits\/(.*?)(?:\/raw)?(?:\/.*)?$/;
    var bitbucketPrUrl = /^https?:\/\/(?:www\.)?bitbucket\.org\/(.*?)\/(.*?)\/pull-requests\/(.*?)(?:\/.*)?$/;

    function genericUrlGen(provider, userName, projectName, type, value) {
      return "https://" + provider + ".com/" + userName + "/" + projectName + "/" + type + "/" + value + ".diff";
    }

    function bitbucketUrlGen(userName, projectName, type, value) {
      var baseUrl = "https://bitbucket.org/api/2.0/repositories/";

      if (type == "pullrequests") {
        return baseUrl + userName + "/" + projectName + "/pullrequests/" + value + "/diff";
      }

      return baseUrl + userName + "/" + projectName + "/diff/" + value;
    }

    var values;
    var finalUrl;
    if ((values = githubPath.exec(url))) {
      finalUrl = genericUrlGen("github", values[1], values[2], "commit", values[3]);
    } else if ((values = githubCommitUrl.exec(url))) {
      finalUrl = genericUrlGen("github", values[1], values[2], "commit", values[3]);
    } else if ((values = githubPrUrl.exec(url))) {
      finalUrl = genericUrlGen("github", values[1], values[2], "pull", values[3]);

    } else if ((values = gitlabPath.exec(url))) {
      finalUrl = genericUrlGen("gitlab", values[1], values[2], "commit", values[3]);
    } else if ((values = gitlabCommitUrl.exec(url))) {
      finalUrl = genericUrlGen("gitlab", values[1], values[2], "commit", values[3]);
    } else if ((values = gitlabPrUrl.exec(url))) {
      finalUrl = genericUrlGen("gitlab", values[1], values[2], "merge_requests", values[3]);

    } else if ((values = bitbucketPath.exec(url))) {
      finalUrl = bitbucketUrlGen(values[1], values[2], "commit", values[3]);
    } else if ((values = bitbucketCommitUrl.exec(url))) {
      finalUrl = bitbucketUrlGen(values[1], values[2], "commit", values[3]);
    } else if ((values = bitbucketPrUrl.exec(url))) {
      finalUrl = bitbucketUrlGen(values[1], values[2], "pullrequests", values[3]);
    } else {
      console.info("Could not parse url, using the provided url.");
      finalUrl = url;
    }

    return finalUrl;
  }

  function draw(url) {
    var outputFormat = $outputFormat.val();
    var showFiles = $showFiles.is(":checked");
    var matching = $matching.val();
    var wordThreshold = $wordThreshold.val();
    var matchingMaxComparisons = $matchingMaxComparisons.val();

    var fullUrl = 'https://crossorigin.me/' + url;
    fetch(fullUrl)
      .then(function (res) {
        return res.text()
      })
      .then(function (data) {
        var container = '#url-diff-container';
        var diff2htmlUi = new Diff2HtmlUI({diff: data});

        if (outputFormat == 'side-by-side') {
          $container.css({"width": "1400px"});
        } else {
          $container.css({"width": ""});
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
