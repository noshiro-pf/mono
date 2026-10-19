import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { $, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a link to a file in this repository points at a path `main` no
 * longer has.
 *
 * Moving or renaming a source file breaks every documentation link to it, and
 * nothing else notices: the docs site builds, the README renders, and the link
 * is a 404 the first reader finds. So two kinds of link are read and resolved
 * against the tracked tree:
 *
 * - an absolute GitHub URL into this repository on `main`
 *   (`https://github.com/noshiro-pf/mono/blob/main/<path>`, and `tree`, `raw`,
 *   `edit`). A line anchor (`#L10`, `#L10-L20`) also has to fall inside the
 *   file, because a link to a line that has moved away is as broken as one to
 *   a file that has.
 * - a relative link in a Markdown file that GitHub and npm render as it is
 *   (`[x](../../libs/synstate)`). The docs site's own pages are left out:
 *   their relative links are routes of the built site, not paths in the tree.
 *
 * The tracked tree, not the file system, is what a link is resolved against,
 * because GitHub has only what is committed: a link to an untracked `dist/`
 * file works locally and nowhere else.
 *
 * A URL pinned to a commit or another branch is not read; it says what it
 * meant when it was written. A URL with a placeholder in its path
 * (`{path}`, `${…}`) is a template, and is not read either. Heading anchors
 * are not checked: GitHub's slugs are its own and change with the heading.
 *
 * External URLs are not this check's business; `link-check.yml` runs lychee
 * over the same files on a schedule, where a site that is down for an hour
 * fails nothing anyone has to merge.
 */
export const checkMonoLinks = async (): Promise<
  Result<CheckSummary, string>
> => {
  const trackedResult = await listTrackedFiles();

  if (Result.isErr(trackedResult)) {
    return Result.err(trackedResult.value);
  }

  const tracked = trackedResult.value;

  const tree = toTree(tracked);

  const scanned = tracked.filter(isScanned);

  const results = await Promise.all(
    scanned.map(async (relativePath) => {
      const readResult = await readTracked(relativePath);

      return Result.isErr(readResult)
        ? readResult
        : Result.ok({
            relativePath,
            links: findMonoLinks(readResult.value, relativePath),
          });
    }),
  );

  const firstError = results.find(Result.isErr);

  if (firstError !== undefined) {
    return Result.err(firstError.value);
  }

  const visited = Arr.generate(function* () {
    for (const result of results) {
      if (!Result.isErr(result)) {
        yield result.value;
      }
    }
  });

  const mut_lineCounts = new Map<string, number>();

  const mut_broken: BrokenLink[] = [];

  for (const { relativePath, links } of visited) {
    for (const link of links) {
      const reason = await brokenReason(link, tree, mut_lineCounts);

      if (reason !== undefined) {
        mut_broken.push({ relativePath, link, reason });
      }
    }
  }

  const total = visited.reduce((count, { links }) => count + links.length, 0);

  return Arr.isNonEmpty(mut_broken)
    ? Result.err(formatBroken(mut_broken))
    : Result.ok({ files: scanned.length, links: total });
};

/**
 * Every link in `fileText` that this check resolves, in the order they are
 * read. `relativePath` is the file's path from the repository root; it is
 * what a relative link is resolved from and what decides whether relative
 * links are read at all.
 */
export const findMonoLinks = (
  fileText: string,
  relativePath: string,
): readonly MonoLink[] => {
  const lines = fileText.split('\n');

  const readsRelative =
    MARKDOWN_EXTENSIONS.has(path.extname(relativePath)) &&
    !relativePath.startsWith(SITE_PAGES_PREFIX);

  return lines.flatMap((lineText, index) => [
    ...Array.from(lineText.matchAll(MONO_URL), (matched) =>
      toAbsoluteLink(matched[0], index + 1),
    ).filter((link) => link !== undefined),
    ...(readsRelative
      ? Array.from(lineText.matchAll(MARKDOWN_RELATIVE_LINK), (matched) =>
          toRelativeLink(matched[0], index + 1, relativePath),
        ).filter((link) => link !== undefined)
      : []),
  ]);
};

/**
 * Why `link` does not resolve against `tree`, or `undefined` when it does.
 * `mut_lineCounts` caches the length of each file a line anchor is checked
 * against.
 */
export const brokenReason = async (
  link: MonoLink,
  tree: Tree,
  mut_lineCounts: Map<string, number>,
): Promise<string | undefined> => {
  const isFile = tree.files.has(link.target);

  if (!isFile && !tree.directories.has(link.target)) {
    return 'no such path on main';
  }

  if (link.lines === undefined) {
    return undefined;
  }

  if (!isFile) {
    return 'a line anchor on a directory';
  }

  const lineCount =
    mut_lineCounts.get(link.target) ?? (await countLines(link.target));

  mut_lineCounts.set(link.target, lineCount);

  return link.lines.last > lineCount
    ? `line ${link.lines.last} is past the end of the file (${lineCount} lines)`
    : undefined;
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

export type MonoLink = Readonly<{
  /** 1-based. */
  line: number;
  /** The link as written. */
  written: string;
  /** The path it points at, from the repository root, with no trailing `/`. */
  target: string;
  lines: Readonly<{ first: number; last: number }> | undefined;
}>;

export type Tree = Readonly<{
  files: ReadonlySet<string>;
  directories: ReadonlySet<string>;
}>;

type BrokenLink = Readonly<{
  relativePath: string;
  link: MonoLink;
  reason: string;
}>;

type CheckSummary = Readonly<{
  files: number;
  links: number;
}>;

/**
 * The files read: the SynState docs site and the SynState packages, the
 * places a moved source file is linked from.
 */
const SCOPE_PATTERN =
  /^(?:apps\/synstate-docs|libs\/synstate[^/]*|libs\/eslint-plugin-synstate)\//u;

/**
 * The docs site's pages, whose relative links are routes of the built site.
 */
const SITE_PAGES_PREFIX = 'apps/synstate-docs/src/';

/** The extensions worth reading. Everything else is binary. */
const SCANNED_EXTENSIONS: ReadonlySet<string> = new Set([
  '.astro',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);

const MARKDOWN_EXTENSIONS: ReadonlySet<string> = new Set(['.md', '.mdx']);

/**
 * An absolute URL into this repository on `main`, up to whitespace, a quote,
 * a bracket or a backtick. The query and the fragment are split off after.
 */
const MONO_URL =
  /https:\/\/github\.com\/noshiro-pf\/mono\/(?:blob|tree|raw|edit)\/main\/[^\s"'`<>()[\]]+/gu;

/** What comes before a path in {@link MONO_URL}. */
const BRANCH_SEGMENT = '/main/';

/** A Markdown link or image whose destination starts with `./` or `../`. */
const MARKDOWN_RELATIVE_LINK = /\]\(\.\.?\/[^\s()]*\)/gu;

const DIGITS = /^\d+$/u;

/** Prose punctuation that follows a bare URL rather than belonging to it. */
const TRAILING_PUNCTUATION = /[.,;:!]+$/u;

const isScanned = (relativePath: string): boolean =>
  SCOPE_PATTERN.test(relativePath) &&
  SCANNED_EXTENSIONS.has(path.extname(relativePath)) &&
  path.basename(relativePath) !== 'CHANGELOG.md';

const isTemplate = (target: string): boolean =>
  target.includes('{') || target.includes('$');

const toAbsoluteLink = (
  matchedText: string,
  line: number,
): MonoLink | undefined => {
  const written = matchedText.replace(TRAILING_PUNCTUATION, '');

  const { linkPath, fragment } = splitFragment(
    written.slice(written.indexOf(BRANCH_SEGMENT) + BRANCH_SEGMENT.length),
  );

  const target = decodePath(linkPath).replace(/\/+$/u, '');

  return isTemplate(target)
    ? undefined
    : { line, written, target, lines: toLineRange(fragment) };
};

const toRelativeLink = (
  matchedText: string,
  line: number,
  relativePath: string,
): MonoLink | undefined => {
  // `](` and `)`.
  const written = matchedText.slice(2, -1);

  const { linkPath, fragment } = splitFragment(written);

  const target = path.posix
    .join(path.posix.dirname(relativePath), decodePath(linkPath))
    .replace(/\/+$/u, '');

  return isTemplate(target)
    ? undefined
    : { line, written, target, lines: toLineRange(fragment) };
};

/** The path of a link, and its fragment when it has one; the query goes. */
const splitFragment = (
  link: string,
): Readonly<{ linkPath: string; fragment: string | undefined }> => {
  const hashIndex = link.indexOf('#');

  const beforeHash = hashIndex === -1 ? link : link.slice(0, hashIndex);

  const queryIndex = beforeHash.indexOf('?');

  return {
    linkPath: queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex),
    fragment: hashIndex === -1 ? undefined : link.slice(hashIndex + 1),
  };
};

/** `L10`, `L10C3`, `L10-L20` or `L10C3-L20C8`; anything else is no range. */
const toLineRange = (
  fragment: string | undefined,
): MonoLink['lines'] | undefined => {
  if (fragment === undefined) {
    return undefined;
  }

  const ends = fragment.split('-');

  if (ends.length > 2) {
    return undefined;
  }

  // One end is `L10` or `L10C3`; the column is read past, not resolved.
  const lineNumbers = ends.map((end) => {
    const [lineText = '', ...columns] = end.slice(1).split('C');

    return end.startsWith('L') &&
      DIGITS.test(lineText) &&
      Arr.isMaxLengthArray(1, columns) &&
      columns.every((column) => DIGITS.test(column))
      ? Result.unwrapOkOr(Num.safeParseFloat(lineText), Number.NaN)
      : Number.NaN;
  });

  if (!lineNumbers.every(Number.isSafeInteger)) {
    return undefined;
  }

  const first = lineNumbers[0] ?? 0;

  return { first, last: Math.max(first, lineNumbers.at(-1) ?? first) };
};

const decodePath = (encoded: string): string => {
  const decoded = Result.fromThrowable(() => decodeURI(encoded));

  return Result.isErr(decoded) ? encoded : decoded.value;
};

const countLines = async (relativePath: string): Promise<number> => {
  const readResult = await readTracked(relativePath);

  if (Result.isErr(readResult)) {
    return 0;
  }

  const text = readResult.value;

  return text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
};

/**
 * The tracked files, asked of git rather than of a glob, for the reason given
 * at the top: GitHub has what is committed and nothing else.
 */
const listTrackedFiles = async (): Promise<
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
    result.value.stdout.split('\0').filter((file) => file !== ''),
  );
};

const readTracked = async (
  relativePath: string,
): Promise<Result<string, string>> => {
  const readResult = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(projectRootPath, relativePath), 'utf8'),
  );

  return Result.isErr(readResult)
    ? Result.err(
        `Failed to read ${relativePath}: ${unknownToString(readResult.value)}`,
      )
    : readResult;
};

const formatBroken = (broken: readonly BrokenLink[]): string =>
  [
    `❌ ${broken.length} link(s) to this repository do not resolve on main:`,
    '',
    ...broken.map(
      ({ relativePath, link, reason }) =>
        `  ${relativePath}:${link.line}  ${link.written}\n      ${reason}`,
    ),
    '',
    'Point each one at where the file is now. A file that is gone for good',
    'can be linked at the last commit that had it',
    '(`git log -1 --format=%H -- <path>`, then its parent), which this check',
    'does not read.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkMonoLinks().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every link to this repository resolves on main (${result.value.links} links in ${result.value.files} files).`,
  );
}
