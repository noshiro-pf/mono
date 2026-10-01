export const hasName = (value: Readonly<Record<string, unknown>>): boolean =>
  Object.hasOwn(value, 'name');
