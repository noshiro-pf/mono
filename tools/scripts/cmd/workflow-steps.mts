import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
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
 * as they were when they were read out of package.json. Its job holds nothing
 * that can write. A step that must not trust the tree — the path check in
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

  // Checked here with the others, so that a misspelt one fails the step
  // whatever `install` says; `runInstall` reads its value.
  const cache = readBoolean(env, 'cache');

  if (!cache.ok) {
    return cache;
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
 * A manual run asked to diff against its parent (`DIFF_PARENT`, the
 * `diff-parent` input) is, wherever it runs: that is how a queue judges a
 * layer, one commit on top of the layer below, on its own commit as a stacked
 * pull request is. The fetch is then the commit itself, two deep.
 *
 * The fetch is one commit deep, two for a run diffed against its parent. The
 * diff compares two trees and reads no history, and a pull request's head,
 * which the checkout fetched alone, is no ancestor of main, so an unbounded
 * fetch would download all of main's history.
 */
export const planDiffCheck = (
  env: Env,
): Parsed<
  | Readonly<{ fetch: string; depth?: number; scope: GateScope; base: string }>
  | 'run-everything'
> => {
  const chosen = readChoice(env, 'diff-scope', GATE_SCOPES);

  if (!chosen.ok) {
    return chosen;
  }

  const scope = chosen.value;

  if (env['DIFF_PARENT'] === 'true') {
    const sha = env['GITHUB_SHA'] ?? '';

    return FULL_SHA.test(sha)
      ? { ok: true, value: { fetch: sha, depth: 2, scope, base: 'HEAD^' } }
      : {
          ok: false,
          message: `GITHUB_SHA is "${sha}"; expected a full commit SHA.`,
        };
  }

  if (env['GITHUB_REF_NAME'] !== 'main') {
    const baseRef = env['BASE_REF'] ?? '';

    const branch = baseRef === '' ? 'main' : baseRef;

    return {
      ok: true,
      value: {
        fetch: `+refs/heads/${branch}:refs/remotes/origin/${branch}`,
        scope,
        base: `origin/${branch}`,
      },
    };
  }

  const before = env['BEFORE'] ?? '';

  return before === '' || /^0+$/u.test(before)
    ? { ok: true, value: 'run-everything' }
    : { ok: true, value: { fetch: before, scope, base: before } };
};

const FULL_SHA = /^[0-9a-f]{40}$/u;

/**
 * The three ignore lists, read from {@link GATE_LISTS_FILE}: an object with the
 * scopes as its keys and nothing else, each a list of patterns of the shapes
 * {@link matchesGatePattern} understands. Anything else is refused rather than
 * read some way of its own: a list the gate misreads skips checks.
 */
export const parseGateLists = (
  text: string,
): Parsed<ReadonlyRecord<GateScope, readonly string[]>> => {
  const parsed = (() => {
    try {
      const value: unknown = JSON.parse(text);

      return value;
    } catch {
      return undefined;
    }
  })();

  const shapeError = {
    ok: false,
    message: `${GATE_LISTS_FILE} holds the lists ${GATE_SCOPES.slice(0, -1).join(', ')} and ${GATE_SCOPES.at(-1) ?? ''} and nothing else, each an array of strings.`,
  } as const;

  if (!isRecord(parsed) || Object.keys(parsed).length !== GATE_SCOPES.length) {
    return shapeError;
  }

  const mut_lists = new Map<GateScope, readonly string[]>();

  for (const scope of GATE_SCOPES) {
    const list = parsed[scope];

    if (!Array.isArray(list)) {
      return shapeError;
    }

    const strings = list.filter(
      (pattern: unknown) => typeof pattern === 'string',
    );

    if (strings.length !== list.length) {
      return shapeError;
    }

    const patterns = validatePatterns(strings);

    if (!patterns.ok) {
      return {
        ok: false,
        message: `${GATE_LISTS_FILE}, list ${scope}: ${patterns.message}`,
      };
    }

    mut_lists.set(scope, patterns.value);
  }

  // Every scope was set above, or the function returned.
  const listOf = (scope: GateScope): readonly string[] =>
    mut_lists.get(scope) ?? [];

  return {
    ok: true,
    value: {
      code: listOf('code'),
      style: listOf('style'),
      'strict-lib': listOf('strict-lib'),
    },
  };
};

/**
 * One list of {@link GATE_LISTS_FILE}, in the repository at `root` (the working
 * directory, where the workflows and `pnpm run` run this).
 */
export const readGateList = (
  scope: GateScope,
  root = '.',
): Parsed<readonly string[]> => {
  const file = path.resolve(root, GATE_LISTS_FILE);

  const text = (() => {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the lists file of the repository given.
      return fs.readFileSync(file, 'utf8');
    } catch (error: unknown) {
      return {
        error:
          isRecord(error) && typeof error['code'] === 'string'
            ? error['code']
            : 'unreadable',
      };
    }
  })();

  if (typeof text !== 'string') {
    return {
      ok: false,
      message: `Could not read ${file}: ${text.error}`,
    };
  }

  const lists = parseGateLists(text);

  return lists.ok ? { ok: true, value: lists.value[scope] } : lists;
};

