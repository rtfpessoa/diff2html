/* global global */
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

function getParamsFromSearch(search) {
  const map = {};
  try {
    search
      .split("?")[1]
      .split("&")
      .forEach(e => {
        const values = e.split("=");
        map[values[0]] = values[1];
      });
  } catch (_ignore) {}

  return map;
}

function validateUrl(url) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    url
  );
}

function prepareRequest(url) {
  if (!validateUrl(url)) {
    console.error("Invalid url provided!");
    return;
  }

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
    url: fetchUrl,
    headers: headers
  };
}

function getConfiguration(urlParams) {
  // Removing `diff` form `urlParams` to avoid being inserted
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { diff, ...urlParamsRest } = urlParams;
  const config = {
    ...global.defaultDiff2HtmlUIConfig,
    ...urlParamsRest
  };

  return Object.entries(config).reduce((object, [k, v]) => {
    const newObject = !Number.isNaN(Number(v))
      ? { [k]: Number(v) }
      : v === "true" && v === "false"
      ? { [k]: Boolean(v) }
      : { [k]: v };
    return { ...object, ...newObject };
  }, {});
}

function getDiff(request) {
  return fetch(request.url, {
    method: "GET",
    headers: request.headers,
    mode: "cors",
    cache: "default"
  })
    .then(res => {
      return res.text();
    })
    .catch(error => console.error("Failed to retrieve diff", error));
}

function draw(diffString, config, elements) {
  const diff2htmlUi = new global.Diff2HtmlUI(diffString, elements.structure.diffTarget, config);

  if (config.outputFormat === "side-by-side") {
    elements.structure.container.style.width = "100%";
  } else {
    elements.structure.container.style.width = "";
  }

  diff2htmlUi.draw();
}

async function prepareInitialState(elements) {
  const urlParams = getParamsFromSearch(window.location.search);
  const currentUrl = (urlParams && urlParams[searchParam]) || "https://github.com/rtfpessoa/diff2html/pull/106";

  if (currentUrl !== elements.url.input.value) elements.url.input.value = currentUrl;

  const request = prepareRequest(currentUrl);

  const initialConfiguration = getConfiguration(urlParams);
  const initialDiff = await getDiff(request);

  return [initialConfiguration, initialDiff];
}

function updateBrowserUrl(config, newDiffUrl) {
  if (history.pushState) {
    const paramString = Object.entries(config)
      .map(([k, v]) => k + "=" + v)
      .join("&");
    const newPageUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      paramString +
      "&" +
      searchParam +
      "=" +
      newDiffUrl;
    window.history.pushState({ path: newPageUrl }, "", newPageUrl);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Improves browser compatibility
  require("whatwg-fetch");

  const drawAndUpdateUrl = async (diffUrl, diffString, config, elements) => {
    updateBrowserUrl(config, diffUrl);
    const newRequest = prepareRequest(diffUrl);
    diffString = await getDiff(newRequest);
    draw(diffString, config, elements);
  };

  const elements = {
    structure: {
      container: document.getElementsByClassName("container")[0],
      diffTarget: document.getElementById("url-diff-container")
    },
    url: {
      input: document.getElementById("url"),
      button: document.getElementById("url-btn")
    },
    options: {
      outputFormat: document.getElementById("diff-url-options-output-format"),
      matching: document.getElementById("diff-url-options-matching"),
      wordsThreshold: document.getElementById("diff-url-options-match-words-threshold"),
      matchingMaxComparisons: document.getElementById("diff-url-options-matching-max-comparisons")
    },
    checkboxes: {
      drawFileList: document.getElementById("diff-url-options-show-files")
    }
  };

  let [config, diffString] = await prepareInitialState(elements);

  // Update HTML inputs from any changes in URL
  elements.options.outputFormat.value = config.outputFormat;
  elements.checkboxes.drawFileList.checked = config.drawFileList;
  elements.options.matching.value = config.matching;
  elements.options.wordsThreshold.value = config.wordsThreshold;
  elements.options.matchingMaxComparisons.value = config.matchingMaxComparisons;

  Object.entries(elements.options).forEach(([option, element]) =>
    element.addEventListener("change", () => {
      config[option] = element.value;
      drawAndUpdateUrl(elements.url.input.value, diffString, config, elements);
    })
  );

  Object.entries(elements.checkboxes).forEach(([option, checkbox]) =>
    checkbox.addEventListener("change", () => {
      config[option] = checkbox.checked;
      drawAndUpdateUrl(elements.url.input.value, diffString, config, elements);
    })
  );

  elements.url.button.addEventListener("click", async e => {
    e.preventDefault();
    const newDiffUrl = elements.url.input.value;
    const newRequest = prepareRequest(newDiffUrl);
    diffString = await getDiff(newRequest);
    drawAndUpdateUrl(newDiffUrl, diffString, config, elements);
  });

  return drawAndUpdateUrl(elements.url.input.value, diffString, config, elements);
});

/* eslint-enable @typescript-eslint/explicit-function-return-type */
