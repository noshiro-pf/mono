/**
 * The little of Markdown that more than one guard has to tell apart: what is
 * code and what is prose. A link or a path written in code is an example,
 * not a reference.
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

/** One line with its inline code spans taken out. */
export const withoutCodeSpans = (lineText: string): string =>
  lineText.replaceAll(CODE_SPAN, '');

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
 * number of `>` (a fence in a blockquote or an alert), then the info
 * string. Only a fence with no info string closes one, and a backtick fence's
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
