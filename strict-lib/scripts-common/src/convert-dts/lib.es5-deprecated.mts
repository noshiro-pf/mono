import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import type { ConverterOptions } from './common.mjs';

export const convertLibEs5_deprecated =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
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
            declare function eval(x: string): unknown;
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
            declare function isNaN(number: number): boolean;
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
            declare function isFinite(number: number): boolean;
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
            charAt(pos: ${brandedNumber.StringSizeArg}): string;
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
            concat(...strings: readonly string[]): string;
          `,
        ),
      ),
    ).value;
