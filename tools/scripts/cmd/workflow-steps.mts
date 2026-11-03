import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as util from 'node:util';
// A top-level `import type`, not the inline `import { type … }`: Node erases
// the former and keeps the latter as a bare `import {} from 'ts-type-forge'`,
// which fails to resolve before `pnpm install`. The test's runtime-import check
// guards this.
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Workflow steps that are a program rather than a command line, kept here so
 * that they can be tested, and so that their inputs are read one way.
 *
 * ```sh
 * node ./tools/scripts/cmd/workflow-steps.mts install     # .github/actions/setup
 * node ./tools/scripts/cmd/workflow-steps.mts check-diff  # check-gates.yml
 * node ./tools/scripts/cmd/workflow-steps.mts should-run  # z:check-should-run
 * ```
 *
 * **Inputs arrive as environment variables named after the input**,
 * upper-cased with `-` as `_` (`engine-strict` is `ENGINE_STRICT`), and each
 * is checked against the values it may take. A composite action's inputs and a
 * `workflow_call` input of `type: string` reach a step as plain strings, so a
 * misspelt `true` would otherwise read as `false` and drop the difference the
 * caller asked for without a word. `install` also reads `LOCKFILE_RECORD`,
 * which is not an input: the path of pnpm's lockfile verification record, which
 * the setup action caches and this warns about when pnpm wrote nothing there.
 *
 * **Only a step whose job is to run the tree anyway belongs here.** A file in
 * the tree is read when the step runs, after the steps before it — `pnpm`
 * itself, which `setup-node` runs for its cache — could have rewritten it;
 * a `run:` block is fixed earlier. That changes nothing for a step that goes on
 * to run `pnpm install` or `pnpm run`, since whatever could rewrite this file
 * runs there with the same reach. `check-diff` installs and runs no dependency:
 * what runs before it in its job is the tree's own setup action,
 * Node.js alone, and the lists it reads are the pull request's own either way,
 * as they were when the step ran a list's script. Its job holds nothing that
 * can write. A step that must not trust the tree — the path check in
 * pnpm-update.yml's `commit` job — stays inline. See "Setup" in
 * .github/workflows/README.md.
 *
 * **Run with `node`, not `tsx` or `pnpm run`.** `install` runs before anything
 * is installed, and on every Node the setup action is given: the `minimum` of
 * tools/configs/node-support.json included. So this imports only `node:*`
 * modules at runtime, uses only erasable syntax, and uses no `Temporal`, which
 * that Node does not have. The test holds all three.
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

    case 'should-run': {
      // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing -- ts-data-forge is not installed when this runs (see the header).
      runShouldRun(argv.slice(3), process.env);

      break;
    }

    case undefined:
    default: {
      console.error(
        'Usage: node workflow-steps.mts <install | check-diff | should-run>',
      );

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
  const pnpm = readBoolean(env, 'pnpm');

  if (!pnpm.ok) {
    return pnpm;
  }

  const install = readBoolean(env, 'install');

  if (!install.ok) {
    return install;
  }

  const engineStrict = readBoolean(env, 'engine-strict');

  if (!engineStrict.ok) {
    return engineStrict;
  }

  const ignoreScripts = readBoolean(env, 'ignore-scripts');

  if (!ignoreScripts.ok) {
    return ignoreScripts;
  }

  if (!install.value) {
    return { ok: true, value: undefined };
  }

  if (!pnpm.value) {
    return {
      ok: false,
      message: 'Input install is true with pnpm false; set install: false too.',
    };
  }

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

// ---------------------------------------------------------------------------
// `check-diff`
// ---------------------------------------------------------------------------

/**
 * What to fetch, which ignore list to read, and what to diff against;
 * `run-everything` when there is nothing to diff against.
 *
 * A pull request's diff is against its base: `origin/main`, or for one stacked
 * on another pull request that one's branch, so that a layer is judged on its
 * own changes and not on those of the layers below it, which their own pull
 * requests judge. Once the layer below merges, GitHub moves this one onto main
 * and the diff is against main again — the same changes.
 *
 * On a push to main the base would be HEAD itself: the diff comes back empty
 * and reads as "nothing relevant changed", so every caller would skip and
 * report `skipped`, which satisfies a required check. There it is against what
 * main pointed at before the push, and with no such commit — a manual run, or
 * the first push to the branch — everything runs rather than nothing.
 *
 * The fetch is one commit deep. The diff compares two trees and reads no
 * history, and a pull request's head, which the checkout fetched alone, is no
 * ancestor of main, so an unbounded fetch would download all of main's history.
 */
export const planDiffCheck = (
  env: Env,
): Parsed<
  | Readonly<{ fetch: string; script: GateScript; base: string }>
  | 'run-everything'
> => {
  const scope = readChoice(env, 'diff-scope', ['code', 'style', 'strict-lib']);

  if (!scope.ok) {
    return scope;
  }

  const script: GateScript =
    `z:check-should-run:${scope.value}-checks` as const;

  if (env['GITHUB_REF_NAME'] !== 'main') {
    const baseRef = env['BASE_REF'] ?? '';

    const branch = baseRef === '' ? 'main' : baseRef;

    return {
      ok: true,
      value: {
        fetch: `+refs/heads/${branch}:refs/remotes/origin/${branch}`,
        script,
        base: `origin/${branch}`,
      },
    };
  }

  const before = env['BEFORE'] ?? '';

  return before === '' || /^0+$/u.test(before)
    ? { ok: true, value: 'run-everything' }
    : { ok: true, value: { fetch: before, script, base: before } };
};

/**
 * The patterns of a `z:check-should-run:*` script, read from its command line.
 *
 * The gate reads the list rather than running the script, because running it
 * takes `pnpm`, which the gate does without. So the command line has to be one
 * the reading cannot get wrong: `pnpm run z:check-should-run` and nothing after
 * it but `--paths-ignore '<pattern>'`, each pattern of a shape
 * {@link matchesGatePattern} understands. Anything else is refused rather than
 * read differently from the shell.
 */
export const gatePatterns = (command: string): Parsed<readonly string[]> => {
  const rest = command.startsWith(GATE_COMMAND)
    ? command.slice(GATE_COMMAND.length)
    : undefined;

  if (rest?.replaceAll(PATTERN_ARGUMENT, '') !== '') {
    return {
      ok: false,
      message: `Expected \`${GATE_COMMAND}\` followed only by \`--paths-ignore '<pattern>'\`, got: ${command}`,
    };
  }

  return validatePatterns(
    Array.from(rest.matchAll(PATTERN_ARGUMENT), (match) => match[1] ?? ''),
  );
};

/**
 * Whether a repository-relative path matches a `--paths-ignore` pattern, in the
 * shapes the lists use, each answering as micromatch does with `{ dot: true }`,
 * which is how `check-should-run` of ts-repo-utils matched them when the gate
 * ran it: `dir/` (everything under it), `**.ext` (that extension at any depth),
 * `** /name` (that file name in any directory, the root included), `*.ext`
 * (that extension at the root), `dir/** /*.ext` (that extension at any depth
 * under the directory) and a plain path.
 *
 * Any other shape throws, so that a pattern added to a list and not understood
 * here is a loud failure rather than a quiet misfiling.
 */
export const matchesGatePattern = (file: string, pattern: string): boolean =>
  matchesShape(file, shapeOrThrow(pattern));

/**
 * The first changed file on none of the patterns, which is what makes the
 * checks run; `undefined` when every one is on a pattern, or none changed.
 * Throws, as {@link matchesGatePattern} does, on a pattern of a shape it does
 * not understand, whatever the files.
 */
export const firstFileToCheck = (
  files: readonly string[],
  patterns: readonly string[],
): string | undefined => {
  const shapes = patterns.map(shapeOrThrow);

  return files.find((file) =>
    shapes.every((shape) => !matchesShape(file, shape)),
  );
};

/**
 * The command line of `should-run`: `--paths-ignore <pattern>`, repeated, and
 * `--base-branch <revision>`, `origin/main` when it is not given.
 */
export const parseShouldRunArgs = (
  args: readonly string[],
): Parsed<ShouldRunArgs> => {
  try {
    const { values } = util.parseArgs({
      args: Array.from(args),
      options: {
        'paths-ignore': { type: 'string', multiple: true, default: [] },
        'base-branch': { type: 'string', default: 'origin/main' },
      },
    });

    const patterns = validatePatterns(values['paths-ignore']);

    return patterns.ok
      ? {
          ok: true,
          value: { patterns: patterns.value, base: values['base-branch'] },
        }
      : patterns;
  } catch {
    // `util.parseArgs` throws on an unknown option, a missing value or a
    // positional argument.
    return {
      ok: false,
      message: `Usage: should-run [--base-branch <revision>] [--paths-ignore <pattern>]..., got: ${args.join(' ')}`,
    };
  }
};

export type GateScript = `z:check-should-run:${string}-checks`;

export type ShouldRunArgs = Readonly<{
  patterns: readonly string[];
  base: string;
}>;

type PatternShape = Readonly<
  | { kind: 'directory'; prefix: string }
  | { kind: 'extension'; suffix: string }
  | { kind: 'name'; name: string }
  | { kind: 'root-extension'; suffix: string }
  | { kind: 'directory-extension'; prefix: string; suffix: string }
  | { kind: 'path'; path: string }
>;

const GATE_COMMAND = 'pnpm run z:check-should-run';

const PATTERN_ARGUMENT = / --paths-ignore '([^']+)'/gu;

