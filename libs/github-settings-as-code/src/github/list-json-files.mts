import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * `dir` の直下にある `*.json` の絶対パス。宣言のディレクトリを読むところと
 * 消すところは、どちらもこれで宣言のファイルを選ぶ。
 *
 * 拡張子で絞るのは、宣言の隣に置く README（`repo-settings/variables/README.md`
 * のような、JSON でない同居ファイル）を宣言として読んだり消したりしないため。
 * 読む側が絞らないと、README を置いただけで `JSON.parse` が投げ、apply が何も
 * 送らずに止まる。
 */
export const listJsonFilesIn = async (
  dir: string,
): Promise<readonly string[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await fs.readdir(dir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.resolve(dir, entry.name));
};
