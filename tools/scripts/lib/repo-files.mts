// cspell:ignore qiita

/** The files of the repository that more than one guard reads, by kind. */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { $, glob } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/** Where the workflows are, relative to the repository root. */
export const WORKFLOW_GLOB = '.github/workflows/*.yml';

/**
 * Every workflow file, absolute and sorted. A composite action under
 * `.github/actions/` is not a workflow and is not listed.
 */
export const listWorkflowFiles = async (): Promise<
  Result<readonly string[], string>
> => listSorted(WORKFLOW_GLOB);

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
  const result = await $('git ls-files -z', {
    cwd: projectRootPath,
    silent: true,
    // The repository tracks well over ten thousand files, which is more than
    // the 1 MiB `exec` defaults to.
    maxBuffer: 64 * 1024 * 1024,
  });

  if (Result.isErr(result)) {
    return Result.err(
      `Failed to list the tracked files: ${unknownToString(result.value)}`,
    );
  }

  return Result.ok(
    result.value.stdout
      .split('\0')
      .filter((file) => file !== '')
      .toSorted(),
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
