export const hasKeyValue = <K extends PropertyKey, V>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  rec: object,
  key: K,
  valueChecker: (v: unknown) => v is V
): rec is ReadonlyRecord<K, V> =>
  // eslint-disable-next-line no-prototype-builtins
  rec.hasOwnProperty(key) && valueChecker((rec as Record<K, unknown>)[key]);
