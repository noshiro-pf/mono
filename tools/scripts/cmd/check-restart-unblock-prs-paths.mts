import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isNonNullObject,
  isRecord,
  memoizeFunction,
  Result,
  unknownToString,
} from 'ts-data-forge';
import * as t from 'ts-fortress';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import {
  listLibraryDirs,
  listTrackedFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';
import {
  readShellScript,
  type ShellAssignment,
} from '../lib/shell-commands.mjs';
import { readWorkflowJobs } from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a path pattern in `restart-unblock-prs.yml` and what its command
 * imports have drifted apart.
 *
 * The workflow files a restart TODO when a push changes a file the
 * `unblock-prs` worker or `run-unblock-prs-skill` loads at startup, and it
 * knows which files those are only by `worker_re` and `runner_re`, written by
 * hand. When either command starts importing from a directory its pattern does
 * not name, a change there goes out with no TODO, and that is silent: the
 * running process keeps the old code and nothing is red. So each pattern is
 * held, both ways, to the static imports reachable from its command's entry:
 *
 * - every module reached is matched, so nothing it loads goes unnoticed;
 * - every tracked module matched is reached, so the pattern does not keep
 *   asking for restarts over code the command no longer loads;
 * - every workspace package reached is either followed into its `src/` — the
 *   pattern names `libs/<dir>/src/` — or listed in `LEFT_OUT`, so a new one is
 *   a decision rather than an omission;
 * - every workspace import reached, as written — inside the packages left
 *   out too — is mapped by `tools/configs/tsconfig.tsx.json`'s `paths` to a
 *   file that exists, which is what makes `tsx` load it from `src/`: the
 *   restart TODO asks for no build, and an import resolved through
 *   `node_modules` would load a `dist/` that a pull leaves stale.
 */
export const checkRestartUnblockPrsPaths = (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const workflowFile = yield* Result.safeUnwrap(
      await readRepositoryFile(WORKFLOW_PATH),
    );

    const patterns = yield* Result.safeUnwrap(
      parsePatterns(
        workflowFile,
        COMMANDS.map(({ variable }) => variable),
      ),
    );

    const workspacePackages = yield* Result.safeUnwrap(
      await readWorkspacePackages(),
    );

    const trackedFiles = yield* Result.safeUnwrap(await listTrackedFiles());

    // A tracked file under a package's `src/`: neither a `dist/` a build left
    // nor an untracked file the checkout happens to have.
    const tracked: ReadonlySet<string> = new Set<string>(trackedFiles);

    const sourceMapped = yield* Result.safeUnwrap(
      parseSourceMapped(
        yield* Result.safeUnwrap(await readRepositoryFile(TSX_TSCONFIG_PATH)),
        (file) => tracked.has(file) && /^libs\/[^/]+\/src\//u.test(file),
      ),
    );

    // Each command is walked twice, and the two share most of their files.
    const readCached = memoizeFunction(readSource, (file: string) => file);

    const reports = COMMANDS.map(({ variable, entry }) => {
      const pattern = patterns.get(variable);

      if (pattern === undefined) {
        return Result.err(`${WORKFLOW_PATH} assigns no ${variable}.`);
      }

      return Result.safeTry(function* () {
        const closure = yield* Result.safeUnwrap(
          walkImports(entry, {
            readSource: readCached,
            workspacePackages,
            follows: (directory) => pattern.test(`${directory}/src/`),
          }),
        );

        // Into every package, the ones left out included: tsx loads what they
        // import at startup as well.
        const everything = yield* Result.safeUnwrap(
          walkImports(entry, {
            readSource: readCached,
            workspacePackages,
            follows: () => true,
          }),
        );

        return Result.ok({
          reached: closure.files.length,
          violations: findViolations({
            variable,
            entry,
            pattern,
            closure: {
              ...closure,
              workspaceImports: everything.workspaceImports,
            },
            trackedFiles,
            leftOut: LEFT_OUT,
            sourceMapped,
          }),
        });
      });
    });

    const firstError = reports.find(Result.isErr);

    if (firstError !== undefined) {
      return Result.err(firstError.value);
    }

    const checked = reports.filter(Result.isOk).map((report) => report.value);

    const violations = checked.flatMap((report) => report.violations);

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations))
      : Result.ok({
          commands: checked.length,
          modules: checked.reduce((total, { reached }) => total + reached, 0),
        });
  });

/**
 * The patterns named by `variables`, read from the shell assignments of the
 * workflow's `run:` scripts with each `${name}` expanded from an assignment
 * above it in the same script, and compiled as JavaScript regular expressions —
 * the alternation, `\.` and anchors the workflow writes for `grep -E` mean the
 * same there.
 *
 * Read through `tools/scripts/lib/workflow-jobs.mts` and the shell reader of
 * `tools/scripts/lib/shell-commands.mts`, so that an assignment is read as the
 * shell reads it: several on a line, one with a trailing comment, or a step in
 * flow style. A variable another step assigned is not expanded, as the shell of
 * this step would not see it; one that more than one step assigns is an error,
 * since which the workflow uses depends on the step.
 */
