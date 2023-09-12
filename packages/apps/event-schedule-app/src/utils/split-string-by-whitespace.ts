export const splitStringByWhitespace = (str: string): readonly string[] =>
  // eslint-disable-next-line prefer-named-capture-group
  str.split(/(\s+)/u);
