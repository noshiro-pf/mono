// cspell:ignore xhigh
import { Arr, Num, Result } from 'ts-data-forge';

/**
 * Reads the `## Review` section a pull request description records: the
 * `/code-review` levels it names, how many rounds it says were run, and the
 * findings it lists with what was done about each.
 *
 * The section is free prose, so this is a reading of the shapes the
 * descriptions here actually take, not a grammar: bullets under a
 * `Fixed:` / `Dismissed:` / `Deferred to #N:` paragraph or a bold label,
 * bullets that carry their own label, and `Fixed: a, b, c.` sentences. What
 * it misreads costs a line in a digest a person reads, nothing more.
 */
export const parseReview = (body: string): ReviewRecord | undefined => {
  const section = extractReviewSection(body);

  if (section === undefined) {
    return undefined;
  }

  const bodyText = section.lines.join('\n');

  return {
    levels: Arr.uniq([...levelsIn(section.heading), ...levelsIn(bodyText)]),
    rounds: roundsIn(bodyText) ?? roundsIn(section.heading),
    findings: findingsIn(section),
  };
};

/**
 * The `## Review` heading and the lines under it, up to the next `#` or `##`
 * heading, the `Claude-Session:` / `Merge-After:` / `Start-After:` trailers,
 * a `---` rule or the generated-with footer — whichever comes first.
 * A heading may carry a suffix (`## Review (\`/code-review xhigh\`)`,
 * `## Review findings not fixed`); `### ` sub-headings stay in the section.
 * A heading inside a code fence neither starts nor ends it.
 */
