import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { $, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when something names a section of `CLAUDE.md` that is not there.
 *
 * Every rule moved out of `CLAUDE.md` and into the file it is about leaves a
 * pointer behind, and a pointer is the one kind of prose that can be wrong
 * without being unclear: `see "CI diff gates" in CLAUDE.md` reads perfectly
 * and sends the reader to a heading that was renamed. Nothing else notices —
 * the file it names exists, the sentence parses, and the reader who does not
 * already know the rule is exactly the reader who cannot tell. Thirteen such
 * pointers had accumulated by the time this was written, all from one pass
 * that shortened the headings.
 *
 * A citation is read in four shapes, and nothing else is read at all:
 *
 * - `CLAUDE.md, "Dependencies"` — and the run of headings that may follow it,
 *   as `CLAUDE.md`'s: "A", "B" and "C".
 * - `"Dependencies" in CLAUDE.md`, with an optional `the root` before the
 *   name.
 * - `CLAUDE.md の「CI」節`, where the trailing 節 is what makes it a citation
 *   rather than a quoted rule — `CLAUDE.md の「 `skip-ci` を付けてから
 *   auto-merge を武装する」` in release.yml quotes a sentence, not a heading,
 *   and is left alone.
 * - `see "Japanese text"` inside `CLAUDE.md` itself, which is how its sections
 *   point at each other.
 *
 * Backticks are ignored on both sides, so `see "strict-lib/"` finds the
 * heading written `` ### `strict-lib/` ``. Case is not: a heading quoted with
 * the wrong case is a quotation of something that was never written.
 *
 * Lines are joined before scanning, with a leading `//`, `*` or `#` dropped,
 * so a citation that wraps across two comment lines still reads as one.
 */
export const checkClaudeMdReferences = async (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const claudeMd = yield* Result.safeUnwrap(
      await readRepositoryFile(CLAUDE_MD),
    );

    const headings = collectHeadings(claudeMd);

    const files = yield* Result.safeUnwrap(await collectScannedFiles());

    const results = await Promise.all(files.map(async (file) => visit(file)));

    const firstError = results.find(Result.isErr);

    if (firstError !== undefined) return Result.err(firstError.value);

    const citations = results.flatMap((result) =>
      Result.isErr(result) ? [] : result.value,
    );

    const violations = citations.filter(({ heading }) =>
      headings.every((h) => !sameHeading(h, heading)),
    );

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations, headings))
      : Result.ok({ files: files.length, citations: citations.length });
  });

/** The headings of `CLAUDE.md`, in the order they are written. */
export const collectHeadings = (claudeMd: string): readonly string[] =>
  claudeMd
    .split('\n')
    .flatMap((line) => {
      const heading = HEADING.exec(line)?.groups?.['heading'];

      return heading === undefined ? [] : [heading.trim()];
    })
    .toSorted();

/**
 * Every section of `CLAUDE.md` that `fileText` claims to send a reader to.
 *
 * `selfReferences` is on for `CLAUDE.md` itself, where a pointer names no
 * file and `see "…"` is the whole of the form.
 */
export const collectCitations = (
  fileText: string,
  options: Readonly<{ selfReferences?: boolean }> = {},
): readonly string[] => {
  const flattened = flatten(fileText);

  const trailing = Array.from(flattened.matchAll(MENTION)).flatMap((match) =>
    quotedRunFrom(flattened.slice(match.index + match[0].length)),
  );

  const named = [
    Array.from(flattened.matchAll(CITATION_LEADING)),
    Array.from(flattened.matchAll(CITATION_JAPANESE)),
    options.selfReferences === true
      ? Array.from(flattened.matchAll(CITATION_SELF))
      : [],
  ]
    .flat()
    .flatMap((match) => {
      const heading = match.groups?.['heading'];

      return heading === undefined ? [] : [heading];
    });

  return [trailing, named].flat().map((heading) => heading.trim());
};

/** A heading quoted somewhere, with the file that quotes it. */
export type Citation = Readonly<{
  file: string;
  heading: string;
}>;

type CheckSummary = Readonly<{
  files: number;
  citations: number;
}>;

const CLAUDE_MD = 'CLAUDE.md';

const HEADING = /^#{1,6}\s+(?<heading>.+)$/u;

/** The file naming itself, before the headings it goes on to quote. */
const MENTION = /`?CLAUDE\.md`?(?:'s)?[:,]?(?: の)?/gu;

/** One quoted heading and what joins it to the next: `"A", ` or `"B" and `. */
const QUOTED_HEAD = /^ ?"(?<heading>[^"\n]+)" ?(?:,|and)? ?/u;

/** `"A" in CLAUDE.md`, and `"A" in the root `CLAUDE.md``. */
const CITATION_LEADING =
  /"(?<heading>[^"\n]+)" in (?:the root )?`?CLAUDE\.md`?/gu;

