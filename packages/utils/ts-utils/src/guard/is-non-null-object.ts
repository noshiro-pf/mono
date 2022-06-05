// eslint-disable-next-line @typescript-eslint/ban-types
export const isNonNullObject = (a: unknown): a is object =>
  typeof a === 'object' && a !== null;
