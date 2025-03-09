import 'zx/globals';
import { paths } from './constants.mjs';
import { type SemVer } from './types.mjs';
import { typescriptVersions } from './typescript-versions.mjs';
import { clearDir } from './utils/clear-dir.mjs';

/**
 * Read files in `source/temp/copied` and generate files in
 * `source/temp/eslint-fixed`
 */
export const genEslintFixed = async (
  tsVersion: SemVer | 'all',
): Promise<'ok' | 'err'> => {
  if (tsVersion === 'all') {
    for (const v of typescriptVersions) {
      echo(`TypeScript version: ${v}.\n`);

      const res = await genEslintFixedImpl(v);
      if (res === 'err') return 'err';
    }
  } else {
    echo(`TypeScript version: ${tsVersion}.\n`);

    const res = await genEslintFixedImpl(tsVersion);
    if (res === 'err') return 'err';
  }

  return 'ok';
};

/**
 * Read files in `source/temp/copied` and generate files in
 * `source/temp/eslint-fixed`
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

  cd(paths.strictTsLib.source.$);

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
