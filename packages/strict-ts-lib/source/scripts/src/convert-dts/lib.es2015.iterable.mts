import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

export const convertLibEs2015Iterable = (source: string): string =>
  pipe(source)
    .chain(
      // Array
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Array<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                `IterableIterator<readonly [number, T]>`,
                `IterableIterator<readonly [${NumberType.ArraySize}, T]>`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `IterableIterator<number>`,
                `IterableIterator<${NumberType.ArraySize}>`,
              ),
            ).value,
      }),
    )
    .chain(
      // ArrayConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice).chainMonoTypeFns([
            replaceWithNoMatchCheck(
              `from<T>(iterable: Iterable<T> | ArrayLike<T>): readonly T[]`,
              `from<T>(iterable: Iterable<T> | ArrayLike<T>): T[]`,
            ),
            replaceWithNoMatchCheck(
              `from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: unknown): readonly U[];`,
              `from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: ${NumberType.ArraySize}) => U, thisArg?: unknown): U[];`,
            ),
          ]).value,
      }),
    )
    .chain(
      // ReadonlyArray
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ReadonlyArray<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                `IterableIterator<readonly [number, T]>`,
                `IterableIterator<readonly [${NumberType.ArraySize}, T]>`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `IterableIterator<number>`,
                `IterableIterator<${NumberType.ArraySize}>`,
              ),
            ).value,
      }),
    )
    .chain(
      // remove readonly
      replaceWithNoMatchCheck(
        `new (): ReadonlyMap<unknown, unknown>;`,
        `new (): Map<never, never>;`,
      ),
    )
    .chain(
      // remove readonly
      replaceWithNoMatchCheck(
        `new <K, V>(iterable?: Iterable<readonly [K, V]> | null): ReadonlyMap<K, V>`,
        `new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>`,
      ),
    )
    .chain(
      // remove readonly
      replaceWithNoMatchCheck(
        `new <T>(iterable?: Iterable<T> | null): ReadonlySet<T>;`,
        `new <T>(iterable?: Iterable<T> | null): Set<T>;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `interface SetConstructor {`,
        [
          //
          `interface SetConstructor {`,
          `  new (): Set<never>;`,
        ].join('\n'),
      ),
    )
    .chainMonoTypeFns(
      (
        [
          '[Symbol.iterator](): IterableIterator<T>;',
          'entries(): IterableIterator<readonly [number, number]>;',
          'entries(): IterableIterator<readonly [T, T]>;',
          'keys(): IterableIterator<number>;',
        ] as const
      ).flatMap(
        // normalize newlines
        (line) => [
          replaceWithNoMatchCheck(`${line}\n`, `${line}\n\n`),
          replaceWithNoMatchCheck(`${line}\n\n\n`, `${line}\n\n`),
        ],
      ),
    )
    .chainMonoTypeFns(
      (
        [
          ['Int8Array', 'Int8'],
          ['Uint8Array', 'Uint8'],
          ['Uint8ClampedArray', 'Uint8'],
          ['Int16Array', 'Int16'],
          ['Uint16Array', 'Uint16'],
          ['Int32Array', 'Int32'],
          ['Uint32Array', 'Uint32'],
          ['Float32Array', 'Float32'],
          ['Float64Array', 'Float64'],
        ] as const
      ).flatMap(([typeName, elementType]) => [
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${typeName} {`,
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(
                replaceWithNoMatchCheck(
                  `[Symbol.iterator](): IterableIterator<number>;`,
                  `[Symbol.iterator](): IterableIterator<${elementType}>;\n`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `entries(): IterableIterator<readonly [number, number]>;`,
                  `entries(): IterableIterator<readonly [${NumberType.TypedArraySize}, ${elementType}]>;`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `keys(): IterableIterator<number>;`,
                  `keys(): IterableIterator<${NumberType.TypedArraySize}>;`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `values(): IterableIterator<number>`,
                  `values(): IterableIterator<${elementType}>`,
                ),
              ).value,
        }),
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${typeName}Constructor {`,
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(
                replaceWithNoMatchCheck(`from(`, `from<T extends number>(`),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `arrayLike: Iterable<number>,`,
                  `arrayLike: Iterable<T>,`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `mapfn?: (v: number, k: number) => number,`,
                  `mapfn?: (v: T, k: ${NumberType.SafeUint}) => ${elementType},`,
                ),
              ).value,
        }),
      ]),
    ).value;