/**
 * `CLAUDE.md の「CI」節`. The 節 is what separates a citation from a quote.
 *
 * The corner brackets are escaped rather than written, because a halfwidth
 * `(` directly after one is what `check:prose:japanese-parentheses` reports —
 * and its `--fix` would rewrite this pattern's own grouping to `（）`.
 */
const CITATION_JAPANESE =
  /`?CLAUDE\.md`? ?の ?\u{300C}(?<heading>[^\u{300D}]+)\u{300D} ?節/gu;

/** `see "Japanese text"`, which is how `CLAUDE.md` points at itself. */
const CITATION_SELF = /(?:^|\W)[sS]ee\s+"(?<heading>[^"\n]+)"/gu;

const SCANNED_EXTENSIONS: ReadonlySet<string> = new Set([
  '.json',
  '.jsonc',
  '.md',
  '.mdx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);

const IGNORED_PREFIXES: readonly string[] = [
  'docs/json-spec/',
  'docs/rust_book/',
  'docs/typescript_book/',
  'experimental/',
] as const;

/**
 * This check's own two files, whose text is the thing it looks for.
 *
 * The fixtures name sections that do not exist on purpose, and the
 * implementation cannot describe a citation without writing one — the shapes
 * in the header above are read as four citations of `"A"`, `"B"`, `"C"` and a
 * heading that was renamed. `check-japanese-parentheses.mts` excludes its own
 * fixtures by exact path for the same reason, and by exact path rather than a
 * directive comment so that the exclusion is visible from here.
 */
const IGNORED_PATHS: ReadonlySet<string> = new Set([
  'tools/scripts/cmd/check-claude-md-references.mts',
  'tools/scripts/cmd/check-claude-md-references.test.mts',
]);

/** A leading comment marker, so a citation that wraps reads as one line. */
const COMMENT_MARKER = /^[\s*#/]+/u;

const RUN_OF_SPACE = /\s+/gu;

/**
 * `fileText` as one line, with each run of space collapsed to one.
 *
 * The collapsing is what lets the patterns above spell a single space rather
 * than `\s+`: two quantifiers over space with something optional between them
 * is the shape that makes a pattern expensive to fail on, and
 * `security/detect-unsafe-regex` is right to refuse it.
 */
const flatten = (fileText: string): string =>
  fileText
    .split('\n')
    .map((line) => line.replace(COMMENT_MARKER, ''))
    .join(' ')
    .replaceAll(RUN_OF_SPACE, ' ');

/**
 * The headings quoted one after another from the start of `text`, stopping at
 * the first thing that is not one.
 *
 * `` `CLAUDE.md`'s: "A", "B" and "C". This file describes … `` is three
 * headings and then a sentence; the run ends where the quoting does.
 */
const quotedRunFrom = (text: string): readonly string[] => {
  const match = QUOTED_HEAD.exec(text);

  const heading = match?.groups?.['heading'];

  return match === null || heading === undefined
    ? []
    : Arr.toUnshifted(heading)(quotedRunFrom(text.slice(match[0].length)));
};

/** Backticks are punctuation here; `` `strict-lib/` `` is `strict-lib/`. */
const sameHeading = (heading: string, cited: string): boolean =>
  heading.replaceAll('`', '') === cited.replaceAll('`', '');

const visit = async (
  file: string,
): Promise<Result<readonly Citation[], string>> => {
  const contents = await readRepositoryFile(file);

  if (Result.isErr(contents)) return contents;

  return Result.ok(
    collectCitations(contents.value, {
      selfReferences: file === CLAUDE_MD,
    }).map((heading) => ({ file, heading })),
  );
};

const collectScannedFiles = async (): Promise<
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
    result.value.stdout.split('\0').filter(isScanned).toSorted(),
  );
};

const isScanned = (relativePath: string): boolean =>
  SCANNED_EXTENSIONS.has(path.extname(relativePath)) &&
  !IGNORED_PATHS.has(relativePath) &&
  IGNORED_PREFIXES.every((prefix) => !relativePath.startsWith(prefix));

const readRepositoryFile = async (
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

const formatViolations = (
  violations: readonly Citation[],
  headings: readonly string[],
): string =>
  [
    `${violations.length} reference(s) name a section ${CLAUDE_MD} does not have:`,
    '',
    ...violations.map(({ file, heading }) => {
      const suggestion = headings.find(
        (candidate) =>
          candidate.replaceAll('`', '').toLowerCase() ===
          heading.replaceAll('`', '').toLowerCase(),
      );

      return [
        `  ${file}: "${heading}"`,
        suggestion === undefined
          ? ''
          : `    — written "${suggestion}" in ${CLAUDE_MD}`,
      ]
        .filter((line) => line !== '')
        .join('\n');
    }),
    '',
    `Quote the heading as ${CLAUDE_MD} writes it, or point at whatever holds`,
    'the rule now. A section that moved into the file it is about is cited by',
    'that file, not by a heading here that no longer exists.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkClaudeMdReferences().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    [
      `${result.value.citations} reference(s) to ${CLAUDE_MD} across`,
      `${result.value.files} file(s) all name a section that is there.`,
    ].join(' '),
  );
}
