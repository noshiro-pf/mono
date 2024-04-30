import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

export const convertLibEs2015Collection = (source: string): string =>
  pipe(source)
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
        //
        'size: number',
        `size: ${NumberType.ArraySize}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface MapConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                'ReadonlyMap<unknown, unknown>;',
                'Map<never, never>;',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                //
                '): ReadonlyMap<K, V>;',
                '): Map<K, V>;',
              ),
            ).value,
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface SetConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                //
                'new <T = unknown>',
                'new <T = never>',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                //
                'ReadonlySet<T>;',
                'Set<T>;',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'prototype: ReadonlySet<unknown>',
                'prototype: Set<never>',
              ),
            ).value,
      }),
    ).value;
