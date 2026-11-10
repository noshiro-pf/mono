import * as fs from 'node:fs';
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
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { StrictOmit } from 'ts-type-forge';
import { runFile } from '../lib/child-process.mjs';
import {
  codeSpanRanges,
  codeSpans,
  markdownLines,
  withoutCodeSpans,
} from '../lib/markdown.mjs';
import {
  hasPath,
  isRepositoryProse,
  isSitePage,
  isUnderExperimental,
  listTrackedFiles,
  readRepositoryFile,
  toTree,
  type Tree,
} from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when the repository's own Markdown names, in backticks, a path the tree
 * does not have.
 *
 * Renaming or deleting a file leaves every sentence that names it behind, and a
 * stale path is the one kind of stale prose that a machine can see: the
 * sentence still reads, and only a reader who goes looking finds nothing there.
 * `check:prose:mono-links` resolves the links; this resolves the paths written
 * as code, which outnumber them.
 *
 * Which documents are read is `isRepositoryProse` in
 * `tools/scripts/lib/repo-files.mts`, with the reason for each one left out.
 *
 * Code spans are read outside fenced code blocks — a fence holds commands and
 * code, whose paths belong to wherever they run. A span is read as a path only
 * when it is unambiguously one:
 *
 * - it is one token of path characters, two segments or more, so
 *   `src/a.mts` is read and `package.json`, `src/**`, `<name>/README.md` and
 *   `pnpm run x` are not; a trailing `/`, `:12` or `#anchor` is dropped
 *   first. `src/` is not read either: it is there wherever it is read at
 *   all, by the next rule;
 * - it does not start with `./` or `../`. Written that way it is an import
 *   specifier or a path from wherever a command runs, and a relative link is
 *   the way a document names a file relative to itself;
 * - its first segment is there in one of the places it may be read from: the
 *   repository root, the document's package and the document's directory
 *   (only the root for a site page, whose reader's `src/` is their own). So
 *   `noshiro-pf/mono`, `@types/node` and `origin/main` are not paths at all,
 *   and `src/a.mts` is one only beside a `src/`.
 *
 * Such a path has to be a tracked file or directory, read from any one of those
 * places. A path `.gitignore` ignores from any one of them (`dist/`,
 * `node_modules/`, a package's generated `docs/`) is generated or installed,
 * never tracked, and is not judged; nor is one that goes on past a symlink (a
 * pnpm link under `node_modules/`, a tracked link such as
 * `.claude/skills/unblock-prs`), whose target the tree does not describe;
 * nor a path into `experimental/`, for the reason `isUnderExperimental` gives.
 *
 * A Markdown file name of one segment is read only where the sentence says
 * whose it is: a workspace package's name, bare or in backticks, then a
 * possessive (`'s`, or `の` in Japanese), then the file name in backticks, as
 * in "synstate's `NEXT_MAJOR.md`". That means the file in that package's
 * directory, and has to be a tracked file there; it is written as that path
 * from the root, which is also how a `doc-paths-ignore` declaration names it. A
 * name that nothing places — `README.md`, "the package's `NEXT_MAJOR.md`" — is
 * not read, since it has no fixed base.
 *
 * A document that names a path that is not there on purpose — a file elsewhere,
 * one that is planned, one that was removed — declares it:
 * `<!-- doc-paths-ignore: .github/README.md -->`, anywhere in the document, as
 * written in the span (less a trailing `/`, `:12` or `#anchor`). A declaration
 * that no longer names a path that fails is itself reported, so the list cannot
 * outlive its reasons.
 */
export const checkDocPaths = async (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const tracked = yield* Result.safeUnwrap(await listTrackedFiles());

    const tree = toTree(tracked);

    const packages = yield* Result.safeUnwrap(await readPackageDirs(tracked));

    const documents = tracked.filter(isRepositoryProse);

    const read = await Promise.all(
      documents.map(async (relativePath) =>
        Result.map(await readRepositoryFile(relativePath), (text) => ({
          relativePath,
          references: findPathReferences(text, relativePath, tree, packages),
          declared: readDeclaredAbsent(text),
        })),
      ),
    );

    const firstError = read.find(Result.isErr);

    if (firstError !== undefined) {
      return Result.err(firstError.value);
    }

    const visited = Arr.generate(function* () {
      for (const result of read) {
        if (!Result.isErr(result)) {
          yield result.value;
        }
      }
    });

    const unresolvedByDocument = visited.map(
      ({ relativePath, references, declared }) => ({
        relativePath,
        declared,
        unresolved: references.filter(
          (reference) => !isResolved(reference, tree),
        ),
      }),
    );

    const gitIgnored = yield* Result.safeUnwrap(
      await listGitIgnored(
        unresolvedByDocument.flatMap(({ unresolved }) =>
          unresolved.flatMap(({ candidates }) => candidates),
        ),
      ),
    );

    const findings = unresolvedByDocument.map(
      ({ relativePath, unresolved, declared }) => ({
        relativePath,
        ...judgeDocument({ unresolved, declared, gitIgnored }),
      }),
    );

    const failing = findings.filter(
      ({ broken, staleDeclarations }) =>
        Arr.isNonEmpty(broken) || Arr.isNonEmpty(staleDeclarations),
    );

    return Arr.isNonEmpty(failing)
      ? Result.err(formatFindings(failing))
      : Result.ok({
          files: documents.length,
          paths: visited.reduce(
            (count, { references }) => count + references.length,
            0,
          ),
        });
  });

/**
 * Every code span in `fileText` that is read as a repository path, with the
 * paths from the repository root it may mean. `relativePath` is the document's
 * own path from the root; `tree` is what decides whether a first segment is
 * there to be named; `packages` (each workspace package's name, and the
 * directories that declare it) is what places a file name a sentence gives an
 * owner to.
 */
export const findPathReferences = (
  fileText: string,
  relativePath: string,
  tree: Tree,
  packages: PackageDirs,
): readonly PathReference[] => {
  const bases = basesOf(relativePath, tree);

  const lines = markdownLines(fileText);

  return lines
    .filter(({ fenced }) => !fenced)
    .flatMap(({ line, text }) =>
      Arr.generate(function* () {
        for (const code of codeSpans(text)) {
          const reference = toReference(code, bases, tree);

          if (reference !== undefined) {
            yield { line, ...reference };
          }
        }

        // `line` is 1-based, so this is the line after it: a sentence wrapped
        // between the package name and the file name is read whole.
        const next = lines[line];

        const following =
          next === undefined || next.fenced ? '' : (`\n${next.text}` as const);

        for (const reference of possessiveReferences(
          text,
          following,
          packages,
        )) {
          yield { line, ...reference };
        }
      }),
    );
};

/**
 * Each workspace package's name and the directories whose tracked
 * `package.json` declares it, read from the tree. The members are those the
 * root `package.json`'s `workspaces` names, the list `pnpm-workspace.yaml`
 * holds too.
 */
export const readPackageDirs = async (
  tracked: readonly string[],
): Promise<Result<PackageDirs, string>> => {
  const root = await readRepositoryFile('package.json');

  if (Result.isErr(root)) {
    return root;
  }

  const workspaces = workspacesOf(root.value);

  if (!Arr.isNonEmpty(workspaces)) {
    return Result.err(
      'the root package.json names no `workspaces`, which is where the package names are read from',
    );
  }

  const read = await Promise.all(
    tracked
      .filter((manifest) => isMemberManifest(manifest, workspaces))
      .map(async (manifest) =>
        Result.map(await readRepositoryFile(manifest), (text) => ({
          manifest,
          text,
        })),
      ),
  );

  const firstError = read.find(Result.isErr);

  if (firstError !== undefined) {
    return Result.err(firstError.value);
  }

  return Result.ok(
    toPackageDirs(
      Arr.generate(function* () {
        for (const result of read) {
          if (Result.isOk(result)) {
            yield result.value;
          }
        }
      }),
    ),
  );
};

/**
 * Whether `manifest` is the `package.json` of a member the `workspaces` globs
 * name. A project under `verify-npm-packages/`, or a group manifest of a
 * strict-lib bundle, is not a package a sentence names.
 */
export const isMemberManifest = (
  manifest: string,
  workspaces: readonly string[],
): boolean =>
  path.posix.basename(manifest) === 'package.json' &&
  workspaces.some((pattern) =>
    path.posix.matchesGlob(path.posix.dirname(manifest), pattern),
  );

/**
 * Each package name the manifests declare, with the directories that declare
 * it. A manifest with no `name`, or one that is not JSON, names nothing.
 */
export const toPackageDirs = (
  manifests: readonly Readonly<{ manifest: string; text: string }>[],
): PackageDirs => {
  const mut_dirs = new Map<string, readonly string[]>();

  for (const { manifest, text } of manifests) {
    const name = nameOf(text);

    if (name !== undefined) {
      mut_dirs.set(
        name,
        Arr.toPushed(mut_dirs.get(name) ?? [], path.posix.dirname(manifest)),
      );
    }
  }

  return mut_dirs;
};

/**
 * The paths `fileText` declares absent on purpose, as written and normalized as
 * a span is (a trailing `/`, `:12` or `#anchor` dropped). A declaration shown
 * as code — in a fence or a code span — is an example, not one; one that wraps
 * across lines is read whole.
 */
export const readDeclaredAbsent = (fileText: string): readonly string[] =>
  Array.from(
    markdownLines(fileText)
      .filter(({ fenced }) => !fenced)
      .map(({ text }) => withoutCodeSpans(text))
      .join('\n')
      .matchAll(DECLARATION),
  ).flatMap((match) =>
    (match.groups?.['paths'] ?? '')
      .split(/\s+/u)
      .filter((p) => p !== '')
      .map(normalize),
  );

/** Whether one of the paths `reference` may mean is in `tree`. */
export const isResolved = (reference: PathReference, tree: Tree): boolean =>
  reference.candidates.some((candidate) => hasPath(tree, candidate));

/**
 * What is wrong with one document, given the references in it that resolve
 * nowhere: those neither ignored by git (nor past a symlink) nor declared, and
 * the declarations that excuse no such reference.
 */
export const judgeDocument = ({
  unresolved,
  declared,
  gitIgnored,
}: Readonly<{
  unresolved: readonly PathReference[];
  declared: readonly string[];
  gitIgnored: ReadonlySet<string>;
}>): Readonly<{
  broken: readonly PathReference[];
  staleDeclarations: readonly string[];
}> => {
  const failing = unresolved.filter(({ candidates }) =>
    candidates.every((candidate) => !gitIgnored.has(candidate)),
  );

  const declaredSet = new Set(declared);

  return {
    broken: failing.filter(({ written }) => !declaredSet.has(written)),
    staleDeclarations: declared.filter((entry) =>
      failing.every(({ written }) => written !== entry),
    ),
  };
};

/** Each workspace package's name, and the directories that declare it. */
export type PackageDirs = ReadonlyMap<string, readonly string[]>;

/** A code span read as a repository path. */
export type PathReference = Readonly<{
  /** 1-based. */
  line: number;
  /** The path as written, less a trailing `/`, `:12` or `#anchor`. */
  written: string;
  /**
   * What it may mean, from the repository root: the path read from each place
   * it may be read from.
   */
  candidates: readonly string[];
}>;

type CheckSummary = Readonly<{
  files: number;
  paths: number;
}>;

/**
 * `:12`, `:12:3` or `#anchor` at the end, which locate within the file. An
 * anchor is anything after `#`, a Japanese heading's included.
 */
const LOCATION_SUFFIX = /:[\d:]*$|#.*$/u;

/** One segment of a path: no space, no glob, no placeholder, no quote. */
const SEGMENT = /^[\w.@+-]+$/u;

/** `.`, `..`, `...` — a relative step or an ellipsis, not a name. */
const DOTS_ONLY = /^\.+$/u;

const DECLARATION = /<!--\s*doc-paths-ignore:(?<paths>[^>]*?)-->/gu;

/**
 * A package name, bare or in backticks, its possessive (`'s`, `’s`, or `の`),
 * and a one-segment file name in backticks, a trailing `:12` or `#anchor`
 * allowed: "synstate's `NEXT_MAJOR.md`", "`synstate` の `NEXT_MAJOR.md`". The
 * name starts where a word does.
 */
const POSSESSIVE =
  /(?<![\w@/.-])(?:`(?<quoted>@?[\w./-]+)`|(?<bare>@?[\w./-]+))(?:['’]s\s+|\s*の\s*)(?<span>`(?<file>[\w.-]+\.md)(?<suffix>(?=[`#:])[^`]*)`)/gu;

/** What may follow a placed file name in its span: nothing, `:12` or `#x`. */
const LOCATION = /^(?:|:[\d:]+|#.*)$/u;

/**
 * The directories a path in `relativePath` may be read from: the root, the
 * document's package (the nearest directory above it with a `package.json`) and
 * its own directory, each once.
 */
const basesOf = (relativePath: string, tree: Tree): readonly string[] => {
  const directory = path.posix.dirname(relativePath);

  if (directory === '.' || isSitePage(relativePath)) {
    return [''];
  }

  const packageDir = Arr.generate(function* () {
    for (
      let mut_dir = directory;
      mut_dir !== '.';
      mut_dir = path.posix.dirname(mut_dir)
    ) {
      yield mut_dir;
    }
  }).find((dir) => tree.files.has(`${dir}/package.json`));

  return Arr.uniq(['', packageDir ?? '', directory]);
};

/** A path as written, less a trailing `/`, `:12` or `#anchor`. */
const normalize = (written: string): string =>
  written.trim().replace(LOCATION_SUFFIX, '').replace(/\/+$/u, '');

const toReference = (
  code: string,
  bases: readonly string[],
  tree: Tree,
): StrictOmit<PathReference, 'line'> | undefined => {
  const written = normalize(code);

  const segments = written.split('/');

  const [first] = segments;

  if (
    first === undefined ||
    segments.length < 2 ||
    segments.some(
      (segment) => !SEGMENT.test(segment) || DOTS_ONLY.test(segment),
    )
  ) {
    return undefined;
  }

  if (bases.every((base) => !hasPath(tree, path.posix.join(base, first)))) {
    return undefined;
  }

  const candidates = bases.map((base) => path.posix.join(base, written));

  return candidates.some(isUnderExperimental)
    ? undefined
    : { written, candidates };
};

/**
 * The file names that a package name on one line places, each as the paths from
 * the root it may mean (one per directory declaring the name). The sentence may
 * go on into `following`, the next line with its line break.
 */
const possessiveReferences = (
  text: string,
  following: string,
  packages: PackageDirs,
): readonly StrictOmit<PathReference, 'line'>[] => {
  const joined = `${text}${following}` as const;

  const matches = Array.from(joined.matchAll(POSSESSIVE)).filter(
    (match) =>
      match.index < text.length &&
      packages.has(match.groups?.['quoted'] ?? match.groups?.['bare'] ?? '') &&
      LOCATION.test(match.groups?.['suffix'] ?? ''),
  );

  if (!Arr.isNonEmpty(matches)) {
    return [];
  }

  const spans = codeSpanRanges(joined);

  return matches.flatMap((match) => {
    const name = match.groups?.['quoted'] ?? match.groups?.['bare'] ?? '';

    const file = match.groups?.['file'] ?? '';

    const span = match.groups?.['span'] ?? '';

    const dirs = packages.get(name);

    const spanStart = match.index + match[0].length - span.length;

    // The file name has to be a code span of its own, and the sentence not
    // inside one: a sentence shown as code is an example.
    const isFileSpan = spans.some(
      ({ start, end }) =>
        start === spanStart && end === spanStart + span.length,
    );

    const isExample = spans.some(
      ({ start, end }) => start < match.index && match.index < end,
    );

    if (dirs === undefined || !isFileSpan || isExample) {
      return [];
    }

    const candidates = dirs.map((dir) => path.posix.join(dir, file));

    const [written] = candidates;

    return written === undefined ? [] : [{ written, candidates }];
  });
};

/** The `workspaces` globs of the root `package.json`, or none. */
const workspacesOf = (manifestText: string): readonly string[] => {
  const parsed = Json.parse(manifestText);

  if (Result.isErr(parsed)) {
    return [];
  }

  const manifest = parsed.value;

  return isRecord(manifest) &&
    hasKey(manifest, 'workspaces') &&
    Arr.isArray(manifest.workspaces)
    ? manifest.workspaces.filter(isString)
    : [];
};

/** The `name` of a `package.json`, or `undefined` when it has none. */
const nameOf = (manifestText: string): string | undefined => {
  const parsed = Json.parse(manifestText);

  if (Result.isErr(parsed)) {
    return undefined;
  }

  const manifest = parsed.value;

  return isRecord(manifest) &&
    hasKey(manifest, 'name') &&
    isString(manifest.name)
    ? manifest.name
    : undefined;
};

/** Whether a proper prefix of `relativePath` is a symlink on disk. */
const goesPastASymlink = (relativePath: string): boolean =>
  Arr.butLast(relativePath.split('/')).some(
    (_, index, segments) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs
        .lstatSync(
          path.resolve(projectRootPath, segments.slice(0, index + 1).join('/')),
          { throwIfNoEntry: false },
        )
        ?.isSymbolicLink() === true,
  );

/**
 * Which of `candidates` the repository's ignore files match. One `git
 * check-ignore` for all of them; it exits 1 when it matched none. The user's
 * own `core.excludesFile` is not read, so that the answer is CI's.
 *
 * Each is asked about twice, as written and with a trailing `/`: a path that is
 * not there is taken for a file, which a directory-only pattern
 * (`node_modules/`, `/libs/ts-data-forge/docs/`) does not match, so without the
 * second form the answer would depend on what had been built.
 *
 * A path that goes on past a symlink on disk is not asked about — git refuses
 * the question — and is returned with the ignored ones: the tree does not
 * describe what a link points at.
 */
const listGitIgnored = async (
  candidates: readonly string[],
): Promise<Result<ReadonlySet<string>, string>> => {
  const pastASymlink = candidates.filter(goesPastASymlink);

  const asked = candidates.filter((candidate) => !goesPastASymlink(candidate));

  if (!Arr.isNonEmpty(asked)) {
    return Result.ok(new Set<string>(pastASymlink));
  }

  const result = await runFile(
    'git',
    ['-c', 'core.excludesFile=/dev/null', 'check-ignore', '--stdin', '-z'],
    {
      cwd: projectRootPath,
      input: asked.flatMap((c) => [c, `${c}/`]).join('\0'),
    },
  );

  if (result.error !== undefined) {
    return Result.err(
      `git check-ignore could not run: ${unknownToString(result.error)}`,
    );
  }

  if (result.status !== 0 && result.status !== 1) {
    return Result.err(`git check-ignore failed: ${result.stderr.trim()}`);
  }

  const ignored = result.stdout
    .split('\0')
    .filter((entry) => entry !== '')
    .map((entry) => entry.replace(/\/$/u, ''));

  return Result.ok(new Set<string>([pastASymlink, ignored].flat()));
};

const formatFindings = (
  findings: readonly Readonly<{
    relativePath: string;
    broken: readonly PathReference[];
    staleDeclarations: readonly string[];
  }>[],
): string =>
  [
    '❌ The repository paths these documents name are not there:',
    '',
    ...findings.flatMap(({ relativePath, broken, staleDeclarations }) => [
      ...broken.map(
        ({ line, written, candidates }) =>
          `  ${relativePath}:${line}  \`${written}\`\n      looked for ${candidates.join(', ')}`,
      ),
      ...staleDeclarations.map(
        (entry) =>
          `  ${relativePath}  doc-paths-ignore: ${entry}\n      declared absent, but nothing in the document fails on it any more`,
      ),
    ]),
    '',
    'Write the path as it is now; reword what names a thing that is gone. A',
    'path that is meant not to be there (one elsewhere, one planned, one',
    'removed on purpose) is declared in the document, as written:',
    '`<!-- doc-paths-ignore: <path> -->`. Delete a declaration reported here.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDocPaths().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every repository path the documents name is there (${result.value.paths} paths in ${result.value.files} files).`,
  );
}
