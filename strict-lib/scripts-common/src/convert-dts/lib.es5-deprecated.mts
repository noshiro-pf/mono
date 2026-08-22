import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_deprecated =
  ({
    config: { commentOutDeprecated },
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        // add @deprecated
        replaceWithNoMatchCheck(
          dedent`
             */
            declare function eval(x: string): unknown;
          `,
          dedent`
             * @deprecated
             */
            ${commentOutDeprecated ? '// ' : ''}declare function eval(x: string): unknown;
          `,
        ),
        replaceWithNoMatchCheck(
          dedent`
             */
            declare function isNaN(number: number): boolean;
          `,
          dedent`
             * @deprecated Use \`Number.isNaN\` instead.
             */
            ${commentOutDeprecated ? '// ' : ''}declare function isNaN(number: number): boolean;
          `,
        ),
        replaceWithNoMatchCheck(
          dedent`
             */
            declare function isFinite(number: number): boolean;
          `,
          dedent`
             * @deprecated Use \`Number.isFinite\` instead.
             */
            ${commentOutDeprecated ? '// ' : ''}declare function isFinite(number: number): boolean;
          `,
        ),
        replaceWithNoMatchCheck(
          dedent`
             */
            charAt(pos: ${brandedNumber.StringSizeArg}): string;
          `,
          dedent`
             * @deprecated Prefer \`String#at(...)\` over \`String#charAt(...)\`. eslint(unicorn/prefer-at)
             */
            ${commentOutDeprecated ? '// ' : ''}charAt(pos: ${brandedNumber.StringSizeArg}): string;
          `,
        ),
        replaceWithNoMatchCheck(
          dedent`
             */
            concat(...strings: readonly string[]): string;
          `,
          dedent`
             * @deprecated Prefer the spread operator over \`Array#concat(...)\`. eslint(unicorn/prefer-spread)
             */
            ${commentOutDeprecated ? '// ' : ''}concat(...strings: readonly string[]): string;
          `,
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
      ),
    ).value;
