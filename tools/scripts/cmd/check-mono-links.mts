import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { markdownLines, withoutCodeSpans } from '../lib/markdown.mjs';
import {
  isRepositoryProse,
  isSitePage,
  isUnderExperimental,
  listTrackedFiles,
  readRepositoryFile,
  toTree,
  type Tree,
} from '../lib/repo-files.mjs';

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
 * - a relative link (`[x](../../libs/synstate)`, `[y](docs/a.md)`) in any of
 *   the repository's own Markdown documents, which GitHub and npm render as
 *   they are — `isRepositoryProse` in `tools/scripts/lib/repo-files.mts` says
 *   which those are and why the rest are left out. The docs sites' own pages
 *   are left out too: their relative links are routes of the built site, not
 *   paths in the tree. Only the inline form `[text](path)` with no title is
 *   read; a reference definition, a link with a title and an HTML `href` are
 *   not. A link inside code — a fence or a code span — is an example and is
 *   not read either.
 *
 * The tracked tree, not the file system, is what a link is resolved against,
 * because GitHub has only what is committed: a link to an untracked `dist/`
 * file works locally and nowhere else.
 *
 * A link into `experimental/` is not resolved, for the reason
 * `isUnderExperimental` gives.
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
      const readResult = await readRepositoryFile(relativePath);

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
      if (isUnderExperimental(link.target)) {
        continue;
      }

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
  const readsRelative =
    isRepositoryProse(relativePath) && !isSitePage(relativePath);

  return markdownLines(fileText).flatMap(({ line, text, fenced }) => [
    ...Array.from(text.matchAll(MONO_URL), (matched) =>
      toAbsoluteLink(matched[0], line),
    ).filter((link) => link !== undefined),
    // A link written in code is an example of one, and is not rendered.
    ...(readsRelative && !fenced
      ? Array.from(
          withoutCodeSpans(text).matchAll(MARKDOWN_RELATIVE_LINK),
          (matched) => toRelativeLink(matched[0], line, relativePath),
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

export type MonoLink = Readonly<{
  /** 1-based. */
  line: number;
  /** The link as written. */
  written: string;
  /** The path it points at, from the repository root, with no trailing `/`. */
  target: string;
  lines: Readonly<{ first: number; last: number }> | undefined;
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
 * The files whose absolute URLs are read besides the repository's own
 * Markdown: the SynState docs site and the SynState packages, whose code
 * builds links to source files.
 */
const SCOPE_PATTERN =
  /^(?:apps\/synstate-docs|libs\/synstate[^/]*|libs\/eslint-plugin-synstate)\//u;

/** The extensions worth reading. Everything else is binary. */
const SCANNED_EXTENSIONS: ReadonlySet<string> = new Set<string>([
  '.astro',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);

/**
 * An absolute URL into this repository on `main`, up to whitespace, a quote,
 * a bracket or a backtick. The query and the fragment are split off after.
 */
const MONO_URL =
  /https:\/\/github\.com\/noshiro-pf\/mono\/(?:blob|tree|raw|edit)\/main\/[^\s"'`<>()[\]]+/gu;

/** What comes before a path in {@link MONO_URL}. */
const BRANCH_SEGMENT = '/main/';

/**
 * A Markdown link or image whose destination is a relative path: not a URL
 * with a scheme (`https:`, `mailto:`), not an anchor in the same document, not
 * a path from a site's root, not `<…>`.
 */
const MARKDOWN_RELATIVE_LINK = /\]\((?![a-z][\d+.a-z-]*:|[#/<])[^\s()]+\)/giu;

const DIGITS = /^\d+$/u;

/** Prose punctuation that follows a bare URL rather than belonging to it. */
const TRAILING_PUNCTUATION = /[.,;:!]+$/u;

const isScanned = (relativePath: string): boolean =>
  isRepositoryProse(relativePath) ||
  (SCOPE_PATTERN.test(relativePath) &&
    SCANNED_EXTENSIONS.has(path.extname(relativePath)) &&
    path.basename(relativePath) !== 'CHANGELOG.md');

const isTemplate = (target: string): boolean =>
  target.includes('{') || target.includes('$');

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

const countLines = async (relativePath: string): Promise<number> => {
  const readResult = await readRepositoryFile(relativePath);

  if (Result.isErr(readResult)) {
    return 0;
  }

  const text = readResult.value;

  return text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
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
