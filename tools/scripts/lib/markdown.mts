/**
 * The little of Markdown that more than one guard has to tell apart: what is
 * code and what is prose. A link or a path written in code is an example, not a
 * reference. And the little that more than one report needs to write: text that
 * fits on one line, or in one table cell.
 */

import { Arr } from 'ts-data-forge';

/**
 * Each line of a Markdown document, 1-based, with whether it belongs to a
 * fenced code block — the fences themselves included.
 */
export const markdownLines = (fileText: string): readonly MarkdownLine[] =>
  Arr.generate<MarkdownLine>(function* () {
    let mut_fence: Fence | undefined = undefined;

    for (const [index, text] of fileText.split(/\r?\n/u).entries()) {
      const fenceMatch = FENCE.exec(text)?.groups;

      const opensOrCloses =
        fenceMatch !== undefined &&
        !(
          fenceMatch['fence']?.startsWith('`') === true &&
          fenceMatch['info']?.includes('`') === true
        );

      const fenced = mut_fence !== undefined || opensOrCloses;

      if (opensOrCloses) {
        mut_fence = nextFence(
          mut_fence,
          fenceMatch['fence'] ?? '',
          fenceMatch['info'] ?? '',
        );
      }

      yield { line: index + 1, text, fenced };
    }
  });

/** The inline code spans of one line, as written between the backticks. */
export const codeSpans = (lineText: string): readonly string[] =>
  Array.from(
    lineText.matchAll(CODE_SPAN),
    (span) => span.groups?.['code'] ?? '',
  );

/**
 * Where each inline code span of one line is, its backticks included: `start`
 * is the index of its first backtick, `end` the index just past its last. Read
 * as CommonMark reads them: a run of backticks opens a span that the next run
 * of the same length closes, so a span may hold shorter runs (`` a`b ``); a
 * run that nothing closes is text, and so is a backtick a backslash escapes.
 */
export const codeSpanRanges = (
  lineText: string,
): readonly Readonly<{ start: number; end: number }>[] =>
  Arr.generate(function* () {
    // A backslash escapes the first backtick of a run outside a span, so a run
    // after an odd number of them opens one backtick later.
    const runs = Array.from(
      lineText.matchAll(/(?<backslashes>\\*)`+/gu),
      (run) => {
        const escaped = (run.groups?.['backslashes']?.length ?? 0) % 2 === 1;

        const start = run.index + (run.groups?.['backslashes']?.length ?? 0);

        return {
          start,
          openAt: escaped ? start + 1 : start,
          end: run.index + run[0].length,
        };
      },
    );

    let mut_closedThrough = -1;

    for (const [index, open] of runs.entries()) {
      if (index <= mut_closedThrough) {
        continue;
      }

      const length = open.end - open.openAt;

      if (length === 0) {
        continue;
      }

      const closeAt = runs.findIndex(
        (run, at) => at > index && run.end - run.start === length,
      );

      const close = runs[closeAt];

      if (close === undefined) {
        continue;
      }

      mut_closedThrough = closeAt;

      yield { start: open.openAt, end: close.end };
    }
  });

/** One line with its inline code spans taken out. */
export const withoutCodeSpans = (lineText: string): string =>
  lineText.replaceAll(CODE_SPAN, '');

/** Text on one line: every run of whitespace one space, none at the ends. */
export const oneLine = (text: string): string =>
  text.replaceAll(/\s+/gu, ' ').trim();

/**
 * Text safe in a Markdown table cell: one line, each `|` escaped, and the
 * backslashes just before one doubled, so that no `|` it has ends the cell.
 * Other backslashes are left alone, since a code span in the text shows them as
 * they are.
 */
export const tableCell = (text: string): string =>
  oneLine(text).replaceAll(
    /(\\*)\|/gu,
    (_match: string, backslashes: string | undefined) =>
      `${backslashes ?? ''}${backslashes ?? ''}${String.raw`\|`}`,
  );

export type MarkdownLine = Readonly<{
  /** 1-based. */
  line: number;
  text: string;
  fenced: boolean;
}>;

type Fence = Readonly<{ char: string; length: number }>;

/**
 * An opening or closing fence: three or more backticks or tildes, indented by
 * anything (a fence in a list item is indented by the item) and behind any
 * number of `>` (a fence in a blockquote or an alert), then the info string.
 * Only a fence with no info string closes one, and a backtick fence's
 * info string has no backtick — ```` ```ts``` と書く ```` is a code span at
 * the start of a line, not a fence.
 */
const FENCE = /^[\s>]*(?<fence>`{3,}|~{3,})(?<info>.*)$/u;

/**
 * An inline code span: a run of backticks, the code, and a run of the same
 * length. A span that wraps onto the next line is not read; what such a
 * mismatch pairs has spaces in it, which no path has.
 */
const CODE_SPAN = /(?<!`)(?<ticks>`+)(?!`)(?<code>[^`]+)\k<ticks>(?!`)/gu;

const nextFence = (
  open: Fence | undefined,
  fence: string,
  info: string,
): Fence | undefined => {
  if (open === undefined) {
    return { char: fence.slice(0, 1), length: fence.length };
  }

  const closes =
    fence.slice(0, 1) === open.char &&
    fence.length >= open.length &&
    info.trim() === '';

  return closes ? undefined : open;
};
