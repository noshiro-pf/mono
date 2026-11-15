// cspell:ignore qiita

/** The files of the repository that more than one guard reads, by kind. */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import { runFile } from './child-process.mjs';
import { readScripts } from './manifest-scripts.mjs';

/** Where the workflows are, relative to the repository root. */
export const WORKFLOW_GLOB = '.github/workflows/*.yml';

/**
 * Every workflow file, absolute and sorted. A composite action under
 * `.github/actions/` is not a workflow and is not listed.
 */
export const listWorkflowFiles = async (): Promise<
  Result<readonly string[], string>
> => listSorted(WORKFLOW_GLOB);

/**
 * Every action's `action.yml` under `.github/actions/`, composite or not,
 * absolute and sorted: where they are kept (see "Setup" in
 * `.github/workflows/README.md`). None at all is an empty list.
 */
export const listActionFiles = async (): Promise<
  Result<readonly string[], string>
> => listSorted('.github/actions/**/action.{yml,yaml}');

/** The directory of every published package (`libs/*`), absolute and sorted. */
export const listLibraryDirs = async (): Promise<
  Result<readonly string[], string>
> =>
  Result.map(await listSorted('libs/*/package.json'), (manifests) =>
    manifests.map(path.dirname),
  );

/**
 * Every tracked file, relative to the repository root and sorted.
 *
 * Asked of git rather than of a glob: GitHub has what is committed and nothing
 * else, so a path that only an untracked file makes good is not good.
 */
export const listTrackedFiles = async (): Promise<
  Result<readonly string[], string>
> => {
  const tracked = await gitLsFiles(projectRootPath, [], 'the tracked files');

  return Result.map(tracked, (files) => files.toSorted());
};

/**
 * Every file of the checkout that git does not ignore and that is a file on
 * disk — tracked, force-added past `.gitignore` included, or untracked and not
 * ignored — relative to the checkout's root, once each and sorted. What is not
 * a file now is not listed: a tracked file deleted or left out of a sparse
 * checkout, one replaced by a directory, a link to a directory or to nothing.
 * Directories whose name starts with `.` are listed like any other.
 *
 * Asked of git rather than of a glob, for a guard that reads the working tree
 * as it stands: a glob from the root walks every directory under it, the ones
 * `.gitignore` ignores included, and a checkout where sessions keep git
 * worktrees under `.claude/worktrees/` holds a whole copy of the repository in
 * each.
 */
export const listCheckoutFiles = async ({
  select = () => true,
  root = projectRootPath,
}: Readonly<{
  /**
   * Which paths to list, asked of every path git lists before anything else is
   * read: every one unless given.
   */
  select?: (relativePath: string) => boolean;
  /** The checkout to list: the repository's own unless given. */
  root?: string;
}> = {}): Promise<Result<readonly string[], string>> => {
  const listed = await gitLsFiles(
    root,
    ['--cached', '--others', '--exclude-standard'],
    'the files of the checkout',
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  // `--cached` lists an unmerged path once per stage.
  const files = Arr.uniq(listed.value.filter(select));

  // One `stat` per file selected, about half a second over the whole
  // repository: git has no listing that tells a file on disk from the rest
  // (`--deleted` misses skip-worktree entries, and `-t` tags one that is on
  // disk as absent).
  const checked = await Promise.all(
    files.map(async (file): Promise<Result<readonly string[], string>> => {
      const stat = await Result.fromPromise(
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path git listed.
        fs.stat(path.join(root, file)),
      );

      if (Result.isOk(stat)) {
        return Result.ok(stat.value.isFile() ? [file] : []);
      }

      const code = errorCode(stat.value);

      // Any other failure, a directory that cannot be searched among them,
      // fails the listing rather than leaving the file out unread.
      return ABSENT_CODES.has(code)
        ? Result.ok([])
        : Result.err(
            `Failed to list the files of the checkout: ${unknownToString(stat.value)}`,
          );
    }),
  );

  return (
    checked.find(Result.isErr) ??
    Result.ok(
      checked
        .flatMap((result) => (Result.isOk(result) ? result.value : []))
        .toSorted(),
    )
  );
};

/** The text of a file, by its path from the repository root. */
export const readRepositoryFile = async (
  relativePath: string,
): Promise<Result<string, string>> => {
  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(projectRootPath, relativePath), 'utf8'),
  );

  return Result.isErr(result)
    ? Result.err(
        `Failed to read ${relativePath}: ${unknownToString(result.value)}`,
      )
    : Result.ok(result.value);
};

