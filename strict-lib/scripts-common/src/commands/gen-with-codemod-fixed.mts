import * as fs from 'node:fs/promises';
import { pathExists } from 'ts-repo-utils';
import { createContext, type CreateContextOptions } from '../context.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { buildGenSteps, findStepIndex } from './gen-steps.mjs';

/**
 * Run the generation pipeline including the `genCodemodFixed` step. When
 * `source/temp/copied/` is already populated the `fetchLibFiles` step is skipped
 * for a fast incremental rebuild; otherwise (e.g. a clean CI checkout, where
 * `temp/` is gitignored) it falls back to fetching the upstream lib files first,
 * so `build` works without a separate `gen:full` run.
 *
 * Compared to `gen`, this additionally regenerates `source/temp/codemod-fixed/`
 * (the input consumed by `genLibFiles`); use it whenever that input might be
 * stale or missing.
 */
export const runGenWithCodemodFixed = async (
  options: CreateContextOptions,
): Promise<void> => {
  const ctx = createContext(options);

  const steps = buildGenSteps(ctx);

  const copiedDir = ctx.paths.strictTsLib.source.temp.copied.$;

  const copiedEntries = (await pathExists(copiedDir))
    ? await fs.readdir(copiedDir)
    : ([] as const);

  const hasCopiedLibFiles = copiedEntries.some(
    (file) => file.startsWith('lib') && file.endsWith('.d.ts'),
  );

  const start = findStepIndex(
    steps,
    hasCopiedLibFiles ? 'format temp/copied' : 'fetchLibFiles',
  );

  const end = findStepIndex(steps, `${ctx.packageManagerName} install`) + 1;

  for (const { name, fn } of steps.slice(start, end)) {
    await wrapStartEnd(fn, name).then(exitIfErr);
  }
};
