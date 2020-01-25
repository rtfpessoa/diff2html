import { Diff2HtmlUI, defaultDiff2HtmlUIConfig, Diff2HtmlUIConfig } from '../../../../src/ui/js/diff2html-ui-slim';

import '../../../main.ts';
import '../../../main.css';
import 'highlight.js/styles/github.css';
import '../../../../src/ui/css/diff2html.css';
import './demo.css';

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

type URLParams = {
  diff?: string;
  [key: string]: string | boolean | number | undefined;
};

const searchParam = 'diff';

function getParamsFromSearch(search: string): URLParams {
  try {
    return search
      .split('?')[1]
      .split('&')
      .reduce((urlParams, e) => {
        const values = e.split('=');
        return {
          ...urlParams,
          [values[0]]: values[1],
        };
      }, {});
  } catch (_ignore) {
    return {};
  }
}

function validateUrl(url: string): boolean {
  return /^(?:(?:https?|ftp):)?\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|(?:[\da-z\u00a1-\uffff]-*)*[\da-z\u00a1-\uffff]+(?:\.(?:[\da-z\u00a1-\uffff]-*)*[\da-z\u00a1-\uffff]+)*\.[a-z\u00a1-\uffff]{2,}.?)(?::\d{2,5})?(?:[#/?]\S*)?$/i.test(
    url,
  );
}

type Request = {
  url: string;
  headers: Headers;
};

function prepareRequest(url: string): Request {
  if (!validateUrl(url)) {
    const errorMsg = 'Invalid url provided!';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  let fetchUrl;
  const headers = new Headers();

  const githubCommitUrl = /^https?:\/\/(?:www\.)?github\.com\/(.*?)\/(.*?)\/commit\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;
  const githubPrUrl = /^https?:\/\/(?:www\.)?github\.com\/(.*?)\/(.*?)\/pull\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;

  const gitlabCommitUrl = /^https?:\/\/(?:www\.)?gitlab\.com\/(.*?)\/(.*?)\/commit\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;
  const gitlabPrUrl = /^https?:\/\/(?:www\.)?gitlab\.com\/(.*?)\/(.*?)\/merge_requests\/(.*?)(?:\.diff)?(?:\.patch)?(?:\/.*)?$/;

  const bitbucketCommitUrl = /^https?:\/\/(?:www\.)?bitbucket\.org\/(.*?)\/(.*?)\/commits\/(.*?)(?:\/raw)?(?:\/.*)?$/;
  const bitbucketPrUrl = /^https?:\/\/(?:www\.)?bitbucket\.org\/(.*?)\/(.*?)\/pull-requests\/(.*?)(?:\/.*)?$/;

  function gitLabUrlGen(userName: string, projectName: string, type: string, value: string): string {
    return (
      'https://crossorigin.me/https://gitlab.com/' + userName + '/' + projectName + '/' + type + '/' + value + '.diff'
    );
  }

  function gitHubUrlGen(userName: string, projectName: string, type: string, value: string): string {
    headers.append('Accept', 'application/vnd.github.v3.diff');
    return 'https://api.github.com/repos/' + userName + '/' + projectName + '/' + type + '/' + value;
  }

  function bitbucketUrlGen(userName: string, projectName: string, type: string, value: string): string {
    const baseUrl = 'https://bitbucket.org/api/2.0/repositories/';
    if (type === 'pullrequests') {
      return baseUrl + userName + '/' + projectName + '/pullrequests/' + value + '/diff';
    }
    return baseUrl + userName + '/' + projectName + '/diff/' + value;
  }

  let values;
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
    url: fetchUrl,
    headers: headers,
  };
}

function getConfiguration(urlParams: URLParams): Diff2HtmlUIConfig {
  // Removing `diff` form `urlParams` to avoid being inserted
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { diff, ...urlParamsRest } = urlParams;
  const config: URLParams = {
    ...defaultDiff2HtmlUIConfig,
    ...urlParamsRest,
  };

  return Object.entries(config).reduce((object, [k, v]) => {
    const newObject = !Number.isNaN(Number(v))
      ? { [k]: Number(v) }
      : v === 'true' || v === 'false'
      ? { [k]: Boolean(v) }
      : { [k]: v };
    return { ...object, ...newObject };
  }, {});
}

async function getDiff(request: Request): Promise<string> {
  try {
    const result = await fetch(request.url, {
      method: 'GET',
      headers: request.headers,
      mode: 'cors',
      cache: 'default',
    });
    return result.text();
  } catch (error) {
    console.error('Failed to retrieve diff', error);
    throw error;
  }
}

function draw(diffString: string, config: Diff2HtmlUIConfig, elements: Elements): void {
  const diff2htmlUi = new Diff2HtmlUI(elements.structure.diffTarget, diffString, config);
  diff2htmlUi.draw();
}

