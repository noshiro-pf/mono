import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { NumberType, converterOptions, typeUtilsName } from './common.mjs';
import { convertReturnTypeToUintRange } from './convert-return-type-to-uint-range.mjs';
import { convertLibDomIterable } from './lib.dom.iterable.mjs';
import { convertLibDom } from './lib.dom.mjs';
import { convertLibEs2015Collection } from './lib.es2015.collection.mjs';
import { convertLibEs2015Core } from './lib.es2015.core.mjs';
import { convertLibEs2015Iterable } from './lib.es2015.iterable.mjs';
import { convertEs2015SymbolWellknown } from './lib.es2015.symbol.wellknown.mjs';
import { convertLibEs2016ArrayInclude } from './lib.es2016.array.include.mjs';
import { convertLibEs2017Date } from './lib.es2017.date.mjs';
import { convertLibEs2017Object } from './lib.es2017.object.mjs';
import { convertLibEs2017Sharedmemory } from './lib.es2017.sharedmemory.mjs';
import { convertLibEs2019Array } from './lib.es2019.array.mjs';
import { convertLibEs2019Object } from './lib.es2019.object.mjs';
import { convertLibEs2019String } from './lib.es2019.string.mjs';
import { convertLibEs2020Bigint } from './lib.es2020.bigint.mjs';
import { convertLibEs2020Sharedmemory } from './lib.es2020.sharedmemory.mjs';
import { convertLibEs2022Array } from './lib.es2022.array.mjs';
import { convertLibEs2022Object } from './lib.es2022.object.mjs';
import { convertLibEs2022Sharedmemory } from './lib.es2022.sharedmemory.mjs';
import { convertLibEs2023Array } from './lib.es2023.array.mjs';
import { convertLibEs5 } from './lib.es5.mjs';
import { convertLibWebWorker } from './lib.webworker.mjs';

export const convert = (
  source: string,
  filename: string,
  forNpmPackage: boolean,
): string =>
  pipe(source)
    .chain(
      (src) =>
        pipe(src)
          .chain(
            replaceWithNoMatchCheck(
              '/// <reference no-default-lib="true"/>',
              [
                '/// <reference no-default-lib="true"/>',
                `/// <reference types="${typeUtilsName}" />`,
              ].join('\n'),
            ),
          )
          .chain(
            forNpmPackage
              ? (s) => s
              : replaceWithNoMatchCheck(
                  // eslint-disable-next-line prefer-named-capture-group
                  /\/\/\/ <reference lib="(.+)" \/>/gu,
                  '/// <reference path="./lib.$1.d.ts" />',
                  () => false,
                ),
          )
          .chain(
            replaceWithNoMatchCheck(
              //
              'declare var ',
              'declare const ',
              () => false,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              //
              'declare let ',
              'declare const ',
              () => false,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              //
              '  var ',
              '  const ',
              () => false,
            ),
          )
          .chain(
            // fix ...args type
            replaceWithNoMatchCheck(
              // eslint-disable-next-line prefer-named-capture-group, no-useless-escape
              /\.\.\.([_\$a-zA-Z\\xA0-\\uFFFF][_\$a-zA-Z0-9\\xA0-\\uFFFF]*): readonly any\[\]/gu,
              '...$1: readonly never[]',
              () => false,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '...args: unknown',
              '...args: readonly never[]',
              () => false,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'TReturn = unknown',
              'TReturn = any',
              () => false,
            ),
          ).value,
    )
    .chain((src) => {
      switch (filename) {
        case 'lib.dom.d.ts':
          return convertLibDom(src);

        case 'lib.webworker.d.ts':
          return convertLibWebWorker(src);

        case 'lib.dom.iterable.d.ts':
          return convertLibDomIterable(src);

        case 'lib.es5.d.ts':
          return convertLibEs5(src);

        case 'lib.es2015.promise.d.ts':
        case 'lib.es2020.promise.d.ts':
          return pipe(src).chain(
            // fix ESLint auto fix result
            replaceWithNoMatchCheck('readonly -readonly', '-readonly'),
          ).value;

        case 'lib.es2015.collection.d.ts':
          return convertLibEs2015Collection(src);

        case 'lib.es2015.symbol.wellknown.d.ts':
          return convertEs2015SymbolWellknown(src);

        case 'lib.es2015.core.d.ts':
          return convertLibEs2015Core(src);

        case 'lib.es2015.iterable.d.ts':
          return convertLibEs2015Iterable(src);

        case 'lib.es2016.array.include.d.ts':
          return convertLibEs2016ArrayInclude(src);

        case 'lib.es2017.sharedmemory.d.ts':
          return convertLibEs2017Sharedmemory(src);

        case 'lib.es2017.object.d.ts':
          return convertLibEs2017Object(src);

        case 'lib.es2017.string.d.ts':
          return pipe(src).chain(
            replaceWithNoMatchCheck(
              'maxLength: number',
              `maxLength: ${NumberType.StringSizeArgNonNegative}`,
            ),
          ).value;

        case 'lib.es2017.date.d.ts':
          return convertLibEs2017Date(src);

        case 'lib.es2018.intl.d.ts':
          return convertReturnTypeToUintRange(src);

        case 'lib.es2019.array.d.ts':
          return convertLibEs2019Array(src);

        case 'lib.es2019.object.d.ts':
          return convertLibEs2019Object(src, forNpmPackage);

        case 'lib.es2019.string.d.ts':
          return convertLibEs2019String(src);

        case 'lib.es2020.bigint.d.ts':
          return convertLibEs2020Bigint(src);

        case 'lib.es2020.number.d.ts':
          return pipe(src).chain(
            replaceWithNoMatchCheck(
              //
              '): string;',
              // eslint-disable-next-line no-template-curly-in-string
              '): `${number}`;',
            ),
          ).value;

        case 'lib.es2020.sharedmemory.d.ts':
          return convertLibEs2020Sharedmemory(src);

        case 'lib.es2022.array.d.ts':
          return convertLibEs2022Array(src);

        case 'lib.es2022.object.d.ts':
          return convertLibEs2022Object(src, forNpmPackage);

        case 'lib.es2022.sharedmemory.d.ts':
          return convertLibEs2022Sharedmemory(src);

        case 'lib.es2022.regexp.d.ts':
          return pipe(src).chain(
            replaceWithNoMatchCheck('number', NumberType.ArraySize),
          ).value;

        case 'lib.es2023.array.d.ts':
          return convertLibEs2023Array(src);

        default:
          return src;
      }
    })
    .chain(
      converterOptions.returnType === 'mutable'
        ? // revert eslint fix result
          replaceWithNoMatchCheck(
            //
            '): readonly ',
            '): ',
            () => false,
          )
        : (a) => a,
    ).value;
