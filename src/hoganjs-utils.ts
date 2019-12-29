import * as Hogan from 'hogan.js';

import { defaultTemplates } from './diff2html-templates';

export interface RawTemplates {
  [name: string]: string;
}

export interface CompiledTemplates {
  [name: string]: Hogan.Template;
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
        const compiledTemplate: Hogan.Template = Hogan.compile(templateString, { asString: false });
        return { ...previousTemplates, [name]: compiledTemplate };
      },
      {},
    );

    this.preCompiledTemplates = { ...defaultTemplates, ...compiledTemplates, ...compiledRawTemplates };
  }

  static compile(templateString: string): Hogan.Template {
    return Hogan.compile(templateString, { asString: false });
  }

  render(namespace: string, view: string, params: Hogan.Context, partials?: Hogan.Partials, indent?: string): string {
    const templateKey = this.templateKey(namespace, view);
    try {
      const template = this.preCompiledTemplates[templateKey];
      return template.render(params, partials, indent);
    } catch (e) {
      throw new Error(`Could not find template to render '${templateKey}'`);
    }
  }

  template(namespace: string, view: string): Hogan.Template {
    return this.preCompiledTemplates[this.templateKey(namespace, view)];
  }

  private templateKey(namespace: string, view: string): string {
    return `${namespace}-${view}`;
  }
}
