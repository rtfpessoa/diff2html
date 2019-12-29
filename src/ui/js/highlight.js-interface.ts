/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/camelcase */

export interface HighlightJS {
  highlight(name: string, value: string, ignore_illegals?: boolean, continuation?: ICompiledMode): IHighlightResult;

  highlightAuto(value: string, languageSubset?: string[]): IAutoHighlightResult;

  getLanguage(name: string): IMode;
}

export interface IAutoHighlightResult extends IHighlightResultBase {
  second_best?: IAutoHighlightResult;
}

export interface IHighlightResultBase {
  relevance: number;
  language: string;
  value: string;
}

export interface IHighlightResult extends IHighlightResultBase {
  top: ICompiledMode;
}

export interface IMode extends IModeBase {
  keywords?: any;
  contains?: IMode[];
}

// Reference:
// https://github.com/isagalaev/highlight.js/blob/master/docs/reference.rst
export interface IModeBase {
  className?: string;
  aliases?: string[];
  begin?: string | RegExp;
  end?: string | RegExp;
  case_insensitive?: boolean;
  beginKeyword?: string;
  endsWithParent?: boolean;
  lexems?: string;
  illegal?: string;
  excludeBegin?: boolean;
  excludeEnd?: boolean;
  returnBegin?: boolean;
  returnEnd?: boolean;
  starts?: string;
  subLanguage?: string;
  subLanguageMode?: string;
  relevance?: number;
  variants?: IMode[];
}

export interface ICompiledMode extends IModeBase {
  compiled: boolean;
  contains?: ICompiledMode[];
  keywords?: Object;
  terminators: RegExp;
  terminator_end?: string;
}

export interface IOptions {
  classPrefix?: string;
  tabReplace?: string;
  useBR?: boolean;
  languages?: string[];
}
