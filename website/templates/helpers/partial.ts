import handlebars, { HelperOptions } from "handlebars";

export default (name: string, options: HelperOptions): void => {
  handlebars.registerPartial(name, options.fn);
};
