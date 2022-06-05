export const hasKey = <K extends PropertyKey>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  obj: object,
  key: K
): obj is ReadonlyRecord<K, unknown> =>
  // eslint-disable-next-line no-restricted-globals, prefer-object-has-own
  Object.prototype.hasOwnProperty.call(obj, key);
