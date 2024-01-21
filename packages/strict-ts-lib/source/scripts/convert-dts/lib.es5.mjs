import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
import { indexType } from './common.mjs';
import { convertLibEs5_Array } from './lib.es5-array.mjs';
import { convertLibEs5_Date } from './lib.es5-date.mjs';
import { convertLibEs5_Math } from './lib.es5-math.mjs';
import { convertLibEs5_String } from './lib.es5-string.mjs';
import { convertLibEs5_TypedArray } from './lib.es5-typed-array.mjs';

/**
 * @param {string} from
 * @param {boolean} commentOutDeprecated
 * @returns {string}
 */
export const convertLibEs5 = (from, commentOutDeprecated) => {
  let mut_ret = from;

  mut_ret = pipe(mut_ret)
    .chain(replaceWithNoMatchCheck('keyof unknown', 'keyof never'))
    .chain((a) => a).value;

  /* -------------------------------- */

  const markers = {
    JSON: {
      start: 'interface JSON {',
      end: 'declare const JSON: JSON;',
    },
    Number: {
      start: 'interface Number {',
      end: 'interface NumberConstructor {',
    },
    NumberConstructor: {
      start: 'interface NumberConstructor {',
      end: 'declare const Number: NumberConstructor;',
    },
    BooleanConstructor: {
      start: 'interface BooleanConstructor {',
      end: 'declare const Boolean: BooleanConstructor;',
    },
    ObjectConstructor: {
      start: 'interface ObjectConstructor {',
      end: 'declare const Object: ObjectConstructor;',
    },
    FunctionConstructor: {
      start: 'interface FunctionConstructor {',
      end: 'declare const Function: FunctionConstructor;',
    },
  };

  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.JSON.start),
      mut_ret.indexOf(markers.JSON.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(replaceWithNoMatchCheck(`): unknown;`, `): MutableJSONValue;`))
          .chain(
            replaceWithNoMatchCheck(
              'space?: string | number',
              'space?: string | UintRange<1, 11>',
            ),
          ).value,
      ),
    ).value;
  }
  {
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
              `new (value?: unknown): Number;`,
              [
                `/** @deprecated Don't use Number constructor */\n`,
                commentOutDeprecated ? '// ' : '',
                `new (value?: unknown): Number;`,
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `(value?: unknown): number;`,
              [
                `/** @deprecated Don't use Number constructor */\n`,
                commentOutDeprecated ? '// ' : '',
                `(value?: unknown): number;`,
              ].join(''),
            ),
          ).value,
      ),
    ).value;
  }
  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.BooleanConstructor.start),
      mut_ret.indexOf(markers.BooleanConstructor.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              `new (value?: unknown): Boolean;`,
              [
                `/** @deprecated Don't use Boolean constructor */\n`,
                commentOutDeprecated ? '// ' : '',
                `new (value?: unknown): Boolean;`,
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `<T>(value?: T): boolean;`,
              [
                `/** @deprecated Don't use Boolean constructor */\n`,
                commentOutDeprecated ? '// ' : '',
                `<T>(value?: T): boolean;`,
              ].join(''),
            ),
          ).value,
      ),
    ).value;
  }
  {
    mut_ret = convertLibEs5_Math(mut_ret);
  }
  {
    mut_ret = convertLibEs5_String(mut_ret);
  }
  {
    mut_ret = convertLibEs5_Date(mut_ret);
  }
  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.FunctionConstructor.start),
      mut_ret.indexOf(markers.FunctionConstructor.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice).chain((str) => {
          let mut_str = str;

          {
            mut_str = pipe(mut_str).chain(
              replaceWithNoMatchCheck(
                [
                  //
                  '   */',
                  '  new (...args: readonly string[]): Function;',
                ].join('\n'),
                [
                  "   * @deprecated Don't use Function constructor",
                  '   */',
                  '  new (...args: readonly string[]): Function;',
                ].join('\n'),
              ),
            ).value;
          }
          {
            const line = `  (...args: readonly string[]): Function;`;
            mut_str = pipe(mut_str).chain(
              replaceWithNoMatchCheck(
                line,
                [
                  `  /** @deprecated Don't use Function constructor */`,
                  line,
                ].join('\n'),
              ),
            ).value;
          }

          return mut_str;
        }).value,
      ),
    ).value;
  }
  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.ObjectConstructor.start),
      mut_ret.indexOf(markers.ObjectConstructor.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice).chain((str) => {
          let mut_str = str;

          for (const line of [
            `new (value?: unknown): Object;`,
            `(): unknown;`,
            `(value: unknown): unknown;`,
          ]) {
            mut_str = pipe(mut_str).chain(
              replaceWithNoMatchCheck(
                line,
                [
                  `  /** @deprecated Don't use Object constructor */`,
                  line,
                ].join('\n'),
              ),
            ).value;
          }
          return mut_str;
        }).value,
      ),
    ).value;
  }
  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.Number.start),
      mut_ret.indexOf(markers.Number.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              'toString(radix?: UintRange<2, 37>): string;',
              // eslint-disable-next-line no-template-curly-in-string
              'toString(radix?: UintRange<2, 37>): `${number}`;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'toFixed(fractionDigits?: number): string;',
              // eslint-disable-next-line no-template-curly-in-string
              'toFixed(fractionDigits?: UintRange<0, 21>): `${number}`;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'toExponential(fractionDigits?: number): string;',
              // eslint-disable-next-line no-template-curly-in-string
              'toExponential(fractionDigits?: UintRange<0, 21>): `${number}`;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'toPrecision(precision?: number): string;',
              // eslint-disable-next-line no-template-curly-in-string
              'toPrecision(precision?: UintRange<1, 22>): `${number}`;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'valueOf(): number;',
              `valueOf(): ${indexType.ret};`,
            ),
          ).value,
      ),
    ).value;
  }

  mut_ret = pipe(mut_ret)
    .chain(
      replaceWithNoMatchCheck(
        'declare function parseInt(string: string, radix?: UintRange<2, 37>): number;',
        'declare function parseInt(string: string, radix?: UintRange<2, 37>): Int | NaNType;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'declare function parseFloat(string: string): number;',
        'declare function parseFloat(string: string): number | NaNType;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'declare const NaN: number;',
        'declare const NaN: NaNType;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'declare const Infinity: number;',
        'declare const Infinity: POSITIVE_INFINITY;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly NaN: number;',
        'readonly NaN: NaNType;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly NEGATIVE_INFINITY: number;',
        'readonly NEGATIVE_INFINITY: NEGATIVE_INFINITY;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly POSITIVE_INFINITY: number;',
        'readonly POSITIVE_INFINITY: POSITIVE_INFINITY;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // Type utils
        'type Exclude<T, U> = T extends U ? never : T;',
        'type Exclude<T, U extends T> = T extends U ? never : T;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'type Omit<T, K extends keyof never> = Pick<T, Exclude<keyof T, K>>;',
        'type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        [
          //
          'type Partial<T> = {',
          '  readonly [P in keyof T]?: T[P];',
          '};',
        ].join('\n'),
        [
          //
          'type Partial<T> = {',
          '  [P in keyof T]?: T[P];',
          '};',
        ].join('\n'),
      ),
    ).value;

  // add @deprecated
  {
    const commonPrefix = [
      '/**',
      ' * Evaluates JavaScript code and executes it.',
      ' * @param x A String value that contains valid JavaScript code.',
    ];

    const lineToInsert = ' * @deprecated';

    const commonSuffix = [' */', 'declare function eval(x: string): unknown;'];

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [...commonPrefix, ...commonSuffix].join('\n'),
        [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
      ),
    ).value;
  }
  {
    const commonPrefix = [
      '/**',
      ' * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a number).',
      ' * @param number A numeric value.',
    ];

    const lineToInsert = ' * @deprecated Use `Number.isNaN` instead.';

    const commonSuffix = [
      ' */',
      'declare function isNaN(number: number): boolean;',
    ];

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [...commonPrefix, ...commonSuffix].join('\n'),
        [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
      ),
    ).value;
  }
  {
    const commonPrefix = [
      '/**',
      ' * Determines whether a supplied number is finite.',
      ' * @param number Any numeric value.',
    ];

    const lineToInsert = ' * @deprecated Use `Number.isFinite` instead.';

    const commonSuffix = [
      ' */',
      'declare function isFinite(number: number): boolean;',
    ];

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [...commonPrefix, ...commonSuffix].join('\n'),
        [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
      ),
    ).value;
  }

  mut_ret = pipe(mut_ret)
    .chain(
      replaceWithNoMatchCheck('byteOffset: number', 'byteOffset: SafeUint'),
    )
    .chain(
      replaceWithNoMatchCheck('byteOffset?: number', 'byteOffset?: SafeUint'),
    )
    .chain(
      replaceWithNoMatchCheck('byteLength: number', 'byteLength: SafeUint'),
    )
    .chain(
      replaceWithNoMatchCheck('byteLength?: number', 'byteLength?: SafeUint'),
    )
    .chain(
      replaceWithNoMatchCheck(
        // RegExp
        'readonly index?: number;',
        'readonly index?: SafeUint;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly index: number;',
        'readonly index: SafeUint;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly lastIndex: number;',
        'readonly lastIndex: SafeUint;',
      ),
    ).value;

  mut_ret = convertLibEs5_Array(mut_ret, commentOutDeprecated);
  mut_ret = convertLibEs5_TypedArray(mut_ret);

  // add @deprecated
  {
    const commonPrefix = [
      '  /**',
      '   * Returns the character at the specified index.',
      '   * @param pos The zero-based index of the desired character.',
    ];

    const lineToInsert =
      '   * @deprecated Prefer `String#at(...)` over `String#charAt(...)`. eslint(unicorn/prefer-at)';

    const commonSuffix = ['   */', '  charAt(pos: SafeInt | Int10): string;'];

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [...commonPrefix, ...commonSuffix].join('\n'),
        [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
      ),
    ).value;
  }
  {
    const commonPrefix = [
      '  /**',
      '   * Returns a string that contains the concatenation of two or more strings.',
      '   * @param strings The strings to append to the end of the string.',
    ];

    const lineToInsert =
      '   * @deprecated Prefer the spread operator over `Array#concat(...)`. eslint(unicorn/prefer-spread)';

    const commonSuffix = [
      '   */',
      '  concat(...strings: readonly string[]): string;',
    ];

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [...commonPrefix, ...commonSuffix].join('\n'),
        [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
      ),
    ).value;
  }

  if (commentOutDeprecated) {
    // comment out deprecated functions
    for (const line of [
      'declare function escape(string: string): string;',
      'declare function unescape(string: string): string;',
      'declare function eval(x: string): unknown;',
      'declare function isNaN(number: number): boolean;',
      'declare function isFinite(number: number): boolean;',
      'substr(from: number, length?: number): string;',
      'compile(pattern: string, flags?: string): this;',
      `charAt(pos: ${indexType.arg}): string;`,
      'concat(...strings: readonly string[]): string;',
    ]) {
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(line, `// ${line}`),
      ).value;
    }
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [
          '/** @deprecated A legacy feature for browser compatibility */',
          '  readonly',
        ].join('\n'),
        [
          '/** @deprecated A legacy feature for browser compatibility */',
          '  // readonly',
        ].join('\n'),
      ),
    ).value;
  }

  // append type utils

  {
    mut_ret = pipe(mut_ret)
      .chain((s) =>
        [
          s,
          'type RawDateMutType = Date;',
          'type RawDateType = Readonly<RawDateMutType>;',
          'type MutableSet<K> = Set<K>;',
          'type MutableMap<K, V> = Map<K, V>;',
          'type TimerId = ReturnType<typeof setTimeout>; // NodeJS.Timeout or number',
        ].join('\n\n'),
      )
      .chain((s) =>
        [
          s,
          '',
          'type DeepReadonly<T> = T extends Primitive',
          '? T',
          ': // eslint-disable-next-line @typescript-eslint/ban-types,no-restricted-globals',
          'T extends Function',
          '? T',
          ': T extends MutableMap<infer K, infer V>',
          '? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>',
          ': T extends MutableSet<infer V>',
          '? ReadonlySet<DeepReadonly<V>>',
          ': // eslint-disable-next-line @typescript-eslint/ban-types',
          'T extends object | readonly unknown[]',
          '? {',
          '    readonly [K in keyof T]: DeepReadonly<T[K]>;',
          '  }',
          ': T;',
        ].join('\n'),
      )
      .chain((s) =>
        [
          s,
          '',
          'type DeepWritable<T> = T extends Primitive',
          '  ? T',
          '  : // eslint-disable-next-line @typescript-eslint/ban-types,no-restricted-globals',
          '  T extends Function',
          '  ? T',
          '  : T extends ReadonlyMap<infer K, infer V>',
          '  ? MutableMap<DeepWritable<K>, DeepWritable<V>>',
          '  : T extends ReadonlySet<infer V>',
          '  ? MutableSet<DeepWritable<V>>',
          '  : // eslint-disable-next-line @typescript-eslint/ban-types',
          '  T extends object | readonly unknown[]',
          '  ? {',
          '      -readonly [K in keyof T]: DeepWritable<T[K]>;',
          '    }',
          '  : T;',
        ].join('\n'),
      )
      .chain((s) =>
        [
          s,
          '',
          'type DeepPartial<T> = T extends Primitive',
          '  ? T',
          '  : // eslint-disable-next-line @typescript-eslint/ban-types,no-restricted-globals',
          '  T extends Function',
          '  ? T',
          '  : T extends MutableMap<infer K, infer V>',
          '  ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>',
          '  : T extends MutableSet<infer V>',
          '  ? ReadonlySet<DeepPartial<V>>',
          '  : // eslint-disable-next-line @typescript-eslint/ban-types',
          '  T extends object | readonly unknown[]',
          '  ? {',
          '      [K in keyof T]?: DeepPartial<T[K]>;',
          '    }',
          '  : T;',
        ].join('\n'),
      ).value;
  }

  return mut_ret;
};
