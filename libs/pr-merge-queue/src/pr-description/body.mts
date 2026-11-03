/**
 * A description written twice — the original, then its translation under one
 * `## <heading>` — and what keeps the two saying the same thing. Nothing here
 * talks to GitHub.
 *
 * The original is what tools and sessions read: the `## Review` section, the
 * `Merge-After:` line at the top. The translation is for a person, and drifts
 * from the original whenever one half is edited without the other. Two halves
 * cannot be compared for meaning, so what is compared is what can be: the
 * headings, the `#N` references, what may appear once only, and on an edit
 * whether both halves changed.
 */

import { outsideCodeFences } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';

/** A description cut where its translation begins and where it ends. */
export type DescriptionParts = Readonly<{
  /** Everything before the translation's heading. */
  original: string;
  /** What follows the heading, up to the first `---` rule. */
  translation: string;
  /** That rule and everything after it — closing keywords, trailers — or `''`. */
  trailers: string;
}>;

/**
 * `body` cut into its {@link DescriptionParts}: the original ends at the one
 * `## <heading>` line, and the translation at the first `---` rule after it.
 * Neither line counts inside a fenced code block. A body without the heading,
 * with it twice, or with an empty half is refused, since nothing could be said
 * about how its halves compare.
 */
export const splitDescription = (
  body: string,
  heading: string,
): Result<DescriptionParts, string> => {
  const lines = body.replaceAll('\r\n', '\n').split('\n');

  // Blanked fences keep the line count, so an index found here is one in
  // `lines` too.
  const visible = outsideCodeFences(lines.join('\n')).split('\n');

  const headingLine = `## ${heading}` as const;

  const at = visible.flatMap((line, i) =>
    HEADING_INDENT.test(line) && line.trim() === headingLine ? [i] : [],
  );

  if (!Arr.isFixedLengthArray(1, at)) {
    return Result.err(
      !Arr.isNonEmpty(at)
        ? `no "${headingLine}" line: the translation is missing; it follows the original under that heading`
        : `"${headingLine}" appears ${at.length} times; the translation goes under one`,
    );
  }

  const [start] = at;

  const rule = visible.findIndex((line, i) => i > start && RULE.test(line));

  const end = rule === -1 ? lines.length : rule;

  const original = lines.slice(0, start).join('\n');

  const translation = lines.slice(start + 1, end).join('\n');

  if (original.trim() === '' || translation.trim() === '') {
    return Result.err(
      `the ${original.trim() === '' ? 'original' : 'translation'} is empty`,
    );
  }

  // A rule the translation uses as a section break would end it there, and what
  // follows would pass for trailers: unchecked, and printed by `read`.
  if (visible.slice(end).some((line) => Arr.isNonEmpty(headingOf(line)))) {
    return Result.err(
      'a heading follows the "---" rule that ends the translation; the translation uses no "---" of its own, and the trailers have no headings',
    );
  }

  return Result.ok({
    original,
    translation,
    trailers: lines.slice(end).join('\n').trimEnd(),
  });
};

/**
 * What keeps the halves of a description from mirroring each other, or a
 * trailer or `## Review` out of its place, one sentence each; empty when
 * nothing does.
 *
 * - The translation has the original's headings one level down, in order,
 *   and may give a heading of its own to prose the original opens with.
 * - Each half names the same `#N`, outside code, tables and declarations.
 * - Code, tables and images appear once, in the original; the translation
 *   refers to them.
 * - `Merge-After:` appears once, in the original: it is read wherever it is,
 *   so a second copy that drifted would be obeyed as well.
 * - The trailers — `Start-After:` and `Claude-Session:` lines and closing
 *   keywords — are in neither half; they follow the rule that ends the
 *   translation, so that each appears once, where the layout puts it.
 * - The original has at most one `## Review`, and the translation none: the
 *   tools read the first they find in the body.
 */
