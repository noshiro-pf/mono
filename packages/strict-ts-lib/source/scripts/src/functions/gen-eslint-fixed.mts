import 'zx/globals';
import { paths } from './constants.mjs';
import { clearDir } from './utils/clear-dir.mjs';

/**
 * Read files in `source/temp/copied` and generate files in
 * `source/temp/eslint-fixed`
 */
export const genEslintFixed = async (): Promise<'ok' | 'err'> => {
  const { copied, eslintFixed } = paths.strictTsLib.source.temp;

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
