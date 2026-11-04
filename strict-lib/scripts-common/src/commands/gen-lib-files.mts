import { createContext, type CreateContextOptions } from '../context.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { buildGenSteps, selectSteps } from './gen-steps.mjs';

/**
 * Run only the lib-file generation slice: `genLibFiles` plus the subsequent
 * format steps on `output/lib-files` and `output/lib-files-branded`.
 */
export const runGenLibFiles = async (
  options: CreateContextOptions,
): Promise<void> => {
  const ctx = createContext(options);

  const steps = buildGenSteps(ctx);

  for (const { name, fn } of selectSteps(steps, {
    from: 'genLibFiles',
    through: 'format output/lib-files-branded',
  })) {
    await wrapStartEnd(fn, name).then(exitIfErr);
  }
};
