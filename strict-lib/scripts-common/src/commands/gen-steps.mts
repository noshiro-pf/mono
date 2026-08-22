import { chdir } from 'node:process';
import { type UnknownResult } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';
import { type Context } from '../context.mjs';
import { fetchLibFiles } from '../functions/fetch-lib-files.mjs';
import { genCodemodFixed } from '../functions/gen-codemod-fixed.mjs';
import { genDiff, prepareCopiedForDiff } from '../functions/gen-diff.mjs';
import { genLibFiles } from '../functions/gen-lib-files.mjs';
import { genPackages } from '../functions/gen-packages.mjs';
import { formatDir } from '../functions/utils/format.mjs';

export type GenStep = Readonly<{
  name: string;
  fn: () => Promise<UnknownResult>;
}>;

export const buildGenSteps = (ctx: Context): readonly GenStep[] =>
  [
    {
      name: 'fetchLibFiles',
      fn: () => fetchLibFiles(ctx),
    },
    {
      name: 'format temp/copied',
      fn: () => formatDir(ctx.paths.strictTsLib.source.temp.copied.$),
    },
    {
      name: 'genCodemodFixed',
      fn: () => genCodemodFixed(ctx),
    },
    {
      name: 'genLibFiles',
      fn: () => genLibFiles(ctx),
    },
    {
      name: 'format output/lib-files',
      fn: () => formatDir(ctx.paths.strictTsLib.output.libFiles.$),
    },
    {
      name: 'format output-branded/lib-files',
      fn: () => formatDir(ctx.paths.strictTsLib.outputBranded.libFiles.$),
    },
    {
      name: 'prepareCopiedForDiff',
      fn: () => prepareCopiedForDiff(ctx),
    },
    {
      name: 'genDiff',
      fn: () => genDiff(ctx),
    },
    {
      name: 'genPackages',
      fn: () => genPackages(ctx),
    },
    {
      name: 'format output/lib/libs',
      fn: () => formatDir(ctx.paths.strictTsLib.output.lib.libs.$),
    },
    {
      name: 'format output/lib/libs-branded',
      fn: () => formatDir(ctx.paths.strictTsLib.output.lib.libsBranded.$),
    },
    {
      name: `${ctx.packageManagerName} install`,
      fn: () => {
        chdir(ctx.paths.root);

        return $(`${ctx.packageManagerName} install`);
      },
    },
  ] as const;

export const findStepIndex = (
  steps: readonly GenStep[],
  stepName: string,
): number => steps.findIndex((s) => s.name === stepName);
