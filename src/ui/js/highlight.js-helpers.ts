/*
 * Adapted Highlight.js Internal APIs
 * Used to highlight selected html elements using context
 */

import { HighlightResult } from 'highlight.js';

/* Utility functions */

function escapeHTML(value: string): string {
  return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
}

function tag(node: Node): string {
  return node.nodeName.toLowerCase();
}

/* Stream merging */

type NodeEvent = {
  event: 'start' | 'stop';
  offset: number;
  node: Node;
};

export function nodeStream(node: Node): NodeEvent[] {
  const result: NodeEvent[] = [];

  const nodeStream = (node: Node, offset: number): number => {
    for (let child = node.firstChild; child; child = child.nextSibling) {
      if (child.nodeType === 3 && child.nodeValue !== null) {
        offset += child.nodeValue.length;
      } else if (child.nodeType === 1) {
        result.push({
          event: 'start',
          offset: offset,
          node: child,
        });
        offset = nodeStream(child, offset);
        // Prevent void elements from having an end tag that would actually
        // double them in the output. There are more void elements in HTML
        // but we list only those realistically expected in code display.
        if (!tag(child).match(/br|hr|img|input/)) {
          result.push({
            event: 'stop',
            offset: offset,
            node: child,
          });
        }
      }
    }
    return offset;
  };

  nodeStream(node, 0);

  return result;
}

