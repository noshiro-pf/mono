import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, idFn, type ConverterOptions } from './common.mjs';

const markers = {
  ReadonlyArray: 'interface ReadonlyArray<T> {',
  Array: 'interface Array<T> {',
  ConcatArray: 'interface ConcatArray<T> {',
} as const;

export const convertLibEs5_Array =
  ({
    config: { commentOutDeprecated, returnType },
    readonlyModifier,
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      ...(['ReadonlyArray', 'Array'] as const).map((key) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[key],
          endRegexp: closeBraceRegexp,
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
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[key],
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            'slice(start?: number, end?: number)',
            `slice(start?: ${brandedNumber.ArraySizeArg}, end?: ${brandedNumber.ArraySizeArg})`,
          ),
        }),
      ),

      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: markers.Array,
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            //
            `start: number`,
            `start: ${brandedNumber.ArraySizeArg}`,
          ),
          replaceWithNoMatchCheck(
            `deleteCount?: number`,
            `deleteCount?: ${brandedNumber.ArraySizeArgNonNegative}`,
          ),
          replaceWithNoMatchCheck(
            `deleteCount: number`,
            `deleteCount: ${brandedNumber.ArraySizeArgNonNegative}`,
          ),
          replaceWithNoMatchCheck(
            `unshift(...items: readonly T[]): number;`,
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

      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          returnType === 'readonly'
            ? idFn
            : replaceWithNoMatchCheck(
                'isArray(arg: unknown): arg is readonly unknown[];',
                'isArray(arg: unknown): arg is unknown[];',
              ),
          replaceWithNoMatchCheck(
            `  new (arrayLength?: number): readonly unknown[];`,
            [
              '/** @deprecated use `Array.from({ length })` instead */',
              `${commentOutDeprecated ? '// ' : ''}new (arrayLength?: ${brandedNumber.NewArrayMaxSize}): ${readonlyModifier}unknown[];`,
            ].join('\n'),
          ),
          replaceWithNoMatchCheck(
            `  new <T>(arrayLength: number): readonly T[];`,
            [
              '/** @deprecated use `Array.from({ length })` instead */',
              `${commentOutDeprecated ? '// ' : ''}new <T>(arrayLength: ${brandedNumber.NewArrayMaxSize}): ${readonlyModifier}T[];`,
            ].join('\n'),
          ),
          replaceWithNoMatchCheck(
            `  new <T>(...items: readonly T[]): readonly T[];`,
            [
              '/** @deprecated use `[...items]` instead */',
              `${commentOutDeprecated ? '// ' : ''}new <T>(...items: readonly T[]): ${readonlyModifier}T[];`,
            ].join('\n'),
          ),
          replaceWithNoMatchCheck(
            `  (arrayLength?: number): readonly unknown[];`,
            [
              '/** @deprecated use `Array.from({ length })` instead */',
              `${commentOutDeprecated ? '// ' : ''}(arrayLength?: ${brandedNumber.NewArrayMaxSize}): ${readonlyModifier}unknown[];`,
            ].join('\n'),
          ),
          replaceWithNoMatchCheck(
            `  <T>(arrayLength: number): readonly T[];`,
            [
              '/** @deprecated use `Array.from({ length })` instead */',
              `${commentOutDeprecated ? '// ' : ''}<T>(arrayLength: ${brandedNumber.NewArrayMaxSize}): ${readonlyModifier}T[];`,
            ].join('\n'),
          ),
          replaceWithNoMatchCheck(
            `  <T>(...items: readonly T[]): readonly T[];`,
            [
              '/** @deprecated use `[...items]` instead */',
              `${commentOutDeprecated ? '// ' : ''}<T>(...items: readonly T[]): ${readonlyModifier}T[];`,
            ].join('\n'),
          ),
        ),
      }),
    ).value;
