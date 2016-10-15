var fs = require('fs');

var hogan = require('hogan.js');

var root = 'website/templates';
var pagesRoot = root + '/pages';

var websitePages = fs.readdirSync(root + '/pages');

var template = hogan.compile(readFile(root + '/template.mustache'));

var options = {
  'url': {
    'extraClass': 'template-index-min'
  }
};

websitePages.map(function(page) {
  var pagePartial = readFile(pagesRoot + '/' + page + '/' + page + '.partial.html');
  var pageAssets = readFile(pagesRoot + '/' + page + '/' + page + '-assets.partial.html');
  var pageScripts = readFile(pagesRoot + '/' + page + '/' + page + '-scripts.partial.html');

  var templateOptions = {assets: pageAssets, scripts: pageScripts, content: pagePartial};

  // Allow each page to have custom options
  var pageOptions = options[page] || {};
  for (var key in pageOptions) {
    if (pageOptions.hasOwnProperty(key)) {
      templateOptions[key] = pageOptions[key];
    }
  }

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