const DIRECTORY_EXTENSION = /^(?<prefix>[^*]+\/)\*\*\/\*(?<suffix>\.[^/]+)$/u;

const GLOB_SYNTAX = /[!()*+,?@[\]{}]/u;

/** Far more than any diff's names; the default 1 MiB is not. */
const MAX_DIFF_BYTES = 256 * 1024 * 1024;

const unsupportedPattern = (pattern: string): string =>
  `Unsupported --paths-ignore pattern "${pattern}": only \`dir/\`, \`**.ext\`, \`**/name\`, \`*.ext\`, \`dir/**/*.ext\` and a plain path are understood.` as const;

/** Its shape, when every part of it but the glob syntax is a literal. */
const patternShape = (pattern: string): PatternShape | undefined => {
  const groups = DIRECTORY_EXTENSION.exec(pattern)?.groups;

  const shape: PatternShape =
    groups !== undefined
      ? ({
          kind: 'directory-extension',
          prefix: groups['prefix'] ?? '',
          suffix: groups['suffix'] ?? '',
        } as const)
      : pattern.endsWith('/')
        ? ({ kind: 'directory', prefix: pattern } as const)
        : pattern.startsWith('**.')
          ? ({ kind: 'extension', suffix: pattern.slice('**'.length) } as const)
          : pattern.startsWith('**/')
            ? ({ kind: 'name', name: pattern.slice('**/'.length) } as const)
            : pattern.startsWith('*.')
              ? ({
                  kind: 'root-extension',
                  suffix: pattern.slice('*'.length),
                } as const)
              : ({ kind: 'path', path: pattern } as const);

  // Only a directory or a whole path may hold a `/` among its literals.
  const mayHoldSlash =
    shape.kind === 'directory' ||
    shape.kind === 'directory-extension' ||
    shape.kind === 'path';

  const literals = Object.entries(shape)
    .filter(([key]) => key !== 'kind')
    .map(([, literal]) => literal);

  return literals.every(
    (literal) =>
      literal !== '' &&
      !GLOB_SYNTAX.test(literal) &&
      (mayHoldSlash || !literal.includes('/')),
  )
    ? shape
    : undefined;
};

