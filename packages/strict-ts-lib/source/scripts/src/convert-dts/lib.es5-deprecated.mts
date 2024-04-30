import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

export const convertLibEs5_deprecated = (
  source: string,
  commentOutDeprecated: boolean,
): string =>
  pipe(source)
    .chain(
      (str) =>
        // add @deprecated
        pipe(str)
          .chain(
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
          )
          .chain(
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
          )
          .chain(
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
          )
          .chain(
            replaceWithNoMatchCheck(
              [
                //
                '     */',
                `    charAt(pos: ${NumberType.StringSizeArg}): string;`,
              ].join('\n'),
              [
                '     * @deprecated Prefer `String#at(...)` over `String#charAt(...)`. eslint(unicorn/prefer-at)',
                '     */',
                `    ${commentOutDeprecated ? '// ' : ''}charAt(pos: ${NumberType.StringSizeArg}): string;`,
              ].join('\n'),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              [
                //
                '     */',
                '    concat(...strings: readonly string[]): string;',
              ].join('\n'),
              [
                //
                '     * @deprecated Prefer the spread operator over `Array#concat(...)`. eslint(unicorn/prefer-spread)',
                '     */',
                `    ${commentOutDeprecated ? '// ' : ''}concat(...strings: readonly string[]): string;`,
              ].join('\n'),
            ),
          ).value,
    )
    .chainMonoTypeFns(
      !commentOutDeprecated
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
          ),
    )
    .chainMonoTypeFns(
      !commentOutDeprecated
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
          ],
    ).value;