export const checkDescription = (
  parts: DescriptionParts,
): readonly string[] => {
  const original = visibleLines(parts.original);

  const translation = visibleLines(parts.translation);

  const originalHeadings = original.flatMap(headingOf);

  const translationHeadings = translation.flatMap(headingOf);

  // An original that opens with prose under no heading may have its
  // translation open with one for it (`### 概要`), and that one is set aside.
  const titledLead =
    translationHeadings.length === originalHeadings.length + 1 &&
    opensWithProse(original) &&
    !opensWithProse(translation);

  const compared = titledLead
    ? Arr.tail(translationHeadings)
    : translationHeadings;

  const mirrored =
    originalHeadings.length === compared.length &&
    originalHeadings.every((h, i) => compared[i]?.level === h.level + 1);

  const originalRefs = referencesIn(original);

  const translationRefs = referencesIn(translation);

  const missingFromTranslation = onlyIn(originalRefs, translationRefs);

  const missingFromOriginal = onlyIn(translationRefs, originalRefs);

  const fenced = parts.translation.split('\n').some((line) => FENCE.test(line));

  const reviews = original.filter((line) => REVIEW_HEADING.test(line)).length;

  return [
    mirrored
      ? undefined
      : [
          "the headings do not mirror: the translation has the original's, one level down, in the same order",
          `  original:    ${outline(originalHeadings)}`,
          `  translation: ${outline(translationHeadings)}`,
        ].join('\n'),
    Arr.isNonEmpty(missingFromTranslation)
      ? `the original names ${missingFromTranslation.join(', ')} and the translation does not`
      : undefined,
    Arr.isNonEmpty(missingFromOriginal)
      ? `the translation names ${missingFromOriginal.join(', ')} and the original does not`
      : undefined,
    fenced
      ? 'the translation has a code block; code appears once, in the original, and the translation refers to it'
      : undefined,
    translation.some((line) => TABLE_ROW.test(line))
      ? 'the translation has a table; a table appears once, in the original, and the translation refers to it'
      : undefined,
    translation.some((line) => IMAGE.test(line))
      ? 'the translation has an image; an image appears once, in the original, and the translation refers to it'
      : undefined,
    translation.some((line) => MERGE_AFTER.test(line))
      ? 'the translation has a Merge-After: line; it is read wherever it is, so it appears once, in the original'
      : undefined,
    trailerProblem('original', original),
    trailerProblem('translation', translation),
    reviews > 1
      ? `the original has a "## Review" section ${reviews} times; the tools read the first, so the findings go under one`
      : undefined,
    translation.some((line) => REVIEW_HEADING.test(line))
      ? 'the translation has a "## Review" heading; the tools read the first in the body, so the findings go under the original\'s and the translation titles its own section "### <translated heading>"'
      : undefined,
  ].filter((problem) => problem !== undefined);
};

/**
 * Which halves differ between two versions of a description. Trailing spaces,
 * runs of blank lines, the `Merge-After:` line and trailer lines do not count:
 * the first two change nothing a reader sees, the third is a declaration,
 * maintained by `open-pr` and with no counterpart in the translation, and a
 * trailer belongs in neither half, so moving one out of a half is no edit.
 */
export const changedParts = (
  before: DescriptionParts,
  after: DescriptionParts,
): Readonly<{ original: boolean; translation: boolean }> =>
  ({
    original: normalized(before.original) !== normalized(after.original),
    translation:
      normalized(before.translation) !== normalized(after.translation),
  }) as const;

/**
 * The description as a reader that needs only the original sees it: the
 * original, the heading with how many lines were left out under it, and the
 * trailers.
 */
export const readableDescription = (
  parts: DescriptionParts,
  heading: string,
): string => {
  const omitted = parts.translation.trim().split('\n').length;

  return `${[
    parts.original.trimEnd(),
    `## ${heading}`,
    `(${omitted} lines left out by \`pr-description read\`)`,
    parts.trailers,
  ]
    .filter((part) => part !== '')
    .join('\n\n')}\n`;
};

type Heading = Readonly<{ level: number; text: string }>;

/** At most three spaces: four or more make an indented code block. */
const HEADING_INDENT = /^ {0,3}\S/u;

/** A thematic break of hyphens, the one a description's trailers follow. */
const RULE = /^ {0,3}-{3,}[ \t]*$/u;

const FENCE = /^[^\S\n]*(?:`{3,}|~{3,})/u;

const TABLE_ROW = /^[^\S\n]*\|/u;

