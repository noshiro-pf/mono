// cspell:ignore FFEF
import { Arr } from 'ts-data-forge';
import { markdownLines } from '../../lib/markdown.mjs';

/**
 * The paragraphs of a Markdown document that are not filled to the print width,
 * refilled: a line with room left for the first word of the line after it, or a
 * line past the width with a space it could break at.
 *
 * The heuristics are those of `ts-restrictions/no-ragged-comment-wrap`
 * (`libs/eslint-config-typed`), which does the same for comments; change the
 * two together. A run of lines is refilled only where no break in it may be
 * deliberate: a line ending a sentence (`.`, `?`, `!`, `:`) or with a hard line
 * break, a line of one word, a line before one that starts with a capital, and
 * two lines that both end with a comma end a run. A run of one line is never
 * judged, so a document that puts each paragraph on one line is left as it is.
 * Lines with a URL, East Asian text or an emoji, an image, inline HTML at the
 * start, or no letter or digit are never refilled, and neither is a run with an
 * odd number of backticks or unbalanced braces on a line or a tab in its
 * prefix. A document with `\r\n` line endings is not read: a refill writes
 * `\n`.
 *
 * A paragraph is read only when `isTouched` holds for one of its lines
 * (1-based).
 */
export const unfilledRuns = (
  fileText: string,
  isTouched: (line: number) => boolean,
  printWidth: number,
): readonly Refill[] =>
  fileText.includes('\r')
    ? ([] as const)
    : Arr.generate(function* () {
        for (const run of paragraphsOf(fileText)
          .filter((paragraph) => paragraph.some((l) => isTouched(l.line)))
          .flatMap(runsOf)) {
          const refill = refillOf(run, printWidth);

          if (refill !== undefined) {
            yield refill;
          }
        }
      });

/**
 * `fileText` with every refill in `refills` applied. They come from one
 * {@link unfilledRuns} of the same text, so they do not overlap.
 */
export const applyRefills = (
  fileText: string,
  refills: readonly Refill[],
): string =>
  refills
    .toSorted((a, b) => b.firstLine - a.firstLine)
    .reduce(
      (lines, { firstLine, lastLine, lines: replacement }) =>
        lines.toSpliced(
          firstLine - 1,
          lastLine - firstLine + 1,
          ...replacement,
        ),
      fileText.split('\n'),
    )
    .join('\n');

/** A run of lines to refill, and what to put there. */
export type Refill = Readonly<{
  /** 1-based, inclusive. */
  firstLine: number;
  lastLine: number;
  /** The first line whose text the refill changes, to report. */
  reportLine: number;
  /** The refilled lines, prefixes included. */
  lines: readonly string[];
}>;

/** One line of a paragraph, split into its prefix and its text. */
type ProseLine = Readonly<{
  /** 1-based. */
  line: number;
  /** Indentation, `>` markers and a list marker: `- `, `  `, `> 1. `. */
  prefix: string;
  /** What a line continuing this paragraph after this one is prefixed with. */
  continuation: string;
  /** The text after the prefix, without trailing whitespace. */
  text: string;
  /** The trailing whitespace the text was written with. */
  trailing: string;
  kind: 'special' | 'text';
  /** A Markdown hard line break ends it: a `\` or two trailing spaces. */
  hardBreak: boolean;
}>;

const width = (s: string): number => Array.from(s).length;

/**
 * The block quote markers that open `raw`, with one space after the last: `> `,
 * `> > `, `  >`.
 */
const quoteOf = (raw: string): string => {
  const lastMarker = (/^[ \t>]*/u.exec(raw)?.[0] ?? '').lastIndexOf('>');

  return lastMarker === -1
    ? ''
    : raw.slice(0, lastMarker + (raw[lastMarker + 1] === ' ' ? 2 : 1));
};

const LIST_ITEM =
  /^(?<indent>[ \t]*)(?<marker>[-*+]|\d{1,9}[.)])(?<space> +)(?<content>\S.*)$/u;

/**
 * A line that is a block of its own, or opens one, and is never paragraph text:
 * a heading, a table row, a rule or a setext underline, inline HTML or an HTML
 * block, a link reference definition or footnote, an MDX import or export, and
 * a Starlight aside (`:::note`).
 */
const BLOCK_LINE =
  /^[ \t]*(?:#{1,6}(?:\s|$)|\||<|\[[^\]]+\]:|(?:import|export)\s.*;$|:::)/u;

/** A thematic break or a setext underline, its spaces taken out. */
const RULE = /^(?:-{3,}|\*{3,}|_{3,}|={3,})$/u;

/** An HTML block runs until a blank line (CommonMark, types 6 and 7). */
const HTML_START = /^[ \t]*</u;

const SETEXT_UNDERLINE = /^[ \t]*(?:=+|-+)[ \t]*$/u;

const URL_LIKE = /\b(?:https?|file):\/\/|\bwww\./u;

const EAST_ASIAN =
  // eslint-disable-next-line security/detect-unsafe-regex -- one character class, nothing to backtrack
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u{3000}-\u{303F}\u{FF00}-\u{FFEF}\p{Extended_Pictographic}]/u;

