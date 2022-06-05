import { hasKey } from './has-key';

export const hasKeyValue = <K extends PropertyKey, V>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  obj: object,
  key: K,
  valueChecker: (v: unknown) => v is V
): obj is ReadonlyRecord<K, V> =>
  // eslint-disable-next-line no-prototype-builtins
  hasKey(obj, key) && valueChecker((obj as Record<K, unknown>)[key]);
