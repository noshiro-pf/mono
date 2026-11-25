import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isNotUndefined,
  isRecord,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { listTrackedFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a `tsconfig*.json` under a package's `test/dist_/` turns
 * `skipLibCheck` on, itself or through a config it extends, or loads types the
 * package's consumers may not have.
 *
 * `check:dist` type-checks what a build emitted, reached the way a consumer
 * reaches it. What a build emits for types is `.d.mts`, and `skipLibCheck` is
 * the option that skips the checking of declaration files — so with it on, the
 * check only proves that the test file can import the package, and passes on
 * declarations that do not type-check. Nothing fails, and a consumer compiling
 * with `skipLibCheck: false` gets the errors from inside `node_modules`.
 *
 * `types` does the same more quietly: an entry for anything but the package
 * itself, such as `node` from the repository's own `@types/node`, resolves
 * names in the declarations that a consumer may not have. So does `lib`: the
 * DOM lib declares `Response`, `URL` and `AbortSignal`, which a consumer
 * compiling a Node-only package with `"lib": ["ESNext"]` lacks, so it is loaded
 * only for a package `DOM_LIB_PACKAGES` names, with the reason.
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

  const undeclared = findUndeclaredTypes(projectRootPath, configs);

  const dom = findDomLibConfigs(projectRootPath, configs, DOM_LIB_PACKAGES);

  const reports = [
    skipLibCheckReport(violations),
    undeclaredTypesReport(undeclared),
    domLibReport(dom),
  ].filter(isNotUndefined);

  return Arr.isNonEmpty(reports)
    ? Result.err(reports.join('\n\n'))
    : Result.ok(configs.length);
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

/**
 * The files among `relativePaths` (relative to `rootDir`, each under
 * `libs/<package>/`) whose `types`, as tsc resolves it through `extends`, names
 * anything but the package itself, by its name as `libs/<package>/package.json`
 * gives it or a subpath of it (`pkg/global`).
 * A consumer's compiler loads only what the declarations reference and what the
 * consumer names, so an entry for anything else, such as `node`, resolves names
 * in the declarations that a consumer may not have. A file whose options cannot
 * be read is left to {@link findSkipLibCheckConfigs}, which reports it.
 */
export const findUndeclaredTypes = (
  rootDir: string,
  relativePaths: readonly string[],
): readonly TypesViolation[] =>
  Arr.generate(function* () {
    for (const relativePath of relativePaths) {
      const read = readOptions(path.join(rootDir, relativePath));

      if (Result.isErr(read)) {
        continue;
      }

      const packageDir = Arr.take(relativePath.split('/'), 2).join('/');

      const own = packageNameAt(path.join(rootDir, packageDir));

      // Unstated, `types` is empty from TypeScript 6 on.
      const undeclared = (read.value.options.types ?? []).filter(
        (entry) => own === undefined || !namesPackage(entry, own),
      );

      if (Arr.isNonEmpty(undeclared)) {
        yield own === undefined
          ? {
              relativePath,
              undeclared,
              namelessManifest: `${packageDir}/package.json`,
            }
          : { relativePath, undeclared };
      }
    }
  });

/**
 * The files among `relativePaths` (relative to `rootDir`, each under
 * `libs/<package>/`) whose `lib`, as tsc resolves it through `extends`, loads
 * the DOM — a `DOM` entry of any kind, or no `lib` at all, which loads tsc's
 * default, DOM included — for a package `listed` does not name; and `stale`, the
 * packages `listed` names that no such file of theirs loads it for any longer. A
 * file whose options cannot be read is left to {@link findSkipLibCheckConfigs},
 * which reports it.
 */
export const findDomLibConfigs = (
  rootDir: string,
  relativePaths: readonly string[],
  listed: ReadonlyMap<string, string>,
): Readonly<{
  unlisted: readonly Readonly<{ relativePath: string; packageName: string }>[];
  stale: readonly string[];
}> => {
  const loading = Arr.generate(function* () {
    for (const relativePath of relativePaths) {
      const read = readOptions(path.join(rootDir, relativePath));

      if (Result.isErr(read)) {
        continue;
      }

      const { lib } = read.value.options;

      if (lib !== undefined && !lib.some(isDomLib)) {
        continue;
      }

      const packageDir = Arr.take(relativePath.split('/'), 2).join('/');

      yield {
        relativePath,
        packageName:
          packageNameAt(path.join(rootDir, packageDir)) ?? packageDir,
      } as const;
    }
  });

  const loaders = new Set(loading.map(({ packageName }) => packageName));

  return {
    unlisted: loading.filter(({ packageName }) => !listed.has(packageName)),
    stale: Array.from(listed.keys()).filter((name) => !loaders.has(name)),
  };
};

/**
 * The packages whose `test/dist_` configs may load the DOM lib, each with why
 * its declarations need it. Each says so in its README too, since a consumer
 * compiling without the DOM lib or `@types/node` gets TS2304 for the names it
 * gives. A package not here is checked against `ESNext` alone, which is what a
 * consumer of a Node-only package compiles with.
 */
const DOM_LIB_PACKAGES: ReadonlyMap<string, string> = new Map<string, string>([
  [
    'octokit-safe-types',
    'the `@octokit/types` and `@octokit/openapi-types` declarations it builds on name `File`, `Blob` and `AbortSignal`',
  ],
  ['pr-merge-queue', '`pause` takes an `AbortSignal`'],
]);

/**
 * Whether a resolved `lib` entry (`lib.dom.d.ts`, `lib.dom.iterable.d.ts`) is
 * one of the DOM's.
 */
const isDomLib = (lib: string): boolean =>
  path.basename(lib).toLowerCase().startsWith('lib.dom');

type TypesViolation = Readonly<{
  relativePath: string;
  undeclared: readonly string[];
  /**
   * The package's `package.json`, when no `name` could be read from it, so that
   * no entry could be told to be the package's own.
   */
  namelessManifest?: string;
}>;

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
  // config's carries none, because `readOptions` parses the object
  // `readConfigFile` returns. Reading the root as a source file instead would
  // give it a position, which would still have to be mapped back to the
  // `extends` node at every level. This reads with the repository's own
  // `typescript` and sets no locale, and should a release reword the message,
  // the tests of a mistyped `extends` fail.
  (code === 5024 && message.includes("'extends'"));

/**
 * The file as written and its compiler options as tsc resolves them, or what
 * keeps them from being read.
 */
const readOptions = (
  tsconfig: string,
): Result<
  Readonly<{ config: unknown; options: ts.CompilerOptions }>,
  string
> => {
  // These files are JSONC, and `extends` is resolved as tsc resolves it:
  // both are tsc's own reading, so a commented-out entry is not taken for one
  // and an option set three configs away is.
  const read = ts.readConfigFile(tsconfig, (file) => ts.sys.readFile(file));

  if (read.error !== undefined) {
    return Result.err(
      ts.flattenDiagnosticMessageText(read.error.messageText, '\n'),
    );
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
  // inherit, and an option would read as unset when the config is broken.
  const errors = parsed.errors.filter(({ code, messageText }) =>
    isAboutReading(code, ts.flattenDiagnosticMessageText(messageText, '\n')),
  );

  return Arr.isNonEmpty(errors)
    ? Result.err(
        errors
          .map(({ messageText }) =>
            ts.flattenDiagnosticMessageText(messageText, '\n'),
          )
          .join('; '),
      )
    : Result.ok({ config, options: parsed.options });
};

const problemOf = (tsconfig: string): Finding | undefined => {
  const read = readOptions(tsconfig);

  return Result.isErr(read)
    ? { problem: 'unreadable', detail: read.value }
    : read.value.options.skipLibCheck !== true
      ? undefined
      : setsItself(read.value.config)
        ? { problem: 'set' }
        : { problem: 'inherited' };
};

/** The `name` in the `package.json` at `packageDir`, if it can be read. */
const packageNameAt = (packageDir: string): string | undefined => {
  const text = ts.sys.readFile(path.join(packageDir, 'package.json'));

  const manifest: unknown = Result.unwrapOkOr(
    Result.fromThrowable((): unknown => JSON.parse(text ?? '')),
    undefined,
  );

  return isRecord(manifest) &&
    hasKey(manifest, 'name') &&
    typeof manifest.name === 'string'
    ? manifest.name
    : undefined;
};

/**
 * Whether a `types` entry is the package `name` or a subpath of it. A subpath
 * may not leave the package: none of its segments, split as tsc splits them on
 * either slash, is empty, `.` or `..`.
 */
const namesPackage = (entry: string, name: string): boolean =>
  entry === name ||
  (entry.startsWith(`${name}/`) &&
    entry
      .slice(name.length + 1)
      .split(/[/\\]/u)
      .every(
        (segment) => segment !== '' && segment !== '.' && segment !== '..',
      ));

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

const skipLibCheckReport = (
  violations: readonly Violation[],
): string | undefined =>
  Arr.isNonEmpty(violations)
    ? [
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
        'fix what the check then reports in the package’s own declarations.',
      ].join('\n')
    : undefined;

const undeclaredTypesReport = (
  undeclared: readonly TypesViolation[],
): string | undefined =>
  Arr.isNonEmpty(undeclared)
    ? [
        `❌ ${undeclared.length} \`test/dist_\` tsconfig file(s) load types beside the package under test:`,
        '',
        ...undeclared.map(
          ({ relativePath, undeclared: names, namelessManifest }) =>
            `  ${relativePath}: ${names.map((name) => `\`${name}\``).join(', ')}${namelessManifest === undefined ? '' : ` (\`${namelessManifest}\` gives no \`name\`, so none of them can be the package itself: fix that first)`}`,
        ),
        '',
        'A consumer’s compiler loads only what the declarations reference and',
        'what the consumer names in its own `types`, so a declaration that',
        'resolves only through another entry here fails for them. Name nothing',
        'but the package itself (a file it publishes by its subpath, such as',
        '`pkg/global`), or state `"types": []`, and fix what `check:dist` then',
        'reports in the package’s declarations: write the types they need',
        'without the other package. A file only the test has gives them what',
        'consumers lack whichever option loads it, so remove it rather than',
        'moving it to `include`.',
      ].join('\n')
    : undefined;

const domLibReport = ({
  unlisted,
  stale,
}: ReturnType<typeof findDomLibConfigs>): string | undefined =>
  Arr.isNonEmpty(unlisted) || Arr.isNonEmpty(stale)
    ? [
        ...(Arr.isNonEmpty(unlisted)
          ? [
              `❌ ${unlisted.length} \`test/dist_\` tsconfig file(s) load the DOM lib for a package \`DOM_LIB_PACKAGES\` does not name:`,
              '',
              ...unlisted.map(
                ({ relativePath, packageName }) =>
                  `  ${relativePath} (${packageName})`,
              ),
              '',
              'A consumer of a Node-only package may compile with `"lib": ["ESNext"]`',
              'and no `@types/node`, and gets TS2304 for a DOM name in the',
              'declarations. State `"lib": ["ESNext"]` and fix what `check:dist` then',
              'reports; or, when the declarations need the DOM, add the package to',
              '`DOM_LIB_PACKAGES` with why, and say so in its README.',
            ]
          : []),
        ...(Arr.isNonEmpty(stale)
          ? Arr.toPushed(
              Arr.isNonEmpty(unlisted) ? [''] : [],
              `❌ \`DOM_LIB_PACKAGES\` names ${stale.join(', ')}, whose \`test/dist_\` configs no longer load the DOM lib: remove it, and the README's note.`,
            )
          : []),
      ].join('\n')
    : undefined;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDistTestLibCheck().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} \`test/dist_\` tsconfig file(s) checked; none turns \`skipLibCheck\` on, loads types beside the package under test, or loads the DOM lib for a package not listed.`,
  );
}
