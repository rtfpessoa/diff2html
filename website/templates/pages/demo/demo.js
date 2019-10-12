/* global Diff2HtmlUI */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

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

const searchParam = "diff";

function getUrlFromSearch(search) {
  try {
    return search
      .split("?")[1]
      .split(searchParam + "=")[1]
      .split("&")[0];
  } catch (_ignore) {}

  return null;
}

function getParamsFromSearch(search) {
  const map = new Map();
  try {
    search
      .split("?")[1]
      .split("&")
      .forEach(e => {
        const values = e.split("=");
        map.set(values[0], values[1]);
      });
  } catch (_ignore) {}

  return map;
}

function prepareUrl(url) {
  let fetchUrl;
  const headers = new Headers();

  const githubCommitUrl = /^https?:\/\/(?:www\.)?github\.com\/(.*?)\/(.*?)\/commit\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;
  const githubPrUrl = /^https?:\/\/(?:www\.)?github\.com\/(.*?)\/(.*?)\/pull\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;

  const gitlabCommitUrl = /^https?:\/\/(?:www\.)?gitlab\.com\/(.*?)\/(.*?)\/commit\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;
  const gitlabPrUrl = /^https?:\/\/(?:www\.)?gitlab\.com\/(.*?)\/(.*?)\/merge_requests\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;

  const bitbucketCommitUrl = /^https?:\/\/(?:www\.)?bitbucket\.org\/(.*?)\/(.*?)\/commits\/(.*?)(?:\/raw)?(?:\/.*)?$/;
  const bitbucketPrUrl = /^https?:\/\/(?:www\.)?bitbucket\.org\/(.*?)\/(.*?)\/pull-requests\/(.*?)(?:\/.*)?$/;

  function gitLabUrlGen(userName, projectName, type, value) {
    return (
      "https://crossorigin.me/https://gitlab.com/" + userName + "/" + projectName + "/" + type + "/" + value + ".diff"
    );
  }

  function gitHubUrlGen(userName, projectName, type, value) {
    headers.append("Accept", "application/vnd.github.v3.diff");
    return "https://api.github.com/repos/" + userName + "/" + projectName + "/" + type + "/" + value;
  }

  function bitbucketUrlGen(userName, projectName, type, value) {
    const baseUrl = "https://bitbucket.org/api/2.0/repositories/";
    if (type === "pullrequests") {
      return baseUrl + userName + "/" + projectName + "/pullrequests/" + value + "/diff";
    }
    return baseUrl + userName + "/" + projectName + "/diff/" + value;
  }

  let values;
  if ((values = githubCommitUrl.exec(url))) {
    fetchUrl = gitHubUrlGen(values[1], values[2], "commits", values[3]);
  } else if ((values = githubPrUrl.exec(url))) {
    fetchUrl = gitHubUrlGen(values[1], values[2], "pulls", values[3]);
  } else if ((values = gitlabCommitUrl.exec(url))) {
    fetchUrl = gitLabUrlGen(values[1], values[2], "commit", values[3]);
  } else if ((values = gitlabPrUrl.exec(url))) {
    fetchUrl = gitLabUrlGen(values[1], values[2], "merge_requests", values[3]);
  } else if ((values = bitbucketCommitUrl.exec(url))) {
    fetchUrl = bitbucketUrlGen(values[1], values[2], "commit", values[3]);
  } else if ((values = bitbucketPrUrl.exec(url))) {
    fetchUrl = bitbucketUrlGen(values[1], values[2], "pullrequests", values[3]);
  } else {
    console.info("Could not parse url, using the provided url.");
    fetchUrl = "https://crossorigin.me/" + url;
  }

  return {
    originalUrl: url,
    url: fetchUrl,
    headers: headers
  };
}

function validateUrl(url) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    url
  );
}

function updateUrl(url) {
  const params = getParamsFromSearch(window.location.search);

  if (params[searchParam] === url) return;

  params[searchParam] = url;

  const paramString = Object.keys(params)
    .map(function(k) {
      return k + "=" + params[k];
    })
    .join("&");

  window.location = "demo.html?" + paramString;
}

