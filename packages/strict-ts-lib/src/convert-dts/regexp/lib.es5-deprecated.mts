import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { closeBraceRegexp, type ConverterOptions } from '../common.mjs';

export const convertLibEs5_deprecated =
  ({
    config: { commentOutDeprecated },
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      // add @deprecated
      replaceWithNoMatchCheck(
        [
          //
          ' */',
          'declare function eval(x: string): unknown;',
        ].join('\n'),
        [
          //
          ' * @deprecated',
          ' */',
          `${commentOutDeprecated ? '// ' : ''}declare function eval(x: string): unknown;`,
        ].join('\n'),
      ),
      replaceWithNoMatchCheck(
        [
          //
          ' */',
          'declare function isNaN(number: number): boolean;',
        ].join('\n'),
        [
          //
          ' * @deprecated Use `Number.isNaN` instead.',
          ' */',
          `${commentOutDeprecated ? '// ' : ''}declare function isNaN(number: number): boolean;`,
        ].join('\n'),
      ),
      replaceWithNoMatchCheck(
        [
          //
          ' */',
          'declare function isFinite(number: number): boolean;',
        ].join('\n'),
        [
          //
          ' * @deprecated Use `Number.isFinite` instead.',
          ' */',
          `${commentOutDeprecated ? '// ' : ''}declare function isFinite(number: number): boolean;`,
        ].join('\n'),
      ),
      replaceWithNoMatchCheck(
        [
          //
          '   */',
          `  charAt(pos: ${brandedNumber.StringSizeArg}): string;`,
        ].join('\n'),
        [
          '   * @deprecated Prefer `String#at(...)` over `String#charAt(...)`. eslint(unicorn/prefer-at)',
          '   */',
          `  ${commentOutDeprecated ? '// ' : ''}charAt(pos: ${brandedNumber.StringSizeArg}): string;`,
        ].join('\n'),
      ),
      replaceWithNoMatchCheck(
        [
          //
          '   */',
          '  concat(...strings: readonly string[]): string;',
        ].join('\n'),
        [
          //
          '   * @deprecated Prefer the spread operator over `Array#concat(...)`. eslint(unicorn/prefer-spread)',
          '   */',
          `  ${commentOutDeprecated ? '// ' : ''}concat(...strings: readonly string[]): string;`,
        ].join('\n'),
      ),

      ...(!commentOutDeprecated
        ? []
        : [
            'declare function escape(string: string): string;',
            'declare function unescape(string: string): string;',
            'declare function eval(x: string): unknown;',
            'declare function isNaN(number: number): boolean;',
            'declare function isFinite(number: number): boolean;',
            'substr(from: number, length?: number): string;',
            'compile(pattern: string, flags?: string): this;',
            `charAt(pos: number): string;`,
            'concat(...strings: readonly string[]): string;',
          ].map((line) =>
            // comment out deprecated functions
            replaceWithNoMatchCheck(
              //
              line,
              `// ${line}`,
            ),
          )),

      ...(!commentOutDeprecated
        ? []
        : [
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'interface RegExpConstructor {',
              endRegexp: closeBraceRegexp,
              mapFn: replaceWithNoMatchCheck(
                //
                'readonly',
                '// readonly',
              ),
            }),
          ]),
    ).value;