/** The root `package.json`'s `scripts`, as {@link readScripts} reads them. */
export const readRootPackageScripts = async (): Promise<
  Result<ReadonlyRecord<string, string>, string>
> => {
  const contents = await readRepositoryFile('package.json');

  if (Result.isErr(contents)) {
    return contents;
  }

  const parsed = Json.parse(contents.value);

  return Result.isErr(parsed)
    ? Result.err(
        `Failed to parse package.json: ${unknownToString(parsed.value)}`,
      )
    : Result.ok(readScripts(parsed.value));
};

/** The tracked files, and every directory that holds one. */
export const toTree = (trackedFiles: readonly string[]): Tree =>
  ({
    files: new Set(trackedFiles),
    directories: new Set(
      trackedFiles.flatMap((file) =>
        Arr.generate(function* () {
          const segments = file.split('/');

          for (const end of segments.keys()) {
            if (end > 0) {
              yield segments.slice(0, end).join('/');
            }
          }
        }),
      ),
    ),
  }) as const;

/** Whether `relativePath` is a tracked file or a directory that holds one. */
export const hasPath = (tree: Tree, relativePath: string): boolean =>
  tree.files.has(relativePath) || tree.directories.has(relativePath);

/**
 * Whether `relativePath` is a Markdown document of the repository's own, kept
 * up to date with the tree it describes — the documents whose references to
 * that tree are checked.
 *
 * What is left out says something as it was when it was written, and is never
 * edited to follow the tree:
 *
 * - `CHANGELOG.md`, and the records under {@link RECORD_SEGMENTS} and
 *   {@link RECORD_SUFFIX}: a report of work done, a session's work log, a
 *   prompt that was given. The paths in them are the paths of that day.
 * - The prefixes in {@link EXCLUDED_PREFIXES}, each with its reason.
 * - The generated bundles of `strict-lib/` (`strict-lib/vX.Y/output/`), whose
 *   README is a copy and is overwritten by `strict-lib:gen:packages`.
 */
export const isRepositoryProse = (relativePath: string): boolean =>
  PROSE_EXTENSIONS.has(path.posix.extname(relativePath)) &&
  path.posix.basename(relativePath) !== 'CHANGELOG.md' &&
  !path.posix.basename(relativePath).endsWith(RECORD_SUFFIX) &&
  Arr.butLast(relativePath.split('/')).every(
    (segment) => !RECORD_SEGMENTS.has(segment),
  ) &&
  !STRICT_LIB_OUTPUT.test(relativePath) &&
  EXCLUDED_PREFIXES.every((prefix) => !relativePath.startsWith(prefix));

/**
 * Whether `relativePath` is a page an app renders — Markdown under an app's
 * `src/`, such as the content collections of the Astro docs sites — rather than
 * a document GitHub renders as it is.
 *
 * Such a page is read by the app's users: its relative links are routes of the
 * built site, and a path like `src/main.ts` in it is in the reader's project,
 * not in the app's.
 */
export const isSitePage = (relativePath: string): boolean =>
  SITE_PAGE.test(relativePath);

/**
 * Whether a path a document names is under `experimental/`, which the guards
 * that resolve such names leave alone.
 *
 * A diff that touches nothing but `experimental/` skips every workflow, so the
 * pull request that deletes a directory there merges unchecked, and the
 * document that still names it would fail the next, unrelated pull request
 * instead. `experimental/` is emptied as its contents are revived or dropped
 * (`docs/experimental-inventory.md`), so its paths are expected to go.
 */
