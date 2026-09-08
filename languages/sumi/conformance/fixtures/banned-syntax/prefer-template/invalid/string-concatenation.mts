export const greet = (name: string): string =>
  // @sumi-expect-error banned-syntax/prefer-template
  'Hello, ' + name;