export const extractReviewSection = (
  body: string,
): ReviewSection | undefined => {
  const lines = body.replaceAll('\r\n', '\n').split('\n');

  const fenced = insideFences(lines);

  const start = lines.findIndex(
    (line, index) => fenced[index] !== true && REVIEW_HEADING.test(line),
  );

  if (start === -1) {
    return undefined;
  }

  const rest = lines.slice(start + 1);

  const end = rest.findIndex(
    (line, index) =>
      fenced[start + 1 + index] !== true && SECTION_END.test(line),
  );

  return {
    heading: (lines[start] ?? '').replace(/^##\s+/u, ''),
    lines: end === -1 ? rest : rest.slice(0, end),
  };
};

/** The `/code-review` levels a text names, in the order it names them. */
export const levelsIn = (text: string): readonly string[] =>
  Arr.uniq(
    Array.from(text.matchAll(LEVEL), (match) => match[1] ?? '').filter(
      (level) => level !== '',
    ),
  );

/**
 * The number of review rounds a text states, summed over every statement of
 * one ("Seven rounds before opening; three rounds on the amend" is ten), or
 * `undefined` when it states none ("for several rounds", "until a round found
 * nothing new"). A sentence that counts rounds ("two rounds") is read for
 * those alone, so "ran it three times: two rounds and one round" is three.
 */
export const roundsIn = (text: string): number | undefined => {
  const counts = text.split(SENTENCE_BREAK).flatMap((sentence) => {
    const rounds = countsIn(sentence, ROUNDS);

    return Arr.isNonEmpty(rounds) ? rounds : countsIn(sentence, TIMES);
  });

  return Arr.isNonEmpty(counts) ? Arr.sum(counts) : undefined;
};

/**
 * The findings a section lists, each with the disposition the nearest label
 * above it gives, unless the item names its own (`Kept: …`, `deferred to
 * #N`).
 */
export const findingsIn = (section: ReviewSection): readonly Finding[] => {
  const mut_findings: Finding[] = [];

  /** What a finding under no label, or under a label that says none, is. */
  const sectionDefault: Disposition = lastCue(section.heading) ?? 'unknown';

  let mut_current: Disposition = sectionDefault;

  /** The issues the label in force names (`Deferred to #2685:`). */
  let mut_labelIssues: readonly number[] = [];

  /** The item a deeper bullet continues, and the indent it sits at. */
  let mut_parent: Readonly<{ index: number; indent: number }> | undefined =
    undefined;

  for (const block of blocksOf(section.lines)) {
    if (block.kind === 'paragraph') {
      mut_parent = undefined;

      mut_findings.push(...inlineFindings(block.text));

      const heading = block.text.startsWith('#');

      if (heading || block.text.endsWith(':')) {
        mut_current = lastCue(block.text) ?? sectionDefault;

        mut_labelIssues = issuesIn(block.text);
      }

      continue;
    }

    if (mut_parent !== undefined && block.indent > mut_parent.indent) {
      const parentIndex = mut_parent.index;

      const parent = mut_findings[parentIndex];

      if (parent !== undefined) {
        mut_findings[parentIndex] = {
          ...parent,
          text: `${parent.text} ${block.text}`,
        };
      }

      continue;
    }

    // A bullet label that names no disposition ("Round 1:") sits inside the
    // list of the label above it, and keeps its disposition.
    if (isPureLabel(block.text)) {
      mut_current = lastCue(block.text) ?? mut_current;

      mut_labelIssues = issuesIn(block.text);

      mut_parent = undefined;

      continue;
    }

    // A numbered round under no label ("1. 9 findings. 8 were fixed: a, b.
    // 1 was dismissed: c.") lists its findings the way a paragraph does.
    const inline =
      mut_current === 'unknown' ? inlineFindings(block.text) : ([] as const);

    if (Arr.isNonEmpty(inline)) {
      mut_findings.push(...inline);

      mut_parent = undefined;

      continue;
    }

    const labelled =
      EMPHASIZED_LABEL.exec(block.text) ?? PLAIN_LABEL.exec(block.text);

    const labelDisposition =
      labelled === null ? undefined : lastCue(labelled[0]);

    const finding =
      labelled === null || labelDisposition === undefined
        ? makeFinding(
            ownDisposition(block.text) ?? mut_current,
            block.text,
            mut_labelIssues,
          )
        : makeFinding(
            labelDisposition,
            block.text.slice(labelled[0].length),
            issuesIn(labelled[0]),
          );

    if (!isFinding(finding)) {
      continue;
    }

    mut_findings.push(finding);

    mut_parent = { index: mut_findings.length - 1, indent: block.indent };
  }

  return mut_findings;
};

export type Disposition = 'deferred' | 'dismissed' | 'fixed' | 'unknown';

export type Finding = Readonly<{
  disposition: Disposition;
  text: string;
  /** The issues a deferred finding was deferred to. */
  issues: readonly number[];
}>;

export type ReviewRecord = Readonly<{
  levels: readonly string[];
  rounds: number | undefined;
  findings: readonly Finding[];
}>;

export type ReviewSection = Readonly<{
  heading: string;
  lines: readonly string[];
}>;

type InlineLabel = Readonly<{
  label: string;
  /** What stands between the cue and the colon. */
  gap: string;
  start: number;
  /** Just after the colon. */
  end: number;
  /** The end of the sentence the list runs to. */
  listEnd: number;
}>;

type ListItem = Readonly<{ text: string; whole: string }>;

type Block = Readonly<
  | { kind: 'bullet'; indent: number; text: string }
  | { kind: 'paragraph'; text: string }
>;

const REVIEW_HEADING = /^##\s+Review\b/u;

const SECTION_END =
  /^(?:#{1,2}\s|Claude-Session:|Merge-After:|Start-After:|-{3,}\s*$|🤖 Generated with|_Generated by)/u;

const LEVEL = /\/code-review\s+(low|medium|high|xhigh|max|ultra)\b/gu;

/** The number each word names, zero to twenty. */
const NUMBER_WORDS: ReadonlyMap<string, number> = new Map(
  [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
    'twenty',
  ].map((word, index) => [word, index]),
);

/**
 * "two rounds", "Seven `/code-review xhigh` rounds", "One round". The word
 * counts only if {@link countOf} reads it as a number.
 */
const ROUNDS =
  /(?<!\bthe )\b(\d+|[a-z]+) (?:`\/code-review (?:low|medium|high|xhigh|max|ultra)` )?(?:more )?rounds?\b(?![- ]trips?\b)/giu;

/**
 * "I ran `/code-review high` three times", "it ran twice more" — the count
 * right after "I ran", "it ran" or "`/code-review high` ran", so "ran the
 * flaky test 5 times" and "the hook ran 3 times" are not one. Not "once", which says "once more" about
 * anything but a review far more often.
 */
const TIMES =
  /(?:\b(?:I|it|we)|`\/code-review (?:low|medium|high|xhigh|max|ultra)`) ran(?: it| `\/code-review (?:low|medium|high|xhigh|max|ultra)`)? (twice|thrice|(?:\d+|[a-z]+)(?= times\b))/giu;

/** Where {@link roundsIn} splits a text into sentences. */
const SENTENCE_BREAK = /(?<=[.!?])\s+|\n/u;

/** A code fence's opening or closing line. */
const FENCE = /^\s*(`{3,}|~{3,})/u;

/** "the …", "a …": what follows "Fixed" when it is a verb, not a label. */
const VERB_OBJECT = /^ (?:the|a|an|its|their|this|that|these|those)\b/iu;

/**
 * The words that say what was done with a finding, longest first where one
 * contains another, so that "fixed except" and "not fixed" are not read as
 * "fixed".
 */
const CUE =
  /\b(?:(?<dismissed>(?:dismissed|deferred) or (?:dismissed|deferred)|fixed except|not fixed|not changed|did not act on|not acted on|dismissed|kept|withdrawn|left (?:alone|as (?:is|they are)))|(?<deferred>deferred)|(?<fixed>fixed|fixes))\b/giu;

/**
 * `Fixed: `, `Deferred to #12: `, and emphasized `**Fixed**: `,
 * `**Deferred, existing behavior**: `, `**Not changed:** `. Other words
 * between the cue and the colon only when emphasized: in plain text, `Fixed
 * the stale README: …` is a finding that opens with a verb.
 */
const EMPHASIZED_LABEL =
  /^[*_]{1,2}(?:Fixed|Dismissed|Deferred|Not changed|Not fixed|Kept|Withdrawn)\b[^*_:]{0,60}[*_]{0,2}:[*_]{0,2}\s*/u;

/** See {@link EMPHASIZED_LABEL}. */
const PLAIN_LABEL =
  /^(?:Fixed|Dismissed|Deferred|Not changed|Not fixed|Kept|Withdrawn)(?:| to #\d+):\s*/u;

const BULLET = /^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/u;

const LABEL_GAP = /^[^\n.:]{0,60}:/u;

/** "`/code-review high`: a, b and c are fixed." */
const POSTFIX_FIXED = /: ([^:]+?) (?:are|were) (?:all )?fixed\b/gu;

/**
 * What {@link sentenceFrom} reads: a code span whole (so nothing in it
 * counts), a bracket, or a period that a sentence could end at.
 */
const SENTENCE_TOKEN = /`[^`]*`|[()[\]]|\.(?=\s+[\dA-Z"*_`])/gu;

const CONTINUATION = /^(?:which|who|whose|so|but|since|because|as)\b/u;

/**
 * What {@link splitTopLevel} reads: a code span or a quotation whole (so
 * nothing in it counts), a bracket, or a separator.
 */
const LIST_TOKEN = /`[^`]*`|"[^"]*"|[()[\]]|[,;]/gu;

const countOf = (word: string): number | undefined => {
  const lower = word.toLowerCase();

  switch (lower) {
    case 'single':
    case 'once':
      return 1;

    case 'twice':
      return 2;

    case 'thrice':
      return 3;

    default: {
      return (
        NUMBER_WORDS.get(lower) ??
        Result.unwrapOkOr(Num.safeParseInt(lower), undefined)
      );
    }
  }
};

/** What `pattern`'s first group reads as a number, at each match in a text. */
const countsIn = (text: string, pattern: RegExp): readonly number[] =>
  Array.from(text.matchAll(pattern), (match) =>
    match[1] === undefined ? undefined : countOf(match[1]),
  ).filter((count) => count !== undefined);

/**
 * Whether each line is inside a code fence, the fence lines included. A
 * fence holds commands or output, never a heading that ends the section or a
 * bullet that is a finding.
 */
const insideFences = (lines: readonly string[]): readonly boolean[] => {
  /** The opening fence, which only a run of its character as long closes. */
  let mut_opener: string | undefined = undefined;

  return lines.map((line) => {
    const fence = FENCE.exec(line)?.[1];

    if (fence === undefined) {
      return mut_opener !== undefined;
    }

    if (mut_opener === undefined) {
      mut_opener = fence;
    } else if (
      fence.startsWith(mut_opener.slice(0, 1)) &&
      fence.length >= mut_opener.length
    ) {
      mut_opener = undefined;
    }

    return true;
  });
};

/** The last disposition a text states, or `undefined` if it states none. */
const lastCue = (text: string): Disposition | undefined =>
  Array.from(text.matchAll(CUE), (match): Disposition => {
    const groups = match.groups ?? {};

    return groups['fixed'] !== undefined
      ? 'fixed'
      : groups['deferred'] !== undefined
        ? 'deferred'
        : 'dismissed';
  }).at(-1);

/**
 * A disposition an item names for itself, overriding the label above it:
 * "deferred to #N" anywhere, or a capitalized `Kept:` / `Dismissed.` /
 * `Deferred:` the way a sentence inside an item opens.
 */
const ownDisposition = (text: string): Disposition | undefined =>
  /\bdeferred(?: to|:)\s*#\d+/iu.test(text)
    ? 'deferred'
    : /\b(?:Dismissed|Kept|Withdrawn|Not changed)\b[:.]/u.test(text)
      ? 'dismissed'
      : /\bDeferred\b[:.]/u.test(text)
        ? 'deferred'
        : undefined;

/**
 * `**Fixed**:`, `*Dismissed:*`, `Deferred to #2685:`, `Round 1:` — a bullet
 * that is only a label for the bullets under it.
 */
