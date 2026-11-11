// cspell:ignore xhigh
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

import { Arr, Num, Result } from 'ts-data-forge';
import {
  codeFenceBlocks,
  isDeclarationLine,
  outsideCodeFences,
} from './declarations.mjs';
import {
  CLAUDE_SESSION_LINE,
  isMergesBeforeNote,
  REVIEW_SECTION_HEADING,
} from './description-lines.mjs';
import { deferralProblemsIn } from './review-section.mjs';

/** A description cut where its translation begins and where it ends. */
export type DescriptionParts = Readonly<{
  /** Everything before the translation's heading. */
  original: string;
  /** What follows the heading, up to the first `---` rule. */
  translation: string;
  /** That rule and everything after it — the trailers ({@link DescriptionKind}) — or `''`. */
  trailers: string;
}>;

/**
 * What a description belongs to. GitHub closes an issue by a closing keyword
 * anywhere in a pull request's description, and acts on none in an issue's, so
 * in an issue one is prose.
 */
export type DescriptionKind = 'issue' | 'pull-request';

/**
 * Whether an answer from the REST issues route is an issue or a pull request:
 * the route answers both, and sets `pull_request` on pull requests alone.
 */
export const descriptionKindOf = (
  issue: Readonly<{ pull_request?: unknown }>,
): DescriptionKind =>
  issue.pull_request === undefined ? 'issue' : 'pull-request';

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
  const lines = lfOnly(body).split('\n');

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
 * - Each code block of the original appears in the translation too, the same
 *   and in the same order, so that either half reads on its own and the copies
 *   cannot drift ({@link codeBlockProblem}); tables and images appear once, in
 *   the original, and the translation refers to them.
 * - `Merge-After:` appears once, in the original: it is read wherever it is,
 *   so a second copy that drifted would be obeyed as well.
 * - The trailers — `Start-After:` and `Claude-Session:` lines, and in a pull
 *   request closing keywords — are in neither half; they follow the rule that
 *   ends the translation, so that each appears once, where the layout puts it.
 * - The original has at most one `## Review`, and the translation none: the
 *   tools read the first they find in the body.
 * - The original's `## Review` opens with the level and the total of rounds,
 *   in the form {@link reviewOpeningRounds} reads, so that a count is read,
 *   not guessed.
 * - Each finding the original's `## Review` defers is a bullet under a
 *   `**Deferred**` line, opening with why it is out of scope
 *   ({@link deferralProblemsIn}): a finding in scope is fixed in the pull
 *   request, and a deferral with no reason reads as one deferred for the
 *   round it came in.
 * - With an `openingHeading`, a pull request's original opens with
 *   `## <openingHeading>`, declarations and the `--merge-before` note aside:
 *   the section that says what the change is about and why, for a reader who
 *   has not read the issue ({@link openingProblem}).
 */
export const checkDescription = (
  parts: DescriptionParts,
  kind: DescriptionKind,
  // Optional so that a check of the other rules need not name it;
  // `descriptionProblems`, through which every posting path calls this,
  // requires it.
  openingHeading?: string,
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

  const originalRefs = referencesIn(original, kind);

  const translationRefs = referencesIn(translation, kind);

  // A number the other half has only in a closing keyword is not called missing:
  // that keyword is refused by itself, and moving it brings this up if it is so.
  const missingFromTranslation = onlyIn(
    originalRefs,
    referencesIn(translation, 'issue'),
  );

  const missingFromOriginal = onlyIn(
    translationRefs,
    referencesIn(original, 'issue'),
  );

  const reviews = original.filter((line) =>
    REVIEW_SECTION_HEADING.test(line),
  ).length;

  const reviewSection = reviewSectionIn(original);

  const reviewOpening =
    reviewSection === undefined
      ? undefined
      : reviewOpeningOf(reviewSection.join('\n'));

  const deferrals = deferralProblemsIn(reviewSection ?? []);

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
    codeBlockProblem(parts),
    translation.some((line) => TABLE_ROW.test(line))
      ? 'the translation has a table; a table appears once, in the original, and the translation refers to it'
      : undefined,
    translation.some((line) => IMAGE.test(line))
      ? 'the translation has an image; an image appears once, in the original, and the translation refers to it'
      : undefined,
    translation.some((line) => MERGE_AFTER.test(line))
      ? 'the translation has a Merge-After: line; it is read wherever it is, so it appears once, in the original'
      : undefined,
    trailerProblem('original', original, kind),
    trailerProblem('translation', translation, kind),
    reviews > 1
      ? `the original has a "## Review" section ${reviews} times; the tools read the first, so the findings go under one`
      : undefined,
    translation.some((line) => REVIEW_SECTION_HEADING.test(line))
      ? 'the translation has a "## Review" heading; the tools read the first in the body, so the findings go under the original\'s and the translation titles its own section "### <translated heading>"'
      : undefined,
    reviewOpening === undefined ||
    reviewOpeningRounds(reviewOpening) !== undefined
      ? undefined
      : reviewOpening === ''
        ? `the "## Review" section is empty; ${REVIEW_OPENING_RULE}`
        : `the "## Review" section opens with "${reviewOpening}"; ${REVIEW_OPENING_RULE}`,
    ...deferrals,
    kind === 'pull-request' && openingHeading !== undefined
      ? openingProblem(parts.original, original, openingHeading)
      : undefined,
  ].filter((problem) => problem !== undefined);
};