/** A line ending this way may have been broken there on purpose. */
const DELIBERATE_END = /[.?!:]["'”’)\]*_`]*$/u;

/**
 * A word that means something else at the start of a line — a list marker, a
 * quote, HTML, a heading, a table row, a rule or setext underline, a fence, a
 * link reference definition, an aside — so a refill never puts one there.
 */
const LINE_START_SENSITIVE =
  /^(?:[-*+|]$|>|<|#|\[[^\]]+\]:|=+$|-+$|\d+[.)]$|```|~~~|:::)/u;

/**
 * The words of `text`: runs of characters other than an ASCII space, where a
 * code span or an MDX expression (`{/* bench:… *\/}`, which a generator finds
 * by its text) counts as one word however many spaces it holds.
 */
const wordsOf = (text: string): readonly string[] =>
  // eslint-disable-next-line security/detect-unsafe-regex -- unanchored and never made to fail, so nothing backtracks
  text.match(/(?:`[^`]*`|\{[^{}]*\}|[^ ])+/gu) ?? [];

const count = (text: string, pattern: RegExp): number =>
  text.match(pattern)?.length ?? 0;

const kindOf = (text: string): ProseLine['kind'] =>
  URL_LIKE.test(text) ||
  EAST_ASIAN.test(text) ||
  text.startsWith('<') ||
  text.includes('![') ||
  !/[A-Za-z0-9]/u.test(text)
    ? 'special'
    : 'text';

const isHardBreak = (raw: string): boolean =>
  raw.endsWith('\\') || (raw.endsWith('  ') && raw.trim() !== '');

const proseLine = (
  line: number,
  prefix: string,
  continuation: string,
  raw: string,
): ProseLine => {
  const text = raw.trimEnd();

  return {
    line,
    prefix,
    continuation,
    text,
    trailing: raw.slice(text.length),
    kind: kindOf(text),
    hardBreak: isHardBreak(raw),
  };
};

/**
 * The paragraphs of the document, as runs of lines, outside fences, front
 * matter, HTML blocks and indented code. A list item starts a paragraph of its
 * own; a paragraph a setext underline turns into a heading is dropped.
 */
const paragraphsOf = (fileText: string): readonly (readonly ProseLine[])[] => {
  const mut_paragraphs: (readonly ProseLine[])[] = [];

  let mut_current: ProseLine[] = [];

  // Inside an HTML block, which only a blank line ends.
  let mut_inHtml = false;

  // The content column of the list item the text below belongs to, if any.
  let mut_listColumn: number | undefined = undefined;

  const lines = markdownLines(fileText);

  const frontMatterEnd =
    lines[0]?.text === '---'
      ? lines.findIndex((l, i) => i > 0 && l.text === '---')
      : -1;

  const flush = (): void => {
    if (Arr.isNonEmpty(mut_current)) {
      mut_paragraphs.push(mut_current);
    }

    mut_current = [];
  };

  for (const [index, { line, text: raw, fenced }] of lines.entries()) {
    const quote = quoteOf(raw);

    const rest = raw.slice(quote.length);

    if (fenced || index <= frontMatterEnd || rest.trim() === '') {
      flush();

      mut_inHtml = false;

      continue;
    }

    if (Arr.isNonEmpty(mut_current) && SETEXT_UNDERLINE.test(rest)) {
      mut_current = [];

      continue;
    }

    if (
      mut_inHtml ||
      BLOCK_LINE.test(rest) ||
      RULE.test(rest.replaceAll(/[ \t]/gu, ''))
    ) {
      flush();

      mut_inHtml ||= HTML_START.test(rest);

      continue;
    }

    const item = LIST_ITEM.exec(rest)?.groups;

    if (item !== undefined) {
      flush();

      const itemPrefix =
        `${quote}${item['indent'] ?? ''}${item['marker'] ?? ''}${item['space'] ?? ''}` as const;

      mut_listColumn = width(itemPrefix) - width(quote);

      mut_current.push(
        proseLine(
          line,
          itemPrefix,
          `${quote}${' '.repeat(mut_listColumn)}`,
          item['content'] ?? '',
        ),
      );

      continue;
    }

    const indent = /^[ \t]*/u.exec(rest)?.[0] ?? '';

    if (!Arr.isNonEmpty(mut_current)) {
      // A line indented four or more past the content column is code.
      if (width(indent) >= (mut_listColumn ?? 0) + 4) {
        continue;
      }

      if (width(indent) < (mut_listColumn ?? 0)) {
        mut_listColumn = undefined;
      }
    }

    const prefix = `${quote}${indent}` as const;

    mut_current.push(
      proseLine(line, prefix, prefix, rest.slice(indent.length)),
    );
  }

  flush();

  return mut_paragraphs;
};

/**
 * The runs of `text` lines in `paragraph` that may be refilled as one: no
 * special line inside, and no break between two of them that may be deliberate.
 */
const runsOf = (
  paragraph: readonly ProseLine[],
): readonly (readonly ProseLine[])[] => {
  const mut_runs: (readonly ProseLine[])[] = [];

  let mut_run: ProseLine[] = [];

  for (const l of paragraph) {
    const previous = mut_run.at(-1);

    if (
      previous !== undefined &&
      (l.kind !== 'text' ||
        l.prefix !== previous.continuation ||
        DELIBERATE_END.test(previous.text) ||
        previous.hardBreak ||
        Arr.isFixedLengthArray(1, wordsOf(previous.text)) ||
        /^[A-Z]/u.test(l.text) ||
        (previous.text.endsWith(',') && l.text.endsWith(',')))
    ) {
      mut_runs.push(mut_run);

      mut_run = [];
    }

    if (l.kind === 'text') {
      mut_run.push(l);
    } else {
      mut_runs.push(mut_run);

      mut_run = [];
    }
  }

  mut_runs.push(mut_run);

  return mut_runs.filter(Arr.isNonEmpty);
};

/**
 * `words` filled greedily, the first line into `firstRoom` columns and the rest
 * into `room`. A line never starts with a word {@link LINE_START_SENSITIVE}
 * matches: the words before it go down with it, or, where only one would be
 * left, the line runs past the width.
 */
const fill = (
  words: readonly string[],
  firstRoom: number,
  room: number,
): readonly string[] => {
  const mut_lines: (readonly string[])[] = [];

  let mut_line: string[] = [];

  const roomOf = (): number => (Arr.isEmpty(mut_lines) ? firstRoom : room);

  for (const word of words) {
    if (
      !Arr.isNonEmpty(mut_line) ||
      width(mut_line.join(' ')) + 1 + width(word) <= roomOf()
    ) {
      mut_line.push(word);

      continue;
    }

    const mut_carried: string[] = [word];

    while (
      LINE_START_SENSITIVE.test(mut_carried[0] ?? '') &&
      mut_line.length > 1
    ) {
      mut_carried.unshift(mut_line.pop() ?? '');
    }

    if (LINE_START_SENSITIVE.test(mut_carried[0] ?? '')) {
      mut_line.push(...mut_carried);
    } else {
      mut_lines.push(mut_line);

      mut_line = mut_carried;
    }
  }

  if (Arr.isNonEmpty(mut_line)) {
    mut_lines.push(mut_line);
  }

  return mut_lines.map((line) => line.join(' '));
};

const refillOf = (
  run: readonly ProseLine[],
  printWidth: number,
): Refill | undefined => {
  const first = run[0];

  const last = run.at(-1);

  if (
    first === undefined ||
    last === undefined ||
    // One line alone is never judged: it is how a document that puts each
    // paragraph on one line is written, and a break it lacks may be on purpose.
    run.length < 2 ||
    // A tab is as wide as Prettier's `tabWidth`, which this does not read.
    first.prefix.includes('\t') ||
    // A lone backtick would pair with one on another line and swallow the text
    // between them as a code span, and a lone brace opens an expression that
    // goes on past the line.
    run.some(
      (l) =>
        count(l.text, /`/gu) % 2 !== 0 ||
        count(l.text, /\{/gu) !== count(l.text, /\}/gu),
    )
  ) {
    return undefined;
  }

  const words = wordsOf(run.map((l) => l.text).join(' '));

  // A word ending with `\` that the fill puts at a line end would become a hard
  // line break.
  if (Arr.butLast(words).some((word) => word.endsWith('\\'))) {
    return undefined;
  }

  const filled = fill(
    words,
    printWidth - width(first.prefix),
    printWidth - width(first.continuation),
  );

  const changed = filled.findIndex((text, i) => run[i]?.text !== text);

  if (changed === -1 && filled.length === run.length) {
    return undefined;
  }

  return {
    firstLine: first.line,
    lastLine: last.line,
    reportLine:
      run[changed === -1 ? filled.length : changed]?.line ?? last.line,
    lines: filled.map(
      (text, i) =>
        `${i === 0 ? first.prefix : first.continuation}${text}${i === filled.length - 1 ? last.trailing : ''}`,
    ),
  };
};
