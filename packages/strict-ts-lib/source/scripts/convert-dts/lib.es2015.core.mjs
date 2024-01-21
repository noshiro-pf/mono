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
  },
};

/**
 * @param {string} from
 * @param {boolean} commentOutDeprecated
 * @returns {string}
 */
export const convertLibEs2015Core = (from, commentOutDeprecated) => {
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
              `predicate: (value: T, index: number, obj: readonly T[]) => unknown,`,
              `predicate: (value: T, index: number, obj: readonly T[]) => boolean,`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `index: number,`,
              `index: ${indexType.callbackArg},`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  ): number;`,
              `  ): ${indexType.searchResult};`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `start?: number`,
              `start?: ${indexType.arg}`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(`end?: number`, `end?: ${indexType.arg}`),
          )
          .chain(
            replaceWithNoMatchCheck(`start: number`, `start: ${indexType.arg}`),
          )
          .chain(
            replaceWithNoMatchCheck(
              'target: number',
              `target: ${indexType.arg}`,
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
              `from<T>(arrayLike: ArrayLike<T>): readonly T[];`,
              `from<T>(arrayLike: ArrayLike<T>): T[];`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(`k: number`, `k: ${indexType.callbackArg}`),
          )
          .chain(replaceWithNoMatchCheck(`  ): readonly U[];`, `  ): U[];`))
          .chain(replaceWithNoMatchCheck(`): readonly T[];`, `): T[];`)).value,
      ),
    ).value;
  }
  {
    // Math
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.Math.start),
      mut_ret.indexOf(markers.Math.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              `  clz32(x: number): number;`,
              `  clz32(x: number): UintRange<0, 33>;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  imul(x: number, y: number): number;`,
              `  imul(x: Int32, y: Int32): Int32;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  sign(x: number): number;`,
              `  sign(x: number): -1 | 0 | -0 | 1 | NaNType;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  acosh(x: number): number;`,
              `  acosh(x: number): NonNegativeNumber | NaNType;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  cosh(x: number): number;`,
              `  cosh(x: number): PositiveNumber | NaNType;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  hypot(...values: readonly number[]): number;`,
              `  hypot(...values: readonly number[]): NonNegativeNumber | NaNType;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  trunc(x: number): number;`,
              `  trunc(x: number): Int | InfiniteNumber | NaNType;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  fround(x: number): number;`,
              `  fround(x: number): Float32 | NaNType;`,
            ),
          ).value,
      ),
    ).value;
  }
  {
    // NumberConstructor
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.NumberConstructor.start),
      mut_ret.indexOf(markers.NumberConstructor.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              'readonly EPSILON: number;',
              'readonly EPSILON: PositiveNumber;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  isFinite(number: unknown): boolean;',
              '  isFinite(number: number): number is FiniteNumber;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  isInteger(number: unknown): boolean;',
              '  isInteger(number: number): number is Int;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  isNaN(number: unknown): boolean;',
              '  isNaN(number: number): number is NaNType;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  isSafeInteger(number: unknown): boolean;',
              '  isSafeInteger(number: number): number is SafeInt;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'readonly MAX_SAFE_INTEGER: number;',
              'readonly MAX_SAFE_INTEGER: SafeUint;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'readonly MIN_SAFE_INTEGER: number;',
              'readonly MIN_SAFE_INTEGER: SafeInt;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  parseFloat(string: string): number',
              '  parseFloat(string: string): number | NaNType',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  parseInt(string: string, radix?: UintRange<2, 37>): number;',
              '  parseInt(string: string, radix?: UintRange<2, 37>): Int | NaNType;',
            ),
          ).value,
      ),
    ).value;
  }
  {
    // ObjectConstructor
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.ObjectConstructor.start),
      mut_ret.indexOf(markers.ObjectConstructor.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              `interface ObjectConstructor {`,
              [
                '/** @internal */',
                'type ToObjectKeysValue<A> = A extends string',
                '  ? A',
                '  : A extends number',
                // eslint-disable-next-line no-template-curly-in-string
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

            return replaceWithNoMatchCheck(
              [...prefix, ...before].join('\n'),
              [...prefix, ...after].join('\n'),
            )(str);
          }).value,
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
              `index: number`,
              `index: ${indexType.callbackArg}`,
            ),
          )
          .chain(replaceWithNoMatchCheck(`) => unknown,`, `) => boolean,`))
          .chain(
            replaceWithNoMatchCheck(
              `  ): number;`,
              `  ): ${indexType.searchResult};`,
            ),
          ).value,
      ),
    ).value;
  }
  {
    // String
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.String.start),
      mut_ret.indexOf(markers.String.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              '  codePointAt(pos: number): number | undefined',
              `  codePointAt(pos: ${indexType.argNonNegative}): Uint32 | undefined`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  repeat(count: number): string`,
              `  repeat(count: Uint): string`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  includes(searchString: string, position?: number): boolean;',
              `  includes(searchString: string, position?: ${indexType.argNonNegative}): boolean;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  endsWith(searchString: string, endPosition?: number): boolean;',
              `  endsWith(searchString: string, endPosition?: ${indexType.argNonNegative}): boolean;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  startsWith(searchString: string, position?: number): boolean;',
              `  startsWith(searchString: string, position?: ${indexType.argNonNegative}): boolean;`,
            ),
          ).value,
      ),
    ).value;
  }
  {
    // StringConstructor
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.StringConstructor.start),
      undefined,
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            `  fromCodePoint(...codePoints: readonly number[]): string`,
            `  fromCodePoint(...codePoints: readonly Uint32[]): string`,
          ),
        ).value,
      ),
    ).value;
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
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(line, `// ${line}`),
      ).value;
    }
  }

  return mut_ret;
};
