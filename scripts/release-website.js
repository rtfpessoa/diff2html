var fs = require('fs');

var hogan = require('hogan.js');

var template = hogan.compile(readFile('website/templates/template.mustache'));

var index = readFile('website/templates/index.partial.html');
var indexScripts = readFile('website/templates/index-scripts.partial.html');

var demo = readFile('website/templates/demo.partial.html');
var demoAssets = readFile('website/templates/demo-assets.partial.html');
var demoScripts = readFile('website/templates/demo-scripts.partial.html');

var indexHtml = template.render({assets: '', scripts: indexScripts, content: index});

writeFile('docs/index.html', indexHtml);

var demoHtml = template.render({assets: demoAssets, scripts: demoScripts, content: demo});

writeFile('docs/demo.html', demoHtml);

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  return fs.writeFileSync(filePath, content);
}