function draw(req, forced, elements) {
  if (!validateUrl(req.url)) {
    console.error("Invalid url provided!");
    return;
  }

  if (validateUrl(req.originalUrl)) updateUrl(req.originalUrl);

  const outputFormat = elements.outputFormat.val();
  const showFiles = elements.showFiles.is(":checked");
  const matching = elements.matching.val();
  const wordsThreshold = elements.wordsThreshold.val();
  const matchingMaxComparisons = elements.matchingMaxComparisons.val();

  fetch(req.url, {
    method: "GET",
    headers: req.headers,
    mode: "cors",
    cache: "default"
  })
    .then(function(res) {
      return res.text();
    })
    .then(function(data) {
      const params = getParamsFromSearch(window.location.search);
      delete params[searchParam];

      if (forced) {
        params.outputFormat = outputFormat;
        params.showFiles = showFiles;
        params.matching = matching;
        params.wordsThreshold = wordsThreshold;
        params.matchingMaxComparisons = matchingMaxComparisons;
      } else {
        params.outputFormat = params.outputFormat || outputFormat;
        params.showFiles = String(params.showFiles) !== "false" || (params.showFiles === null && showFiles);
        params.matching = params.matching || matching;
        params.wordsThreshold = params.wordsThreshold || wordsThreshold;
        params.matchingMaxComparisons = params.matchingMaxComparisons || matchingMaxComparisons;

        elements.outputFormat.value = params.outputFormat;
        elements.showFiles.setAttribute("checked", params.showFiles);
        elements.matching.value = params.matching;
        elements.wordsThreshold.value = params.wordsThreshold;
        elements.matchingMaxComparisons.value = params.matchingMaxComparisons;
      }

      params.synchronisedScroll = params.synchronisedScroll || true;

      const diff2htmlUi = new Diff2HtmlUI(data, elements.root);

      if (outputFormat === "side-by-side") {
        elements.container.css({ width: "100%" });
      } else {
        elements.container.css({ width: "" });
      }

      diff2htmlUi.draw();
      diff2htmlUi.fileListCloseable(params.fileListCloseable || false);
      if (params.highlight === undefined || params.highlight) {
        diff2htmlUi.highlightCode();
      }

      return undefined;
    })
    .catch(() => {});
}

function smartDraw(urlOpt, urlElem, forced) {
  const url = urlOpt || urlElem.val();
  const req = prepareUrl(url);
  draw(req, forced);
}

function bind(urlElem) {
  $("#url-btn").click(e => {
    e.preventDefault();
    const url = urlElem.val();
    smartDraw(url, urlElem);
  });

  urlElem.on("paste", e => {
    const url = e.originalEvent.clipboardData.getData("Text");
    smartDraw(url, urlElem);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  // Improves browser compatibility
  require("whatwg-fetch");

  const elements = {
    root: document.getElementById("url-diff-container"),
    container: document.getElementsByClassName("container"),
    url: document.getElementById("url"),
    outputFormat: document.getElementById("diff-url-options-output-format"),
    showFiles: document.getElementById("diff-url-options-show-files"),
    matching: document.getElementById("diff-url-options-matching"),
    wordsThreshold: document.getElementById("diff-url-options-match-words-threshold"),
    matchingMaxComparisons: document.getElementById("diff-url-options-matching-max-comparisons")
  };

  if (window.location.search) {
    const url = getUrlFromSearch(window.location.search);
    elements.url.val(url);
    smartDraw(url, elements.url);
  }

  bind();

  elements.outputFormat
    .add(elements.showFiles)
    .add(elements.matching)
    .add(elements.wordsThreshold)
    .add(elements.matchingMaxComparisons)
    .change(() => smartDraw(null, elements.url, true));
});

/* eslint-enable @typescript-eslint/explicit-function-return-type */
