import { exec } from 'node:child_process';
import 'zx/globals';
import { type TsVersion } from '../typescript-versions.mjs';
import { converterConfigs, paths } from './constants.mjs';
import { clearDir } from './utils/clear-dir.mjs';
import { forAllTsVersions } from './utils/for-all-ts-versions.mjs';
import { formatFiles } from './utils/format.mjs';
import { wrapStartEnd } from './utils/wrap-start-end.mjs';

export const prepareCopiedForDiff = async (
  tsVersion: TsVersion | 'all',
): Promise<'ok' | 'err'> =>
  forAllTsVersions(tsVersion, prepareCopiedForDiffImpl);

const prepareCopiedForDiffImpl = async (
  tsVersion: TsVersion,
): Promise<'ok' | 'err'> => {
  const { copied, copiedForDiff } = paths.strictTsLib.output(tsVersion).temp;

  {
    const res = await clearDir(copiedForDiff);
    if (res === 'err') return res;
  }

  {
    const res = await $`cp ${copied}/* ${copiedForDiff}/`;
    if (res.exitCode !== 0) {
      console.error(res.stderr);
      return 'err';
    }
  }

  return wrapStartEnd(
    () => glob(`${copiedForDiff}/*`).then(formatFiles),
    'formatFiles("temp/copied-for-diff")',
  );
};

export const genDiff = async (
  tsVersion: TsVersion | 'all',
): Promise<'ok' | 'err'> => forAllTsVersions(tsVersion, genDiffImpl);

const genDiffImpl = async (tsVersion: TsVersion): Promise<'ok' | 'err'> => {
  for (const { numberType } of converterConfigs) {
    const res = await genDiffImpl2(tsVersion, numberType);
    if (res === 'err') return 'err';
  }

  return 'ok';
};

/**
 * Compare `output/{tsVersion}/{numberType}/temp/copied-for-diff/*` and
 * `output/{tsVersion}/{numberType}/lib-files/*` and generate `.diff` files to
 * `output/{tsVersion}/{numberType}/diff`
 */
const genDiffImpl2 = async (
  tsVersion: TsVersion,
  numberType: 'normal' | 'branded',
): Promise<'ok' | 'err'> => {
  const { copiedForDiff } = paths.strictTsLib.output(tsVersion).temp;
  const { diff, libFiles } = paths.strictTsLib.output(tsVersion)[numberType];

  const files = await glob(copiedForDiff);

  {
    const res = await clearDir(diff);
    if (res === 'err') return res;
  }

  try {
    for (const file of files) {
      const filename = path.basename(file);
      const name = path.basename(file, '.d.ts');
      echo(filename);

      const args = [
        '--no-index',
        `${copiedForDiff}/${name}.d.ts`,
        `${libFiles}/${name}.d.ts`,
      ].join(' ');

      const output = await execAsync(`git diff ${args}`);

      await fs.writeFile(
        path.resolve(diff, `${name}.diff`),
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
