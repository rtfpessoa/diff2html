var fs = require('fs');

var hogan = require('hogan.js');

var template = hogan.compile(readFile('src/templates/template.mustache'));

var index = readFile('src/templates/index.partial.html');
var indexScripts = readFile('src/templates/index-scripts.partial.html');

var demo = readFile('src/templates/demo.partial.html');
var demoAssets = readFile('src/templates/demo-assets.partial.html');
var demoScripts = readFile('src/templates/demo-scripts.partial.html');

var indexHtml = template.render({assets: '', scripts: indexScripts, content: index});

writeFile('index.html', indexHtml);

var demoHtml = template.render({assets: demoAssets, scripts: demoScripts, content: demo});

writeFile('demo.html', demoHtml);

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  return fs.writeFileSync(filePath, content);
}
