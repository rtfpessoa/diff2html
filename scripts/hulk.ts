/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import * as path from 'path';
import * as fs from 'fs';

import * as hogan from 'hogan.js';
import nopt from 'nopt';
import * as mkderp from 'mkdirp';

const options = nopt(
  {
    namespace: String,
    outputdir: path,
    variable: String,
    wrapper: String,
    version: true,
    help: true,
  },
  {
    n: ['--namespace'],
    o: ['--outputdir'],
    vn: ['--variable'],
    w: ['--wrapper'],
    h: ['--help'],
    v: ['--version'],
  },
);

const specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
const specialsRegExp = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
function escape(text: string): string {
  return text.replace(specialsRegExp, '\\$1');
}

function cyan(text: string): string {
  return '\x1B[36m' + text + '\x1B[39m';
}

function extractFiles(files: string[]): string[] {
  const usage = `${cyan(
    'USAGE:',
  )}  hulk [--wrapper wrapper] [--outputdir outputdir] [--namespace namespace] [--variable variable] FILES

    ${cyan('OPTIONS:')}  [-w, --wrapper]   :: wraps the template (i.e. amd)
             [-o,  --outputdir] :: outputs the templates as individual files to a directory

             [-n,  --namespace] :: prepend string to template names

             [-vn, --variable]  :: variable name for non-amd wrapper

    ${cyan('EXAMPLE:')}  hulk --wrapper amd ./templates/*.mustache

    ${cyan('NOTE:')}  hulk supports the "*" wildcard and allows you to target specific extensions too
  `;

  if (options.version) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    console.log(require('../package.json').version);
    process.exit(0);
  }

  if (!files.length || options.help) {
    console.log(usage);
    process.exit(0);
  }

  return files
    .map((fileGlob: string) => {
      if (/\*/.test(fileGlob)) {
        const [fileGlobPrefix, fileGlobSuffix] = fileGlob.split('*');

        return fs.readdirSync(fileGlobPrefix || '.').reduce<string[]>((previousFiles, relativeFilePath) => {
          const file = path.join(fileGlobPrefix, relativeFilePath);
          if (new RegExp(`${escape(fileGlobSuffix)}$`).test(relativeFilePath) && fs.statSync(file).isFile()) {
            previousFiles.push(file);
          }
          return previousFiles;
        }, []);
      } else if (fs.statSync(fileGlob).isFile()) {
        return [fileGlob];
      } else {
        return [];
      }
    })
    .reduce((previous, current) => previous.concat(current), []);
}

// Remove utf-8 byte order mark, http://en.wikipedia.org/wiki/Byte_order_mark
function removeByteOrderMark(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.substring(1);
  }
  return text;
}

// Wrap templates
function wrap(file: string, name: string, openedFile: string): string {
  const hoganTemplateString = `new Hogan.Template(${hogan.compile(openedFile, { asString: true })})`;

  const objectName = options.variable || 'templates';
  const objectAccessor = `${objectName}["${name}"]`;
  const objectStmt = `${objectAccessor} = ${hoganTemplateString};`;

  switch (options.wrapper) {
    case 'amd':
      return `define(${
        !options.outputdir ? `"${path.join(path.dirname(file), name)}", ` : ''
      }["hogan.js"], function(Hogan) { return ${hoganTemplateString}; });`;

    case 'node':
      // If we have a template per file the export will expose the template directly
      return options.outputdir ? `global.${objectStmt};\nmodule.exports = ${objectAccessor};` : `global.${objectStmt}`;

    case 'ts':
      return `// @ts-ignore\n${objectStmt}`;
    default:
      return objectStmt;
  }
}

function prepareOutput(content: string): string {
  const variableName = options.variable || 'templates';
  switch (options.wrapper) {
    case 'amd':
      return content;
    case 'node':
      return `(function() {
if (!!!global.${variableName}) global.${variableName} = {};
var Hogan = require("hogan.js");
${content}
${!options.outputdir ? `module.exports = global.${variableName};\n` : ''})();`;

    case 'ts':
      return `import * as Hogan from "hogan.js";
type CompiledTemplates = { [name: string]: Hogan.Template };
export const ${variableName}: CompiledTemplates = {};
${content}`;

    default:
      return 'if (!!!' + variableName + ') var ' + variableName + ' = {};\n' + content;
  }
}

// Write the directory
if (options.outputdir) {
  mkderp.sync(options.outputdir);
}

// Prepend namespace to template name
function namespace(name: string): string {
  return (options.namespace || '') + name;
}

// Write a template foreach file that matches template extension
const templates = extractFiles(options.argv.remain)
  .map(file => {
    const timmedFileContents = fs.readFileSync(file, 'utf8').trim();

    if (!timmedFileContents) return;

    const name = namespace(path.basename(file).replace(/\..*$/, ''));
    const cleanFileContents = wrap(file, name, removeByteOrderMark(timmedFileContents));

    if (!options.outputdir) return cleanFileContents;

    const fileExtension = options.wrapper === 'ts' ? 'ts' : 'js';

    return fs.writeFileSync(path.join(options.outputdir, `${name}.${fileExtension}`), prepareOutput(cleanFileContents));
  })
  .filter(templateContents => typeof templateContents !== 'undefined');

// Output templates
if (!templates.length || options.outputdir) process.exit(0);

console.log(prepareOutput(templates.join('\n')));
