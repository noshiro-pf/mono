import 'zx/globals';
import { paths } from './constants.mjs';
import { type SemVer } from './types.mjs';
import { typescriptVersions } from './typescript-versions.mjs';

export const openDiffInCode = async (
  numberType: 'normal' | 'branded',
): Promise<void> => {
  await openDiffInCodeImpl(typescriptVersions[0], numberType);
};

const openDiffInCodeImpl = async (
  tsVersion: SemVer,
  numberType: 'normal' | 'branded',
): Promise<void> => {
  const files = await glob(
    paths.strictTsLib.output(tsVersion).temp.copiedForDiff.$,
  );

  for (const file of files) {
    const name = path.basename(file, '.d.ts');

    if (
      !/^(lib|lib.es6|lib\.esnext(\.full)?|lib.es20[0-9][0-9](\.full)?)$/u.test(
        name,
      )
    ) {
      await $`code --diff "${paths.strictTsLib.output(tsVersion).temp.copiedForDiff.$}/${name}.d.ts" "${paths.strictTsLib.output(tsVersion)[numberType].lib.$}/${name}.d.ts"`;
    }
  }
};