export const parsePatterns = (
  workflowFile: string,
  variables: readonly string[],
): Result<ReadonlyMap<string, RegExp>, string> => {
  const jobs = readWorkflowJobs(workflowFile);

  if (Result.isErr(jobs)) {
    return jobs;
  }

  const mut_sources = new Map<string, string>();

  for (const { steps } of jobs.value) {
    for (const { run } of steps) {
      if (run === undefined) {
        continue;
      }

      const { values, unresolved } = expandAssignments(
        readShellScript(run).assignments,
      );

      for (const variable of variables) {
        const unknownName = unresolved.get(variable);

        if (unknownName !== undefined) {
          return Result.err(
            `${variable} expands \${${unknownName}}, which no line above it assigns.`,
          );
        }

        const value = values.get(variable);

        if (value === undefined) {
          continue;
        }

        if (mut_sources.has(variable)) {
          return Result.err(
            `${variable} is assigned in more than one step, so which pattern the workflow uses depends on the step.`,
          );
        }

        mut_sources.set(variable, value);
      }
    }
  }

  const mut_patterns = new Map<string, RegExp>();

  for (const variable of variables) {
    const source = mut_sources.get(variable);

    if (source === undefined) {
      return Result.err(`The workflow assigns no ${variable}.`);
    }

    const compiled = Result.fromThrowable(
      // eslint-disable-next-line security/detect-non-literal-regexp -- compiling the workflow's own pattern is what this check is for.
      () => new RegExp(source, 'u'),
    );

    if (Result.isErr(compiled)) {
      return Result.err(
        `${variable} is not a valid pattern: ${unknownToString(compiled.value)}`,
      );
    }

    mut_patterns.set(variable, compiled.value);
  }

  return Result.ok(mut_patterns);
};

/**
 * Every module reachable from `entry` by static import or re-export, type-only
 * ones included (a change there is still a change to the file), by paths from
 * the repository root.
 *
 * A relative specifier is resolved as the repository writes them, `.mjs` for
 * the `.mts` beside it. A bare one naming a workspace package is entered at its
 * `src/` entry when `follows` says so, and otherwise listed in `unfollowed`;
 * either way it is listed, as written, in `workspaceImports`. Anything else
 * (`node:*`, a third-party package) is not ours to restart for.
 */
export const walkImports = (
  entry: string,
  {
    readSource: read,
    workspacePackages,
    follows,
  }: Readonly<{
    readSource: (relativePath: string) => string | undefined;
    workspacePackages: ReadonlyMap<string, string>;
    follows: (directory: string) => boolean;
  }>,
): Result<Closure, string> => {
  const mut_files = new Set<string>();

  const mut_unfollowed = new Set<string>();

  const mut_workspaceImports = new Set<string>();

  const mut_queue: string[] = [entry];

  while (Arr.isNonEmpty(mut_queue)) {
    const file = mut_queue.pop();

    if (file === undefined || mut_files.has(file)) {
      continue;
    }

    const source = read(file);

    if (source === undefined) {
      return Result.err(
        file === entry
          ? `${entry} could not be read.`
          : `${file}, imported on the way from ${entry}, could not be read.`,
      );
    }

    mut_files.add(file);

    for (const { fileName: specifier } of ts.preProcessFile(source, true, true)
      .importedFiles) {
      if (specifier.startsWith('.')) {
        mut_queue.push(
          path.posix
            .join(path.posix.dirname(file), specifier)
            .replace(/\.mjs$/u, '.mts'),
        );

        continue;
      }

      const packageName = toPackageName(specifier);

      const directory = workspacePackages.get(packageName);

      if (directory === undefined) {
        continue;
      }

      mut_workspaceImports.add(specifier);

      if (!follows(directory)) {
        mut_unfollowed.add(packageName);

        continue;
      }

      const packageEntry = PACKAGE_ENTRIES.map(
        (name) => `${directory}/src/${name}`,
      ).find((candidate) => read(candidate) !== undefined);

      if (packageEntry === undefined) {
        return Result.err(
          `${packageName} has none of ${PACKAGE_ENTRIES.join(', ')} under ${directory}/src/.`,
        );
      }

      mut_queue.push(packageEntry);
    }
  }

  return Result.ok({
    files: Array.from(mut_files).toSorted(),
    unfollowed: Array.from(mut_unfollowed).toSorted(),
    workspaceImports: Array.from(mut_workspaceImports).toSorted(),
  });
};