const IMAGE = /!\[[^\]]*\]\(/u;

const MERGE_AFTER = /^[^\S\n]*merge-after[^\S\n]*:/iu;

const DECLARATION = /^[^\S\n]*(?:merge|start)-after[^\S\n]*:/iu;

/** A trailer line other than a closing keyword (`Start-After:`, `Claude-Session:`). */
const TRAILER_LINE = /^[^\S\n]*(?:start-after|claude-session)[^\S\n]*:/iu;

/**
 * A heading `review-findings-digest` reads as the `## Review` section, suffix
 * and all (`## Review (/code-review high)`): its `parse.mts` pattern, as is.
 */
const REVIEW_HEADING = /^##\s+Review\b/u;

/** `open-pr --merge-before`'s line (`mergeBeforeNote`). */
const MERGE_BEFORE_NOTE = /^Merges before #\d/u;

/**
 * A closing keyword before any reference GitHub closes by: `#N`,
 * `owner/repo#N`, or an issue or pull request URL.
 */
const CLOSING_KEYWORD =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)(?:[^\S\n]*:[^\S\n]*|[^\S\n]+)(?:[\w.-]+\/[\w.-]+#\d|#\d|https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:issues|pull)\/\d)/iu;

/** {@link CLOSING_KEYWORD} before a `#N` alone, read once and replaced all. */
const CLOSING_KEYWORDS =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)(?:[^\S\n]*:[^\S\n]*|[^\S\n]+)#\d+/giu;

/** As `pr-report-core` reads one: not after anything that ends a repository name. */
const REFERENCE = /(?<![\w./&-])#(?<number>\d+)\b/gu;

const stripInlineCode = (line: string): string =>
  line.replaceAll(/(`+)[^`]*?\1/gu, '');

const isTrailer = (line: string): boolean =>
  TRAILER_LINE.test(line) || CLOSING_KEYWORD.test(stripInlineCode(line));

/** The first trailer `half` holds, as a problem; `undefined` when none. */
const trailerProblem = (
  half: 'original' | 'translation',
  lines: readonly string[],
): string | undefined => {
  const trailer = lines.find(isTrailer);

  return trailer === undefined
    ? undefined
    : `the ${half} has the trailer "${trailer.trim()}"; Start-After: and Claude-Session: lines and closing keywords are read wherever they are, so each appears once, after the "---" rule that ends the translation`;
};

const headingOf = (line: string): readonly Heading[] => {
  const match = /^ {0,3}(?<marks>#{1,6})[ \t]+(?<text>.*?)[ \t#]*$/u.exec(line);

  const marks = match?.groups?.['marks'];

  return marks === undefined
    ? []
    : [{ level: marks.length, text: match?.groups?.['text'] ?? '' }];
};

const outline = (headings: readonly Heading[]): string =>
  Arr.isNonEmpty(headings)
    ? headings
        .map(({ level, text }) => `${'#'.repeat(level)} ${text}`)
        .join(', ')
    : '(none)';

/**
 * Whether anything is written before the first heading, declarations and the
 * `--merge-before` note aside.
 */
const opensWithProse = (lines: readonly string[]): boolean => {
  const first = lines.findIndex((line) => Arr.isNonEmpty(headingOf(line)));

  return (first === -1 ? lines : lines.slice(0, first)).some(
    (line) =>
      line.trim() !== '' &&
      !DECLARATION.test(line) &&
      !MERGE_BEFORE_NOTE.test(line),
  );
};

/** The references in `a` that `b` lacks, as `#N`. */
const onlyIn = (
  a: ReadonlySet<number>,
  b: ReadonlySet<number>,
): readonly string[] =>
  Array.from(a)
    .filter((n) => !b.has(n))
    .map((n) => `#${n}`);

/** `text`'s lines with fenced code blanked out; `text` is LF only, as {@link splitDescription} leaves it. */
const visibleLines = (text: string): readonly string[] =>
  outsideCodeFences(text).split('\n');

/**
 * The `#N` a half names, outside code, table rows, declarations and closing
 * keywords: a table, like code, appears in the original only, and the rest are
 * read by tools, not translated.
 */
const referencesIn = (lines: readonly string[]): ReadonlySet<number> =>
  new Set(
    lines
      .filter(
        (line) =>
          !TABLE_ROW.test(line) &&
          !DECLARATION.test(line) &&
          !MERGE_BEFORE_NOTE.test(line),
      )
      .map((line) => stripInlineCode(line).replaceAll(CLOSING_KEYWORDS, ''))
      .flatMap((line) =>
        Array.from(line.matchAll(REFERENCE), (match) =>
          Number(match.groups?.['number']),
        ),
      ),
  );

const normalized = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => !MERGE_AFTER.test(line) && !isTrailer(line))
    .join('\n')
    .replaceAll(/\n{3,}/gu, '\n\n')
    .trim();
