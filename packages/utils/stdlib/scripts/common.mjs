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
