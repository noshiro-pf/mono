import { indexType, pipe } from './common.mjs';
import { convertLibEs5_Array } from './lib.es5-array.mjs';
import { convertLibEs5_Date } from './lib.es5-date.mjs';
import { convertLibEs5_Math } from './lib.es5-math.mjs';
import { convertLibEs5_String } from './lib.es5-string.mjs';
import { convertLibEs5_TypedArray } from './lib.es5-typed-array.mjs';

/**
 *
 * @param {string} from
 * @param {boolean} commentOutDeprecated
 * @returns {string}
 */
export const convertLibEs5 = (from, commentOutDeprecated) => {
  let ret = from;

  ret = ret.replaceAll(
    'forEach(\n    callbackfn: (value: number, index: number, array: Uint32Array) => void,\n    thisArg?: unknown\n  ): void;',
    'forEach(\n    callbackfn: (value: number, index: number, array: Uint32Array) => void,\n    thisArg?: unknown\n  ): void;\n',
  );
  ret = ret.replaceAll(
    'forEach(\n    callbackfn: (value: number, index: number, array: Int16Array) => void,\n    thisArg?: unknown\n  ): void;',
    'forEach(\n    callbackfn: (value: number, index: number, array: Int16Array) => void,\n    thisArg?: unknown\n  ): void;\n',
  );

  /////////////////////////////////////

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
    const slice = ret.slice(
      ret.indexOf(markers.JSON.start),
      ret.indexOf(markers.JSON.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(`): unknown;`, `): MutableJSONValue;`)
        .replaceAll(
          'space?: string | number',
          'space?: string | UintRange<1, 11>',
        ),
    );
  }
  {
    const slice = ret.slice(
      ret.indexOf(markers.NumberConstructor.start),
      ret.indexOf(markers.NumberConstructor.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          `new (value?: unknown): Number;`,
          [
            `/** @deprecated Don't use Number constructor */\n`,
            commentOutDeprecated ? '// ' : '',
            `new (value?: unknown): Number;`,
          ].join(''),
        )
        .replaceAll(
          `(value?: unknown): number;`,
          [
            `/** @deprecated Don't use Number constructor */\n`,
            commentOutDeprecated ? '// ' : '',
            `(value?: unknown): number;`,
          ].join(''),
        ),
    );
  }
  {
    const slice = ret.slice(
      ret.indexOf(markers.BooleanConstructor.start),
      ret.indexOf(markers.BooleanConstructor.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          `new (value?: unknown): Boolean;`,
          [
            `/** @deprecated Don't use Boolean constructor */\n`,
            commentOutDeprecated ? '// ' : '',
            `new (value?: unknown): Boolean;`,
          ].join(''),
        )
        .replaceAll(
          `<T>(value?: T): boolean;`,
          [
            `/** @deprecated Don't use Boolean constructor */\n`,
            commentOutDeprecated ? '// ' : '',
            `<T>(value?: T): boolean;`,
          ].join(''),
        ),
    );
  }
  {
    ret = convertLibEs5_Math(ret);
  }
  {
    ret = convertLibEs5_String(ret);
  }
  {
    ret = convertLibEs5_Date(ret);
  }
  {
    const slice = ret.slice(
      ret.indexOf(markers.FunctionConstructor.start),
      ret.indexOf(markers.FunctionConstructor.end),
    );
    ret = ret.replaceAll(
      slice,
      pipe(slice).chain((str) => {
        {
          str = str.replaceAll(
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
          );
        }
        {
          const line = `  (...args: readonly string[]): Function;`;
          str = str.replaceAll(
            line,
            [`  /** @deprecated Don't use Function constructor */`, line].join(
              '\n',
            ),
          );
        }

        return str;
      }).value,
    );
  }
  {
    const slice = ret.slice(
      ret.indexOf(markers.ObjectConstructor.start),
      ret.indexOf(markers.ObjectConstructor.end),
    );
    ret = ret.replaceAll(
      slice,
      pipe(slice).chain((str) => {
        for (const line of [
          `new (value?: unknown): Object;`,
          `(): unknown;`,
          `(value: unknown): unknown;`,
        ]) {
          str = str.replaceAll(
            line,
            [`  /** @deprecated Don't use Object constructor */`, line].join(
              '\n',
            ),
          );
        }
        return str;
      }).value,
    );
  }
  {
    const slice = ret.slice(
      ret.indexOf(markers.Number.start),
      ret.indexOf(markers.Number.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          'toString(radix?: UintRange<2, 37>): string;',
          'toString(radix?: UintRange<2, 37>): `${number}`;',
        )
        .replaceAll(
          'toFixed(fractionDigits?: number): string;',
          'toFixed(fractionDigits?: UintRange<0, 21>): `${number}`;',
        )
        .replaceAll(
          'toExponential(fractionDigits?: number): string;',
          'toExponential(fractionDigits?: UintRange<0, 21>): `${number}`;',
        )
        .replaceAll(
          'toPrecision(precision?: number): string;',
          'toPrecision(precision?: UintRange<1, 22>): `${number}`;',
        )
        .replaceAll('valueOf(): number;', `valueOf(): ${indexType.ret};`),
    );
  }

  ret = ret.replaceAll(
    'declare function parseInt(string: string, radix?: UintRange<2, 37>): number;',
    'declare function parseInt(string: string, radix?: UintRange<2, 37>): Int | NaNType;',
  );
  ret = ret.replaceAll(
    'declare function parseFloat(string: string): number;',
    'declare function parseFloat(string: string): number | NaNType;',
  );

  ret = ret.replaceAll(
    'declare const NaN: number;',
    'declare const NaN: NaNType;',
  );
  ret = ret.replaceAll(
    'declare const Infinity: number;',
    'declare const Infinity: POSITIVE_INFINITY;',
  );
  ret = ret.replaceAll('readonly NaN: number;', 'readonly NaN: NaNType;');
  ret = ret.replaceAll(
    'readonly NEGATIVE_INFINITY: number;',
    'readonly NEGATIVE_INFINITY: NEGATIVE_INFINITY;',
  );
  ret = ret.replaceAll(
    'readonly POSITIVE_INFINITY: number;',
    'readonly POSITIVE_INFINITY: POSITIVE_INFINITY;',
  );

  // Type utils
  ret = ret.replaceAll(
    'type Exclude<T, U> = T extends U ? never : T;',
    'type Exclude<T, U extends T> = T extends U ? never : T;',
  );

  ret = ret.replaceAll(
    'type Omit<T, K extends keyof never> = Pick<T, Exclude<keyof T, K>>;',
    'type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;',
  );

  ret = ret.replaceAll(
    'type Partial<T> = {\n  readonly [P in keyof T]?: T[P];\n};',
    'type Partial<T> = {\n  [P in keyof T]?: T[P];\n};',
  );

  // add @deprecated
  {
    const commonPrefix = [
      '/**',
      ' * Evaluates JavaScript code and executes it.',
      ' * @param x A String value that contains valid JavaScript code.',
    ];

    const lineToInsert = ' * @deprecated';

    const commonSuffix = [' */', 'declare function eval(x: string): unknown;'];

    ret = ret.replaceAll(
      [...commonPrefix, ...commonSuffix].join('\n'),
      [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
    );
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

    ret = ret.replaceAll(
      [...commonPrefix, ...commonSuffix].join('\n'),
      [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
    );
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

    ret = ret.replaceAll(
      [...commonPrefix, ...commonSuffix].join('\n'),
      [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
    );
  }

  ret = ret.replaceAll('byteOffset: number', 'byteOffset: SafeUint');
  ret = ret.replaceAll('byteOffset?: number', 'byteOffset?: SafeUint');
  ret = ret.replaceAll('byteLength: number', 'byteLength: SafeUint');
  ret = ret.replaceAll('byteLength?: number', 'byteLength?: SafeUint');

  // RegExp
  ret = ret.replaceAll(
    'readonly index?: number;',
    'readonly index?: SafeUint;',
  );
  ret = ret.replaceAll('readonly index: number;', 'readonly index: SafeUint;');
  ret = ret.replaceAll(
    'readonly lastIndex: number;',
    'readonly lastIndex: SafeUint;',
  );

  ret = convertLibEs5_Array(ret, commentOutDeprecated);
  ret = convertLibEs5_TypedArray(ret);

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

    ret = ret.replaceAll(
      [...commonPrefix, ...commonSuffix].join('\n'),
      [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
    );
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

    ret = ret.replaceAll(
      [...commonPrefix, ...commonSuffix].join('\n'),
      [...commonPrefix, lineToInsert, ...commonSuffix].join('\n'),
    );
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
      ret = ret.replaceAll(line, `// ${line}`);
    }
    ret = ret.replaceAll(
      `/** @deprecated A legacy feature for browser compatibility */\n  readonly`,
      `/** @deprecated A legacy feature for browser compatibility */\n  // readonly`,
    );
  }

  return ret;
};
