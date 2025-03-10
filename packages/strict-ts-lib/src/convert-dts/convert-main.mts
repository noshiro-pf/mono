import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { type ConverterConfig } from '../constants.mjs';
import {
  closeBraceRegexp,
  createBrandedNumber,
  idFn,
  type ConverterOptions,
} from './common.mjs';
import {
  convertEs2015SymbolWellknown,
  convertLibDom,
  convertLibDomCommon,
  convertLibDomIterable,
  convertLibEs2015Collection,
  convertLibEs2015Core,
  convertLibEs2015Iterable,
  convertLibEs2016ArrayInclude,
  convertLibEs2017Date,
  convertLibEs2017Object,
  convertLibEs2017Sharedmemory,
  convertLibEs2019Array,
  convertLibEs2019Object,
  convertLibEs2019String,
  convertLibEs2020Bigint,
  convertLibEs2020Sharedmemory,
  convertLibEs2022Array,
  convertLibEs2022Object,
  convertLibEs2023Array,
  convertLibEs2024Arraybuffer,
  convertLibEs2024Sharedmemory,
  convertLibEs5,
  convertLibEsNextIterator,
  convertReturnTypeToUintRange,
} from './regexp/index.mjs';

export const convertWithGrep = (
  src: string,
  filename: string,
  converterConfig: ConverterConfig,
): string => {
  const options: ConverterOptions = {
    config: converterConfig,
    readonlyModifier:
      converterConfig.returnType === 'mutable' ? '' : 'readonly ',
    brandedNumber: createBrandedNumber(converterConfig.numberType),
  } as const;

  return pipe(src).chainMonoTypeFns(
    replaceWithNoMatchCheck(
      /\/\/\/ <reference lib="(.+)" \/>/gu,
      '/// <reference path="./lib.$1.d.ts" />',
      {
        onNotFound: 'off',
      },
    ),

    replaceWithNoMatchCheck(
      //
      'readonly any[]',
      'readonly unknown[]',
      {
        onNotFound: 'off',
      },
    ),
    replaceWithNoMatchCheck('TReturn = unknown', 'TReturn = any', {
      onNotFound: 'off',
    }),

    (() => {
      switch (filename) {
        case 'lib.decorators.d.ts':
          return composeMonoTypeFns(
            replaceWithNoMatchCheck(
              'Class extends abstract new (...args: unknown) => unknown = abstract new (...args: unknown) => unknown',
              'Class extends abstract new (...args: readonly never[]) => unknown = abstract new (...args: readonly never[]) => unknown',
            ),
            replaceWithNoMatchCheck(
              'Value extends (this: This, ...args: unknown) => unknown = (this: This, ...args: unknown) => unknown',
              'Value extends (this: This, ...args: readonly never[]) => unknown = (this: This, ...args: readonly never[]) => unknown',
            ),
          );

        case 'lib.dom.d.ts':
          return convertLibDom(options);

        case 'lib.webworker.d.ts':
          return convertLibDomCommon(options);

        case 'lib.dom.iterable.d.ts':
          return convertLibDomIterable(options);

        case 'lib.es5.d.ts':
          return convertLibEs5(options);

        case 'lib.es2015.promise.d.ts':
          // Fix incorrect results of eslint fix
          return options.config.returnType === 'readonly'
            ? replaceWithNoMatchCheck('readonly -readonly', 'readonly')
            : replaceWithNoMatchCheck('readonly -readonly', '-readonly');

        case 'lib.es2015.collection.d.ts':
          return convertLibEs2015Collection(options);

        case 'lib.es2015.symbol.wellknown.d.ts':
          return convertEs2015SymbolWellknown(options);

        case 'lib.es2015.reflect.d.ts':
          return replaceWithNoMatchCheck(
            'newTarget?: new (...args: unknown) => unknown',
            'newTarget?: new (...args: readonly never[]) => unknown',
          );

        case 'lib.es2015.core.d.ts':
          return convertLibEs2015Core(options);

        case 'lib.es2015.iterable.d.ts':
          return convertLibEs2015Iterable(options);

        case 'lib.es2015.proxy.d.ts':
          return options.config.returnType === 'readonly'
            ? idFn
            : replaceWithNoMatchCheck(
                '): { readonly proxy: T; readonly revoke: () => void }',
                '): { proxy: T; revoke: () => void }',
              );

        case 'lib.es2015.generator.d.ts':
          return replaceWithNoMatchCheck(
            'readonly length: number;',
            `readonly length: ${options.brandedNumber.ArraySize};`,
          );

        case 'lib.es2016.array.include.d.ts':
          return convertLibEs2016ArrayInclude(options);

        case 'lib.es2017.sharedmemory.d.ts':
          return convertLibEs2017Sharedmemory(options);

        case 'lib.es2017.object.d.ts':
          return convertLibEs2017Object(options);

        case 'lib.es2017.string.d.ts':
          return replaceWithNoMatchCheck(
            'maxLength: number',
            `maxLength: ${options.brandedNumber.StringSizeArgNonNegative}`,
          );

        case 'lib.es2017.date.d.ts':
          return convertLibEs2017Date(options);

        case 'lib.es2018.intl.d.ts':
          return convertReturnTypeToUintRange;

        case 'lib.es2019.array.d.ts':
          return convertLibEs2019Array(options);

        case 'lib.es2019.object.d.ts':
          return convertLibEs2019Object(options);

        case 'lib.es2019.string.d.ts':
          return convertLibEs2019String(options);

        case 'lib.es2020.bigint.d.ts':
          return convertLibEs2020Bigint(options);

        case 'lib.es2020.number.d.ts':
          // (Number.NEGATIVE_INFINITY).toLocaleString() が '-∞' になるためこの変更はできない。
          // return replaceWithNoMatchCheck(
          //   //
          //   '): string;',
          //   // eslint-disable-next-line no-template-curly-in-string
          //   '): `${number}`;',
          // );
          return idFn;

        case 'lib.es2020.promise.d.ts':
          return composeMonoTypeFns(
            // Fix incorrect results of eslint fix
            options.config.returnType === 'readonly'
              ? replaceWithNoMatchCheck('readonly -readonly', 'readonly')
              : replaceWithNoMatchCheck('readonly -readonly', '-readonly'),
            options.config.returnType === 'readonly'
              ? idFn
              : replaceWithNoMatchCheck(
                  '): Promise<readonly PromiseSettledResult<Awaited<T>>[]>',
                  '): Promise<PromiseSettledResult<Awaited<T>>[]>',
                ),
          );

        case 'lib.es2020.sharedmemory.d.ts':
          return convertLibEs2020Sharedmemory(options);

        case 'lib.es2021.weakref.d.ts':
          // fix type errors
          return replaceWithNoMatchCheckBetweenRegexp({
            startRegexp: 'interface WeakRefConstructor {',
            endRegexp: closeBraceRegexp,
            mapFn: replaceWithNoMatchCheck(
              'readonly prototype: WeakRef<unknown>;',
              'readonly prototype: WeakRef<object>;',
            ),
          });

        case 'lib.es2021.intl.d.ts':
          // use mutable array in return value (undo of batch replacement results)
          return options.config.returnType === 'readonly'
            ? idFn
            : replaceWithNoMatchCheck(
                "readonly { readonly type: 'element' | 'literal'; readonly value: string }[]",
                "{ type: 'element' | 'literal'; value: string }[]",
              );

        case 'lib.es2022.array.d.ts':
          return convertLibEs2022Array(options);

        case 'lib.es2022.object.d.ts':
          return convertLibEs2022Object(options);

        case 'lib.es2022.string.d.ts':
          return replaceWithNoMatchCheck(
            'at(index: number)',
            `at(index: ${options.brandedNumber.StringSizeArg})`,
          );

        case 'lib.es2022.regexp.d.ts':
          return replaceWithNoMatchCheck(
            'number',
            options.brandedNumber.ArraySize,
          );

        case 'lib.es2023.array.d.ts':
          return convertLibEs2023Array(options);

        case 'lib.es2024.collection.d.ts':
          return composeMonoTypeFns(
            options.config.returnType === 'readonly'
              ? idFn
              : replaceWithNoMatchCheck(
                  'ReadonlyMap<K, readonly T[]>;',
                  'Map<K, T[]>;',
                ),
            replaceWithNoMatchCheck(
              'keySelector: (item: T, index: number) => K',
              `keySelector: (item: T, index: ${options.brandedNumber.ArraySize}) => K`,
            ),
          );

        case 'lib.es2024.object.d.ts':
          return composeMonoTypeFns(
            options.config.returnType === 'readonly'
              ? idFn
              : replaceWithNoMatchCheck(
                  'Partial<Record<K, readonly T[]>>',
                  'Partial<MutableRecord<K, T[]>>',
                ),
            replaceWithNoMatchCheck(
              'keySelector: (item: T, index: number) => K',
              `keySelector: (item: T, index: ${options.brandedNumber.ArraySize}) => K`,
            ),
          );

        case 'lib.es2024.sharedmemory.d.ts':
          return convertLibEs2024Sharedmemory(options);

        case 'lib.es2024.arraybuffer.d.ts':
          return convertLibEs2024Arraybuffer(options);

        case 'lib.esnext.iterator.d.ts':
          return convertLibEsNextIterator(options);

        case 'lib.esnext.array.d.ts':
          return replaceWithNoMatchCheck(
            'mapFn: (value: Awaited<T>, index: number) => U',
            `mapFn: (value: Awaited<T>, index: ${options.brandedNumber.ArraySize}) => U`,
          );

        default:
          return idFn;
      }
    })(),

    options.config.returnType === 'readonly'
      ? idFn
      : // use mutable array in return value (undo of batch replacement results)
        composeMonoTypeFns(
          replaceWithNoMatchCheck(
            //
            '): readonly ',
            '): ',
            {
              onNotFound: 'off',
            },
          ),
          replaceWithNoMatchCheck(
            /\): Promise<readonly ([_$a-zA-Z][_$a-zA-Z0-9]*)\[\]>/gu,
            '): Promise<$1[]>',
            {
              onNotFound: 'off',
            },
          ),
        ),
  ).value;
};