/** `patterns`, when every one of them has a shape the matcher understands. */
const validatePatterns = (
  patterns: readonly string[],
): Parsed<readonly string[]> => {
  const unsupported = patterns.find(
    (pattern) => patternShape(pattern) === undefined,
  );

  return unsupported === undefined
    ? { ok: true, value: patterns }
    : { ok: false, message: unsupportedPattern(unsupported) };
};

const shapeOrThrow = (pattern: string): PatternShape => {
  const shape = patternShape(pattern);

  if (shape === undefined) {
    throw new Error(unsupportedPattern(pattern));
  }

  return shape;
};

const matchesShape = (file: string, shape: PatternShape): boolean => {
  switch (shape.kind) {
    case 'directory':
      return file.startsWith(shape.prefix);

    case 'extension':
      return file.endsWith(shape.suffix);

    case 'name':
      return file === shape.name || file.endsWith(`/${shape.name}`);

    case 'root-extension':
      return !file.includes('/') && file.endsWith(shape.suffix);

    case 'directory-extension':
      return file.startsWith(shape.prefix) && file.endsWith(shape.suffix);

    case 'path':
      return file === shape.path;
  }
};

// ---------------------------------------------------------------------------
// Running the steps
// ---------------------------------------------------------------------------

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

const orExit = <T,>(parsed: Parsed<T>): T =>
  parsed.ok ? parsed.value : exitWithError(parsed.message);

