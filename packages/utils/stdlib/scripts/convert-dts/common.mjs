import * as fs from 'fs';
import * as util from 'util';

export const readdirAsync = util.promisify(fs.readdir);
export const readFileAsync = util.promisify(fs.readFile);
export const writeFileAsync = util.promisify(fs.writeFile);

/**
 *
 * @param {string} srcDir
 * @returns {Promise<{ filename: string, content: string }[]>}
 */
export const getDistFileList = async (srcDir) => {
  const distFileNameList = await readdirAsync(srcDir);

  const distFileContentList = await Promise.all(
    distFileNameList.map((filename) =>
      readFileAsync(`${srcDir}/${filename}`, 'utf8')
    )
  );

  /** @type {{ filename: string, content: string }[]} */
  const distFileList = distFileNameList.map((filename, index) => ({
    filename,
    content: distFileContentList[index] ?? '',
  }));

  return distFileList;
};

/** @typedef {import("./type").Pipe} Pipe */

/**
 * @param {string} a
 * @returns {Pipe}
 */
export const pipe = (a) => ({
  value: a,
  chain: (fn) => pipe(fn(a)),
});

/**
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/length
 *
 * - max array length : 2^32 - 1
 * - max string length : 2^53 - 1
 */
export const indexType = {
  argNonNegative: 'SafeUint | Uint9',
  arg: 'SafeInt | Int10',
  ret: 'SafeUint',
  size: 'SafeUint',
  searchResult: 'SafeUint | -1',
  callbackArg: 'SafeUint',
  newArrayMaxSize: 'Uint32',
};