/**
 * Whether a repository-relative path matches an ignore pattern, in the shapes
 * the lists use, each answering as micromatch does with `{ dot: true }`, which
 * is how `check-should-run` of ts-repo-utils matched them when the gate ran it:
 * `dir/` (everything under it; a segment that is `*` stands for any one
 * directory, as in `apps/* /src/`), `**.ext` (that extension at any depth),
 * `** /name` (that file name in any directory, the root included), `*.ext`
 * (that extension at the root), `dir/** /*.ext` (that extension at any depth
 * under the directory) and a plain path.
 *
 * Any other shape throws, so that a pattern added to a list and not understood
 * here is a loud failure rather than a quiet misfiling. One pattern only, never
 * a list's `!` exception, which throws here: a list is read by
 * {@link ignoredBy}.
 */
export const matchesGatePattern = (file: string, pattern: string): boolean =>
  matchesShape(file, shapeOrThrow(pattern));

/**
 * Whether a list ignores a path, the list read once: one of its patterns
 * matches the path, and none of its exceptions does. An exception is a pattern
 * after a `!`, and it takes what it matches out of every other pattern of the
 * list wherever it stands in it, unlike a `.gitignore`, where a later line
 * overrides an earlier one: a list is a set, and its order is no meaning to
 * keep. Throws, as {@link matchesGatePattern} does, on a pattern of a shape it
 * does not understand, whatever the paths.
 */
export const ignoredBy = (
  patterns: readonly string[],
): ((file: string) => boolean) => {
  const ignore = patterns
    .filter((pattern) => !pattern.startsWith(EXCEPT))
    .map(shapeOrThrow);

  const except = patterns
    .filter((pattern) => pattern.startsWith(EXCEPT))
    .map((pattern) => shapeOrThrow(withoutExcept(pattern)));

  return (file) =>
    ignore.some((shape) => matchesShape(file, shape)) &&
    except.every((shape) => !matchesShape(file, shape));
};

/**
 * The first changed file the patterns do not ignore ({@link ignoredBy}), which
 * is what makes the checks run; `undefined` when every one is ignored, or none
 * changed. Throws on a pattern of a shape it does not understand, whatever the
 * files.
 */
export const firstFileToCheck = (
  files: readonly string[],
  patterns: readonly string[],
): string | undefined => {
  const isIgnored = ignoredBy(patterns);

  return files.find((file) => !isIgnored(file));
};

/**
 * The command line of `should-run`: `--scope <scope>`, the list of that name,
 * or `--paths-ignore <pattern>`, repeated, and `--base-branch <revision>`,
 * `origin/main` when it is not given.
 */
export const parseShouldRunArgs = (
  args: readonly string[],
): Parsed<ShouldRunArgs> => {
  try {
    const { values } = util.parseArgs({
      args: Array.from(args),
      options: {
        scope: { type: 'string' },
        'paths-ignore': { type: 'string', multiple: true, default: [] },
        'base-branch': { type: 'string', default: 'origin/main' },
      },
    });

    const { scope } = values;

    if (scope !== undefined && values['paths-ignore'].length > 0) {
      return { ok: false, message: USAGE_SHOULD_RUN(args) };
    }

    const chosen =
      scope === undefined
        ? undefined
        : readChoice({ SCOPE: scope }, 'scope', GATE_SCOPES);

    if (chosen !== undefined && !chosen.ok) {
      return chosen;
    }

    const patterns =
      chosen === undefined
        ? validatePatterns(values['paths-ignore'])
        : readGateList(chosen.value);

    return patterns.ok
      ? {
          ok: true,
          value: {
            patterns: patterns.value,
            base: values['base-branch'],
            label:
              chosen === undefined
                ? 'the --paths-ignore list'
                : `the ${chosen.value} list`,
          },
        }
      : patterns;
  } catch {
    // `util.parseArgs` throws on an unknown option, a missing value or a
    // positional argument.
    return { ok: false, message: USAGE_SHOULD_RUN(args) };
  }
};

/** Where the ignore lists are, relative to the repository root. */
export const GATE_LISTS_FILE = 'tools/configs/gate-ignore-lists.json';

export const GATE_SCOPES = ['code', 'style', 'strict-lib'] as const;

export type GateScope = (typeof GATE_SCOPES)[number];

export type ShouldRunArgs = Readonly<{
  patterns: readonly string[];
  base: string;
  /** What the patterns are, for the answer. */
  label: string;
}>;

