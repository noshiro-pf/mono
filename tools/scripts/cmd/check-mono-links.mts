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
 *   a file that has. One on any other ref fails unless the ref is a full
 *   40-character commit SHA, which is not read: it says what it meant when it
 *   was written. A branch can be renamed or deleted (`develop` was, leaving
 *   the articles that named it dead), and a short SHA cannot be told from a
 *   branch name. Resolving a branch against the remote is not done: a
 *   `check:prose` guard does not depend on the network.
 * - a relative link (`[x](../../libs/synstate)`, `[y](docs/a.md)`) in any of
 *   the repository's own Markdown documents, which GitHub and npm render as
 *   they are — `isRepositoryProse` in `tools/scripts/lib/repo-files.mts` says
 *   which those are and why the rest are left out. The docs sites' own pages
 *   are left out too: their relative links are routes of the built site, not
 *   paths in the tree. A relative link is read in four forms: `[text](path)`,
 *   with or without a title, a reference definition `[label]: path`, and the
 *   `href` of an HTML `<a>` or the `src` of an `<img>`. A link inside code — a
 *   fence or a code span — is an example and is not read.
 *
 * The tracked tree, not the file system, is what a link is resolved against,
 * because GitHub has only what is committed: a link to an untracked `dist/`
 * file works locally and nowhere else.
 *
 * The Zenn content, `articles/*.md` and every `.md` under `books/`, is read for its
 * absolute URLs alone: Zenn publishes it from here, so a URL in it is read by
 * every reader of the article, and its relative links are Zenn's to resolve,
 * not GitHub's. `isRepositoryProse` stays false for it, so the other prose
 * guards leave published text alone.
 *
 * A link on `main` into `experimental/` is not resolved, for the reason
 * `isUnderExperimental` gives; one on another ref still fails.
 *
 * A URL with a placeholder in its path or ref (`{path}`, `${…}`) is a template,
 * and is not read. Heading anchors are not checked:
 * GitHub's slugs are its own and change with the heading.
 *
 * External URLs are not this check's business; `link-check.yml` runs lychee
 * over the Markdown and MDX of {@link SCOPE_PATTERN} (not the rest of the
 * repository's Markdown) on a schedule, where a site that is down for an hour
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
      if (link.ref === undefined && isUnderExperimental(link.target)) {
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
 * Every link in `fileText` that this check resolves, line by line.
 * `relativePath` is the file's path from the repository root; it is what a
 * relative link is resolved from and what decides whether relative links are
 * read at all.
 */
export const findMonoLinks = (
  fileText: string,
  relativePath: string,
): readonly MonoLink[] => {
  const readsRelative =
    isRepositoryProse(relativePath) && !isSitePage(relativePath);

  return markdownLines(fileText).flatMap(({ line, text, fenced }) => [
    ...Array.from(text.matchAll(MONO_URL), (matched) =>
      toAbsoluteLink(
        matched[0],
        matched.groups?.['ref'] ?? '',
        matched.groups?.['rest'] ?? '',
        line,
      ),
    ).filter((link) => link !== undefined),
    // A link written in code is an example of one, and is not rendered.
    ...(readsRelative && !fenced
      ? relativeDestinations(withoutCodeSpans(text))
          .map((destination) => toRelativeLink(destination, line, relativePath))
          .filter((link) => link !== undefined)
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
  if (link.ref !== undefined) {
    return `names the ref \`${link.ref}\`, neither main nor a full commit SHA: a branch can be renamed or deleted`;
  }

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

/**
 * Whether the links of the tracked file at `relativePath` are read: the
 * repository's own Markdown, the Zenn content's Markdown (its absolute URLs
 * alone), and the files {@link isInScope} with a scanned extension.
 */
export const isScanned = (relativePath: string): boolean =>
  isRepositoryProse(relativePath) ||
  ZENN_CONTENT.test(relativePath) ||
  (isInScope(relativePath) &&
    SCANNED_EXTENSIONS.has(path.extname(relativePath)));

/**
 * Whether `relativePath` is in {@link SCOPE_PATTERN}, changelogs aside: the
 * files whose links are read besides the repository's own Markdown, and whose
 * external ones `link-check.yml` checks.
 */
export const isInScope = (relativePath: string): boolean =>
  SCOPE_PATTERN.test(relativePath) &&
  path.basename(relativePath) !== 'CHANGELOG.md';

export type MonoLink = Readonly<{
  /** 1-based. */
  line: number;
  /** The link as written. */
  written: string;
  /** The path it points at, from the repository root, with no trailing `/`. */
  target: string;
  lines: Readonly<{ first: number; last: number }> | undefined;
  /**
   * For an absolute URL on a ref other than `main` (and not a full commit SHA,
   * which is not read), that ref; `undefined` otherwise. Such a link fails
   * whatever its path.
   */
  ref: string | undefined;
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
 * Markdown: the docs sites and the SynState packages, whose code builds links
 * to source files. A docs site is matched by its directory's `-docs` suffix, so
 * that a new one is read with no edit here. `link-check.yml` checks the external
 * links of the same scope, held to it by `check:prose:link-check-scope`.
 */
export const SCOPE_PATTERN =
  /^(?:apps\/[^/]+-docs|libs\/synstate[^/]*|libs\/eslint-plugin-synstate)\//u;

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
 * An absolute URL into this repository on any ref, up to whitespace, a quote, a
 * bracket or a backtick: the ref is judged after the match. The query and the
 * fragment are split off after.
 */
const MONO_URL =
  /https:\/\/github\.com\/noshiro-pf\/mono\/(?:blob|tree|raw|edit)\/(?<ref>[^/\s"'`<>()[\]]+)\/(?<rest>[^\s"'`<>()[\]]+)/gu;

/** A full commit SHA, the one ref besides `main` that cannot move. */
const FULL_SHA = /^[\da-f]{40}$/u;

/** The Markdown Zenn publishes: `articles/*.md` and every `.md` under `books/`. */
const ZENN_CONTENT = /^(?:articles\/[^/]+|books\/.+)\.md$/u;

/** A Markdown link or image with no title: `[x](./a.md)`. */
const MARKDOWN_LINK = /\]\(([^\s()]+)\)/gu;

/** `[x](./a.md "title")`, `[x](a.md 'title')`, `[x](a.md (title))`. */
const TITLED_LINK = /\]\(([^\s()]+)\s+(?:"[^"]*"|'[^']*'|\([^()]*\))\s*\)/gu;

/**
 * `[x]: ./a.md`, `[x]: <./a.md> "title"`. Not a footnote (`[^1]: …`), and
 * nothing but an optional title may follow the destination, so
 * `[x]: See the docs` is prose.
 */
const REFERENCE_DEFINITION =
  // Read by its line alone: a line of this shape that continues a paragraph is
  // read too, though it is prose, and fails only on a path that does not exist;
  // a definition behind `>` or indented four spaces or more is not read.
  /^ {0,3}\[(?!\^)[^\]]+\]:\s*<?([^\s>]+)>?(?:\s+"[^"]*"|\s+'[^']*'|\s+\([^()]*\)|)\s*$/gu;

/** `<a href="./a.md">`, `<img src="img/a.png" />`. */
const HTML_LINK =
  // Read by its line alone, and quoted: a tag split over lines, `href = "…"`
  // with spaces and an unquoted value are not read. Only the first `href` or
  // `src` of a tag is read, and as written: a character reference (`&amp;`) is
  // not decoded, and one inside an earlier attribute's value is read in place
  // of the real one.
  /<(?:a|img)\b[^>]*?\s(?:href|src)=(?:"([^"]+)"|'([^']+)')/giu;

/**
 * The start of a destination that is not a relative path: a URL scheme
 * (`https:`, `mailto:`), an anchor in the same document, a path from a site's
 * root, `<…>`.
 */
const NOT_RELATIVE = /^(?:[a-z][\d+.a-z-]*:|[#/<])/iu;

const DIGITS = /^\d+$/u;

/** Prose punctuation that follows a bare URL rather than belonging to it. */
const TRAILING_PUNCTUATION = /[.,;:!]+$/u;

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

/** `matchedText` as {@link MONO_URL} matched it, with its `ref` and `rest` groups. */
const toAbsoluteLink = (
  matchedText: string,
  ref: string,
  rest: string,
  line: number,
): MonoLink | undefined => {
  if (FULL_SHA.test(ref) || isTemplate(ref)) {
    return undefined;
  }

  const written = matchedText.replace(TRAILING_PUNCTUATION, '');

  const { linkPath, fragment } = splitFragment(
    rest.replace(TRAILING_PUNCTUATION, ''),
  );

  const target = decodePath(linkPath).replace(/\/+$/u, '');

  return isTemplate(target)
    ? undefined
    : {
        line,
        written,
        target,
        lines: toLineRange(fragment),
        ref: ref === 'main' ? undefined : ref,
      };
};

/**
 * The relative destinations of the links on one line, form by form; each
 * pattern captures the destination in group 1, or in group 2 for an HTML
 * attribute in single quotes.
 */
const relativeDestinations = (lineText: string): readonly string[] =>
  [MARKDOWN_LINK, TITLED_LINK, REFERENCE_DEFINITION, HTML_LINK]
    .flatMap((pattern) =>
      Array.from(
        lineText.matchAll(pattern),
        (matched) => matched[1] ?? matched[2],
      ),
    )
    .filter((destination) => destination !== undefined)
    .filter((destination) => !NOT_RELATIVE.test(destination));

const toRelativeLink = (
  written: string,
  line: number,
  relativePath: string,
): MonoLink | undefined => {
  const { linkPath, fragment } = splitFragment(written);

  const target = path.posix
    .join(path.posix.dirname(relativePath), decodePath(linkPath))
    .replace(/\/+$/u, '');

  return isTemplate(target)
    ? undefined
    : { line, written, target, lines: toLineRange(fragment), ref: undefined };
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
    'Point each one at where the file is now, on main. A file that is gone for',
    'good can be linked at the last commit that had it, by its full SHA',
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
