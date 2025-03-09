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
import { formatChanged, formatFiles } from '../functions/utils/format.mjs';
import { type TsVersion, typescriptVersions } from '../typescript-versions.mjs';

export const steps = (tsVersion: TsVersion | 'all') =>
  [
    {
      name: 'fetchLibFiles',
      fn: () => fetchLibFiles(tsVersion),
    },
    {
      name: 'format temp/copied',
      fn: async () => {
        if (tsVersion === 'all') {
          const files = await Promise.all(
            typescriptVersions.map((v) =>
              glob(`${paths.strictTsLib.output(v).temp.copied}/*`),
            ),
          );

          return formatFiles(files.flat());
        } else {
          const files = await glob(
            `${paths.strictTsLib.output(tsVersion).temp.copied}/*`,
          );

          return formatFiles(files);
        }
      },
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
      fn: async () => {
        if (tsVersion === 'all') {
          const files = await Promise.all(
            converterConfigs.flatMap((cfg) =>
              typescriptVersions.map((v) =>
                glob(
                  `${paths.strictTsLib.output(v)[cfg.numberType].libFiles}/*`,
                ),
              ),
            ) satisfies readonly Promise<readonly string[]>[],
          );

          return formatFiles(files.flat());
        } else {
          const files = await Promise.all(
            converterConfigs.flatMap((cfg) =>
              glob(
                `${paths.strictTsLib.output(tsVersion)[cfg.numberType].libFiles}/*`,
              ),
            ),
          );

          return formatFiles(files.flat());
        }
      },
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
        cd(paths.monoRoot);
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
