import { type Result } from 'ts-data-forge';
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
 */
export const devOnlyCode: StripDevOnlyCodeOptions = {
  removeCallStatements: ['expectType'],
  unwrapIdentityCalls: [
    'castMutable',
    'castDeepMutable',
    'castReadonly',
    'castDeepReadonly',
  ],
};

/** Runs `stripDevOnlyCodeInDir` over `distDir` with {@link devOnlyCode}. */
export const stripDistDevOnlyCode = (
  distDir: string,
): Promise<Result<Readonly<{ changedFiles: number }>, string>> =>
  stripDevOnlyCodeInDir(distDir, devOnlyCode);
