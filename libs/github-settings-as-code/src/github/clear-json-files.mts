import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * `dir` の直下の `*.json` を消す。ディレクトリが無ければ作る。
 *
 * backup が書き込む前にこれを呼ぶ。撮り直したあとにそこに在るものが、そのまま
 * 「GitHub から取れたもの」になる — 取れなかった資源は `git status` に削除と
 * して現れる。消さずに上書きするだけだと、取れなかった資源の古いファイルが
 * 残り、取れたのと見分けがつかない。
 *
 * まだ apply していない宣言も同じように削除として現れるが、それも見えた方が
 * よい情報で、コミットしなければ失われない。
 *
 * `rm -rf` ではなく直下の `*.json` に限る。宣言の隣に置いてある README
 * （`repo-settings/variables/README.md`）のような、JSON でない同居ファイルを
 * 巻き込まないため。
 */
export const clearJsonFilesIn = async (dir: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(dir, { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      await fs.rm(path.resolve(dir, entry.name));
    }
  }
};
