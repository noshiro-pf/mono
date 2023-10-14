import { indexType, pipe } from './common.mjs';

const markers = {
  Array: {
    start: 'interface Array<T> {',
    end: 'interface ArrayConstructor {',
  },
  ArrayConstructor: {
    start: 'interface ArrayConstructor {',
    end: 'interface DateConstructor {',
  },
  ReadonlyArray: {
    start: 'interface ReadonlyArray<T> {',
    end: 'interface RegExp {',
  },
  Math: {
    start: 'interface Math {',
    end: 'interface NumberConstructor {',
  },
  NumberConstructor: {
    start: 'interface NumberConstructor {',
    end: 'interface ObjectConstructor {',
  },
  ObjectConstructor: {
    start: 'interface ObjectConstructor {',
    end: 'interface ReadonlyArray<T> {',
  },
  String: {
    start: 'interface String {',
    end: 'interface StringConstructor {',
  },
  StringConstructor: {
    start: 'interface StringConstructor {',
    end: undefined,
  },
};

/**
 *
 * @param {string} from
 * @param {boolean} commentOutDeprecated
 * @returns {string}
 */
export const convertLibEs2015Core = (from, commentOutDeprecated) => {
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
          `predicate: (value: T, index: number, obj: readonly T[]) => unknown,`,
          `predicate: (value: T, index: number, obj: readonly T[]) => boolean,`,
        )
        .replaceAll(`index: number,`, `index: ${indexType.callbackArg},`)
        .replaceAll(`  ): number;`, `  ): ${indexType.searchResult};`)
        .replaceAll(`start?: number`, `start?: ${indexType.arg}`)
        .replaceAll(`end?: number`, `end?: ${indexType.arg}`)
        .replaceAll(`index: number`, `index: ${indexType.callbackArg}`)
        .replaceAll(`start: number`, `start: ${indexType.arg}`)
        .replaceAll('target: number', `target: ${indexType.arg}`),
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
          `from<T>(arrayLike: ArrayLike<T>): readonly T[];`,
          `from<T>(arrayLike: ArrayLike<T>): T[];`,
        )
        .replaceAll(`k: number`, `k: ${indexType.callbackArg}`)
        .replaceAll(`  ): readonly U[];`, `  ): U[];`)
        .replaceAll(`): readonly T[];`, `): T[];`),
    );
  }
  {
    // Math
    const slice = ret.slice(
      ret.indexOf(markers.Math.start),
      ret.indexOf(markers.Math.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          `clz32(x: number): number;`,
          `clz32(x: number): UintRange<0, 33>;`,
        )
        .replaceAll(
          `imul(x: number, y: number): number;`,
          `imul(x: Int32, y: Int32): Int32;`,
        )
        .replaceAll(
          `sign(x: number): number;`,
          `sign(x: number): -1 | 0 | -0 | 1 | NaNType;`,
        )
        .replaceAll(
          `cosh(x: number): number;`,
          `cosh(x: number): PositiveNumber | NaNType;`,
        )
        .replaceAll(
          `acosh(x: number): number;`,
          `acosh(x: number): NonNegativeNumber | NaNType;`,
        )
        .replaceAll(
          `hypot(...values: readonly number[]): number;`,
          `hypot(...values: readonly number[]): NonNegativeNumber | NaNType;`,
        )
        .replaceAll(
          `trunc(x: number): number;`,
          `trunc(x: number): Int | InfiniteNumber | NaNType;`,
        )
        .replaceAll(
          `fround(x: number): number;`,
          `fround(x: number): Float32 | NaNType;`,
        ),
    );
  }
  {
    // NumberConstructor
    const slice = ret.slice(
      ret.indexOf(markers.NumberConstructor.start),
      ret.indexOf(markers.NumberConstructor.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          'readonly EPSILON: number;',
          'readonly EPSILON: PositiveNumber;',
        )
        .replaceAll(
          'isFinite(number: unknown): boolean;',
          'isFinite(number: number): number is FiniteNumber;',
        )
        .replaceAll(
          'isInteger(number: unknown): boolean;',
          'isInteger(number: number): number is Int;',
        )
        .replaceAll(
          'isNaN(number: unknown): boolean;',
          'isNaN(number: number): number is NaNType;',
        )
        .replaceAll(
          'isSafeInteger(number: unknown): boolean;',
          'isSafeInteger(number: number): number is SafeInt;',
        )
        .replaceAll(
          'readonly MAX_SAFE_INTEGER: number;',
          'readonly MAX_SAFE_INTEGER: SafeUint;',
        )
        .replaceAll(
          'readonly MIN_SAFE_INTEGER: number;',
          'readonly MIN_SAFE_INTEGER: SafeInt;',
        )
        .replaceAll(
          'parseFloat(string: string): number',
          'parseFloat(string: string): number | NaNType',
        )
        .replaceAll(
          'parseInt(string: string, radix?: UintRange<2, 37>): number;',
          'parseInt(string: string, radix?: UintRange<2, 37>): Int | NaNType;',
        ),
    );
  }
  {
    // ObjectConstructor
    const slice = ret.slice(
      ret.indexOf(markers.ObjectConstructor.start),
      ret.indexOf(markers.ObjectConstructor.end),
    );
    ret = ret.replaceAll(
      slice,
      pipe(slice)
        .chain((str) =>
          str.replaceAll(
            `interface ObjectConstructor {`,
            [
              '/** @internal */',
              'type ToObjectKeysValue<A> = A extends string',
              '  ? A',
              '  : A extends number',
              '  ? `${A}`',
              '  : never;',
              '',
              'interface ObjectConstructor {',
            ].join('\n'),
          ),
        )
        .chain((str) => {
          const prefix = [
            '  /**',
            '   * Returns the names of the enumerable string properties and methods of an object.',
            '   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.',
          ];

          const before = ['   */', '  keys(o: {}): readonly string[];'];

          const after = [
            '   *',
            '   * @example',
            '   * ```ts',
            "   * const ks = Object.keys({ x: 1, y: 2, z: '3', 3: 4 }); // ('3' | 'x' | 'y' | 'z')[]",
            '   * ```',
            '   */',
            '  keys<R extends RecordBase>(object: R): readonly ToObjectKeysValue<keyof R>[];',
          ];

          return str.replaceAll(
            [...prefix, ...before].join('\n'),
            [...prefix, ...after].join('\n'),
          );
        }).value,
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
        .replaceAll(`index: number`, `index: ${indexType.callbackArg}`)
        .replaceAll(`) => unknown,`, `) => boolean,`)
        .replaceAll(`  ): number;`, `  ): ${indexType.searchResult};`),
    );
  }
  {
    // String
    const slice = ret.slice(
      ret.indexOf(markers.String.start),
      ret.indexOf(markers.String.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          'codePointAt(pos: number): number | undefined',
          `codePointAt(pos: ${indexType.argNonNegative}): Uint32 | undefined`,
        )
        .replaceAll(
          `repeat(count: number): string`,
          `repeat(count: Uint): string`,
        )
        .replaceAll(
          'includes(searchString: string, position?: number): boolean;',
          `includes(searchString: string, position?: ${indexType.argNonNegative}): boolean;`,
        )
        .replaceAll(
          'endsWith(searchString: string, endPosition?: number): boolean;',
          `endsWith(searchString: string, endPosition?: ${indexType.argNonNegative}): boolean;`,
        )
        .replaceAll(
          'startsWith(searchString: string, position?: number): boolean;',
          `startsWith(searchString: string, position?: ${indexType.argNonNegative}): boolean;`,
        ),
    );
  }
  {
    // StringConstructor
    const slice = ret.slice(
      ret.indexOf(markers.StringConstructor.start),
      undefined,
    );
    ret = ret.replaceAll(
      slice,
      slice.replaceAll(
        `fromCodePoint(...codePoints: readonly number[]): string`,
        `fromCodePoint(...codePoints: readonly Uint32[]): string`,
      ),
    );
  }

  if (commentOutDeprecated) {
    // comment out deprecated functions
    for (const line of [
      'anchor(name: string): string;',
      'big(): string;',
      'blink(): string;',
      'bold(): string;',
      'fixed(): string;',
      'fontcolor(color: string): string;',
      'fontsize(size: SafeUint): string;',
      'fontsize(size: string): string;',
      'italics(): string;',
      'link(url: string): string;',
      'small(): string;',
      'strike(): string;',
      'sub(): string;',
      'sup(): string;',
    ]) {
      ret = ret.replaceAll(line, `// ${line}`);
    }
  }

  return ret;
};