/** What is wrong with one pattern, as one message per problem. */
export const findViolations = ({
  variable,
  entry,
  pattern,
  closure,
  trackedFiles,
  leftOut,
  sourceMapped,
}: Readonly<{
  variable: string;
  entry: string;
  pattern: RegExp;
  closure: Closure;
  trackedFiles: readonly string[];
  leftOut: readonly string[];
  /**
   * The module names `tools/configs/tsconfig.tsx.json` maps to a source file
   * ({@link parseSourceMapped}).
   */
  sourceMapped: readonly string[];
}>): readonly string[] => {
  const reached = new Set(closure.files);

  // A `Set` rather than `includes`: under the strict standard library
  // `includes` narrows when it is false too, so the name would read as `never`.
  const leftOutNames: ReadonlySet<string> = new Set(leftOut);

  const mapped: ReadonlySet<string> = new Set<string>(sourceMapped);

  return [
    ...closure.files
      .filter((file) => !isModule(file) || !pattern.test(file))
      .map((file) =>
        isModule(file)
          ? `${variable} does not match ${file}, which ${entry} imports: a change there would file no restart TODO.`
          : `${entry} imports ${file}, and the workflow reads only \`.mts\` sources: a change there would file no restart TODO.`,
      ),
    ...closure.unfollowed
      .filter((packageName) => !leftOutNames.has(packageName))
      .map(
        (packageName) =>
          `${entry} imports the workspace package ${packageName}, which ${variable} does not name and LEFT_OUT does not list.`,
      ),
    ...closure.workspaceImports
      .filter((specifier) => !mapped.has(specifier))
      .map(
        (specifier) =>
          `${entry} imports ${specifier}, which ${TSX_TSCONFIG_PATH} does not map to a source file that exists: tsx loads it from dist/, which a restart without a build leaves stale.`,
      ),
    ...trackedFiles
      .filter(
        (file) => isModule(file) && pattern.test(file) && !reached.has(file),
      )
      .map(
        (file) =>
          `${variable} matches ${file}, which ${entry} does not import: a change there would ask for a restart that changes nothing.`,
      ),
  ];
};

export type Closure = Readonly<{
  files: readonly string[];
  unfollowed: readonly string[];
  /** Every bare specifier naming a workspace package, as written. */
  workspaceImports: readonly string[];
}>;

/**
 * The module names `tsconfig.tsx.json` maps, read as `tsc` reads the file
 * (JSONC), each to a tracked file under a `src/` (`isSource`) — what makes tsx
 * load it from source. A name none of whose targets is one is left out:
 * tsx then falls back to `node_modules` without a word, and that is the `dist/`
 * this guard is about. Only exact names count; a subpath import needs its own
 * entry, as no `*` pattern is read.
 */
export const parseSourceMapped = (
  text: string,
  isSource: (relativePath: string) => boolean,
): Result<readonly string[], string> => {
  const parsed = ts.parseConfigFileTextToJson(TSX_TSCONFIG_PATH, text);

  const config: unknown = parsed.config;

  const { error } = parsed;

  if (error !== undefined) {
    return Result.err(
      `${TSX_TSCONFIG_PATH} could not be parsed: ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`,
    );
  }

  const validated = TsxTsconfigSchema.validate(config);

  if (Result.isErr(validated)) {
    return Result.err(
      Arr.toUnshifted(`${TSX_TSCONFIG_PATH} has no usable compilerOptions:`)(
        t.validationErrorsToMessages(validated.value),
      ).join('\n'),
    );
  }

  const { baseUrl, paths } = validated.value.compilerOptions;

  // TypeScript 6 deprecates `baseUrl`, and TypeScript 7 ignores it and resolves
  // `paths` from the configuration file's own directory, which is what this
  // reads them against.
  if (baseUrl !== undefined) {
    return Result.err(
      `${TSX_TSCONFIG_PATH} sets \`baseUrl\`, which TypeScript 7 ignores; remove it and write \`paths\` relative to the configuration file.`,
    );
  }

  const base = path.posix.dirname(TSX_TSCONFIG_PATH);

  return Result.ok(
    Object.entries(paths)
      .filter(
        ([key, targets]) =>
          !key.includes('*') &&
          targets.some((target) =>
            isSource(path.posix.normalize(path.posix.join(base, target))),
          ),
      )
      .map(([key]) => key),
  );
};

const TsxTsconfigSchema = t.record({
  compilerOptions: t.record({
    // Read only to refuse it (`parseSourceMapped`).
    baseUrl: t.optional(t.string()),
    paths: t.keyValueRecord(t.string(), t.array(t.string())),
  }),
});

type CheckSummary = Readonly<{
  commands: number;
  modules: number;
}>;

