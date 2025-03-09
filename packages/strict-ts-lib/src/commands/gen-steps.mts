import { toUint32 } from '@noshiro/mono-utils';
import {
  converterConfigs,
  packageManagerName,
  paths,
} from '../functions/constants.mjs';
import { fetchLibFiles } from '../functions/fetch-lib-files.mjs';
import { genDiff, prepareCopiedForDiff } from '../functions/gen-diff.mjs';
import { genEslintFixed } from '../functions/gen-eslint-fixed.mjs';
import { genLibFiles } from '../functions/gen-lib-files.mjs';
import { genPackages } from '../functions/gen-packages.mjs';
import { type SemVer } from '../functions/types.mjs';
import { typescriptVersions } from '../functions/typescript-versions.mjs';
import { formatChanged, formatFiles } from '../functions/utils/format.mjs';

export const steps = (tsVersion: SemVer | 'all') =>
  [
    {
      name: 'fetchLibFiles',
      fn: () => fetchLibFiles(tsVersion),
    },
    {
      name: 'format temp/copied',
      fn: () =>
        formatFiles(
          tsVersion === 'all'
            ? typescriptVersions.map((v) =>
                path.resolve(paths.strictTsLib.output(v).temp.copied.$, '*'),
              )
            : path.resolve(
                paths.strictTsLib.output(tsVersion).temp.copied.$,
                '*',
              ),
        ),
    },
    {
      name: 'format temp/copied (changed)',
      fn: formatChanged,
    },
    {
      name: 'genEslintFixed',
      fn: () => genEslintFixed(tsVersion),
    },
    {
      name: 'genLibFiles',
      fn: () => genLibFiles(tsVersion),
    },
    {
      name: 'format lib-files',
      fn: () =>
        formatFiles(
          converterConfigs.flatMap((cfg) =>
            tsVersion === 'all'
              ? typescriptVersions.map((v) =>
                  path.resolve(
                    paths.strictTsLib.output(v)[cfg.numberType].libFiles.$,
                    '*',
                  ),
                )
              : path.resolve(
                  paths.strictTsLib.output(tsVersion)[cfg.numberType].libFiles
                    .$,
                  '*',
                ),
          ),
        ),
    },
    {
      name: 'format lib-files (changed)',
      fn: formatChanged,
    },
    {
      name: 'prepareCopiedForDiff',
      fn: () => prepareCopiedForDiff(tsVersion),
    },
    {
      name: 'genDiff',
      fn: () => genDiff(tsVersion),
    },
    {
      name: 'genPackages',
      fn: () => genPackages(tsVersion),
    },
    {
      name: 'formatChanged',
      fn: formatChanged,
    },
    {
      name: `${packageManagerName} install`,
      fn: async () => {
        cd(paths.root);
        await $`${packageManagerName} install`;
        return 'ok';
      },
    },
  ] as const satisfies { name: string; fn: () => Promise<'ok' | 'err'> }[];

export const getStartStepIndex = (stepName: StepName): Uint32 =>
  toUint32(steps('all').findIndex((s) => s.name === stepName));

export const getEndStepIndex = (stepName: StepName): Uint32 =>
  toUint32(steps('all').findIndex((s) => s.name === stepName) + 1);

export type StepName = ReturnType<typeof steps>[number]['name'];
