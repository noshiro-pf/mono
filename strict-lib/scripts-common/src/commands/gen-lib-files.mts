import { createContext, type CreateContextOptions } from '../context.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { buildGenSteps, findStepIndex } from './gen-steps.mjs';

/**
 * Run only the lib-file generation slice: `genLibFiles` plus the subsequent
 * format steps on `output/lib-files` and `output-branded/lib-files`.
 */
export const runGenLibFiles = async (
  options: CreateContextOptions,
): Promise<void> => {
  const ctx = createContext(options);

  const steps = buildGenSteps(ctx);

  const start = findStepIndex(steps, 'genLibFiles');

  const end = findStepIndex(steps, 'format output-branded/lib-files') + 1;

  for (const { name, fn } of steps.slice(start, end)) {
    await wrapStartEnd(fn, name).then(exitIfErr);
  }
};
