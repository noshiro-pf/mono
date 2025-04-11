import 'zx/globals';
import { paths } from '../constants.mjs';
import { getSrcFileList, replaceWithTsMorph } from '../convert-dts/index.mjs';
import { type TsVersion } from '../typescript-versions.mjs';
import { clearDir, forAllTsVersions } from './utils/index.mjs';

/**
 * Read files in `output/{tsVersion}/{numberType}/temp/copied` and generate
 * files in `output/{tsVersion}/{numberType}/temp/eslint-fixed`
 */
export const genEslintFixed = async (
  tsVersion: TsVersion | 'all',
): Promise<'ok' | 'err'> => forAllTsVersions(tsVersion, genEslintFixedImpl);

/**
 * Read files in `output/{tsVersion}/{numberType}/temp/copied` and generate
 * files in `output/{tsVersion}/{numberType}/temp/eslint-fixed`
 */
const genEslintFixedImpl = async (
  tsVersion: TsVersion,
): Promise<'ok' | 'err'> => {
  const { copied, eslintFixed } = paths.strictTsLib.output(tsVersion).temp;

  {
    const res = await clearDir(eslintFixed);
    if (res === 'err') return 'err';
  }

  {
    const res = await $`cp -r ${copied}/lib*.d.ts ${eslintFixed}`;
    if (res.exitCode !== 0) {
      console.error(res.stderr);
      return 'err';
    }
  }

  const srcFileList = await getSrcFileList(eslintFixed);

  await Promise.all(
    srcFileList.map(async (filename) => {
      const outputFile = path.resolve(eslintFixed, filename);

      console.log(`${outputFile} generated.`);

      return replaceWithTsMorph(outputFile);
    }),
  );

  return 'ok';
};