type PatternShape = Readonly<
  | { kind: 'directory'; segments: readonly string[] }
  | { kind: 'extension'; suffix: string }
  | { kind: 'name'; name: string }
  | { kind: 'root-extension'; suffix: string }
  | { kind: 'directory-extension'; prefix: string; suffix: string }
  | { kind: 'path'; path: string }
>;

const USAGE_SHOULD_RUN = (args: readonly string[]): string =>
  `Usage: should-run [--base-branch <revision>] (--scope <${GATE_SCOPES.join(' | ')}> | [--paths-ignore <pattern>]...), got: ${args.join(' ')}` as const;

const DIRECTORY_EXTENSION = /^(?<prefix>[^*]+\/)\*\*\/\*(?<suffix>\.[^/]+)$/u;

const GLOB_SYNTAX = /[!()*+,?@[\]{}]/u;

/** Far more than any diff's names; the default 1 MiB is not. */
const MAX_DIFF_BYTES = 256 * 1024 * 1024;

const unsupportedPattern = (pattern: string): string =>
  `Unsupported ignore pattern "${pattern}": only \`dir/\` (whose segments may be \`*\`), \`**.ext\`, \`**/name\`, \`*.ext\`, \`dir/**/*.ext\` and a plain path are understood, each optionally after a \`!\` that excepts what it matches.` as const;

/** What marks an exception in a list. */
const EXCEPT = '!';

/** A segment of a `dir/` pattern that stands for any one directory. */
const ANY_SEGMENT = '*';

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
        ? ({
            kind: 'directory',
            segments: pattern.slice(0, -1).split('/'),
          } as const)
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

  const literals =
    shape.kind === 'directory'
      ? shape.segments.filter((segment) => segment !== ANY_SEGMENT)
      : Object.entries(shape)
          .filter(([key]) => key !== 'kind')
          .map(([, literal]) => literal);

  // A directory needs a literal segment: `*/` alone would take in every file
  // below the root, an exception that leaves its list ignoring nothing.
  return literals.length > 0 &&
    literals.every(
      (literal) =>
        literal !== '' &&
        !GLOB_SYNTAX.test(literal) &&
        (mayHoldSlash || !literal.includes('/')),
    )
    ? shape
    : undefined;
};

/** A pattern with the `!` of an exception taken off. */
const withoutExcept = (pattern: string): string =>
  pattern.startsWith(EXCEPT) ? pattern.slice(EXCEPT.length) : pattern;

/**
 * `patterns`, when every one of them, or of their exceptions after the `!`, has
 * a shape the matcher understands.
 */
const validatePatterns = (
  patterns: readonly string[],
): Parsed<readonly string[]> => {
  const unsupported = patterns.find(
    (pattern) => patternShape(withoutExcept(pattern)) === undefined,
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
    case 'directory': {
      const parts = file.split('/');

      // A file under it, so one segment more at least.
      return (
        parts.length > shape.segments.length &&
        shape.segments.every(
          (segment, index) =>
            segment === ANY_SEGMENT || parts[index] === segment,
        )
      );
    }

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

  // The record path matters only to the cache of it, which `cache: false`
  // leaves out.
  const cache = orExit(readBoolean(env, 'cache'));

  const record = env['LOCKFILE_RECORD'] ?? '';

  if (cache && record === '') {
    exitWithError('LOCKFILE_RECORD is not set.');
  }

  console.log(`pnpm ${args.join(' ')}`);

  runOrExit('pnpm', args);

  // The record is what lets the jobs after the first skip pnpm's lockfile
  // verification. Missing, the cache step saves nothing, and only this says so.
  if (
    cache &&
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    !fs.existsSync(record)
  ) {
    console.log(
      `::warning::pnpm left no lockfile verification record at ${record}, so the setup action's cache of it saves nothing and every job verifies the lockfile again. Point the "Locate pnpm's lockfile verification record" step of .github/actions/setup/action.yml at the file this pnpm writes.`,
    );
  }
};

const isRecord = (value: unknown): value is ReadonlyRecord<string, unknown> =>
  typeof value === 'object' && value !== null;

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
      ? `should_run=true: ${label} does not ignore ${fileToCheck} (${files.length} changed files).`
      : anyFile === undefined
        ? `should_run=false: no file changed against ${base}.`
        : `should_run=false: ${label} ignores every one of the ${files.length} changed files.`,
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

  runOrExit('git', [
    'fetch',
    `--depth=${plan.depth ?? 1}`,
    'origin',
    plan.fetch,
  ]);

  answerShouldRun({
    label: `the ${plan.scope} list`,
    base: plan.base,
    patterns: orExit(readGateList(plan.scope)),
    output,
  });
};

/**
 * `z:check-should-run`: the answer `check-diff` gives, for the patterns and the
 * base on the command line, so that `--scope <list>` by hand gives the gate's
 * answer.
 */
const runShouldRun = (args: readonly string[], env: Env): void => {
  const { patterns, base, label } = orExit(parseShouldRunArgs(args));

  answerShouldRun({
    label,
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
