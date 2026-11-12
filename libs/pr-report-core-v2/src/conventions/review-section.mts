import { Arr, asUint32 } from 'ts-data-forge';

/**
 * The rule for a deferred finding in a `## Review` section
 * (`docs/code-review-loop.md`): it is an item of the list under a
 * `**Deferred**` line, opening with why it is out of scope.
 * `review-findings-digest` counts deferrals by that reason
 * ({@link deferralReasonOf}), and one written anywhere else as one with none.
 */

/**
 * Why a deferred finding is out of scope, as the tag its text opens with states
 * — `(predates)`, `(another change)` or `(too large)`, in any case, emphasized
 * or not, punctuation allowed after it — or `undefined` when it opens with
 * none.
 */
export const deferralReasonOf = (text: string): DeferralReason | undefined => {
  const tag = DEFERRAL_TAG.exec(text.trimStart())?.groups?.[
    'reason'
  ]?.toLowerCase();

  return DEFERRAL_REASONS.find((reason) => reason === tag);
};

/**
 * What keeps the lists under the `**Deferred**` lines of a `## Review` section
 * (its lines, fenced code blanked) from the rule, one sentence each: an item
 * that opens with no reason, and a `**Deferred**` line with no list and no
 * "none".
 *
 * A list runs from the first item after the line to the first paragraph that is
 * neither an item nor indented under one; a line right after an item, with no
 * blank between, continues it, as in Markdown.
 * Its findings are the items no deeper than the first; a deeper item belongs to
 * the finding above it. A deferral written in any other shape is not refused
 * here: the digest counts it as one with no reason.
 */
export const deferralProblemsIn = (
  section: readonly string[],
): readonly string[] =>
  section.flatMap((line, index) => {
    // A header is a paragraph of its own, not a line wrapped from the one above
    // it.
    const rest =
      HEADER_INDENT.test(line) && (section[index - 1] ?? '').trim() === ''
        ? DEFERRED_HEADER.exec(line.trim())?.groups?.['rest']
        : undefined;

    if (rest !== '') {
      return [];
    }

    const after = section.slice(index + 1);

    const first = after.find((next) => next.trim() !== '');

    if (first !== undefined && NONE.test(first.trim())) {
      return [];
    }

    const items = listItems(after);

    return Arr.isNonEmpty(items)
      ? items
          .filter((item) => deferralReasonOf(item) === undefined)
          .map(
            (item) =>
              `the deferred finding "${shortened(item)}" opens with no reason; ${DEFERRAL_RULE}`,
          )
      : [
          `the "**Deferred**" line lists nothing (with nothing deferred, write "**Deferred**: none." or leave the line out); ${DEFERRAL_RULE}`,
        ];
  });

/** The reasons a finding may be deferred for (`docs/code-review-loop.md`). */
export const DEFERRAL_REASONS = [
  'predates',
  'another change',
  'too large',
] as const;

export type DeferralReason = (typeof DEFERRAL_REASONS)[number];

/**
 * A parenthesized tag at the start of a finding, bold or not;
 * {@link deferralReasonOf} looks it up in {@link DEFERRAL_REASONS}, so the list
 * there is the only one.
 */
const DEFERRAL_TAG =
  /^[*_]{0,2}\((?<reason>[^()\n]+)\)[*_]{0,2}(?=[\s:,.;]|$)/u;

const DEFERRAL_RULE =
  'a deferred finding is an item under a "**Deferred**" line, opening with why it is out of scope: (predates), (another change) or (too large); a finding in scope is fixed in the pull request, whatever round raised it (docs/code-review-loop.md)';

/**
 * The line a list of deferred findings stands under: `**Deferred**`,
 * `**Deferred**:`, `**Deferred:**` or `Deferred:`, alone or followed by "none".
 */
const DEFERRED_HEADER =
  /^(?:\*\*Deferred\*\*:?|\*\*Deferred:\*\*|Deferred:)[ \t]*(?<rest>.*)$/u;

const NONE = /^none\.?$/iu;

/** At most three spaces: four or more make an indented code block. */
const HEADER_INDENT = /^ {0,3}\S/u;

/** A list item, bulleted or numbered, its indent removed. */
const LIST_ITEM = /^(?:[-*+]|\d{1,9}[.)])[ \t]+(?<text>.*)$/u;

/**
 * The text of each finding in the list `lines` open with
 * ({@link deferralProblemsIn}); none when they open with anything else.
 */
const listItems = (lines: readonly string[]): readonly string[] => {
  const mut_items: string[] = [];

  /** The indent of the first item, once there is one. */
  let mut_indent: number | undefined = undefined;

  /** Whether the line before was part of an item, with no blank between. */
  let mut_inItem = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      mut_inItem = false;

      continue;
    }

    const indent = (/^[ \t]*/u.exec(line)?.[0] ?? '').length;

    if (mut_indent !== undefined && indent > mut_indent) {
      continue;
    }

    const text = LIST_ITEM.exec(trimmed)?.groups?.['text'];

    if (text === undefined && mut_inItem) {
      continue;
    }

    if (text === undefined) {
      break;
    }

    mut_inItem = true;

    mut_indent ??= indent;

    mut_items.push(text.trim());
  }

  return mut_items;
};

/** `text`, cut to 60 characters with an ellipsis when longer. */
const shortened = (text: string): string => {
  const characters = Array.from(text);

  return characters.length > 60
    ? `${Arr.take(characters, asUint32(60)).join('')}…`
    : text;
};
