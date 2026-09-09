export const hasName = (value: object): boolean =>
  // @sumi-expect-error banned-syntax/no-in-operator
  'name' in value;
