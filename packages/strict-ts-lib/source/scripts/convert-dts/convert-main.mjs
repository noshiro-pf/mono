import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { indexType } from './common.mjs';
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
import { convertLibEs2017String } from './lib.es2017.string.mjs';
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

/**
 * @param {string} source
 * @param {string} filename
 * @param {boolean} forNpmPackage
 * @param {boolean} commentOutDeprecated
 * @returns {string}
 */
export const convert = (
  source,
  filename,
  forNpmPackage,
  commentOutDeprecated,
) => {
  /** @type {string} */
  let mut_ret = source;

  mut_ret = pipe(mut_ret)
    .chain(
      replaceWithNoMatchCheck(
        '/// <reference no-default-lib="true"/>',
        [
          '/// <reference no-default-lib="true"/>',
          '/// <reference types="@noshiro/ts-type-utils-no-stdlib" />',
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
      replaceWithNoMatchCheck('declare var ', 'declare const ', () => false),
    )
    .chain(
      replaceWithNoMatchCheck('declare let ', 'declare const ', () => false),
    )
    .chain(replaceWithNoMatchCheck('  var ', '  const ', () => false))
    .chain(
      replaceWithNoMatchCheck(
        'radix?: number',
        'radix?: UintRange<2, 37>',
        () => false,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumIntegerDigits?: number | undefined',
        'minimumIntegerDigits?: UintRange<1, 22> | undefined',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumSignificantDigits?: number | undefined',
        'minimumSignificantDigits?: UintRange<1, 22> | undefined',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'maximumSignificantDigits?: number | undefined',
        'maximumSignificantDigits?: UintRange<1, 22> | undefined',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumFractionDigits?: number | undefined',
        'minimumFractionDigits?: UintRange<0, 21> | undefined',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'maximumFractionDigits?: number | undefined',
        'maximumFractionDigits?: UintRange<0, 21> | undefined',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumIntegerDigits: number;',
        'minimumIntegerDigits: UintRange<1, 22>;',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumSignificantDigits?: number;',
        'minimumSignificantDigits?: UintRange<1, 22>;',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'maximumSignificantDigits?: number;',
        'maximumSignificantDigits?: UintRange<1, 22>;',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumFractionDigits: number;',
        'minimumFractionDigits: UintRange<0, 21>;',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'maximumFractionDigits: number;',
        'maximumFractionDigits: UintRange<0, 21>;',
        filename !== 'lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts'
          ? () => false
          : undefined,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'length: number',
        `length: ${indexType.size}`,
        () => false,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'size: number',
        `size: ${indexType.size}`,
        () => false,
      ),
    )
    .chain(
      // fix ESLint auto fix result
      replaceWithNoMatchCheck(
        'readonly -readonly',
        '-readonly',
        filename !== 'lib.es2015.promise.d.ts' &&
          filename !== 'lib.es2020.promise.d.ts'
          ? () => false
          : undefined,
      ),
    )
    // fix ...args type
    .chain(
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
    ).value;

  switch (filename) {
    case 'lib.dom.d.ts':
      mut_ret = convertLibDom(mut_ret);
      break;

    case 'lib.webworker.d.ts':
      mut_ret = convertLibWebWorker(mut_ret);
      break;

    case 'lib.dom.iterable.d.ts':
      mut_ret = convertLibDomIterable(mut_ret);
      break;

    case 'lib.es5.d.ts':
      mut_ret = convertLibEs5(mut_ret, commentOutDeprecated);
      break;

    case 'lib.es2015.collection.d.ts':
      mut_ret = convertLibEs2015Collection(mut_ret);
      break;

    case 'lib.es2015.symbol.wellknown.d.ts':
      mut_ret = convertEs2015SymbolWellknown(mut_ret);
      break;

    case 'lib.es2015.core.d.ts':
      mut_ret = convertLibEs2015Core(mut_ret, commentOutDeprecated);
      break;

    case 'lib.es2015.iterable.d.ts':
      mut_ret = convertLibEs2015Iterable(mut_ret);
      break;

    case 'lib.es2016.array.include.d.ts':
      mut_ret = convertLibEs2016ArrayInclude(mut_ret);
      break;

    case 'lib.es2017.sharedmemory.d.ts':
      mut_ret = convertLibEs2017Sharedmemory(mut_ret);
      break;

    case 'lib.es2017.object.d.ts':
      mut_ret = convertLibEs2017Object(mut_ret);
      break;

    case 'lib.es2017.string.d.ts':
      mut_ret = convertLibEs2017String(mut_ret);
      break;

    case 'lib.es2017.date.d.ts':
      mut_ret = convertLibEs2017Date(mut_ret);
      break;

    case 'lib.es2019.array.d.ts':
      mut_ret = convertLibEs2019Array(mut_ret);
      break;

    case 'lib.es2019.object.d.ts':
      mut_ret = convertLibEs2019Object(mut_ret);
      break;

    case 'lib.es2019.string.d.ts':
      mut_ret = convertLibEs2019String(mut_ret);
      break;

    case 'lib.es2020.bigint.d.ts':
      mut_ret = convertLibEs2020Bigint(mut_ret);
      break;

    case 'lib.es2020.number.d.ts':
      mut_ret = pipe(mut_ret).chain(
        // eslint-disable-next-line no-template-curly-in-string
        replaceWithNoMatchCheck('): string;', '): `${number}`;'),
      ).value;
      break;

    case 'lib.es2020.sharedmemory.d.ts':
      mut_ret = convertLibEs2020Sharedmemory(mut_ret);
      break;

    case 'lib.es2022.array.d.ts':
      mut_ret = convertLibEs2022Array(mut_ret);
      break;

    case 'lib.es2022.object.d.ts':
      mut_ret = convertLibEs2022Object(mut_ret);
      break;

    case 'lib.es2022.sharedmemory.d.ts':
      mut_ret = convertLibEs2022Sharedmemory(mut_ret);
      break;

    case 'lib.es2022.regexp.d.ts':
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck('number', indexType.ret),
      ).value;
      break;

    case 'lib.es2023.array.d.ts':
      mut_ret = convertLibEs2023Array(mut_ret);
      break;

    default:
      break;
  }

  return mut_ret;
};
