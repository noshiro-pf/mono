import { Result } from 'ts-data-forge';
import {
  stripDevOnlyCodeInDir,
  type StripDevOnlyCodeOptions,
} from 'ts-repo-utils';

/**
 * What `stripDevOnlyCode` removes from the `dist/` of the libraries here.
 *
 * `ts-repo-utils` supplies the mechanism and no names: which functions are
 * safe to remove is knowledge about the code being built, and this is where
 * that knowledge lives for this repository. A package's `scripts/cmd/build.mts`
 * calls {@link stripDistDevOnlyCode} after the native `tsc` has emitted.
 *
 * - `removeCallStatements` — statements that exist for the type checker only.
 *   The whole statement goes, arguments included, so only list functions
 *   whose arguments are literals.
 * - `unwrapIdentityCalls` — functions that return their argument unchanged,
 *   `(x) => x`. Never list a function that validates: `asUint32` and the
 *   other branded-number `castType`s throw on a value outside the range, and
 *   unwrapping one changes behavior.
 * - `removeComments` — on. The compiler writes each declaration's JSDoc into
 *   the JavaScript as well as into the `.d.mts`; an editor reads the
 *   `.d.mts`, so the copy in the JavaScript is read by nobody. It was two
 *   thirds of `ts-data-forge`'s emitted JavaScript. The compiler's own
 *   `removeComments` cannot do this: it strips the `.d.mts` as well.
 */
export const devOnlyCode: StripDevOnlyCodeOptions = {
  removeCallStatements: ['expectType'],
  unwrapIdentityCalls: [
    'castMutable',
    'castDeepMutable',
    'castReadonly',
    'castDeepReadonly',
  ],
  removeComments: true,
};

/**
 * Runs `stripDevOnlyCodeInDir` over `distDir` with {@link devOnlyCode},
 * throwing when a file cannot be stripped.
 *
 * It throws rather than returning the `Result` it gets because the build
 * scripts report a failed step in two different ways — some take a promise of
 * a `Result`, some a function that may throw — and a helper that throws is
 * one line at either kind of call site.
 */
export const stripDistDevOnlyCode = async (distDir: string): Promise<void> => {
  const result = await stripDevOnlyCodeInDir(distDir, devOnlyCode);

  if (Result.isErr(result)) {
    throw new Error(result.value);
  }
};
