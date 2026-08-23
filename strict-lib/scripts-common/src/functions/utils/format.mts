import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';

// `strict-lib/`, relative to this file
// (strict-lib/scripts-common/src/functions/utils/format.mts). oxfmt formats
// this subtree and nothing else — Prettier ignores it, and everything outside
// it is Prettier's.
const strictLibRoot = path.resolve(import.meta.dirname, '../../../..');

// The pnpm workspace root, one level up, where the shared `node_modules` is.
const workspaceRoot = path.resolve(strictLibRoot, '..');

const oxfmtBin = path.join(workspaceRoot, 'node_modules', '.bin', 'oxfmt');

const oxfmtIgnorePath = path.join(strictLibRoot, '.oxfmtignore');

const oxfmtConfigPath = path.join(strictLibRoot, '.oxfmtrc.json');

/** Max attempts for a single oxfmt invocation (see {@link formatDir}). */
const maxAttempts = 5;

/** Max format passes to reach a stable (idempotent) result. */
const maxPasses = 5;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Run a single oxfmt invocation, retrying to absorb the transient "Exit prior
 * to config file resolving" abort that oxfmt hits when many instances resolve
 * the shared config at once under `ws:gen`.
 */
const runOxfmt = async (
  args: string,
): Promise<Result<Readonly<{ stdout: string }>, unknown>> => {
  let lastErr: Result<Readonly<{ stdout: string }>, unknown> = Result.err(
    undefined,
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    // Silence the noisy per-attempt output on retries only.
    const res = await $(args, { silent: attempt > 1 });

    if (Result.isOk(res)) {
      return Result.ok({ stdout: res.value.stdout });
    }

    lastErr = res;

    if (attempt < maxAttempts) {
      await sleep(200 * attempt);
    }
  }

  return lastErr;
};

/**
 * Format a directory with oxfmt (Oxc's formatter), the repo's formatter. It is
 * roughly an order of magnitude faster than Prettier, which matters because the
 * gen pipeline reformats very large generated `.d.ts` files (e.g. a ~1.8 MB
 * `lib.dom.d.ts`) on every run. Configured via `.oxfmtrc.json`.
 *
 * `--ignore-path` points oxfmt at `.oxfmtignore` rather than the default
 * `.gitignore` lookup, so it formats generated directories under git-ignored
 * `temp/` too (the exact path is always passed explicitly by the caller).
 *
 * `--config` pins the repo-root `.oxfmtrc.json` explicitly: under the
 * concurrent `ws:gen` load oxfmt's implicit upward config search is unreliable
 * (it aborts with "Exit prior to config file resolving" or silently falls back
 * to defaults), which the retry in {@link runOxfmt} also guards.
 *
 * Oxfmt 0.58.0 is not idempotent for some generated constructs — a single pass
 * can leave output that another pass would still change (e.g. a wrapped vs
 * inline signature). Running it once therefore produces a different result than
 * the repo-wide `fmt` (which reformats the already-committed baseline), so
 * `ws:gen` would leave the tree dirty. We reformat until `--list-different`
 * reports nothing, reaching the same stable fixed point as `fmt`.
 */
export const formatDir = async (
  dir: string,
): Promise<Result<undefined, unknown>> => {
  const common =
    `--config="${oxfmtConfigPath}" --ignore-path="${oxfmtIgnorePath}" --no-error-on-unmatched-pattern "${dir}"` as const;

  const writeCmd = `"${oxfmtBin}" --write ${common}` as const;

  // `--list-different` exits non-zero and prints the paths when another pass
  // would still change something; `|| true` keeps that on stdout instead of
  // turning it into a Result.err.
  const listDifferentCmd =
    `"${oxfmtBin}" --list-different ${common} || true` as const;

  for (let pass = 1; pass <= maxPasses; pass += 1) {
    const writeRes = await runOxfmt(writeCmd);

    if (Result.isErr(writeRes)) {
      return writeRes;
    }

    const checkRes = await runOxfmt(listDifferentCmd);

    if (Result.isErr(checkRes)) {
      return checkRes;
    }

    if (checkRes.value.stdout.trim() === '') {
      return Result.ok(undefined);
    }
  }

  return Result.ok(undefined);
};
