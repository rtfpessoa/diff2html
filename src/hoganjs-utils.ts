import mustache, { CompiledTemplate, Partials } from 'wontache';

import { defaultTemplates } from './diff2html-templates';

export interface RawTemplates {
  [name: string]: string;
}

export interface CompiledTemplates {
  [name: string]: CompiledTemplate;
}

export interface HoganJsUtilsConfig {
  compiledTemplates?: CompiledTemplates;
  rawTemplates?: RawTemplates;
}

export default class HoganJsUtils {
  private preCompiledTemplates: CompiledTemplates;

  constructor({ compiledTemplates = {}, rawTemplates = {} }: HoganJsUtilsConfig) {
    const compiledRawTemplates = Object.entries(rawTemplates).reduce<CompiledTemplates>(
      (previousTemplates, [name, templateString]) => {
        const compiledTemplate: CompiledTemplate = mustache(templateString);
        return { ...previousTemplates, [name]: compiledTemplate };
      },
      {},
    );

    this.preCompiledTemplates = { ...defaultTemplates, ...compiledTemplates, ...compiledRawTemplates };
  }

  static compile(templateString: string): CompiledTemplate {
    return mustache(templateString);
  }

  render(namespace: string, view: string, params: object, partials?: Partials): string {
    const templateKey = this.templateKey(namespace, view);
    try {
      const template = this.preCompiledTemplates[templateKey];
      return template(params, { partials });
    } catch (e) {
      throw new Error(`Could not find template to render '${templateKey}'`);
    }
  }

  template(namespace: string, view: string): CompiledTemplate {
    return this.preCompiledTemplates[this.templateKey(namespace, view)];
  }

  private templateKey(namespace: string, view: string): string {
    return `${namespace}-${view}`;
  }
}
