import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { idFn, type ConverterOptions } from './common.mjs';

export const convertLibEs5_Array =
  ({
    config: { commentOutDeprecated, returnType },
    readonlyModifier,
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        ...(['ReadonlyArray', 'Array'] as const).map((key) =>
          replaceWithinInterface({
            name: key,
            mapFn: composeMonoTypeFns(
              // require predicate function to return boolean
              replaceWithNoMatchCheck(
                'predicate: (value: T, index: number, array: readonly T[]) => unknown',
                'predicate: (value: T, index: number, array: readonly T[]) => boolean',
              ),
              replaceWithNoMatchCheck(
                'index: number',
                `index: ${brandedNumber.ArraySize}`,
              ),
              replaceWithNoMatchCheck(
                'searchElement: T, fromIndex?: number): number;',
                `searchElement: T, fromIndex?: ${brandedNumber.ArraySizeArg}): ${brandedNumber.ArraySearchResult};`,
              ),
              replaceWithNoMatchCheck(
                'currentIndex: number',
                `currentIndex: ${brandedNumber.ArraySize}`,
              ),
            ),
          }),
        ),

        ...(['ReadonlyArray', 'ConcatArray', 'Array'] as const).map((key) =>
          replaceWithinInterface({
            name: key,
            mapFn: replaceWithNoMatchCheck(
              'slice(start?: number, end?: number)',
              `slice(start?: ${brandedNumber.ArraySizeArg}, end?: ${brandedNumber.ArraySizeArg})`,
            ),
          }),
        ),

        replaceWithinInterface({
          name: 'Array',
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              //
              'start: number',
              `start: ${brandedNumber.ArraySizeArg}`,
            ),
            replaceWithNoMatchCheck(
              'deleteCount?: number',
              `deleteCount?: ${brandedNumber.ArraySizeArgNonNegative}`,
            ),
            replaceWithNoMatchCheck(
              'deleteCount: number',
              `deleteCount: ${brandedNumber.ArraySizeArgNonNegative}`,
            ),
            replaceWithNoMatchCheck(
              'unshift(...items: readonly T[]): number;',
              `unshift(...items: readonly T[]): ${brandedNumber.ArraySize};`,
            ),
            replaceWithNoMatchCheck(
              'push(...items: readonly T[]): number;',
              `push(...items: readonly T[]): ${brandedNumber.ArraySize};`,
            ),
            // remove readonly from Array index signature
            replaceWithNoMatchCheck(
              //
              'readonly [n: number]',
              '[n: number]',
            ),
            // revert eslint fix
            replaceWithNoMatchCheck(
              //
              'this is readonly S[]',
              'this is S[]',
            ),
          ),
        }),

        replaceWithinInterface({
          name: 'ArrayConstructor',
          mapFn: composeMonoTypeFns(
            returnType === 'readonly'
              ? idFn
              : replaceWithNoMatchCheck(
                  'isArray(arg: unknown): arg is readonly unknown[];',
                  'isArray(arg: unknown): arg is unknown[];',
                ),
            replaceWithNoMatchCheck(
              '  new (arrayLength?: number): readonly unknown[];',
              dedent`
                /** @deprecated use \`Array.from({ length })\` instead */
                ${commentOutDeprecated ? '// ' : ''}new (arrayLength?: ${brandedNumber.NewArrayMaxSize}): ${readonlyModifier}unknown[];
              `,
            ),
            replaceWithNoMatchCheck(
              '  new <T>(arrayLength: number): readonly T[];',
              dedent`
                /** @deprecated use \`Array.from({ length })\` instead */
                ${commentOutDeprecated ? '// ' : ''}new <T>(arrayLength: ${brandedNumber.NewArrayMaxSize}): ${readonlyModifier}T[];
              `,
            ),
            replaceWithNoMatchCheck(
              '  new <T>(...items: readonly T[]): readonly T[];',
              dedent`
                /** @deprecated use \`[...items]\` instead */
                ${commentOutDeprecated ? '// ' : ''}new <T>(...items: readonly T[]): ${readonlyModifier}T[];
              `,
            ),
            replaceWithNoMatchCheck(
              '  (arrayLength?: number): readonly unknown[];',
              dedent`
                /** @deprecated use \`Array.from({ length })\` instead */
                ${commentOutDeprecated ? '// ' : ''}(arrayLength?: ${brandedNumber.NewArrayMaxSize}): ${readonlyModifier}unknown[];
              `,
            ),
            replaceWithNoMatchCheck(
              '  <T>(arrayLength: number): readonly T[];',
              dedent`
                /** @deprecated use \`Array.from({ length })\` instead */
                ${commentOutDeprecated ? '// ' : ''}<T>(arrayLength: ${brandedNumber.NewArrayMaxSize}): ${readonlyModifier}T[];
              `,
            ),
            replaceWithNoMatchCheck(
              '  <T>(...items: readonly T[]): readonly T[];',
              dedent`
                /** @deprecated use \`[...items]\` instead */
                ${commentOutDeprecated ? '// ' : ''}<T>(...items: readonly T[]): ${readonlyModifier}T[];
              `,
            ),
          ),
        }),
      ),
    ).value;