const isPureLabel = (text: string): boolean =>
  text.length <= 60 && /^[*_]{0,2}[^*_]+[*_]{0,2}:[*_]{0,2}$/u.test(text);

/** The `#N` references in a text. */
const issuesIn = (text: string): readonly number[] =>
  Array.from(text.matchAll(/#(\d+)\b/gu), (match) =>
    Result.unwrapOkOr(Num.safeParseInt(match[1] ?? ''), 0),
  ).filter((n) => n > 0);

/**
 * A finding. A deferred one is given the issues its text names, or else
 * those of the label it sits under (`labelIssues`).
 */
const makeFinding = (
  disposition: Disposition,
  raw: string,
  labelIssues: readonly number[] = [],
): Finding => {
  const text = raw.trim().replace(/[;,]$/u, '');

  const own = issuesIn(text);

  return {
    disposition,
    text,
    issues:
      disposition !== 'deferred' ? [] : Arr.isNonEmpty(own) ? own : labelIssues,
  };
};

/** Not an empty item, nor a round that says it found nothing. */
const isFinding = ({ text }: Finding): boolean =>
  text !== '' &&
  !/^(?:no (?:new |further )?findings|(?:found )?nothing(?: new)?|none)\.?$/iu.test(
    text.replace(ROUND_LABEL, ''),
  );

/** "Round 2: " or "Pass 2: " before what a round found. */
const ROUND_LABEL = /^(?:round|pass) \w+: /iu;

/**
 * The section's lines as bullets and paragraphs. A line indented under a
 * bullet continues it, even after a blank line; any other line continues the
 * paragraph it follows until a blank line ends it. Table rows and code
 * fences are skipped.
 */
const blocksOf = (lines: readonly string[]): readonly Block[] => {
  const mut_blocks: Block[] = [];

  const fenced = insideFences(lines);

  let mut_open = false;

  for (const [index, line] of lines.entries()) {
    if (fenced[index] === true || line.trim() === '') {
      mut_open = false;

      continue;
    }

    if (line.trimStart().startsWith('|')) {
      continue;
    }

    const bullet = BULLET.exec(line);

    if (bullet !== null) {
      mut_blocks.push({
        kind: 'bullet',
        indent: (bullet[1] ?? '').length,
        text: (bullet[2] ?? '').trim(),
      });

      mut_open = true;

      continue;
    }

    const last = mut_blocks.at(-1);

    const indented = /^\s/u.test(line);

    if (last?.kind === 'bullet' && (mut_open || indented)) {
      mut_blocks[mut_blocks.length - 1] = {
        ...last,
        text: `${last.text} ${line.trim()}`,
      };

      continue;
    }

    if (mut_open && last?.kind === 'paragraph') {
      mut_blocks[mut_blocks.length - 1] = {
        ...last,
        text: `${last.text} ${line.trim()}`,
      };

      continue;
    }

    mut_blocks.push({ kind: 'paragraph', text: line.trim() });

    mut_open = true;
  }

  return mut_blocks;
};

/** The bracket depth after a token: one deeper, one shallower, or the same. */
const depthAfter = (token: string, depth: number): number =>
  token === '(' || token === '['
    ? depth + 1
    : token === ')' || token === ']'
      ? Math.max(0, depth - 1)
      : depth;

/**
 * The text from `start` to the end of its sentence: a period followed by a
 * capital, a digit, emphasis, a quote or a code span, or the end of the
 * paragraph. Periods inside parentheses, brackets or code spans do not end
 * it — unless a bracket is never closed, when the first period does.
 */
const sentenceFrom = (text: string, start: number): string => {
  const rest = text.slice(start);

  let mut_depth = 0;

  let mut_firstPeriod: number | undefined = undefined;

  for (const token of rest.matchAll(SENTENCE_TOKEN)) {
    if (token[0] === '.') {
      if (mut_depth === 0) {
        return rest.slice(0, token.index);
      }

      mut_firstPeriod ??= token.index;
    }

    mut_depth = depthAfter(token[0], mut_depth);
  }

  return mut_firstPeriod !== undefined && mut_depth > 0
    ? rest.slice(0, mut_firstPeriod)
    : rest;
};

const splitTopLevel = (
  text: string,
  separator: ',' | ';',
): readonly string[] => {
  const mut_cuts: number[] = [];

  let mut_depth = 0;

  for (const token of text.matchAll(LIST_TOKEN)) {
    if (mut_depth === 0 && token[0] === separator) {
      mut_cuts.push(token.index);
    }

    mut_depth = depthAfter(token[0], mut_depth);
  }

  return Arr.toUnshifted(-1)(mut_cuts).map((cut, i) =>
    text.slice(cut + 1, mut_cuts[i] ?? text.length),
  );
};

/**
 * A running-text list split into its items: on top-level semicolons when
 * there are any; else, for fixed findings, on top-level commas, which is how
 * those are listed ("Fixed: a, b, and c"). A dismissed or deferred finding
 * comes with its reason, so a comma there is inside one finding. What follows
 * a dash in an item is its reason: `text` leaves it out, `whole` keeps it. A
 * leading "and" or "plus" is dropped, and a clause that only goes on about
 * the item before it ("…, which …") stays with it.
 */
const splitList = (
  list: string,
  disposition: Disposition,
): readonly ListItem[] => {
  const trimmed = list.trim().replace(/\.$/u, '');

  const bySemicolon = splitTopLevel(trimmed, ';');

  const items =
    disposition === 'dismissed' ||
    disposition === 'deferred' ||
    bySemicolon.length > 1
      ? bySemicolon
      : splitTopLevel(trimmed, ',');

  return items
    .map((item) => item.trim().replace(/^(?:and|plus)\s+/u, ''))
    .reduce<readonly string[]>(
      (acc, item) =>
        CONTINUATION.test(item) && Arr.isNonEmpty(acc)
          ? Arr.toPushed(acc.slice(0, -1), `${acc.at(-1)}, ${item}`)
          : Arr.toPushed(acc, item),
      [],
    )
    .map((whole) => {
      const dash = whole.indexOf(' — ');

      return {
        text: dash === -1 ? whole : whole.slice(0, dash).trim(),
        whole,
      };
    })
    .filter(({ text }) => text !== '');
};

/**
 * Each cue in a paragraph followed, within 60 characters of the same clause,
 * by a colon — the label that opens a running list — with where it starts,
 * where its colon ends and where its list does. A cue inside a code span, or
 * inside a label or list already found ("fixed except these, dismissed:",
 * "Fixed: \`kept: true\`"), is part of that text, not a label of its own.
 */
const inlineLabels = (paragraph: string): readonly InlineLabel[] => {
  const codeSpans = Array.from(paragraph.matchAll(/`[^`]*`/gu));

  const inCode = (index: number): boolean =>
    codeSpans.some(
      (span) => span.index <= index && index < span.index + span[0].length,
    );

  const mut_labels: InlineLabel[] = [];

  for (const cue of paragraph.matchAll(CUE)) {
    const previousEnd = mut_labels.at(-1)?.listEnd ?? 0;

    const gap =
      cue.index < previousEnd || inCode(cue.index)
        ? null
        : LABEL_GAP.exec(paragraph.slice(cue.index + cue[0].length));

    if (gap === null) {
      continue;
    }

    const end = cue.index + cue[0].length + gap[0].length;

    mut_labels.push({
      label: paragraph.slice(cue.index, end),
      gap: gap[0].slice(0, -1),
      start: cue.index,
      end,
      listEnd: end + sentenceFrom(paragraph, end).length,
    });
  }

  return mut_labels;
};

/**
 * The findings a paragraph lists in running text: `Fixed: a, b, and c.`,
 * `fixed most of what it found: a; b.`, and `: a, b and c are fixed.`. The
 * "fixed" of that last form, should a colon follow it, does not open another
 * list, and the form itself inside a label's list ("Dismissed: x was fixed
 * upstream.") is part of that list.
 *
 * A text that opens with "Fixed the …:" is a finding that opens with a verb,
 * not a label: its subject is what was fixed.
 */
const inlineFindings = (paragraph: string): readonly Finding[] => {
  const postfix = Array.from(paragraph.matchAll(POSTFIX_FIXED));

  const labels = inlineLabels(paragraph).filter(({ start }) =>
    postfix.every(
      (match) => start < match.index || match.index + match[0].length <= start,
    ),
  );

  return [
    ...labels.flatMap(({ label, gap, start, end }) => {
      const disposition = lastCue(label) ?? 'unknown';

      const list = sentenceFrom(paragraph, end);

      const opensWithVerb =
        start === 0 && VERB_OBJECT.test(gap) && list.trim() !== '';

      return opensWithVerb
        ? []
        : splitList(list, disposition)
            .map(({ text, whole }) =>
              makeFinding(
                ownDisposition(whole) ?? disposition,
                text,
                Arr.isNonEmpty(issuesIn(whole))
                  ? issuesIn(whole)
                  : issuesIn(label),
              ),
            )
            .filter(isFinding);
    }),
    ...postfix
      .filter((match) =>
        labels.every(
          ({ start, listEnd }) => match.index < start || listEnd <= match.index,
        ),
      )
      .flatMap((match) =>
        splitList(match[1] ?? '', 'fixed').map(({ text }) =>
          makeFinding('fixed', text),
        ),
      ),
  ] as const;
};
