// @ts-check

import { getDistFileList, indexType, writeFileAsync } from './common.mjs';
import { convertLibDomIterable } from './lib.dom.iterable.mjs';
import { convertLibDom } from './lib.dom.mjs';
import { convertLibEs2015Collection } from './lib.es2015.collection.mjs';
import { convertLibEs2015Core } from './lib.es2015.core.mjs';
import { convertLibEs2015Iterable } from './lib.es2015.iterable.mjs';
import { convertEs2015SymbolWellknown } from './lib.es2015.symbol.wellknown.mjs';
import { convertLibEs2016ArrayInclude } from './lib.es2016.array.include.mjs';
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

const srcDir = './temp';
const distDir = './dist';

/** @type {boolean} */
const commentOutDeprecated = false;

const distFileList = await getDistFileList(srcDir);

/**
 * @param {string} content
 * @param {string} filename
 * @returns {string}
 */
const convert = (content, filename) => {
  /** @type {string} */
  let ret = content;

  ret = ret.replaceAll(
    '/// <reference no-default-lib="true"/>',
    '/// <reference no-default-lib="true"/>\n/// <reference path="../../ts-type-utils-no-stdlib/ts-type-utils-no-stdlib.d.ts" />',
  );

  ret = ret.replaceAll(
    /\/\/\/ <reference lib="(.+)" \/>/gu,
    '/// <reference path="./lib.$1.d.ts" />',
  );

  ret = ret.replaceAll('declare var ', 'declare const ');
  ret = ret.replaceAll('declare let ', 'declare const ');
  ret = ret.replaceAll('  var ', '  const ');

  ret = ret.replaceAll('radix?: number', 'radix?: UintRange<2, 37>');
  ret = ret.replaceAll(
    'minimumIntegerDigits?: number | undefined',
    'minimumIntegerDigits?: UintRange<1, 22> | undefined',
  );
  ret = ret.replaceAll(
    'minimumSignificantDigits?: number | undefined',
    'minimumSignificantDigits?: UintRange<1, 22> | undefined',
  );
  ret = ret.replaceAll(
    'maximumSignificantDigits?: number | undefined',
    'maximumSignificantDigits?: UintRange<1, 22> | undefined',
  );
  ret = ret.replaceAll(
    'minimumFractionDigits?: number | undefined',
    'minimumFractionDigits?: UintRange<0, 21> | undefined',
  );
  ret = ret.replaceAll(
    'maximumFractionDigits?: number | undefined',
    'maximumFractionDigits?: UintRange<0, 21> | undefined',
  );
  ret = ret.replaceAll(
    'minimumIntegerDigits: number;',
    'minimumIntegerDigits: UintRange<1, 22>;',
  );
  ret = ret.replaceAll(
    'minimumSignificantDigits?: number;',
    'minimumSignificantDigits?: UintRange<1, 22>;',
  );
  ret = ret.replaceAll(
    'maximumSignificantDigits?: number;',
    'maximumSignificantDigits?: UintRange<1, 22>;',
  );
  ret = ret.replaceAll(
    'minimumFractionDigits: number;',
    'minimumFractionDigits: UintRange<0, 21>;',
  );
  ret = ret.replaceAll(
    'maximumFractionDigits: number;',
    'maximumFractionDigits: UintRange<0, 21>;',
  );

  ret = ret.replaceAll('length: number', `length: ${indexType.size}`);
  ret = ret.replaceAll('size: number', `size: ${indexType.size}`);

  // fix ESLint auto fix result
  ret = ret.replaceAll('readonly -readonly', '-readonly');

  // fix ...args type

  ret = ret.replaceAll(
    /\.\.\.([_\$a-zA-Z\\xA0-\\uFFFF][_\$a-zA-Z0-9\\xA0-\\uFFFF]*): readonly any\[\]/gu,
    '...$1: readonly never[]',
  );
  ret = ret.replaceAll('...args: unknown', '...args: readonly never[]');
  ret = ret.replaceAll('...args: unknown[]', '...args: readonly never[]');
  ret = ret.replaceAll(
    '...args: readonly unknown[]',
    '...args: readonly never[]',
  );

  ret = ret.replaceAll('keyof unknown', 'keyof never');
  ret = ret.replaceAll('TReturn = unknown', 'TReturn = any');

  switch (filename) {
    case 'lib.dom.d.ts':
      ret = convertLibDom(ret);
      break;

    case 'lib.webworker.d':
      ret = convertLibWebWorker(ret);
      break;

    case 'lib.dom.iterable.d.ts':
      ret = convertLibDomIterable(ret);
      break;

    case 'lib.es5.d.ts':
      ret = convertLibEs5(ret, commentOutDeprecated);
      break;

    case 'lib.es2015.collection.d.ts':
      ret = convertLibEs2015Collection(ret);
      break;

    case 'lib.es2015.symbol.wellknown.d.ts':
      ret = convertEs2015SymbolWellknown(ret);
      break;

    case 'lib.es2015.core.d.ts':
      ret = convertLibEs2015Core(ret, commentOutDeprecated);
      break;

    case 'lib.es2015.iterable.d.ts':
      ret = convertLibEs2015Iterable(ret);
      break;

    case 'lib.es2016.array.include.d.ts':
      ret = convertLibEs2016ArrayInclude(ret);
      break;

    case 'lib.es2017.sharedmemory.d.ts':
      ret = convertLibEs2017Sharedmemory(ret);
      break;

    case 'lib.es2017.object.d.ts':
      ret = convertLibEs2017Object(ret);
      break;

    case 'lib.es2017.string.d.ts':
      ret = convertLibEs2017String(ret);
      break;

    case 'lib.es2019.array.d.ts':
      ret = convertLibEs2019Array(ret);
      break;

    case 'lib.es2019.object.d.ts':
      ret = convertLibEs2019Object(ret);
      break;

    case 'lib.es2019.string.d.ts':
      ret = convertLibEs2019String(ret);
      break;

    case 'lib.es2020.bigint.d.ts':
      ret = convertLibEs2020Bigint(ret);
      break;

    case 'lib.es2020.number.d.ts':
      ret = ret.replaceAll('): string;', '): `${number}`;');
      break;

    case 'lib.es2020.sharedmemory.d.ts':
      ret = convertLibEs2020Sharedmemory(ret);
      break;

    case 'lib.es2022.array.d.ts':
      ret = convertLibEs2022Array(ret);
      break;

    case 'lib.es2022.object.d.ts':
      ret = convertLibEs2022Object(ret);
      break;

    case 'lib.es2022.sharedmemory.d.ts':
      ret = convertLibEs2022Sharedmemory(ret);
      break;

    case 'lib.es2022.regexp.d.ts':
      ret = ret.replaceAll('number', indexType.ret);
      break;

    case 'lib.es2023.array.d.ts':
      ret = convertLibEs2023Array(ret);
      break;
  }

  return ret;
};

await Promise.all(
  distFileList.map(({ content, filename }) =>
    writeFileAsync(`${distDir}/${filename}`, convert(content, filename)),
  ),
);