async function prepareInitialState(elements: Elements): Promise<[Diff2HtmlUIConfig, string]> {
  const urlParams = getParamsFromSearch(window.location.search);
  const currentUrl = (urlParams && urlParams[searchParam]) || 'https://github.com/rtfpessoa/diff2html/pull/106';

  if (currentUrl !== elements.url.input.value) elements.url.input.value = currentUrl;

  const request = prepareRequest(currentUrl);

  const initialConfiguration = getConfiguration(urlParams);
  const initialDiff = await getDiff(request);

  return [initialConfiguration, initialDiff];
}

function updateBrowserUrl(config: Diff2HtmlUIConfig, newDiffUrl: string): void {
  if (history.pushState) {
    const paramString = Object.entries(config)
      .map(([k, v]) => k + '=' + v)
      .join('&');
    const newPageUrl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      '?' +
      paramString +
      '&' +
      searchParam +
      '=' +
      newDiffUrl;
    window.history.pushState({ path: newPageUrl }, '', newPageUrl);
  }
}

type Elements = {
  structure: {
    diffTarget: HTMLElement;
  };
  url: {
    input: HTMLInputElement;
    button: HTMLElement;
  };
  options: {
    outputFormat: HTMLInputElement;
    matching: HTMLInputElement;
    wordsThreshold: HTMLInputElement;
    matchingMaxComparisons: HTMLInputElement;
  };
  checkboxes: {
    drawFileList: HTMLInputElement;
  };
};

function isHTMLInputElement(arg?: unknown): arg is HTMLInputElement {
  return arg !== null && (arg as HTMLInputElement)?.value !== undefined;
}

function getHTMLInputElementById(id: string): HTMLInputElement {
  const element = document.getElementById(id);

  if (!isHTMLInputElement(element)) {
    throw new Error(`Could not find html input element with id '${id}'`);
  }

  return element;
}

function getHTMLElementById(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (element === null) {
    throw new Error(`Could not find html element with id '${id}'`);
  }

  return element;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Improves browser compatibility
  require('whatwg-fetch');

  const drawAndUpdateUrl = async (
    diffUrl: string,
    diffString: string,
    config: Diff2HtmlUIConfig,
    elements: Elements,
  ): Promise<void> => {
    updateBrowserUrl(config, diffUrl);
    const newRequest = prepareRequest(diffUrl);
    diffString = await getDiff(newRequest);
    draw(diffString, config, elements);
  };

  const elements: Elements = {
    structure: {
      diffTarget: getHTMLElementById('url-diff-container'),
    },
    url: {
      input: getHTMLInputElementById('url'),
      button: getHTMLElementById('url-btn'),
    },
    options: {
      outputFormat: getHTMLInputElementById('diff-url-options-output-format'),
      matching: getHTMLInputElementById('diff-url-options-matching'),
      wordsThreshold: getHTMLInputElementById('diff-url-options-match-words-threshold'),
      matchingMaxComparisons: getHTMLInputElementById('diff-url-options-matching-max-comparisons'),
    },
    checkboxes: {
      drawFileList: getHTMLInputElementById('diff-url-options-show-files'),
    },
  };

  let [config, diffString] = await prepareInitialState(elements);

  // Update HTML inputs from any changes in URL
  config.outputFormat && (elements.options.outputFormat.value = config.outputFormat);
  config.drawFileList && (elements.checkboxes.drawFileList.checked = config.drawFileList);
  config.matching && (elements.options.matching.value = config.matching);
  config.matchWordsThreshold && (elements.options.wordsThreshold.value = config.matchWordsThreshold.toString());
  config.matchingMaxComparisons &&
    (elements.options.matchingMaxComparisons.value = config.matchingMaxComparisons.toString());

  Object.entries(elements.options).forEach(([option, element]) =>
    element.addEventListener('change', () => {
      config = { ...config, [option]: element.value };
      drawAndUpdateUrl(elements.url.input.value, diffString, config, elements);
    }),
  );

  Object.entries(elements.checkboxes).forEach(([option, checkbox]) =>
    checkbox.addEventListener('change', () => {
      config = { ...config, [option]: checkbox.checked };
      drawAndUpdateUrl(elements.url.input.value, diffString, config, elements);
    }),
  );

  elements.url.button.addEventListener('click', async e => {
    e.preventDefault();
    const newDiffUrl = elements.url.input.value;
    const newRequest = prepareRequest(newDiffUrl);
    diffString = await getDiff(newRequest);
    drawAndUpdateUrl(newDiffUrl, diffString, config, elements);
  });

  return drawAndUpdateUrl(elements.url.input.value, diffString, config, elements);
});