/**
 * `text` with CRLF line ends made LF: GitHub keeps what its editor sent, and
 * every comparison of a description is made LF only.
 */
export const lfOnly = (text: string): string => text.replaceAll('\r\n', '\n');

/**
 * Why `body` may not be posted, or `undefined` when it may: with a translation
 * `heading` configured, a body whose halves do not mirror each other, or that
 * has a trailer or a `## Review` out of its place, or a pull request's that
 * does not open with `openingHeading` when one is given; what is a trailer
 * depends on whether `body` is an issue's or a pull request's. Every path that
 * posts a description asks this: `pr-description push`, `create`, `check`, and
 * `open-pr --body-file`.
 */
export const descriptionProblems = (
  body: string,
  heading: string | undefined,
  kind: DescriptionKind,
  openingHeading: string | undefined,
): string | undefined => {
  if (heading === undefined) {
    return undefined;
  }

  const parts = splitDescription(body, heading);

  if (Result.isErr(parts)) {
    return parts.value;
  }

  const problems = checkDescription(parts.value, kind, openingHeading);

  return Arr.isNonEmpty(problems)
    ? `the description cannot be posted as it is:\n${problems.map((p) => `- ${p}`).join('\n')}`
    : undefined;
};

/**
 * The first line of a `## Review` section that is not blank and not in a code
 * fence, its trailing spaces dropped, given the text under the heading; `''`
 * when nothing comes before the next `#` or `##` heading. `checkDescription`
 * and `review-findings-digest` both pick the opening with this, so they read
 * the same line.
 */
export const reviewOpeningOf = (section: string): string => {
  const opening = outsideCodeFences(lfOnly(section))
    .split('\n')
    .find((line) => line.trim() !== '');

  return opening === undefined || SECTION_HEADING.test(opening)
    ? ''
    : opening.trimEnd();
};

/**
 * The total of rounds a `## Review` section's opening ({@link reviewOpeningOf})
 * states, or `undefined` when it is not in the form {@link checkDescription}
 * asks for: the level and the total in digits, as `` `/code-review high`, 3
 * rounds. ``, or for a review with no `/code-review`, `` Review at `high`, 2
 * rounds. `` or `` Self-review at `high`, 1 round. ``.
 * Indented four spaces or more, the line is code, not an opening.
 */
export const reviewOpeningRounds = (line: string): number | undefined => {
  const count = REVIEW_OPENING.exec(line.trimEnd())?.groups?.['count'];

  if (count === undefined) {
    return undefined;
  }

  const parsed = Num.safeParseInt(count);

  return Result.isOk(parsed) ? parsed.value : undefined;
};

/**
 * Which halves differ between two versions of a description. Trailing spaces,
 * runs of blank lines, the `Merge-After:` line, the `Merges before` line and
 * trailer lines do not count: the first two change nothing a reader sees, the
 * next two are maintained by `open-pr`, with no counterpart in the translation
 * (**Changed in v2**: v1 counted the `Merges before` line), and a trailer of
 * `kind` belongs in neither half, so moving one out of a half is no edit.
 */
