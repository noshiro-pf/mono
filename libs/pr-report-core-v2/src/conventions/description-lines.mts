/**
 * Lines of a description that tools read (`spec/conventions.md`, "Two-language
 * descriptions").
 */

import { Arr } from 'ts-data-forge';

/**
 * The heading read as the review section, suffix and all
 * (`## Review (/code-review high)`); the first in the body is the one.
 */
export const REVIEW_SECTION_HEADING = /^##\s+Review\b/u;

/** The start of a `Claude-Session:` trailer line. */
export const CLAUDE_SESSION_LINE = /^[^\S\n]*claude-session[^\S\n]*:/iu;

/**
 * The line `open-pr --merge-before` writes into pull request B for the pull
 * requests `numbers`, whose `Merge-After:` it has written B into
 * (`spec/conventions.md`, "Merges before"); `undefined` for none.
 */
export const mergesBeforeLine = (
  numbers: readonly number[],
): string | undefined =>
  Arr.isNonEmpty(numbers)
    ? (`Merges before ${numbers.map((n) => `#${n}`).join(', ')}, whose \`Merge-After:\` names this one.` as const)
    : undefined;

/**
 * Whether `line` is one {@link mergesBeforeLine} writes, indented as a
 * paragraph may be (up to three spaces) and with trailing spaces aside: prose,
 * with no counterpart in the translation. Only that line, so that a person's
 * sentence that starts the same way stays theirs. **Changed in v2**: v1 set
 * aside any line starting `Merges before #`.
 */
export const isMergesBeforeNote = (line: string): boolean => {
  const text = line.replace(PARAGRAPH_INDENT, '').trimEnd();

  return (
    text.startsWith('Merges before #') &&
    text ===
      mergesBeforeLine(
        Array.from(text.matchAll(NUMBER), (match) =>
          Number(match.groups?.['digits']),
        ),
      )
  );
};

/** At most three spaces: four or more make an indented code block. */
const PARAGRAPH_INDENT = /^ {0,3}(?! )/u;

const NUMBER = /#(?<digits>\d+)/gu;
