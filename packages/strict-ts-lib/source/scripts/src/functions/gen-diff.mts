import { exec } from 'node:child_process';
import 'zx/globals';
import { paths } from './constants.mjs';
import { clearDir } from './utils/clear-dir.mjs';
import { formatFiles } from './utils/format.mjs';
import { wrapStartEnd } from './utils/wrap-start-end.mjs';

export const prepareCopiedForDiff = async (): Promise<'ok' | 'err'> => {
  const { copied, copiedForDiff } = paths.strictTsLib.source.temp;

  {
    const res = await clearDir(copiedForDiff.$);
    if (res === 'err') return res;
  }

  {
    const res = await $`cp ${copied.$}/* ${copiedForDiff.$}/`;
    if (res.exitCode !== 0) {
      console.error(res.stderr);
      return 'err';
    }
  }

  return wrapStartEnd(
    () => formatFiles(copiedForDiff.$),
    'formatFiles("source/temp/copied-for-diff")',
  );
};

/**
 * Compare `source/temp/copied-for-diff/*` and `output/lib-files/*` and generate
 * `.diff` files to `output/diff`
 */
export const genDiff = async (): Promise<'ok' | 'err'> => {
  const { copiedForDiff } = paths.strictTsLib.source.temp;
  const { diff, libFiles } = paths.strictTsLib.output;

  const files = await glob(copiedForDiff.$);

  {
    const res = await clearDir(diff.$);
    if (res === 'err') return res;
  }

  try {
    for (const file of files) {
      const filename = path.basename(file);
      const name = path.basename(file, '.d.ts');
      echo(filename);

      const args = [
        '--no-index',
        `${copiedForDiff.$}/${name}.d.ts`,
        `${libFiles.$}/${name}.d.ts`,
      ].join(' ');

      const output = await execAsync(`git diff ${args}`);

      await fs.writeFile(
        path.resolve(diff.$, `${name}.diff`),
        output.split('\n').slice(4).join('\n'),
      );
    }
    return 'ok';
  } catch (error) {
    console.error(error);
    return 'err';
  }
};

const execAsync = (cmd: string): Promise<string> =>
  new Promise<string>((resolve, _reject) => {
    // eslint-disable-next-line security/detect-child-process
    exec(cmd, (_error, stdout) => {
      // NOTE: git diff を実行すると error が吐かれるが正常に diff ファイルは生成されるのでエラーは無視する
      resolve(stdout);
    });
  });
