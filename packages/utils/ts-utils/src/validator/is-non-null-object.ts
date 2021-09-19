// eslint-disable-next-line @typescript-eslint/ban-types
export const isNonNullObject = (data: unknown): data is object =>
  typeof data === 'object' && data !== null;
