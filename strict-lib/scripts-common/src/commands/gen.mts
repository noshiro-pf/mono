import { createContext, type CreateContextOptions } from '../context.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { buildGenSteps, selectSteps } from './gen-steps.mjs';

/**
 * Run the lightweight generation pipeline: it skips `genCodemodFixed` (and the
 * upstream `fetchLibFiles` / `format temp/copied` steps) and runs everything
 * from `genLibFiles` onward through the final install.
 *
 * This reuses the already-generated `source/temp/codemod-fixed/` files, so it is
 * meant for fast incremental rebuilds after `genCodemodFixed` has run at least
 * once. For a cold checkout (e.g. CI, where `temp/` is gitignored) use
 * `gen:with-codemod-fixed` or `gen:full` instead, which regenerate that input.
 */
export const runGen = async (options: CreateContextOptions): Promise<void> => {
  const ctx = createContext(options);

  const steps = buildGenSteps(ctx);

  for (const { name, fn } of selectSteps(steps, {
    from: 'genLibFiles',
    through: `${ctx.packageManagerName} install`,
  })) {
    await wrapStartEnd(fn, name).then(exitIfErr);
  }
};
