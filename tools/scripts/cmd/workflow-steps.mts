import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
// A top-level `import type`, not the inline `import { type … }` the lint
// prefers: Node erases the former and keeps the latter as a bare
// `import {} from 'ts-type-forge'`, which fails to resolve before
// `pnpm install`. The test's runtime-import check guards this.
// eslint-disable-next-line import-x/consistent-type-specifier-style -- see above.
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Workflow steps that are a program rather than a command line, kept here so
 * that they can be tested, and so that their inputs are read one way.
 *
 * ```sh
 * node ./tools/scripts/cmd/workflow-steps.mts install     # .github/actions/setup
 * node ./tools/scripts/cmd/workflow-steps.mts check-diff  # check-gates.yml
 * ```
 *
 * **Inputs arrive as environment variables named after the input**,
 * upper-cased with `-` as `_` (`engine-strict` is `ENGINE_STRICT`), and each
 * is checked against the values it may take. A composite action's inputs and
 * a `workflow_call` input of `type: string` reach a step as plain strings, so
 * a misspelt `true` would otherwise read as `false` and drop the difference
 * the caller asked for without a word.
 *
 * **Only a step whose job is to run the tree anyway belongs here.** A file in
 * the tree is read when the step runs, after the steps before it — `pnpm`
 * itself, which `setup-node` runs for its cache — could have rewritten it;
 * a `run:` block is fixed earlier. That changes nothing for a step that goes
 * on to run `pnpm install` or `pnpm run`, since whatever could rewrite this
 * file runs there with the same reach. A step that must not trust the tree —
 * the path check in pnpm-update.yml's `commit` job — stays inline. See
 * "Setup" in .github/workflows/README.md.
 *
 * **Run with `node`, not `tsx` or `pnpm run`.** `install` runs before
 * anything is installed, and on every Node the setup action is given: the
 * `minimum` of tools/configs/node-support.json included. So this imports
 * only `node:*` modules at runtime, uses only erasable syntax, and uses no
 * `Temporal`, which that Node does not have. The test holds all three.
 */
export const main = (argv: readonly string[]): void => {
  const command = argv[2];

  switch (command) {
    case 'install': {
      runInstall(process.env);

      break;
    }

    case 'check-diff': {
      runDiffCheck(process.env);

      break;
    }

    case undefined:
    default: {
      console.error('Usage: node workflow-steps.mts <install | check-diff>');

      process.exit(2);
    }
  }
};

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export type Parsed<T> = Readonly<
  { ok: true; value: T } | { ok: false; message: string }
>;

export type Env = ReadonlyRecord<string, string | undefined>;

/** The value of `input` when it is one of `choices`. */
export const readChoice = <const T extends string>(
  env: Env,
  input: string,
  choices: readonly T[],
): Parsed<T> => {
  const value = env[input.toUpperCase().replaceAll('-', '_')] ?? '';

  const choice = choices.find((c) => c === value);

  return choice === undefined
    ? {
        ok: false,
        message: `Input ${input} is "${value}"; expected one of ${choices.join(', ')}.`,
      }
    : { ok: true, value: choice };
};

export const readBoolean = (env: Env, input: string): Parsed<boolean> => {
  const parsed = readChoice(env, input, ['true', 'false']);

  return parsed.ok ? { ok: true, value: parsed.value === 'true' } : parsed;
};

// ---------------------------------------------------------------------------
// `install`
// ---------------------------------------------------------------------------

/**
 * The `pnpm` arguments the setup action's inputs ask for, or `undefined` for
 * `install: false`. Every input is checked, `install: false` or not, so a
 * misspelt one fails the step whatever the others say.
 */
export const installArgs = (
  env: Env,
): Parsed<readonly string[] | undefined> => {
  const install = readBoolean(env, 'install');

  if (!install.ok) return install;

  const engineStrict = readBoolean(env, 'engine-strict');

  if (!engineStrict.ok) return engineStrict;

  const ignoreScripts = readBoolean(env, 'ignore-scripts');

  if (!ignoreScripts.ok) return ignoreScripts;

  if (!install.value) return { ok: true, value: undefined };

  return {
    ok: true,
    value: [
      'install',
      '--frozen-lockfile',
      ...(engineStrict.value ? ['--engine-strict'] : []),
      ...(ignoreScripts.value ? ['--ignore-scripts'] : []),
    ],
  };
};

const runInstall = (env: Env): void => {
  const args = orExit(installArgs(env));

  if (args === undefined) {
    console.log('install: false; nothing is installed.');

    return;
  }

  console.log(`pnpm ${args.join(' ')}`);

  runOrExit('pnpm', args);
};

// ---------------------------------------------------------------------------
// `check-diff`
// ---------------------------------------------------------------------------

/**
 * `run`: the `pnpm` arguments that answer `should_run` (the script writes it
 * to `GITHUB_OUTPUT` itself), after fetching `fetch` when it is set.
 * `run-everything`: there is nothing to diff against.
 *
 * The diff is against `origin/main`, except on a push to main, where that is
 * a diff against HEAD itself: it comes back empty and reads as "nothing
 * relevant changed", so every caller would skip and report `skipped`, which
 * satisfies a required check. There it is against what main pointed at
 * before the push, and with no such commit — a manual run, or the first push
 * to the branch — everything runs rather than nothing.
 */
export const planDiffCheck = (
  env: Env,
): Parsed<
  Readonly<{ fetch?: string; run: readonly string[] }> | 'run-everything'
> => {
  const scope = readChoice(env, 'diff-scope', ['code', 'style', 'strict-lib']);

  if (!scope.ok) return scope;

  const script = `z:check-should-run:${scope.value}-checks` as const;

  if (env['GITHUB_REF_NAME'] !== 'main') {
    return { ok: true, value: { run: ['run', script] } };
  }

  const before = env['BEFORE'] ?? '';

  if (before === '' || /^0+$/u.test(before)) {
    return { ok: true, value: 'run-everything' };
  }

  return {
    ok: true,
    value: {
      fetch: before,
      run: ['run', script, '--base-branch', before],
    },
  };
};

const runDiffCheck = (env: Env): void => {
  const plan = orExit(planDiffCheck(env));

  if (plan === 'run-everything') {
    console.log('Nothing to diff against, so everything runs.');

    const output =
      env['GITHUB_OUTPUT'] ?? exitWithError('GITHUB_OUTPUT is not set.');

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the runner's output file.
    fs.appendFileSync(output, 'should_run=true\n');

    return;
  }

  if (plan.fetch !== undefined) {
    runOrExit('git', ['fetch', '--depth=1', 'origin', plan.fetch]);
  }

  runOrExit('pnpm', plan.run);
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

const orExit = <T,>(parsed: Parsed<T>): T =>
  parsed.ok ? parsed.value : exitWithError(parsed.message);

/** An error annotation on the step, then a failed step. */
const exitWithError = (message: string): never => {
  console.log(`::error::${message}`);

  process.exit(1);
};

const runOrExit = (command: string, args: readonly string[]): void => {
  const { status, error } = spawnSync(command, args, { stdio: 'inherit' });

  if (error !== undefined) {
    exitWithError(`${command} could not be run: ${error.message}`);
  }

  if (status !== 0) {
    process.exit(status ?? 1);
  }
};

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: that package is not
 * installed when this runs (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  main(process.argv);
}