export const isUnderExperimental = (relativePath: string): boolean =>
  relativePath === 'experimental' || relativePath.startsWith('experimental/');

export type Tree = Readonly<{
  files: ReadonlySet<string>;
  /** With no trailing `/`; the repository root is not one of them. */
  directories: ReadonlySet<string>;
}>;

/**
 * The files a package's public entry may be, relative to the package, the first
 * that exists being it (`CLAUDE.md`, "Repository layout").
 */
export const PACKAGE_ENTRY_FILES = [
  'src/entry-point.mts',
  'src/index.mts',
] as const;

/**
 * The extensions of the files whose text a person writes and a reader sees —
 * documents, code and its comments, configuration, and the markup of the sites'
 * components. Everything else is binary or generated.
 */
export const TEXT_EXTENSIONS: ReadonlySet<string> = new Set<string>([
  '.astro',
  '.css',
  '.cts',
  '.html',
  '.js',
  '.json',
  '.jsonc',
  '.jsx',
  '.md',
  '.mdx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

/**
 * What `stat` fails with for a path that is no file to read: not there, under a
 * file rather than a directory, or a link that leads round in a loop.
 */
const ABSENT_CODES: ReadonlySet<unknown> = new Set<unknown>([
  'ENOENT',
  'ENOTDIR',
  'ELOOP',
]);

const PROSE_EXTENSIONS: ReadonlySet<string> = new Set<string>(['.md', '.mdx']);

/** A directory whose documents are records. */
const RECORD_SEGMENTS: ReadonlySet<string> = new Set<string>([
  'prompts',
  'reports',
  'update-reports',
  'work-log',
]);

/** A document named as a record (`length-constrained-array-report.md`). */
const RECORD_SUFFIX = '-report.md';

const STRICT_LIB_OUTPUT = /^strict-lib\/v[^/]+\/output\//u;

const SITE_PAGE = /^apps\/[^/]+\/src\//u;

const EXCLUDED_PREFIXES: readonly string[] = [
  // Verbatim texts, which are never edited.
  'docs/json-spec/',
  'docs/rust_book/',
  'docs/typescript_book/',
  // Outside the workspace, and not fixed in unrelated work.
  'experimental/',
  // Zenn content: published from here as written, and dated by Zenn.
  'articles/',
  'books/',
  // Copies of articles published elsewhere and of talks that were given; like
  // the Zenn content, they say what was true when they went out.
  'docs/blog/',
  'docs/qiita/',
  'docs/marp-slides/',
  'docs/reveal-slides/',
  // The dated record of the move into this monorepo.
  'docs/monorepo-consolidation.md',
] as const;

/** The `code` of a Node.js system error, if it has one. */
const errorCode = (error: unknown): unknown =>
  isRecord(error) && hasKey(error, 'code') ? error.code : undefined;

/** The paths `git ls-files -z` prints with `args`, relative to `root`. */
const gitLsFiles = async (
  root: string,
  args: readonly string[],
  what: string,
): Promise<Result<readonly string[], string>> => {
  const result = await runFile('git', ['ls-files', '-z', ...args], {
    cwd: root,
    // The repository tracks well over ten thousand files, which is more than
    // the 1 MiB `execFile` defaults to.
    maxBuffer: 64 * 1024 * 1024,
  });

  const stderr = result.stderr.trim();

  // `runFile` leaves `error` unset only when there is an exit code or a signal.
  return result.status === 0
    ? Result.ok(result.stdout.split('\0').filter((file) => file !== ''))
    : Result.err(
        `Failed to list ${what}: ${
          result.error !== undefined
            ? unknownToString(result.error)
            : stderr !== ''
              ? stderr
              : `git ended with ${result.status ?? result.signal}`
        }`,
      );
};

const listSorted = async (
  pattern: string,
): Promise<Result<readonly string[], string>> => {
  const result = await glob(pattern, {
    cwd: projectRootPath,
    absolute: true,
  });

  return Result.isErr(result)
    ? Result.err(`Failed to list ${pattern}: ${unknownToString(result.value)}`)
    : Result.ok(result.value.toSorted());
};
