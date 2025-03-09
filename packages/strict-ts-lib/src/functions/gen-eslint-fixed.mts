import 'zx/globals';
import { paths } from './constants.mjs';
import { type SemVer } from './types.mjs';
import { clearDir } from './utils/clear-dir.mjs';
import { forAllTsVersions } from './utils/for-all-ts-versions.mjs';

/**
 * Read files in `output/{tsVersion}/{numberType}/temp/copied` and generate
 * files in `output/{tsVersion}/{numberType}/temp/eslint-fixed`
 */
export const genEslintFixed = async (
  tsVersion: SemVer | 'all',
): Promise<'ok' | 'err'> => forAllTsVersions(tsVersion, genEslintFixedImpl);

/**
 * Read files in `output/{tsVersion}/{numberType}/temp/copied` and generate
 * files in `output/{tsVersion}/{numberType}/temp/eslint-fixed`
 */
const genEslintFixedImpl = async (tsVersion: SemVer): Promise<'ok' | 'err'> => {
  const { copied, eslintFixed } = paths.strictTsLib.output(tsVersion).temp;

  {
    const res = await clearDir(eslintFixed.$);
    if (res === 'err') return 'err';
  }

  {
    const res = await $`cp -r ${copied.$}/lib*.d.ts ${eslintFixed.$}`;
    if (res.exitCode !== 0) {
      console.error(res.stderr);
      return 'err';
    }
  }

  cd(paths.strictTsLib.$);

  {
    const res =
      await $`yarn zz:eslint ${eslintFixed.$} --config ./configs/eslint.config.gen.mjs --fix || true`;
    if (res.exitCode !== 0) {
      console.error(res.stderr);
      return 'err';
    }
  }

  return 'ok';
};
