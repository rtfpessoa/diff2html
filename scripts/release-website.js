var fs = require('fs');

var hogan = require('hogan.js');

var root = 'website/templates';
var pagesRoot = root + '/pages';

var websitePages = fs.readdirSync(root + '/pages');

var template = hogan.compile(readFile(root + '/template.mustache'));

var options = {
  'all': {
    'demoUrl': 'demo.html?diff=https://github.com/rtfpessoa/diff2html/pull/106'
  },
  'demo': {
    'extraClass': 'template-index-min'
  }
};

websitePages.map(function(page) {
  var pagePartialTemplate = hogan.compile(readFile(pagesRoot + '/' + page + '/' + page + '.partial.mustache'));
  var pageAssetsTemplate = hogan.compile(readFile(pagesRoot + '/' + page + '/' + page + '-assets.partial.mustache'));
  var pageScriptsTemplate = hogan.compile(readFile(pagesRoot + '/' + page + '/' + page + '-scripts.partial.mustache'));

  var templateOptions = {};

  var key;

  // Allow the pages to share common options
  var genericOptions = options['all'] || {};
  for (key in genericOptions) {
    if (genericOptions.hasOwnProperty(key)) {
      templateOptions[key] = genericOptions[key];
    }
  }

  // Allow each page to have custom options
  var pageOptions = options[page] || {};
  for (key in pageOptions) {
    if (pageOptions.hasOwnProperty(key)) {
      templateOptions[key] = pageOptions[key];
    }
  }

  var pagePartial = pagePartialTemplate.render(templateOptions);
  var pageAssets = pageAssetsTemplate.render(templateOptions);
  var pageScripts = pageScriptsTemplate.render(templateOptions);

  templateOptions.assets = pageAssets;
  templateOptions.scripts = pageScripts;
  templateOptions.content = pagePartial;

  var pageHtml = template.render(templateOptions);
  writeFile('docs/' + page + '.html', pageHtml);
});

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_ignore) {
  }

  return '';
}

function writeFile(filePath, content) {
  return fs.writeFileSync(filePath, content);
}
