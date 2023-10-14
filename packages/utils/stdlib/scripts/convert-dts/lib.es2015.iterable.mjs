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
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2015Iterable = (from) => {
  let ret = from;

  {
    // Array
    const slice = ret.slice(
      ret.indexOf(markers.Array.start),
      ret.indexOf(markers.Array.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          `IterableIterator<readonly [number, T]>`,
          `IterableIterator<readonly [${indexType.ret}, T]>`,
        )
        .replaceAll(
          `IterableIterator<number>`,
          `IterableIterator<${indexType.ret}>`,
        ),
    );
  }
  {
    // ArrayConstructor
    const slice = ret.slice(
      ret.indexOf(markers.ArrayConstructor.start),
      ret.indexOf(markers.ArrayConstructor.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          'mapfn: (v: T, k: number) => U,',
          `mapfn: (v: T, k: ${indexType.callbackArg}) => U,`,
        )
        .replaceAll(`): readonly U[];`, `): U[];`)
        .replaceAll(`): readonly T[];`, `): T[];`),
    );
  }
  {
    // ReadonlyArray
    const slice = ret.slice(
      ret.indexOf(markers.ReadonlyArray.start),
      ret.indexOf(markers.ReadonlyArray.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          `IterableIterator<readonly [number, T]>`,
          `IterableIterator<readonly [${indexType.ret}, T]>`,
        )
        .replaceAll(
          `IterableIterator<number>`,
          `IterableIterator<${indexType.ret}>`,
        ),
    );
  }
  {
    const slice = ret.slice(ret.indexOf(markers.TypedArrays.start), undefined);
    ret = ret.replaceAll(
      slice,
      slice.replaceAll(
        'mapfn: (v: T, k: number) => U,',
        `mapfn: (v: T, k: ${indexType.callbackArg}) => U,`,
      ),
    );
  }

  // remove readonly

  ret = ret
    .replaceAll(
      `new (): ReadonlyMap<unknown, unknown>;`,
      `new (): Map<unknown, unknown>;`,
    )
    .replaceAll(
      `new <K, V>(iterable?: Iterable<readonly [K, V]> | null): ReadonlyMap<K, V>`,
      `new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>`,
    )
    .replaceAll(
      `new <T>(iterable?: Iterable<T> | null): ReadonlySet<T>;`,
      `new <T>(iterable?: Iterable<T> | null): Set<T>;`,
    );

  // normalize newlines

  for (const line of [
    '[Symbol.iterator](): IterableIterator<number>;',
    '[Symbol.iterator](): IterableIterator<T>;',
    'entries(): IterableIterator<readonly [number, number]>;',
    'entries(): IterableIterator<readonly [T, T]>;',
    'keys(): IterableIterator<number>;',
    'values(): IterableIterator<number>;',
  ]) {
    ret = ret
      .replaceAll(`${line}\n`, `${line}\n\n`)
      .replaceAll(`${line}\n\n\n`, `${line}\n\n`);
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
      const slice = ret.slice(
        ret.indexOf(markers.TypedArray(typeName ?? '').Array.start),
        ret.indexOf(markers.TypedArray(typeName ?? '').Array.end),
      );
      ret = ret.replaceAll(
        slice,
        slice
          .replaceAll(
            `[Symbol.iterator](): IterableIterator<number>;`,
            `[Symbol.iterator](): IterableIterator<${elementType}>;`,
          )
          .replaceAll(
            `entries(): IterableIterator<readonly [number, number]>;`,
            `entries(): IterableIterator<readonly [${indexType.ret}, ${elementType}]>;`,
          )
          .replaceAll(
            `keys(): IterableIterator<number>;`,
            `keys(): IterableIterator<${indexType.ret}>;`,
          )
          .replaceAll(
            `values(): IterableIterator<number>`,
            `values(): IterableIterator<${elementType}>`,
          ),
      );
    }
    {
      const slice = ret.slice(
        ret.indexOf(markers.TypedArray(typeName ?? '').ArrayConstructor.start),
        ret.indexOf(markers.TypedArray(typeName ?? '').ArrayConstructor.end),
      );
      ret = ret.replaceAll(
        slice,
        slice
          .replaceAll(`from(`, `from<T extends number>(`)
          .replaceAll(`arrayLike: Iterable<number>,`, `arrayLike: Iterable<T>,`)
          .replaceAll(
            `mapfn?: (v: number, k: number) => number,`,
            `mapfn?: (v: T, k: SafeUint) => ${elementType},`,
          ),
      );
    }
  }

  return ret;
};
