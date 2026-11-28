declare module '@profoundlogic/hogan' {
  export interface Context {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface SectionTags {
    o: string;
    c: string;
  }

  export interface HoganOptions {
    asString?: boolean | undefined;
    sectionTags?: readonly SectionTags[] | undefined;
    delimiters?: string | undefined;
    disableLambda?: boolean | undefined;
  }

  export interface Token {
    tag: string;
    otag?: string | undefined;
    ctag?: string | undefined;
    i?: number | undefined;
    n?: string | undefined;
    text?: string | undefined;
  }

  export interface Leaf extends Token {
    end: number;
    nodes: Token[];
  }

  export type Tree = Leaf[];

  export interface Partials {
    [symbol: string]: HoganTemplate;
  }

  export class HoganTemplate {
    render(context: Context, partials?: Partials, indent?: string): string;
  }

  export { HoganTemplate as Template, HoganTemplate as template };

  export function compile(text: string, options?: HoganOptions & { asString: false }): HoganTemplate;
  export function compile(text: string, options?: HoganOptions & { asString: true }): string;
  export function compile(text: string, options?: HoganOptions): HoganTemplate | string;

  export function scan(text: string, delimiters?: string): Token[];

  export function parse(tokens: readonly Token[], text?: undefined, options?: HoganOptions): Tree;
}