export const changedParts = (
  before: DescriptionParts,
  after: DescriptionParts,
  kind: DescriptionKind,
): Readonly<{ original: boolean; translation: boolean }> =>
  ({
    original:
      normalized(before.original, kind) !== normalized(after.original, kind),
    translation:
      normalized(before.translation, kind) !==
      normalized(after.translation, kind),
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

const CODE_RULE =
  'each code block appears in both halves, the same and in the same order, so that either half reads on its own';

/** At most three spaces: four or more make an indented code block. */
const HEADING_INDENT = /^ {0,3}\S/u;

/** A thematic break of hyphens, the one a description's trailers follow. */
const RULE = /^ {0,3}-{3,}[ \t]*$/u;

const TABLE_ROW = /^[^\S\n]*\|/u;

const IMAGE = /!\[[^\]]*\]\(/u;

const MERGE_AFTER = /^[^\S\n]*merge-after[^\S\n]*:/iu;

const isDeclaration = (line: string): boolean =>
  isDeclarationLine(line, 'merge-after') ||
  isDeclarationLine(line, 'start-after');

/** A trailer line other than a closing keyword (`Start-After:`, `Claude-Session:`). */
const isTrailerLine = (line: string): boolean =>
  isDeclarationLine(line, 'start-after') || CLAUDE_SESSION_LINE.test(line);

/** What {@link reviewOpeningRounds} reads. */
const REVIEW_OPENING =
  /^ {0,3}(?:`\/code-review (?:low|medium|high|xhigh|max)`|(?:Self-review|Review) at `(?:low|medium|high|xhigh|max)`), (?<count>1(?= round\b)|(?:[2-9]|[1-9]\d+)(?= rounds\b)) rounds?(?:[.,;:]|$)/u;

const REVIEW_OPENING_RULE =
  'it opens with the level and the total of rounds in digits, as "`/code-review high`, 3 rounds.", "Review at `high`, 2 rounds." or "Self-review at `high`, 1 round."';

/** A `#` or `##` heading, which ends a `## Review` section. */
const SECTION_HEADING = /^ {0,3}#{1,2}(?:[ \t]|$)/u;

const HTML_COMMENT = /<!--[\s\S]*?-->/gu;

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

/** A closing keyword is a trailer in a pull request's description only. */
const isTrailer = (line: string, kind: DescriptionKind): boolean =>
  isTrailerLine(line) ||
  (kind === 'pull-request' && CLOSING_KEYWORD.test(stripInlineCode(line)));

/** The first trailer `half` holds, as a problem; `undefined` when none. */
const trailerProblem = (
  half: 'original' | 'translation',
  lines: readonly string[],
  kind: DescriptionKind,
): string | undefined => {
  const trailer = lines.find((line) => isTrailer(line, kind));

  return trailer === undefined
    ? undefined
    : isTrailerLine(trailer)
      ? `the ${half} has the trailer "${trailer.trim()}"; Start-After: and Claude-Session: lines are read wherever they are, so each appears once, after the "---" rule that ends the translation`
      : // Both readings and no flag: a file does not say which it is, and
        // `--issue` passes a pull request's that GitHub would still act on.
        `the ${half} has the closing keyword "${trailer.trim()}"; read as a pull request's description, as this is, GitHub acts on one wherever it is, so it appears once, after the "---" rule that ends the translation. In an issue's description one is prose and stays where it is`;
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

/** A line before the first heading that is neither blank nor what tools write there. */
const isLeadContent = (line: string): boolean =>
  line.trim() !== '' && !isDeclaration(line) && !isMergesBeforeNote(line);

/**
 * Whether anything is written before the first heading, declarations and the
 * `--merge-before` note aside.
 */
const opensWithProse = (lines: readonly string[]): boolean => {
  const first = lines.findIndex((line) => Arr.isNonEmpty(headingOf(line)));

  return (first === -1 ? lines : lines.slice(0, first)).some(isLeadContent);
};

/** `text`'s lines with fenced code blanked out; `text` is LF only, as {@link splitDescription} leaves it. */
const visibleLines = (text: string): readonly string[] =>
  outsideCodeFences(text).split('\n');

/** `text` with each HTML comment blanked, its line breaks kept. */
const withoutComments = (text: string): string =>
  text.replaceAll(HTML_COMMENT, (comment) => comment.replaceAll(/[^\n]/gu, ''));

/**
 * Why `original` does not open with `## <openingHeading>`, or `undefined` when
 * it does, given its {@link visibleLines} too. The first heading is found
 * outside code, and anything before it but declarations, the `--merge-before`
 * note and HTML comments, which a reader does not see — a code block included —
 * is content under no heading.
 */
const openingProblem = (
  original: string,
  visible: readonly string[],
  openingHeading: string,
): string | undefined => {
  // Blanked fences and comments keep the line count, so an index in `shown` is
  // one in `lines`.
  const lines = withoutComments(original).split('\n');

  const shown = withoutComments(visible.join('\n')).split('\n');

  const first = shown.findIndex((line) => Arr.isNonEmpty(headingOf(line)));

  const rule =
    `a pull request's description opens with "## ${openingHeading}": what the change is about and why it is needed, for a reader who has not read the issue (the pr-description README says what to write)` as const;

  if ((first === -1 ? lines : lines.slice(0, first)).some(isLeadContent)) {
    return `the original opens with prose under no heading; ${rule}`;
  }

  const [heading] = headingOf(shown[first] ?? '');

  return heading === undefined
    ? `the original has no heading; ${rule}`
    : heading.level === 2 && heading.text === openingHeading
      ? undefined
      : `the original opens with "${'#'.repeat(heading.level)} ${heading.text}"; ${rule}`;
};

/** `block` with the indentation its lines share taken off, and trailing spaces. */
const unindented = (block: string): string => {
  const lines = block.split('\n').map((line) => line.trimEnd());

  const indent = Math.min(
    ...lines
      .filter((line) => line !== '')
      .map((line) => line.length - line.trimStart().length),
  );

  return lines.map((line) => line.slice(indent)).join('\n');
};

/**
 * Why the translation's code blocks are not the original's, one for one and in
 * order, or `undefined` when they are. Each is compared with its indentation
 * taken off, since one half may hold it in a list item and the other not.
 */
const codeBlockProblem = (parts: DescriptionParts): string | undefined => {
  const original = codeFenceBlocks(parts.original).map(unindented);

  const translation = codeFenceBlocks(parts.translation).map(unindented);

  if (original.length !== translation.length) {
    return `the original has ${original.length} code ${Arr.isFixedLengthArray(1, original) ? 'block' : 'blocks'} and the translation ${translation.length}; ${CODE_RULE}`;
  }

  const differs = translation.findIndex((block, i) => block !== original[i]);

  return differs === -1
    ? undefined
    : `code block ${differs + 1} of the translation is not the original's; ${CODE_RULE}`;
};

/** The references in `a` that `b` lacks, as `#N`. */
const onlyIn = (
  a: ReadonlySet<number>,
  b: ReadonlySet<number>,
): readonly string[] =>
  Array.from(a)
    .filter((n) => !b.has(n))
    .map((n) => `#${n}`);

/**
 * The lines under the first `## Review` heading in `lines`, up to the next `#`
 * or `##` heading, or `undefined` when there is no such heading.
 */
const reviewSectionIn = (
  lines: readonly string[],
): readonly string[] | undefined => {
  const start = lines.findIndex((line) => REVIEW_SECTION_HEADING.test(line));

  if (start === -1) {
    return undefined;
  }

  const rest = lines.slice(start + 1);

  const end = rest.findIndex((line) => SECTION_HEADING.test(line));

  return end === -1 ? rest : rest.slice(0, end);
};

/**
 * The `#N` a half names, outside code, table rows, declarations and, in a pull
 * request, closing keywords: a table, like code, appears in the original only,
 * and the rest are read by tools, not translated. In an issue a closing keyword
 * is prose, translated like any other.
 */
const referencesIn = (
  lines: readonly string[],
  kind: DescriptionKind,
): ReadonlySet<number> =>
  new Set(
    lines
      .filter(
        (line) =>
          !TABLE_ROW.test(line) &&
          !isDeclaration(line) &&
          !isMergesBeforeNote(line),
      )
      .map(stripInlineCode)
      .map((line) =>
        kind === 'pull-request' ? line.replaceAll(CLOSING_KEYWORDS, '') : line,
      )
      .flatMap((line) =>
        Array.from(line.matchAll(REFERENCE), (match) =>
          Number(match.groups?.['number']),
        ),
      ),
  );

const normalized = (text: string, kind: DescriptionKind): string =>
  text
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(
      (line) =>
        !MERGE_AFTER.test(line) &&
        !isMergesBeforeNote(line) &&
        !isTrailer(line, kind),
    )
    .join('\n')
    .replaceAll(/\n{3,}/gu, '\n\n')
    .trim();
