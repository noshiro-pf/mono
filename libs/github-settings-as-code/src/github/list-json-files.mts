import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathExists } from 'ts-repo-utils';

/**
 * `dir` の直下にある `*.json` の絶対パス。宣言のディレクトリを読むところと
 * 消すところは、どちらもこれで宣言のファイルを選ぶ。
 *
 * 拡張子で絞るのは、宣言の隣に置く README（`repo-settings/variables/README.md`
 * のような、JSON でない同居ファイル）を宣言として読んだり消したりしないため。
 * 読む側が絞らないと、README を置いただけで `JSON.parse` が投げ、apply が何も
 * 送らずに止まる。
 *
 * `dir` が無ければ空を返す。宣言のディレクトリを置いていない repository では、
 * その target の宣言が無いだけで、apply はそこで止まらずに次の target へ進む。
 */
export const listJsonFilesIn = async (
  dir: string,
): Promise<readonly string[]> => {
  if (!(await pathExists(dir))) {
    return [];
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await fs.readdir(dir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.resolve(dir, entry.name));
};

/**
 * 読んだ宣言。値と、それを読んだファイル。 apply が反映後の値を書き戻すのは
 * このファイルで、宣言の名前から作り直したパスではない。名前を変えた宣言を
 * 名前から書き戻すと、元のファイル（同じ id を持つ）が残って二つになる。
 */
export type Declaration<T> = Readonly<{ file: string; value: T }>;
