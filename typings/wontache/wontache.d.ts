declare module 'wontache' {
  export default function compile(template: string | object): CompiledTemplate;
  type Partials = {
    [_: string]: string | object;
  };
  type Options = {
    partials?: Partials;
  };
  interface CompiledTemplate {
    (data: object, opt?: Options): string;
    source: string;
  }
}