const WORKFLOW_PATH = '.github/workflows/restart-unblock-prs.yml';

const TSX_TSCONFIG_PATH = 'tools/configs/tsconfig.tsx.json';

/** Each long-running command, by the pattern that stands for it. */
const COMMANDS = [
  {
    variable: 'worker_re',
    entry: 'libs/pr-merge-queue/src/cmd/unblock-prs.mts',
  },
  {
    variable: 'runner_re',
    entry: 'libs/pr-merge-queue/src/cmd/run-unblock-prs-skill.mts',
  },
] as const;

/**
 * Workspace packages the commands import (from `src/`, through
 * `tools/configs/tsconfig.tsx.json`) that the workflow leaves out on purpose:
 * they change often and the queue rarely waits on them (see the comment above
 * the patterns). A package that joins them is added here.
 */
const LEFT_OUT = [
  'ts-data-forge',
  'ts-fortress',
  'ts-repo-utils',
  'ts-type-forge',
] as const;

/** A package's source entry, in the order `CLAUDE.md` names them. */
const PACKAGE_ENTRIES = ['entry-point.mts', 'index.mts'] as const;

const EXPANSION = /\$\{(?<name>[a-z_]+)\}/gu;

/**
 * The values of a script's assignments, in order, each `${name}` replaced by
 * the value assigned above it; and, apart, each assignment that expands a name
 * none above it assigns, with that name, which is left out of the values.
 */
const expandAssignments = (
  assignments: readonly ShellAssignment[],
): Readonly<{
  values: ReadonlyMap<string, string>;
  unresolved: ReadonlyMap<string, string>;
}> => {
  const mut_values = new Map<string, string>();

  const mut_unresolved = new Map<string, string>();

  for (const { name, value } of assignments) {
    const unknownName = Array.from(
      value.matchAll(EXPANSION),
      (expansion) => expansion.groups?.['name'] ?? '',
    ).find((expanded) => !mut_values.has(expanded));

    if (unknownName !== undefined) {
      mut_unresolved.set(name, unknownName);

      continue;
    }

    // Split and joined rather than `replace`d: the values hold `$`, which a
    // replacement string would read as a pattern of its own.
    mut_values.set(
      name,
      value
        .matchAll(EXPANSION)
        .reduce(
          (expandedValue, [whole, expanded = '']) =>
            expandedValue.split(whole).join(mut_values.get(expanded) ?? ''),
          value,
        ),
    );
  }

  return { values: mut_values, unresolved: mut_unresolved };
};

/** The workflow's own filter on the changed files, before any pattern. */
const isModule = (file: string): boolean =>
  file.endsWith('.mts') && !file.endsWith('.test.mts');

const toPackageName = (specifier: string): string => {
  const segments = specifier.split('/');

  return specifier.startsWith('@')
    ? Arr.take(segments, 2).join('/')
    : (segments[0] ?? specifier);
};

const readSource = (relativePath: string): string | undefined => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.readFileSync(path.resolve(projectRootPath, relativePath), 'utf8');
  } catch {
    return undefined;
  }
};

/** Every workspace library, by package name, to its directory from the root. */
const readWorkspacePackages = async (): Promise<
  Result<ReadonlyMap<string, string>, string>
> =>
  Result.safeTry(async function* () {
    const directories = yield* Result.safeUnwrap(await listLibraryDirs());

    const mut_packages = new Map<string, string>();

    for (const directory of directories) {
      const relativeDirectory = path.relative(projectRootPath, directory);

      const manifest = yield* Result.safeUnwrap(
        await readRepositoryFile(`${relativeDirectory}/package.json`),
      );

      const parsed: unknown = JSON.parse(manifest);

      const name =
        isNonNullObject(parsed) && isRecord(parsed) && hasKey(parsed, 'name')
          ? parsed.name
          : undefined;

      if (typeof name === 'string') {
        mut_packages.set(name, relativeDirectory);
      }
    }

    return Result.ok(mut_packages);
  });

const formatViolations = (violations: readonly string[]): string =>
  [
    `❌ A pattern in ${WORKFLOW_PATH} and what its command imports have drifted apart:`,
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'Edit the pattern (and the comment above it) so that it names exactly the',
    'directories the command reaches; a workspace package left out on purpose',
    'goes in LEFT_OUT in tools/scripts/cmd/check-restart-unblock-prs-paths.mts.',
    `A workspace import tsx would load from dist/ gets a paths entry in ${TSX_TSCONFIG_PATH}.`,
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkRestartUnblockPrsPaths().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    [
      `The restart patterns in ${WORKFLOW_PATH} cover exactly what`,
      `their ${result.value.commands} commands import`,
      `(${result.value.modules} modules).`,
    ].join(' '),
  );
}
