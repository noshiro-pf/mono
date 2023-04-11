export const hasKeyValue = <K extends PropertyKey, V>(
  obj: RecordBase,
  key: K,
  valueChecker: (v: unknown) => v is V
): obj is Record<K, V> => Object.hasOwn(obj, key) && valueChecker(obj[key]);
