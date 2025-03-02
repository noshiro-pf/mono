import 'zx/globals';
import { paths } from './constants.mjs';

export const openDiffInCode = async (): Promise<void> => {
  const files = await glob(paths.strictTsLib.source.temp.copiedForDiff.$);

  for (const file of files) {
    const name = path.basename(file, '.d.ts');

    if (
      !/^(lib|lib.es6|lib\.esnext(\.full)?|lib.es20[0-9][0-9](\.full)?)$/u.test(
        name,
      )
    ) {
      await $`code --diff "${paths.strictTsLib.source.temp.copiedForDiff.$}/${name}.d.ts" "${paths.strictTsLib.output.lib.$}/${name}.d.ts"`;
    }
  }
};
