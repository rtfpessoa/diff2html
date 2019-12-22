import handlebars, { HelperOptions } from "handlebars";

const loadPartial = <T>(name: string): handlebars.Template<T> => {
  let partial = handlebars.partials[name];
  if (typeof partial === "string") {
    partial = handlebars.compile(partial);
    handlebars.partials[name] = partial;
  }
  return partial;
};

export default (name: string, options: HelperOptions): string => {
  const partial = loadPartial(name) || options.fn;
  return partial(this, { data: options.hash });
};
