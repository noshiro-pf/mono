export const hasKey = <K extends PropertyKey>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  rec: object,
  key: K
): rec is ReadonlyRecord<K, unknown> =>
  // eslint-disable-next-line no-prototype-builtins
  rec.hasOwnProperty(key);