export function mergeStreams(original: NodeEvent[], highlighted: NodeEvent[], value: string): string {
  let processed = 0;
  let result = '';
  const nodeStack = [];

  function isElement(arg?: unknown): arg is Element {
    return arg !== null && (arg as Element)?.attributes !== undefined;
  }

  function selectStream(): NodeEvent[] {
    if (!original.length || !highlighted.length) {
      return original.length ? original : highlighted;
    }
    if (original[0].offset !== highlighted[0].offset) {
      return original[0].offset < highlighted[0].offset ? original : highlighted;
    }

    /*
       To avoid starting the stream just before it should stop the order is
       ensured that original always starts first and closes last:
       if (event1 == 'start' && event2 == 'start')
       return original;
       if (event1 == 'start' && event2 == 'stop')
       return highlighted;
       if (event1 == 'stop' && event2 == 'start')
       return original;
       if (event1 == 'stop' && event2 == 'stop')
       return highlighted;
       ... which is collapsed to:
       */
    return highlighted[0].event === 'start' ? original : highlighted;
  }

  function open(node: Node): void {
    if (!isElement(node)) {
      throw new Error('Node is not an Element');
    }

    result += `<${tag(node)} ${Array<Attr>()
      .map.call(node.attributes, attr => `${attr.nodeName}="${escapeHTML(attr.value).replace(/"/g, '&quot;')}"`)
      .join(' ')}>`;
  }

  function close(node: Node): void {
    result += '</' + tag(node) + '>';
  }

  function render(event: NodeEvent): void {
    (event.event === 'start' ? open : close)(event.node);
  }

  while (original.length || highlighted.length) {
    let stream = selectStream();
    result += escapeHTML(value.substring(processed, stream[0].offset));
    processed = stream[0].offset;
    if (stream === original) {
      /*
         On any opening or closing tag of the original markup we first close
         the entire highlighted node stack, then render the original tag along
         with all the following original tags at the same offset and then
         reopen all the tags on the highlighted stack.
         */
      nodeStack.reverse().forEach(close);
      do {
        render(stream.splice(0, 1)[0]);
        stream = selectStream();
      } while (stream === original && stream.length && stream[0].offset === processed);
      nodeStack.reverse().forEach(open);
    } else {
      if (stream[0].event === 'start') {
        nodeStack.push(stream[0].node);
      } else {
        nodeStack.pop();
      }
      render(stream.splice(0, 1)[0]);
    }
  }

  return result + escapeHTML(value.substr(processed));
}

// https://github.com/hexojs/hexo-util/blob/979873b63a725377c2bd6ad834d790023496130d/lib/highlight.js#L123
export function closeTags(res: HighlightResult): HighlightResult {
  const tokenStack = new Array<string>();

  res.value = res.value
    .split('\n')
    .map(line => {
      const prepend = tokenStack.map(token => `<span class="${token}">`).join('');
      const matches = line.matchAll(/(<span class="(.*?)">|<\/span>)/g);
      Array.from(matches).forEach(match => {
        if (match[0] === '</span>') tokenStack.shift();
        else tokenStack.unshift(match[2]);
      });
      const append = '</span>'.repeat(tokenStack.length);
      return prepend + line + append;
    })
    .join('\n');

  return res;
}

// Sourced from https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md and
// https://github.com/exercism/v2-website/blob/main/config/initializers/prism.rb#L187-L315
const languagesToExt: { [_: string]: string } = {
  '1c': '1c',
  abnf: 'abnf',
  accesslog: 'accesslog',
  as: 'actionscript',
  adb: 'ada',
  ada: 'ada',
  ads: 'ada',
  angelscript: 'angelscript',
  // asc: 'angelscript',
  apache: 'apache',
  applescript: 'applescript',
  scpt: 'applescript',
  arcade: 'arcade',
  cpp: 'cpp',
  hpp: 'cpp',
  arduino: 'arduino',
  ino: 'arduino',
  armasm: 'armasm',
  arm: 'armasm',
  xml: 'xml',
  html: 'xml',
  xhtml: 'xml',
  rss: 'xml',
  atom: 'xml',
  xjb: 'xml',
  xsd: 'xml',
  xsl: 'xml',
  plist: 'xml',
  svg: 'xml',
  asciidoc: 'asciidoc',
  adoc: 'asciidoc',
  asc: 'asciidoc',
  aspectj: 'aspectj',
  ahk: 'autohotkey',
  ahkl: 'autohotkey',
  au3: 'autoit',
  avrasm: 'avrasm',
  awk: 'awk',
  axapta: 'axapta',
  'x++': 'axapta',
  bash: 'bash',
  sh: 'bash',
  zsh: 'bash',
  b: 'basic',
  bnf: 'bnf',
  bf: 'brainfuck',
  c: 'c',
  h: 'c',
  cats: 'c',
  idc: 'c',
  cal: 'cal',
  capnproto: 'capnproto',
  capnp: 'capnproto',
  ceylon: 'ceylon',
  clean: 'clean',
  clj: 'clojure',
  boot: 'clojure',
  cl2: 'clojure',
  cljc: 'clojure',
  cljs: 'clojure',
  'cljs.hl': 'clojure',
  cljscm: 'clojure',
  cljx: 'clojure',
  hic: 'clojure',
  'clojure-repl': 'clojure-repl',
  cmake: 'cmake',
  'cmake.in': 'cmake',
  coffee: 'coffeescript',
  _coffee: 'coffeescript',
  cake: 'coffeescript',
  cjsx: 'coffeescript',
  iced: 'coffeescript',
  cson: 'coffeescript',
  coq: 'coq',
  cos: 'cos',
  cls: 'cos',
  crmsh: 'crmsh',
  crm: 'crmsh',
  pcmk: 'crmsh',
  cr: 'crystal',
  cs: 'csharp',
  csx: 'csharp',
  csp: 'csp',
  css: 'css',
  d: 'd',
  di: 'd',
  md: 'markdown',
  markdown: 'markdown',
  mdown: 'markdown',
  mdwn: 'markdown',
  mkd: 'markdown',
  mkdn: 'markdown',
  mkdown: 'markdown',
  ronn: 'markdown',
  workbook: 'markdown',
  dart: 'dart',
  dpr: 'delphi',
  dfm: 'delphi',
  pas: 'delphi',
  pascal: 'delphi',
  diff: 'diff',
  patch: 'diff',
  django: 'django',
  jinja: 'django',
  dns: 'dns',
  zone: 'dns',
  bind: 'dns',
  dockerfile: 'dockerfile',
  docker: 'dockerfile',
  dos: 'dos',
  bat: 'dos',
  cmd: 'dos',
  dsconfig: 'dsconfig',
  dts: 'dts',
  dust: 'dust',
  dst: 'dust',
  ebnf: 'ebnf',
  ex: 'elixir',
  exs: 'elixir',
  elm: 'elm',
  rb: 'ruby',
  builder: 'ruby',
  eye: 'ruby',
  gemspec: 'ruby',
  god: 'ruby',
  jbuilder: 'ruby',
  mspec: 'ruby',
  pluginspec: 'ruby',
  podspec: 'ruby',
  rabl: 'ruby',
  rake: 'ruby',
  rbuild: 'ruby',
  rbw: 'ruby',
  rbx: 'ruby',
  ru: 'ruby',
  ruby: 'ruby',
  spec: 'ruby',
  thor: 'ruby',
  watchr: 'ruby',
  erb: 'erb',
  'erlang-repl': 'erlang-repl',
  erl: 'erlang',
  'app.src': 'erlang',
  escript: 'erlang',
  hrl: 'erlang',
  xrl: 'erlang',
  yrl: 'erlang',
  excel: 'excel',
  xls: 'excel',
  xlsx: 'excel',
  fix: 'fix',
  flix: 'flix',
  f90: 'fortran',
  f: 'fortran',
  f03: 'fortran',
  f08: 'fortran',
  f77: 'fortran',
  f95: 'fortran',
  for: 'fortran',
  fpp: 'fortran',
  fs: 'fsharp',
  fsx: 'fsharp',
  gams: 'gams',
  gms: 'gams',
  gauss: 'gauss',
  gss: 'gauss',
  gcode: 'gcode',
  nc: 'gcode',
  gherkin: 'gherkin',
  glsl: 'glsl',
  fp: 'glsl',
  frag: 'glsl',
  frg: 'glsl',
  fsh: 'glsl',
  fshader: 'glsl',
  geo: 'glsl',
  geom: 'glsl',
  glslv: 'glsl',
  gshader: 'glsl',
  shader: 'glsl',
  tesc: 'glsl',
  tese: 'glsl',
  vert: 'glsl',
  vrx: 'glsl',
  vsh: 'glsl',
  vshader: 'glsl',
  gml: 'gml',
  go: 'go',
  bal: 'go',
  golo: 'golo',
  gololang: 'golo',
  gradle: 'gradle',
  groovy: 'groovy',
  grt: 'groovy',
  gtpl: 'groovy',
  gvy: 'groovy',
  haml: 'haml',
  'haml.deface': 'haml',
  handlebars: 'handlebars',
  hbs: 'handlebars',
  'html.hbs': 'handlebars',
  'html.handlebars': 'handlebars',
  hs: 'haskell',
  hsc: 'haskell',
  idr: 'haskell',
  purs: 'haskell',
  hx: 'haxe',
  hxsl: 'haxe',
  hsp: 'hsp',
  htmlbars: 'htmlbars',
  http: 'http',
  https: 'http',
  hy: 'hy',
  inform7: 'inform7',
  i7: 'inform7',
  ini: 'ini',
  toml: 'ini',
  cfg: 'ini',
  prefs: 'ini',
  // properties: 'ini',
  irpf90: 'irpf90',
  isbl: 'isbl',
  java: 'java',
  jsp: 'java',
  js: 'javascript',
  jsx: 'javascript',
  _js: 'javascript',
  bones: 'javascript',
  es: 'javascript',
  es6: 'javascript',
  gs: 'javascript',
  jake: 'javascript',
  jsb: 'javascript',
  jscad: 'javascript',
  jsfl: 'javascript',
  jsm: 'javascript',
  jss: 'javascript',
  mjs: 'javascript',
  njs: 'javascript',
  pac: 'javascript',
  sjs: 'javascript',
  ssjs: 'javascript',
  xsjs: 'javascript',
  xsjslib: 'javascript',
  cfc: 'javascript',
  'jboss-cli': 'jboss-cli',
  json: 'json',
  avsc: 'json',
  geojson: 'json',
  gltf: 'json',
  'JSON-tmLanguage': 'json',
  jsonl: 'json',
  tfstate: 'json',
  'tfstate.backup': 'json',
  topojson: 'json',
  webapp: 'json',
  webmanifest: 'json',
  jl: 'julia',
  'julia-repl': 'julia-repl',
  kt: 'kotlin',
  ktm: 'kotlin',
  kts: 'kotlin',
  lasso: 'lasso',
  // ls: 'lasso',
  lassoscript: 'lasso',
  tex: 'latex',
  ldif: 'ldif',
  leaf: 'leaf',
  less: 'less',
  lisp: 'lisp',
  factor: 'lisp',
  livecodeserver: 'livecodeserver',
  ls: 'livescript',
  _ls: 'livescript',
  llvm: 'llvm',
  lsl: 'lsl',
  lua: 'lua',
  nse: 'lua',
  p8: 'lua',
  pd_lua: 'lua',
  rbxs: 'lua',
  wlua: 'lua',
  mak: 'makefile',
  make: 'makefile',
  mk: 'makefile',
  mkfile: 'makefile',
  mathematica: 'mathematica',
  mma: 'mathematica',
  wl: 'mathematica',
  matlab: 'matlab',
  maxima: 'maxima',
  mel: 'mel',
  mercury: 'mercury',
  mipsasm: 'mipsasm',
  miz: 'mizar',
  voc: 'mizar',
  al: 'perl',
  cgi: 'perl',
  fcgi: 'perl',
  perl: 'perl',
  ph: 'perl',
  plx: 'perl',
  pl: 'perl',
  pm: 'perl',
  psgi: 'perl',
  t: 'perl',
  mojolicious: 'mojolicious',
  monkey: 'monkey',
  monkey2: 'monkey',
  moonscript: 'moonscript',
  moon: 'moonscript',
  n1ql: 'n1ql',
  nginxconf: 'nginx',
  nim: 'nim',
  nimrod: 'nim',
  nix: 'nix',
  nsi: 'nsis',
  nsh: 'nsis',
  m: 'objectivec',
  objc: 'objectivec',
  mm: 'objectivec',
  'obj-c': 'objectivec',
  'obj-c++': 'objectivec',
  'objective-c++': 'objectivec',
  fun: 'ocaml',
  sig: 'ocaml',
  // sml: 'ocaml',
  ml: 'ocaml',
  mli: 'ocaml',
  eliom: 'ocaml',
  eliomi: 'ocaml',
  ml4: 'ocaml',
  mll: 'ocaml',
  mly: 'ocaml',
  openscad: 'openscad',
  oxygene: 'oxygene',
  parser3: 'parser3',
  pf: 'pf',
  'pf.conf': 'pf',
  pgsql: 'pgsql',
  postgres: 'pgsql',
  postgresql: 'pgsql',
  php: 'php',
  aw: 'php',
  ctp: 'php',
  inc: 'php',
  php3: 'php',
  php4: 'php',
  php5: 'php',
  phps: 'php',
  phpt: 'php',
  'php-template': 'php-template',
  plaintext: 'plaintext',
  txt: 'plaintext',
  text: 'plaintext',
  pony: 'pony',
  ps: 'powershell',
  ps1: 'powershell',
  psd1: 'powershell',
  psm1: 'powershell',
  pde: 'processing',
  profile: 'profile',
  pro: 'prolog',
  prolog: 'prolog',
  yap: 'prolog',
  properties: 'properties',
  proto: 'protobuf',
  puppet: 'puppet',
  pp: 'puppet',
  purebasic: 'purebasic',
  py: 'python',
  bzl: 'python',
  gyp: 'python',
  gypi: 'python',
  lmi: 'python',
  py3: 'python',
  pyde: 'python',
  pyi: 'python',
  pyp: 'python',
  pyt: 'python',
  pyw: 'python',
  rpy: 'python',
  tac: 'python',
  wsgi: 'python',
  xpy: 'python',
  'python-repl': 'python-repl',
  pycon: 'python-repl',
  q: 'q',
  k: 'q',
  kdb: 'q',
  qml: 'qml',
  r: 'r',
  rd: 'r',
  rsx: 'r',
  reasonml: 'reasonml',
  re: 'reasonml',
  rib: 'rib',
  roboconf: 'roboconf',
  graph: 'roboconf',
  instances: 'roboconf',
  routeros: 'routeros',
  rsl: 'rsl',
  ruleslanguage: 'ruleslanguage',
  rs: 'rust',
  'rs.in': 'rust',
  sas: 'sas',
  // pony: 'scala',
  scala: 'scala',
  kojo: 'scala',
  sbt: 'scala',
  sc: 'scala',
  scm: 'scheme',
  sch: 'scheme',
  sld: 'scheme',
  sls: 'scheme',
  sps: 'scheme',
  ss: 'scheme',
  rkt: 'scheme',
  scilab: 'scilab',
  scss: 'scss',
  shell: 'shell',
  smali: 'smali',
  st: 'smalltalk',
  sml: 'sml',
  sqf: 'sqf',
  sql: 'sql',
  cql: 'sql',
  ddl: 'sql',
  mysql: 'sql',
  prc: 'sql',
  tab: 'sql',
  udf: 'sql',
  viw: 'sql',
  stan: 'stan',
  stanfuncs: 'stan',
  stata: 'stata',
  step21: 'step21',
  step: 'step21',
  stp: 'step21',
  styl: 'stylus',
  subunit: 'subunit',
  swift: 'swift',
  taggerscript: 'taggerscript',
  yml: 'yaml',
  mir: 'yaml',
  reek: 'yaml',
  rviz: 'yaml',
  'sublime-syntax': 'yaml',
  syntax: 'yaml',
  yaml: 'yaml',
  'yaml-tmlanguage': 'yaml',
  'yml.mysql': 'yaml',
  tap: 'tap',
  tcl: 'tcl',
  adp: 'tcl',
  tm: 'tcl',
  thrift: 'thrift',
  tp: 'tp',
  twig: 'twig',
  craftcms: 'twig',
  ts: 'typescript',
  tsx: 'typescript',
  vala: 'vala',
  vbnet: 'vbnet',
  vb: 'vbnet',
  vbscript: 'vbscript',
  vbs: 'vbscript',
  'vbscript-html': 'vbscript-html',
  v: 'verilog',
  veo: 'verilog',
  vhdl: 'vhdl',
  vhd: 'vhdl',
  vhf: 'vhdl',
  vhi: 'vhdl',
  vho: 'vhdl',
  vhs: 'vhdl',
  vht: 'vhdl',
  vhw: 'vhdl',
  vim: 'vim',
  x86asm: 'x86asm',
  xl: 'xl',
  xquery: 'xquery',
  xpath: 'xquery',
  xq: 'xquery',
  zephir: 'zephir',
  zep: 'zephir',
};

export function getLanguage(fileExtension: string): string {
  return languagesToExt[fileExtension] ?? 'plaintext';
}
