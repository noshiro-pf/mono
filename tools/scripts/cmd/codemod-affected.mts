import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import {
  getDiffFrom,
  getUntrackedFiles,
  isDirectlyExecuted,
} from 'ts-repo-utils';
import type { MutableFixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import { resolveDiffBase } from '../lib/diff-base.mjs';
import { readRepositoryFile } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * `fix:codemod:affected`: the root codemod over what the change could have left
 * un-normalized, which is `code-check (fix:codemod:affected)`'s check.
 *
 * The transformers are syntactic — they read type nodes, never the checker's
 * types — and each file is transformed in a `Project` of its own, so a file's
 * result depends on that file and the codemod alone. A file the change did not
 * touch was already normalized on the base, and stays so unless the codemod
 * itself changed. So the codemod runs over the files that differ from the base,
 * and over everything only when something that decides its output differs: a
 * workspace package it runs (`ts-codemod-cli` and its production dependencies,
 * read from the workspace graph rather than kept as a list), the lockfile, the
 * tsx config, this file, or the root scripts that name the transformers and the
 * globs.
 *
 * The base is `CODEMOD_DIFF_BASE`, which `code-check.yml` sets to the base of
 * the pull request (the commit before the push on `main`, `origin/main` for a
 * queue layer on a `queue/*` branch) and fetches. Set and empty, as on any other manual run, it means "no
 * base": everything is run. Unset, as on a local run, it is the merge base of
 * `HEAD` and `origin/main`. A base that is not in the clone is an error rather
 * than an empty change, which would pass.
 */
export const decideCodemodScope = ({
  changedFiles,
  inputDirs,
  baseScripts,
  headScripts,
}: Readonly<{
  /** Repository-relative paths that differ from the base. */
  changedFiles: readonly string[];
  /**
   * Repository-relative directories of the workspace packages the codemod
   * runs.
   */
  inputDirs: readonly string[];
  /** The root `package.json`'s scripts on the base, if it has any. */
  baseScripts: ReadonlyRecord<string, string> | undefined;
  /** The root `package.json`'s scripts in the working tree. */
  headScripts: ReadonlyRecord<string, string>;
}>): CodemodScope => {
  const reasons = Arr.generate(function* () {
    for (const file of changedFiles) {
      const dir = inputDirs.find((d) => file.startsWith(`${d}/`));

      if (dir !== undefined) {
        yield `${file} is in ${dir}, which the codemod runs.`;
      } else if (INPUT_FILES.has(file)) {
        yield `${file} changed, and it decides what the codemod does.`;
      }
    }

    if (changedFiles.includes('package.json')) {
      if (baseScripts === undefined) {
        yield 'The base has no root package.json scripts to compare with.';
      } else {
        for (const name of INPUT_SCRIPTS) {
          if (baseScripts[name] !== headScripts[name]) {
            yield `The root script ${name} changed.`;
          }
        }
      }
    }
  });

  return Arr.isNonEmpty(reasons) ? { full: true, reasons } : { full: false };
};

/**
 * A path from the repository root, whatever form it came in: the git helpers of
 * ts-repo-utils return absolute paths, and `decideCodemodScope` compares
 * repository paths.
 */
export const toRepositoryPath = (root: string, file: string): string =>
  path.relative(root, path.resolve(root, file)).split(path.sep).join('/');

export type CodemodScope = Readonly<
  { full: false } | { full: true; reasons: readonly string[] }
>;

/**
 * Files that decide the codemod's output without being in one of the packages
 * it runs. The lockfile pins ts-morph, which prints every file the transformers
 * touch, and tsx; the tsx config is what the command is run with.
 */
const INPUT_FILES: ReadonlySet<string> = new Set<string>([
  'pnpm-lock.yaml',
  'tools/configs/tsconfig.tsx.json',
  'tools/scripts/cmd/codemod-affected.mts',
]);

/** The root scripts that name the transformers, the globs and this command. */
const INPUT_SCRIPTS = [
  'z:ts-codemod',
  'z:ts-codemod:cmd',
  'fix:codemod:affected',
] as const;

/** The workspace package whose dependency closure the codemod runs. */
const CODEMOD_PACKAGE = 'ts-codemod-cli';

const BASE_VARIABLE = 'CODEMOD_DIFF_BASE';

const run = (
  command: string,
  args: readonly string[],
): Result<string, string> => {
  const result = spawnSync(command, args, {
    cwd: projectRootPath,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  return result.status === 0
    ? Result.ok(result.stdout)
    : Result.err(
        `\`${Arr.toUnshifted(command)(args).join(' ')}\` failed: ${result.stderr.trim()}`,
      );
};

const lines = (text: string): readonly string[] =>
  text.split('\n').filter((line) => line !== '');

/** The base commit, or `undefined` when the run is asked to cover everything. */
const resolveBase = (): Result<string | undefined, string> => {
  if (process.env[BASE_VARIABLE] === '') {
    return Result.ok(undefined);
  }

  try {
    return Result.ok(
      resolveDiffBase('diff the codemod against', BASE_VARIABLE),
    );
  } catch (error: unknown) {
    return Result.err(unknownToString(error));
  }
};

const readScripts = (
  json: string,
): ReadonlyRecord<string, string> | undefined => {
  const parsed = Json.parse(json);

  if (
    Result.isErr(parsed) ||
    !isRecord(parsed.value) ||
    !hasKey(parsed.value, 'scripts') ||
    !isRecord(parsed.value.scripts)
  ) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(parsed.value.scripts).filter(
      (entry): entry is MutableFixedLengthTuple<2, string> =>
        isString(entry[1]),
    ),
  );
};

const listInputDirs = (): Result<readonly string[], string> => {
  const listed = run('pnpm', [
    '--filter-prod',
    `${CODEMOD_PACKAGE}...`,
    'ls',
    '--depth',
    '-1',
    '--parseable',
  ]);

  if (Result.isErr(listed)) {
    return listed;
  }

  const dirs = lines(listed.value).map((dir) =>
    toRepositoryPath(projectRootPath, dir),
  );

  return Arr.isNonEmpty(dirs)
    ? Result.ok(dirs)
    : Result.err(
        `pnpm listed no workspace package for ${CODEMOD_PACKAGE}, so what the codemod runs is unknown.`,
      );
};

const decide = (
  base: string,
): Promise<
  Result<Readonly<{ scope: CodemodScope; untracked: boolean }>, string>
> =>
  Result.safeTry(async function* () {
    // The working tree against the base, so that a local run also covers what
    // is not committed yet. Deleted files included, and a rename under both its
    // paths, so that a file moved out of a package the codemod runs counts as a
    // change to it.
    const tracked = yield* Result.safeUnwrap(
      Result.mapErr(
        await getDiffFrom(base, { excludeDeleted: false, silent: true }),
        (error) => `Could not diff against ${base}: ${unknownToString(error)}`,
      ),
    );

    const untracked = yield* Result.safeUnwrap(
      Result.mapErr(
        await getUntrackedFiles({ silent: true }),
        (error) =>
          `Could not list the untracked files: ${unknownToString(error)}`,
      ),
    );

    const inputDirs = yield* Result.safeUnwrap(listInputDirs());

    const headScripts = readScripts(
      yield* Result.safeUnwrap(await readRepositoryFile('package.json')),
    );

    if (headScripts === undefined) {
      return Result.err('The root package.json has no scripts.');
    }

    const baseJson = run('git', ['show', `${base}:package.json`]);

    return Result.ok({
      scope: decideCodemodScope({
        changedFiles: [...tracked, ...untracked].map((file) =>
          toRepositoryPath(projectRootPath, file),
        ),
        inputDirs,
        baseScripts: Result.isOk(baseJson)
          ? readScripts(baseJson.value)
          : undefined,
        headScripts,
      }),
      untracked: Arr.isNonEmpty(untracked),
    });
  });

const codemod = (args: readonly string[]): boolean =>
  spawnSync('pnpm', ['run', 'z:ts-codemod', ...args], {
    cwd: projectRootPath,
    stdio: 'inherit',
  }).status === 0;

const main = (): Promise<Result<undefined, string>> =>
  Result.safeTry(async function* () {
    const base = yield* Result.safeUnwrap(resolveBase());

    if (base === undefined) {
      console.info(`${BASE_VARIABLE} is empty: running the codemod in full.`);

      return codemod([])
        ? Result.ok(undefined)
        : Result.err('The codemod failed.');
    }

    const { scope, untracked } = yield* Result.safeUnwrap(await decide(base));

    if (scope.full) {
      console.info(
        'Running the codemod in full, because what decides its output changed:',
      );

      console.info(scope.reasons.map((reason) => `  ${reason}`).join('\n'));

      return codemod([])
        ? Result.ok(undefined)
        : Result.err('The codemod failed.');
    }

    console.info(
      `Nothing that decides the codemod's output differs from ${base}: running it over the diff.`,
    );

    // `--diff-from` reads `git diff`, which leaves out untracked files.
    const ok =
      codemod(['--diff-from', base]) &&
      (!untracked || codemod(['--uncommitted']));

    return ok ? Result.ok(undefined) : Result.err('The codemod failed.');
  });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await main().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(`❌ ${result.value}`);

    process.exit(1);
  }
}
