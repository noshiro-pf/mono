import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2015Collection = (from) =>
  pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        // change Set.has() and Map.has() to accept widen literal types
        'has(key: K): boolean;',
        'has(key: K | (WidenLiteral<K> & {})): key is K;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'has(value: T): boolean;',
        'has(value: T | (WidenLiteral<T> & {})): value is T;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // remove readonly
        [
          'interface MapConstructor {',
          '  new (): ReadonlyMap<unknown, unknown>;',
          '  new <K, V>(entries?: readonly (readonly [K, V])[] | null): ReadonlyMap<K, V>;',
          '  readonly prototype: ReadonlyMap<unknown, unknown>;',
          '}',
        ].join('\n'),
        [
          'interface MapConstructor {',
          '  new (): Map<unknown, unknown>;',
          '  new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;',
          '  readonly prototype: Map<unknown, unknown>;',
          '}',
        ].join('\n'),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        [
          'interface SetConstructor {',
          '  new <T = unknown>(values?: readonly T[] | null): ReadonlySet<T>;',
          '  readonly prototype: ReadonlySet<unknown>;',
          '}',
        ].join('\n'),
        [
          'interface SetConstructor {',
          '  new <T = unknown>(values?: readonly T[] | null): Set<T>;',
          '  readonly prototype: Set<unknown>;',
          '}',
        ].join('\n'),
      ),
    ).value;
