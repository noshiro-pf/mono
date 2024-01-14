import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
import { indexType } from './common.mjs';

const markers = {
  Array: {
    start: 'interface Array<T> {',
    end: 'interface ArrayConstructor {',
  },
  ArrayConstructor: {
    start: 'interface ArrayConstructor {',
    end: 'interface ReadonlyArray<T> {',
  },
  ReadonlyArray: {
    start: 'interface ReadonlyArray<T> {',
    end: 'interface IArguments {',
  },

  /** @param {string} elem */
  TypedArray: (elem) => ({
    Array: {
      start: `interface ${elem} {`,
      end: `interface ${elem}Constructor {`,
    },
    ArrayConstructor: {
      start: `interface ${elem}Constructor {`,
      end: `  ): ${elem};`,
    },
  }),

  TypedArrays: {
    start: 'interface Int8Array {',
    end: undefined,
  },
};

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2015Iterable = (from) => {
  let mut_ret = from;

  {
    // Array
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.Array.start),
      mut_ret.indexOf(markers.Array.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              `IterableIterator<readonly [number, T]>`,
              `IterableIterator<readonly [${indexType.ret}, T]>`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `IterableIterator<number>`,
              `IterableIterator<${indexType.ret}>`,
            ),
          ).value,
      ),
    ).value;
  }
  {
    // ArrayConstructor
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.ArrayConstructor.start),
      mut_ret.indexOf(markers.ArrayConstructor.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              'mapfn: (v: T, k: number) => U,',
              `mapfn: (v: T, k: ${indexType.callbackArg}) => U,`,
            ),
          )
          .chain(replaceWithNoMatchCheck(`): readonly U[];`, `): U[];`))
          .chain(replaceWithNoMatchCheck(`): readonly T[];`, `): T[];`)).value,
      ),
    ).value;
  }
  {
    // ReadonlyArray
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.ReadonlyArray.start),
      mut_ret.indexOf(markers.ReadonlyArray.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              `IterableIterator<readonly [number, T]>`,
              `IterableIterator<readonly [${indexType.ret}, T]>`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `IterableIterator<number>`,
              `IterableIterator<${indexType.ret}>`,
            ),
          ).value,
      ),
    ).value;
  }
  // {
  //   const slice = mut_ret.slice(
  //     mut_ret.indexOf(markers.TypedArrays.start),
  //     undefined,
  //   );
  //   mut_ret = pipe(mut_ret).chain(
  //     replaceWithNoMatchCheck(
  //       slice,
  //       replaceWithNoMatchCheck(
  //         'mapfn: (v: T, k: number) => U,',
  //         `mapfn: (v: T, k: ${indexType.callbackArg}) => U,`,
  //       )(slice),
  //     ),
  //   ).value;
  // }

  // remove readonly

  mut_ret = pipe(mut_ret)
    .chain(
      replaceWithNoMatchCheck(
        `new (): ReadonlyMap<unknown, unknown>;`,
        `new (): Map<unknown, unknown>;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `new <K, V>(iterable?: Iterable<readonly [K, V]> | null): ReadonlyMap<K, V>`,
        `new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `new <T>(iterable?: Iterable<T> | null): ReadonlySet<T>;`,
        `new <T>(iterable?: Iterable<T> | null): Set<T>;`,
      ),
    ).value;

  // normalize newlines

  for (const line of [
    '[Symbol.iterator](): IterableIterator<T>;',
    'entries(): IterableIterator<readonly [number, number]>;',
    'entries(): IterableIterator<readonly [T, T]>;',
    'keys(): IterableIterator<number>;',
  ]) {
    mut_ret = pipe(mut_ret)
      .chain(replaceWithNoMatchCheck(`${line}\n`, `${line}\n\n`))
      .chain(replaceWithNoMatchCheck(`${line}\n\n\n`, `${line}\n\n`)).value;
  }

  for (const [typeName, elementType] of [
    ['Int8Array', 'Int8'],
    ['Uint8Array', 'Uint8'],
    ['Uint8ClampedArray', 'Uint8'],
    ['Int16Array', 'Int16'],
    ['Uint16Array', 'Uint16'],
    ['Int32Array', 'Int32'],
    ['Uint32Array', 'Uint32'],
    ['Float32Array', 'Float32'],
    ['Float64Array', 'Float64'],
  ]) {
    {
      const slice = mut_ret.slice(
        mut_ret.indexOf(markers.TypedArray(typeName ?? '').Array.start),
        mut_ret.indexOf(markers.TypedArray(typeName ?? '').Array.end),
      );
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(
          slice,
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
                `entries(): IterableIterator<readonly [${indexType.ret}, ${elementType}]>;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `keys(): IterableIterator<number>;`,
                `keys(): IterableIterator<${indexType.ret}>;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `values(): IterableIterator<number>`,
                `values(): IterableIterator<${elementType}>`,
              ),
            ).value,
        ),
      ).value;
    }
    {
      const slice = mut_ret.slice(
        mut_ret.indexOf(
          markers.TypedArray(typeName ?? '').ArrayConstructor.start,
        ),
        mut_ret.indexOf(
          markers.TypedArray(typeName ?? '').ArrayConstructor.end,
        ),
      );
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(
          slice,
          pipe(slice)
            .chain(replaceWithNoMatchCheck(`from(`, `from<T extends number>(`))
            .chain(
              replaceWithNoMatchCheck(
                `arrayLike: Iterable<number>,`,
                `arrayLike: Iterable<T>,`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `mapfn?: (v: number, k: number) => number,`,
                `mapfn?: (v: T, k: SafeUint) => ${elementType},`,
              ),
            ).value,
        ),
      ).value;
    }
  }

  return mut_ret;
};
