export const hasName = (value: object): boolean =>
  // @sumi-expect banned-syntax/no-in-operator
  'name' in value;
