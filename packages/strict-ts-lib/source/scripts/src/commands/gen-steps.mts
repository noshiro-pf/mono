import { toUint32 } from '@noshiro/mono-utils';
import { packageManagerName, paths } from '../functions/constants.mjs';
import { fetchLibFiles } from '../functions/fetch-lib-files.mjs';
import { genDiff, prepareCopiedForDiff } from '../functions/gen-diff.mjs';
import { genEslintFixed } from '../functions/gen-eslint-fixed.mjs';
import { genLibFiles } from '../functions/gen-lib-files.mjs';
import { genPackages } from '../functions/gen-packages.mjs';
import { formatChanged, formatFiles } from '../functions/utils/format.mjs';

export const genSteps = [
  {
    name: 'fetchLibFiles',
    fn: fetchLibFiles,
  },
  {
    name: 'format temp/copied',
    fn: () => formatFiles(paths.strictTsLib.source.temp.copied.$),
  },
  {
    name: 'format temp/copied (changed)',
    fn: formatChanged,
  },
  {
    name: 'genEslintFixed',
    fn: genEslintFixed,
  },
  {
    name: 'genLibFiles',
    fn: genLibFiles,
  },
  {
    name: 'format output/lib-files',
    fn: () => formatFiles(paths.strictTsLib.output.libFiles.$),
  },
  {
    name: 'format output/lib-files (changed)',
    fn: formatChanged,
  },
  {
    name: 'prepareCopiedForDiff',
    fn: prepareCopiedForDiff,
  },
  {
    name: 'genDiff',
    fn: genDiff,
  },
  {
    name: 'genPackages',
    fn: genPackages,
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
  toUint32(genSteps.findIndex((s) => s.name === stepName));

export const getEndStepIndex = (stepName: StepName): Uint32 =>
  toUint32(genSteps.findIndex((s) => s.name === stepName) + 1);

export type StepName = (typeof genSteps)[number]['name'];
