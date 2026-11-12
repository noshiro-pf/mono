import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { listTrackedFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a `tsconfig*.json` under a package's `test/dist_/` turns
 * `skipLibCheck` on, itself or through a config it extends.
 *
 * `check:dist` type-checks what a build emitted, reached the way a consumer
 * reaches it. What a build emits for types is `.d.mts`, and `skipLibCheck` is
 * the option that skips the checking of declaration files — so with it on, the
 * check only proves that the test file can import the package, and passes on
 * declarations that do not type-check. Nothing fails, and a consumer compiling
 * with `skipLibCheck: false` gets the errors from inside `node_modules`.
 */
export const checkDistTestLibCheck = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const configs = findDistTestConfigs(tracked.value);

  // The guard knows these files by where they are. Finding none means they
  // moved, not that all is well.
  if (!Arr.isNonEmpty(configs)) {
    return Result.err(
      '❌ no `libs/*/test/dist_/**/tsconfig*.json` is tracked, so nothing was checked. If the directory was renamed, teach `check-dist-test-lib-check.mts` its new name.',
    );
  }

  const violations = findSkipLibCheckConfigs(projectRootPath, configs);

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} \`test/dist_\` tsconfig file(s) do not type-check the declarations they are there to check:`,
        '',
        ...violations.map(
          ({ relativePath, problem, detail }) =>
            `  ${relativePath}: ${problemText(problem, detail)}`,
        ),
        '',
        'The files under test are declaration files (`dist/**/*.d.mts`), and',
        '`skipLibCheck` is the option that skips checking those: with it on,',
        '`check:dist` passes on a `.d.mts` that does not type-check. Remove it',
        '(or state `"skipLibCheck": false` over a config that is extended), and',
        'fix what the check then reports in the package’s own declarations. If',
        'they name types of another package (`node:` modules), list that',
        'package in `types`.',
      ].join('\n'),
    );
  }

  return Result.ok(configs.length);
};

/**
 * The `tsconfig*.json` files under a published package's `test/dist_/`, among
 * `trackedFiles` (relative to the repository root, `/`-separated), in the order
 * given.
 */
export const findDistTestConfigs = (
  trackedFiles: readonly string[],
): readonly string[] => trackedFiles.filter(isDistTestConfig);

/**
 * The files among `relativePaths` (relative to `rootDir`) whose compiler
 * options, as tsc resolves them through `extends`, have `skipLibCheck` on, and
 * those whose options cannot be read at all — which would otherwise read as
 * "not set".
 */
export const findSkipLibCheckConfigs = (
  rootDir: string,
  relativePaths: readonly string[],
): readonly Violation[] =>
  Arr.generate(function* () {
    for (const relativePath of relativePaths) {
      const found = problemOf(path.join(rootDir, relativePath));

      if (found !== undefined) {
        yield { relativePath, ...found };
      }
    }
  });

type Problem = 'inherited' | 'set' | 'unreadable';

/** A problem, and for `unreadable` what tsc said. */
type Finding = Readonly<{ problem: Problem; detail?: string }>;

type Violation = Readonly<{ relativePath: string } & Finding>;

/**
 * The codes of errors that do not say the options could not be read: TS5023
 * "Unknown compiler option", TS5024 "requires a value of type" and TS6046
 * "Argument for option must be", which the native compiler `check:dist` runs
 * may accept where the JavaScript one this reads with does not, and TS18003 "No
 * inputs were found".
 */
const NOT_ABOUT_READING: ReadonlySet<number> = new Set<number>([
  5023, 5024, 6046, 18_003,
]);

/**
 * Whether `file` is under `libs/<package>/test/dist_/` and named as tsc would
 * be given a project: `tsconfig.json`, or `tsconfig.<anything>.json` for a
 * second program in the same directory.
 */
const isDistTestConfig = (file: string): boolean => {
  const segments = file.split('/');

  const name = segments.at(-1) ?? '';

  return (
    segments[0] === 'libs' &&
    segments[2] === 'test' &&
    segments[3] === 'dist_' &&
    name.startsWith('tsconfig') &&
    name.endsWith('.json')
  );
};

/** Whether the file's own `compilerOptions` state `skipLibCheck: true`. */
const setsItself = (config: unknown): boolean => {
  if (!isRecord(config) || !hasKey(config, 'compilerOptions')) {
    return false;
  }

  const compilerOptions: unknown = config.compilerOptions;

  return (
    isRecord(compilerOptions) &&
    hasKey(compilerOptions, 'skipLibCheck') &&
    compilerOptions.skipLibCheck === true
  );
};

/**
 * Whether an error of `ts.parseJsonConfigFileContent`, by its code and its
 * flattened message, at any depth of `extends`, says the options could not be
 * read as written.
 *
 * Those in {@link NOT_ABOUT_READING} do not — except a TS5024 about `extends`,
 * which tsc answers an `extends` of the wrong type with before dropping it, and
 * with it what the options inherit. A `files`, `include` or `exclude` of the
 * wrong type is dropped too, but says nothing about the options this reads.
 */
// `check-tsconfig-lib-replacement.mts` filters the same codes its own way and
// is not shared with: it reads which files a program has, so a mistyped
// `files`, `include` or `exclude` is about reading there and is not here.
const isAboutReading = (code: number, message: string): boolean =>
  !NOT_ABOUT_READING.has(code) ||
  // By the message: a TS5024 names its option there alone. One about a config
  // further down the chain carries a position in that file, but the root
  // config's carries none, because `problemOf` parses the object
  // `readConfigFile` returns. Reading the root as a source file instead would
  // give it a position, which would still have to be mapped back to the
  // `extends` node at every level. This reads with the repository's own
  // `typescript` and sets no locale, and should a release reword the message,
  // the tests of a mistyped `extends` fail.
  (code === 5024 && message.includes("'extends'"));

const problemOf = (tsconfig: string): Finding | undefined => {
  // These files are JSONC, and `extends` is resolved as tsc resolves it:
  // both are tsc's own reading, so a commented-out entry is not taken for one
  // and an option set three configs away is.
  const read = ts.readConfigFile(tsconfig, (file) => ts.sys.readFile(file));

  if (read.error !== undefined) {
    return {
      problem: 'unreadable',
      detail: ts.flattenDiagnosticMessageText(read.error.messageText, '\n'),
    };
  }

  const config: unknown = read.config;

  const parsed = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(tsconfig),
    undefined,
    tsconfig,
  );

  // An `extends` that does not resolve leaves the options without what they
  // inherit, and the option would read as off when the config is broken.
  const errors = parsed.errors.filter(({ code, messageText }) =>
    isAboutReading(code, ts.flattenDiagnosticMessageText(messageText, '\n')),
  );

  return Arr.isNonEmpty(errors)
    ? {
        problem: 'unreadable',
        detail: errors
          .map(({ messageText }) =>
            ts.flattenDiagnosticMessageText(messageText, '\n'),
          )
          .join('; '),
      }
    : parsed.options.skipLibCheck !== true
      ? undefined
      : setsItself(config)
        ? { problem: 'set' }
        : { problem: 'inherited' };
};

const problemText = (problem: Problem, detail: string | undefined): string => {
  switch (problem) {
    case 'set':
      return 'sets `"skipLibCheck": true`.';

    case 'inherited':
      return 'has `skipLibCheck` on through a config it extends.';

    case 'unreadable':
      return `tsc cannot read its options, so whether \`skipLibCheck\` is on is not known: ${detail ?? ''}`;
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDistTestLibCheck().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} \`test/dist_\` tsconfig file(s) checked; none turns \`skipLibCheck\` on.`,
  );
}
