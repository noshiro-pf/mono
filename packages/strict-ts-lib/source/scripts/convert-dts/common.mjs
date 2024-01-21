import * as fs from 'node:fs/promises';

/**
 * @param {string} srcDir
 * @returns {Promise<
 *   readonly Readonly<{ filename: string; content: string }>[]
 * >}
 */
export const getSrcFileList = async (srcDir) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const distFileNameList = await fs.readdir(srcDir);

  const distFileContentList = await Promise.all(
    distFileNameList.map((filename) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFile(`${srcDir}/${filename}`, 'utf8'),
    ),
  );

  /** @type {readonly Readonly<{ filename: string; content: string }>[]} */
  const distFileList = distFileNameList.map((filename, index) => ({
    filename,
    content: distFileContentList[index] ?? '',
  }));

  return distFileList;
};

/**
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/length
 *
 *     Max array length : 2^32 - 1
 *     Max string length : 2^53 - 1
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
