/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2015Collection = (from) => {
  let ret = from;

  // change Set.has() and Map.has() to accept widen literal types
  ret = ret.replaceAll(
    'has(key: K): boolean;',
    'has(key: K | (WidenLiteral<K> & {})): key is K;'
  );
  ret = ret.replaceAll(
    'has(value: T): boolean;',
    'has(value: T | (WidenLiteral<T> & {})): value is T;'
  );

  // remove readonly
  ret = ret.replaceAll(
    'interface MapConstructor {\n  new (): ReadonlyMap<unknown, unknown>;\n  new <K, V>(entries?: readonly (readonly [K, V])[] | null): ReadonlyMap<K, V>;\n  readonly prototype: ReadonlyMap<unknown, unknown>;\n}',
    'interface MapConstructor {\n  new (): Map<unknown, unknown>;\n  new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;\n  readonly prototype: Map<unknown, unknown>;\n}'
  );
  ret = ret.replaceAll(
    'interface SetConstructor {\n  new <T = unknown>(values?: readonly T[] | null): ReadonlySet<T>;\n  readonly prototype: ReadonlySet<unknown>;\n}',
    'interface SetConstructor {\n  new <T = unknown>(values?: readonly T[] | null): Set<T>;\n  readonly prototype: Set<unknown>;\n}'
  );

  return ret;
};
