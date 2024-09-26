import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import {
  closeBraceRegexp,
  enumType,
  idFn,
  type ConverterOptions,
} from './common.mjs';

export const convertLibEs2015Iterable = ({
  brandedNumber,
  readonlyModifier,
  config: { returnType },
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    // Array
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface Array<T> {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        replaceWithNoMatchCheck(
          `ArrayIterator<readonly [number, T]>`,
          `ArrayIterator<readonly [${brandedNumber.ArraySize}, T]>`,
        ),
        replaceWithNoMatchCheck(
          `ArrayIterator<number>`,
          `ArrayIterator<${brandedNumber.ArraySize}>`,
        ),
      ),
    }),

    // ArrayConstructor
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface ArrayConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        returnType === 'readonly'
          ? idFn
          : replaceWithNoMatchCheck(
              `from<T>(iterable: Iterable<T> | ArrayLike<T>): readonly T[]`,
              `from<T>(iterable: Iterable<T> | ArrayLike<T>): T[]`,
            ),
        replaceWithNoMatchCheck(
          `from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: unknown): readonly U[];`,
          `from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: ${brandedNumber.ArraySize}) => U, thisArg?: unknown): ${readonlyModifier}U[];`,
        ),
      ),
    }),

    // ReadonlyArray
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface ReadonlyArray<T> {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        replaceWithNoMatchCheck(
          `ArrayIterator<readonly [number, T]>`,
          `ArrayIterator<readonly [${brandedNumber.ArraySize}, T]>`,
        ),
        replaceWithNoMatchCheck(
          `ArrayIterator<number>`,
          `ArrayIterator<${brandedNumber.ArraySize}>`,
        ),
      ),
    }),

    // remove readonly
    replaceWithNoMatchCheck(
      `new (): ReadonlyMap<unknown, unknown>;`,
      `new (): Map<never, never>;`,
    ),

    // remove readonly
    replaceWithNoMatchCheck(
      `new <K, V>(iterable?: Iterable<readonly [K, V]> | null): ReadonlyMap<K, V>`,
      `new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>`,
    ),

    // remove readonly
    replaceWithNoMatchCheck(
      `new <T>(iterable?: Iterable<T> | null): ReadonlySet<T>;`,
      `new <T>(iterable?: Iterable<T> | null): Set<T>;`,
    ),

    replaceWithNoMatchCheck(
      `interface SetConstructor {`,
      [
        //
        `interface SetConstructor {`,
        `  new (): Set<never>;`,
      ].join('\n'),
    ),

    ...(
      [
        ['Int8Array', enumType.Int8],
        ['Uint8Array', enumType.Uint8],
        ['Uint8ClampedArray', enumType.Uint8],
        ['Int16Array', brandedNumber.Int16],
        ['Uint16Array', brandedNumber.Uint16],
        ['Int32Array', brandedNumber.Int32],
        ['Uint32Array', brandedNumber.Uint32],
        ['Float32Array', brandedNumber.Float32],
        ['Float64Array', brandedNumber.Float64],
      ] as const
    ).flatMap(([typeName, elementType]) => [
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: `interface ${typeName} {`,
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            `[Symbol.iterator](): ArrayIterator<number>;`,
            `[Symbol.iterator](): ArrayIterator<${elementType}>;`,
          ),
          replaceWithNoMatchCheck(
            `entries(): ArrayIterator<readonly [number, number]>;`,
            `entries(): ArrayIterator<readonly [${brandedNumber.TypedArraySize}, ${elementType}]>;`,
          ),
          replaceWithNoMatchCheck(
            `keys(): ArrayIterator<number>;`,
            `keys(): ArrayIterator<${brandedNumber.TypedArraySize}>;`,
          ),
          replaceWithNoMatchCheck(
            `values(): ArrayIterator<number>`,
            `values(): ArrayIterator<${elementType}>`,
          ),
        ),
      }),
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: `interface ${typeName}Constructor {`,
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            //
            'from(',
            'from<T extends number>(',
          ),
          replaceWithNoMatchCheck(
            'arrayLike: Iterable<number>,',
            'arrayLike: Iterable<T>,',
          ),
          replaceWithNoMatchCheck(
            'mapfn?: (v: number, k: number) => number,',
            `mapfn?: (v: T, k: ${brandedNumber.TypedArraySize}) => ${elementType},`,
          ),
        ),
      }),
    ]),
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface Iterator<',
      endRegexp: closeBraceRegexp,
      mapFn: replaceWithNoMatchCheck(
        `next(...[value]: readonly [] | readonly [TNext]): IteratorResult<T, TReturn>;`,
        `next(...[value]: [] | [TNext]): IteratorResult<T, TReturn>;`,
      ),
    }),
    returnType === 'readonly'
      ? idFn
      : replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface PromiseConstructor {',
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            '): Promise<readonly Awaited<T>[]>',
            '): Promise<Awaited<T>[]>',
          ),
        }),
  );
