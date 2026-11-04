import { createContext, type CreateContextOptions } from '../context.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { buildGenSteps, selectSteps } from './gen-steps.mjs';

/**
 * Runs only the package-generation slice: `genPackages` plus the `format`
 * steps, but **not** the final `pnpm install`.
 *
 * `ws:gen:packages` runs this across every version in parallel. If each run
 * also triggered its own workspace-root `pnpm install`, those installs would
 * race on the shared `node_modules/.pnpm` store and pnpm fails bin-linking with
 * `ENOENT ... mkdir .../node_modules/.bin`. The install is therefore left to
 * the caller, which runs a single one afterwards (e.g.
 * `changeset:version-packages` ends with `pnpm install`).
 */
export const runGenPackages = async (
  options: CreateContextOptions,
): Promise<void> => {
  const ctx = createContext(options);

  const steps = buildGenSteps(ctx);

  for (const { name, fn } of selectSteps(steps, {
    from: 'genPackages',
    before: `${ctx.packageManagerName} install`,
  })) {
    await wrapStartEnd(fn, name).then(exitIfErr);
  }
};
