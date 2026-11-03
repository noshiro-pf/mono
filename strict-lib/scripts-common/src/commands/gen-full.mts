import { createContext, type CreateContextOptions } from '../context.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { buildGenSteps, selectSteps } from './gen-steps.mjs';

/** Run the full generation pipeline from scratch, starting with fetchLibFiles. */
export const runGenFull = async (
  options: CreateContextOptions,
): Promise<void> => {
  const ctx = createContext(options);

  const steps = buildGenSteps(ctx);

  for (const { name, fn } of selectSteps(steps, {
    from: 'fetchLibFiles',
    through: `${ctx.packageManagerName} install`,
  })) {
    await wrapStartEnd(fn, name).then(exitIfErr);
  }
};
