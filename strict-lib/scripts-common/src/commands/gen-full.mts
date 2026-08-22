import { createContext, type CreateContextOptions } from '../context.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { buildGenSteps, findStepIndex } from './gen-steps.mjs';

/** Run the full generation pipeline from scratch, starting with fetchLibFiles. */
export const runGenFull = async (
  options: CreateContextOptions,
): Promise<void> => {
  const ctx = createContext(options);

  const steps = buildGenSteps(ctx);

  const start = findStepIndex(steps, 'fetchLibFiles');

  const end = findStepIndex(steps, `${ctx.packageManagerName} install`) + 1;

  for (const { name, fn } of steps.slice(start, end)) {
    await wrapStartEnd(fn, name).then(exitIfErr);
  }
};