const runInstall = (env: Env): void => {
  const args = orExit(installArgs(env));

  if (args === undefined) {
    console.log('install: false; nothing is installed.');

    return;
  }

  const record = env['LOCKFILE_RECORD'] ?? '';

  if (record === '') {
    exitWithError('LOCKFILE_RECORD is not set.');
  }

  console.log(`pnpm ${args.join(' ')}`);

  runOrExit('pnpm', args);

  // The record is what lets the jobs after the first skip pnpm's lockfile
  // verification. Missing, the cache step saves nothing, and only this says so.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(record)) {
    console.log(
      `::warning::pnpm left no lockfile verification record at ${record}, so the setup action's cache of it saves nothing and every job verifies the lockfile again. Point the "Locate pnpm's lockfile verification record" step of .github/actions/setup/action.yml at the file this pnpm writes.`,
    );
  }
};

const isRecord = (value: unknown): value is ReadonlyRecord<string, unknown> =>
  // eslint-disable-next-line ts-data-forge/prefer-is-non-null-object -- ts-data-forge is not installed when this runs (see the header).
  typeof value === 'object' && value !== null;

/** A script of the root `package.json`; the steps run at the root. */
const rootScript = (name: string): string | undefined => {
  const manifest: unknown = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const scripts = isRecord(manifest) ? manifest['scripts'] : undefined;

  const command = isRecord(scripts) ? scripts[name] : undefined;

  return typeof command === 'string' ? command : undefined;
};

/**
 * The files that differ between `base` and the working tree. A deleted file
 * counts, and a renamed one counts by both names (`--no-renames`), so that a
 * diff that only deletes code, or moves it onto a pattern, still runs the
 * checks; `check-should-run` of ts-repo-utils, which the gate ran before, left
 * both out. `-z` keeps a name with non-ASCII characters as it is rather than
 * quoted, which a pattern would not match.
 */
const changedFiles = (base: string): readonly string[] => {
  if (base.startsWith('-')) {
    exitWithError(`Invalid base "${base}": a base must name a revision.`);
  }

  const { status, stdout, error } = spawnSync(
    'git',
    ['diff', '--name-only', '-z', '--no-renames', base, '--'],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
      maxBuffer: MAX_DIFF_BYTES,
    },
  );

  if (error !== undefined) {
    exitWithError(`git could not be run: ${error.message}`);
  }

  if (status !== 0) {
    process.exit(status ?? 1);
  }

  return stdout.split('\0').filter((file) => file !== '');
};

/** Diffs against `base`, says why, and appends `should_run` to `output`. */
const answerShouldRun = ({
  label,
  base,
  patterns,
  output,
}: Readonly<{
  label: string;
  base: string;
  patterns: readonly string[];
  output: string | undefined;
}>): void => {
  const files = changedFiles(base);

  const fileToCheck = firstFileToCheck(files, patterns);

  const [anyFile] = files;

  console.log(
    fileToCheck !== undefined
      ? `should_run=true: ${fileToCheck} is on no pattern of ${label} (${files.length} changed files).`
      : anyFile === undefined
        ? `should_run=false: no file changed against ${base}.`
        : `should_run=false: every one of the ${files.length} changed files is on a pattern of ${label}.`,
  );

  if (output !== undefined) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the runner's output file.
    fs.appendFileSync(output, `should_run=${fileToCheck !== undefined}\n`);
  }
};

const runDiffCheck = (env: Env): void => {
  const plan = orExit(planDiffCheck(env));

  const output =
    env['GITHUB_OUTPUT'] ?? exitWithError('GITHUB_OUTPUT is not set.');

  if (plan === 'run-everything') {
    console.log('Nothing to diff against, so everything runs.');

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the runner's output file.
    fs.appendFileSync(output, 'should_run=true\n');

    return;
  }

  runOrExit('git', ['fetch', '--depth=1', 'origin', plan.fetch]);

  const command =
    rootScript(plan.script) ??
    exitWithError(`package.json has no ${plan.script} script.`);

  answerShouldRun({
    label: plan.script,
    base: plan.base,
    patterns: orExit(gatePatterns(command)),
    output,
  });
};

/**
 * `z:check-should-run`: the answer `check-diff` gives, for the patterns and the
 * base on the command line, so that running a list's script by hand gives the
 * gate's answer.
 */
const runShouldRun = (args: readonly string[], env: Env): void => {
  const { patterns, base } = orExit(parseShouldRunArgs(args));

  answerShouldRun({
    label: 'the --paths-ignore list',
    base,
    patterns,
    output: env['GITHUB_OUTPUT'],
  });
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
