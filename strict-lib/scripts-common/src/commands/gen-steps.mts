import { chdir } from 'node:process';
import { Arr, expectType, type UnknownResult } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';
import type { Context } from '../context.mjs';
import { fetchLibFiles } from '../functions/fetch-lib-files.mjs';
import { genCodemodFixed } from '../functions/gen-codemod-fixed.mjs';
import { genDiff, prepareCopiedForDiff } from '../functions/gen-diff.mjs';
import { genLibFiles } from '../functions/gen-lib-files.mjs';
import { genPackages } from '../functions/gen-packages.mjs';
import { formatDir } from '../functions/utils/format.mjs';

type GenStep = Readonly<{
  name: string;
  fn: () => Promise<UnknownResult>;
}>;

/**
 * The generation pipeline, in order. Each command runs a slice of it bounded by
 * {@link selectSteps}. The return type is left to inference so the step names
 * stay a literal union ({@link GenStepName}); annotating it as
 * `readonly GenStep[]` would widen them to `string` and let a stale bound pass
 * `check:types`.
 */
export const buildGenSteps = (ctx: Context) =>
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
      name: 'format output/lib-files-branded',
      fn: () => formatDir(ctx.paths.strictTsLib.output.libFilesBranded.$),
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
  ] as const satisfies readonly GenStep[];

type GenSteps = ReturnType<typeof buildGenSteps>;

type GenStepName = GenSteps[number]['name'];

// Fails if the names widen back to `string`, which would make a bound naming a
// renamed step compile again.
expectType<string extends GenStepName ? true : false, false>('=');

/**
 * The slice of `steps` a command runs: from `from` through `through` (both
 * included), or from `from` up to `before` (excluded). Keeping the bound rule
 * here, rather than a `+ 1` in each command, is what keeps the commands from
 * disagreeing on it.
 *
 * Throws when a bound names no step, names more than one, or the slice is
 * empty: any of these would otherwise run the wrong steps, or none, and exit 0.
 */
export const selectSteps = (
  steps: GenSteps,
  range: Readonly<
    { from: GenStepName } & (
      | { through: GenStepName; before?: undefined }
      | { before: GenStepName; through?: undefined }
    )
  >,
): readonly GenSteps[number][] => {
  const start = findStepIndex(steps, range.from);

  const end =
    range.through === undefined
      ? findStepIndex(steps, range.before)
      : findStepIndex(steps, range.through) + 1;

  const selected = steps.slice(start, end);

  if (!Arr.isNonEmpty(selected)) {
    throw new Error(
      `strict-lib gen: the step range ${JSON.stringify(range)} selects no step`,
    );
  }

  return selected;
};

const findStepIndex = (steps: GenSteps, stepName: GenStepName): number => {
  const index = steps.findIndex((s) => s.name === stepName);

  if (index === -1) {
    throw new Error(
      `strict-lib gen: no step named ${JSON.stringify(stepName)} in buildGenSteps`,
    );
  }

  if (steps.findLastIndex((s) => s.name === stepName) !== index) {
    throw new Error(
      `strict-lib gen: more than one step is named ${JSON.stringify(stepName)} in buildGenSteps`,
    );
  }

  return index;
};
