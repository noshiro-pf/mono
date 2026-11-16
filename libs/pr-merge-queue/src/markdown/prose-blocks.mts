// cspell:ignore FFFC
/**
 * The text a Markdown document shows a reader, block by block, as GitHub's
 * closing keywords are read from it.
 */

import { decodeNamedCharacterReference } from 'decode-named-character-reference';
import type { Nodes } from 'mdast';
import { fromMarkdown, type Options } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import { decodeNumericCharacterReference } from 'micromark-util-decode-numeric-character-reference';
import { asciiLowerCase, outsideCodeFences } from 'pr-report-core';
import { Arr, isNonNullObject, Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

/**
 * The text each block of `markdown` shows, in order, with the line of
 * `markdown` (from 0) each of its characters comes from.
 *
 * Read by a CommonMark parser with GitHub's extensions (tables, footnotes,
 * autolinks), not by patterns: where code, a code span or an HTML comment
 * begins and ends follows the parser, which no set of patterns did. Code,
 * fenced or indented, shows nothing. Within a block, a line break or a `<br>`
 * tag shows as a space, and a code span, an image or an `<img>` tag as U+FFFC
 * OBJECT REPLACEMENT CHARACTER ({@link objectAt}), so that the words on either
 * side stay apart; a tag that begins or ends a block
 * (`<p>`, `<li>`, `<td>`, …) is a line break, which no keyword is read across;
 * an HTML comment and any other inline tag show nothing, since GitHub joins the
 * text around them (`Fix<em>es</em>` and `Fix<!-- -->es` show `Fixes`), but a
 * number ends where an element begins ({@link joinedInline}). A `<script>`
 * element's content shows, since GitHub's tag filter leaves it text, on the
 * side of reading. Emphasis and a link leave their text alone (`**Fixes:** #12`
 * shows `Fixes: #12`). A table cell is a block, as GitHub renders each apart.
 *
 * An HTML block shows its text with its tags and comments taken out the same
 * way, and its character references decoded. The text of an HTML `<code>` or
 * `<pre>` is shown too, which is on the side of reading a keyword. An image's
 * alt text, a link's title and a tag's attributes show nothing.
 *
 * Lines are those of `markdown` split on `\n`, `\r\n` or a lone `\r`, as
 * CommonMark splits them. A body nested too deeply for the parser's stack, or
 * holding more than it reads in time ({@link MAX_LINE_MARKERS}), is read
 * without it, paragraph by paragraph as written ({@link asWritten}), on the
 * side of reading.
 */
export const proseBlocks = (markdown: string): readonly ProseBlock[] => {
  const source = markdown.replaceAll(/\r\n?/gu, '\n');

  if (isPastTheParser(source)) {
    return asWritten(source);
  }

  // The parser and the walk over inline nodes recurse, so a body nested deeply
  // enough runs either out of stack. That alone is read without it; anything
  // else thrown is a fault, not a body.
  const blocks = Result.fromThrowable(() =>
    allBlocksIn(parse(forTheParser(source))),
  );

  if (Result.isOk(blocks)) {
    return blocks.value;
  }

  if (!isStackOverflow(blocks.value)) {
    throw blocks.value;
  }

  return asWritten(source);
};

/** The line of the source that `offset` in `block`'s text is on. */
export const lineAt = (block: ProseBlock, offset: number): number =>
  block.lines[offset] ?? block.lines.at(-1) ?? 0;

/** A block's shown text, and the line of the source each character is on. */
export type ProseBlock = Readonly<{ text: string; lines: readonly number[] }>;

type MarkdownNode = DeepReadonly<Nodes>;

const EMPTY: ProseBlock = { text: '', lines: [] } as const;

/**
 * A backslash escaping a `#`, after any escaped backslashes (`$1`). GitHub reads
 * no reference in an escaped `#`, which the parser shows as a `#` like any
 * other, so the `#` is given U+FF03 FULLWIDTH NUMBER SIGN instead, which no
 * reference begins with and which is one UTF-16 unit, as `#` is: no position
 * moves. A text node then drops the backslash before it, and HTML, which takes
 * a backslash as it is, gives the `#` back ({@link shownHtml}).
 */
const ESCAPED_NUMBER_SIGN = /(?<!\\)((?:\\\\)*)\\#/gu;

/**
 * A character reference to a line feed. One in a text node would decode to a
 * line break the source has not, putting what follows it on a later line than
 * it is written on, so it is given a space's reference instead, which shows as
 * the line feed does within a block.
 */
const LINE_FEED_REFERENCE = /&#(?:0*10|[Xx]0*[Aa]);|&NewLine;/gu;

const PARSE_OPTIONS: Options = {
  extensions: [gfm()],
  // Without the transforms, which find the autolinks micromark leaves in text:
  // a link shows the text it was found in, and the nodes it splits that text
  // into have no position.
  mdastExtensions: gfmFromMarkdown().map((extension) => ({
    ...extension,
    transforms: [],
  })),
} as const;

/**
 * A comment (a processing instruction, a declaration or CDATA too, which HTML
 * reads as comments that end at the first `>`), a tag or a character reference
 * in HTML. A tag runs past a `>` in a quoted attribute value, a quote opening
 * one only after an `=` and the spaces after that; any other quote is a
 * character of the tag.
 * HTML also asks the `=` to follow an attribute's name, which this does not
 * check (#4316). ASCII letters only, as HTML reads a tag's name: no `i` flag,
 * which would take U+212A KELVIN SIGN for a `k`. A name ends at a space, a `/`
 * or a `>`, so `<li-x>` is another element.
 */
const HTML_PART =
  // The alternatives inside the tag's repetition start with distinct characters
  // (an `=`, or anything else), and the spaces after an `=` are followed by a
  // quote or by what is not one, so it never backtracks between them.
  // eslint-disable-next-line security/detect-unsafe-regex
  /<!--(?:-?>|[\s\S]*?(?:--!?>|(?![\s\S])))|<[!?][^>]*>?|<\/?[A-Za-z](?:[^<>=]|=[\t\n\f\r ]*(?:"[^"]*"|'[^']*'|(?=[^\t\n\f\r "'])))*>|&(?:#\d+|#[Xx][\dA-Fa-f]+|[A-Za-z][A-Za-z\d]*);/gu;

/**
 * A tag that begins or ends a block, so that no keyword is read across it, its
 * name folded to ASCII lower case.
 */
const BLOCK_TAG =
  /^<\/?(?:blockquote|caption|dd|details|div|dl|dt|figcaption|figure|h[1-6]|hr|li|ol|p|pre|summary|table|tbody|td|tfoot|th|thead|tr|ul)(?=[\t\n\f\r />])/u;

/**
 * A tag GitHub renders as a break between words within a block, its name folded
 * to ASCII lower case.
 */
const SPACING_TAG = /^<\/?br(?=[\t\n\f\r />])/u;

/**
 * A tag GitHub renders as an image, its name folded to ASCII lower case: shown
 * as a code span or an image is ({@link objectAt}).
 */
const IMAGE_TAG = /^<\/?(?:img|picture)(?=[\t\n\f\r />])/u;

/**
 * What a body may hold before it is read without the parser
 * ({@link asWritten}), since the parser takes time quadratic in each: the block
 * quote and list markers on one line and on all lines, the {@link DELIMITER}s,
 * the `<!` or `<?` that may open a comment, a declaration or a processing
 * instruction, the `<` and letter that may open a tag, the lines of `=` that
 * may underline a heading, the `[` and `]` of a link, and the lengths of backtick runs,
 * each of which the parser looks for a closing run of. Past them, a body of
 * GitHub's largest size takes the parser seconds or minutes; under them, about
 * two seconds at most, with every one near its limit. No description comes near
 * them.
 */
const MAX_LINE_MARKERS = 32;

const MAX_BODY_MARKERS = 4096;

const MAX_DELIMITERS = 4096;

const MAX_MARKUP_OPENERS = 64;

const MAX_TAG_OPENERS = 1024;

const MAX_UNDERLINES = 1024;

const MAX_BRACKETS = 8192;

const MAX_BACKTICK_RUN_LENGTHS = 16;

/**
 * The block quote and list markers that open a line, a list's only before a
 * space, a tab or the line's end, as CommonMark reads one: a rule or a word's
 * dash is none.
 */
const LINE_OPENING =
  // Each repetition is spaces and then one marker, which begins with no space,
  // so a line splits into repetitions one way only and it never backtracks
  // between them.
  // eslint-disable-next-line security/detect-unsafe-regex
  /^(?:[\t ]*(?:>|(?:[*+-]|\d{1,9}[.)])(?=[\t ]|$)))*/u;

const MARKER = />|[*+-]|\d{1,9}[.)]/gu;

/**
 * A `*` or a `~`, or a `_` not within a word, which may delimit emphasis or
 * strikethrough: CommonMark reads no `_` within a word, and the parser takes no
 * time over one.
 */
const DELIMITER = /[*~]|(?<![\p{L}\p{N}])_|_(?![\p{L}\p{N}])/gu;

/**
 * A code span within a line, its backtick runs whole so that each run is tried
 * once, or what may open a comment.
 */
const CODE_OR_COMMENT = /(?<!`)(`+)(?!`)[^`\n]*(?<!`)\1(?!`)|<!--/gu;

/** An autolink, a URL's or an email address's, its address in `$1`. */
const AUTOLINK =
  /<([A-Za-z][A-Za-z\d+.-]{1,31}:[^<>\s]*|[^<>\s@]+@[^<>\s@]+)>/gu;

/**
 * A tag within a line, its name in `$1`. The name and what follows it share no
 * character, so that an unclosed tag is scanned once.
 */
const TAG =
  // The name's characters and the one that ends it are apart, so it never
  // backtracks between them.
  // eslint-disable-next-line security/detect-unsafe-regex
  /<\/?([A-Za-z][A-Za-z\d-]*)(?:[\t\f />][^<>\n]*)?>/gu;

/** An ATX heading's line, which is a block of its own. */
const HEADING = /^ {0,3}#{1,6}(?:[\t ]|$)/u;

/** Whether `text` has a letter or a digit at `at`. */
const isWordAt = (text: string, at: number): boolean =>
  at >= 0 && /^[\p{L}\p{N}]/u.test(text.slice(at, at + 2));

/** Whether a number written up to `at` would run on into what `end` begins. */
const runsOn = (text: string, at: number, end: number): boolean =>
  /\d/u.test(text.slice(Math.max(at - 1, 0), at)) && isWordAt(text, end);

/**
 * `text` with each match of the global `pattern` replaced by what `shown` says
 * of it, its first group and where it begins.
 */
const replacedEach = (
  text: string,
  pattern: RegExp,
  shown: (match: string, group: string | undefined, at: number) => string,
): string => {
  const mut_parts: string[] = [];

  let mut_at = 0;

  for (const match of text.matchAll(pattern)) {
    mut_parts.push(
      text.slice(mut_at, match.index),
      shown(match[0], match[1], match.index),
    );

    mut_at = match.index + match[0].length;
  }

  mut_parts.push(text.slice(mut_at));

  return mut_parts.join('');
};

/**
 * A run of `*`, `~` and `_`, taken out unless it is between two letters or
 * digits, as emphasis or strikethrough delimits: one between them is kept, so
 * that it still ends a word or a number (`#3~5`). The run is matched whole, so
 * that a long one is scanned once.
 */
const withoutDelimiterRuns = (text: string): string =>
  replacedEach(text, /[*~_]+/gu, (run, _, at) =>
    isWordAt(text, at - 1) && isWordAt(text, at + run.length) ? run : '',
  );

const markersOpening = (line: string): number =>
  (LINE_OPENING.exec(line)?.[0] ?? '').match(MARKER)?.length ?? 0;

/**
 * Whether `source` holds more than the parser reads in time. Counted in all of
 * it, fenced code and code spans too, since what counts as either is the
 * parser's to say: an indented fence or an escaped backtick opens nothing.
 */
const isPastTheParser = (source: string): boolean => {
  const lines = source.split('\n');

  const markers = lines.map(markersOpening);

  const underlines = lines.filter((line) =>
    /^[\t ]*=+[\t ]*$/u.test(
      line.slice(LINE_OPENING.exec(line)?.[0].length ?? 0),
    ),
  ).length;

  const runLengths = new Set(source.match(/`+/gu)?.map((run) => run.length));

  return (
    markers.some((count) => count > MAX_LINE_MARKERS) ||
    Arr.sum(markers) > MAX_BODY_MARKERS ||
    (source.match(DELIMITER)?.length ?? 0) > MAX_DELIMITERS ||
    (source.match(/<[!?]/gu)?.length ?? 0) > MAX_MARKUP_OPENERS ||
    (source.match(/<\/?[A-Za-z]/gu)?.length ?? 0) > MAX_TAG_OPENERS ||
    underlines > MAX_UNDERLINES ||
    (source.match(/[[\]]/gu)?.length ?? 0) > MAX_BRACKETS ||
    runLengths.size > MAX_BACKTICK_RUN_LENGTHS
  );
};

/** The line each character of `text` is on, `text` starting on `start`. */
const lineOf = (text: string, start: number): readonly number[] =>
  // By UTF-16 unit, as a match's index counts: each line's units and the line
  // break ending it, the last line ending none.
  text
    .split('\n')
    .flatMap((segment, offset) =>
      Array.from({ length: segment.length + 1 }, () => start + offset),
    )
    .slice(0, text.length);

/**
 * One scan of {@link withoutCodeOrComments} from `from`: what it shows up to
 * `at`, cut short past the first comment it takes out (`isCut`), and the first
 * of `closes` it has not passed (`closeAt`).
 */
const scanFrom = (
  text: string,
  from: number,
  closes: readonly Readonly<{ index: number; end: number }>[],
  closeAt: number,
): Readonly<{ shown: string; at: number; isCut: boolean; closeAt: number }> => {
  const mut_parts: string[] = [];

  let mut_at = from;

  let mut_closeAt = closeAt;

  for (const match of text.slice(from).matchAll(CODE_OR_COMMENT)) {
    const [token] = match;

    const start = from + match.index;

    if (token.startsWith('`')) {
      mut_parts.push(text.slice(mut_at, start), '\u{FFFC}');

      mut_at = start + token.length;
    } else {
      // `<!-->` and `<!--->` end where they begin, as HTML reads them.
      const emptyEnd = text.startsWith('>', start + 4)
        ? start + 5
        : text.startsWith('->', start + 4)
          ? start + 6
          : undefined;

      while (
        (closes[mut_closeAt]?.index ?? Number.POSITIVE_INFINITY) <
        start + 4
      ) {
        mut_closeAt += 1;
      }

      const end = emptyEnd ?? closes[mut_closeAt]?.end;

      if (end !== undefined) {
        const breaks = text.slice(start, end).replaceAll(/[^\n]/gu, '');

        mut_parts.push(
          text.slice(mut_at, start),
          breaks === '' && runsOn(text, start, end) ? '\u{FFFC}' : breaks,
        );

        return {
          shown: mut_parts.join(''),
          at: end,
          isCut: true,
          closeAt: mut_closeAt,
        };
      }
    }
  }

  return {
    shown: mut_parts.join(''),
    at: mut_at,
    isCut: false,
    closeAt: mut_closeAt,
  };
};

/**
 * `text` with each code span within a line U+FFFC, as the parser shows one, and
 * each closed comment taken out but for its line breaks, so that the text
 * around it joins as GitHub joins it, though not a number, which a comment ends
 * as a tag does ({@link shownWritten}). Whichever begins first is taken: a
 * backtick in a comment opens no code span, and a `<!--` in a code span no
 * comment. A comment ends at `-->` or `--!>`, found among those listed once,
 * rather than by a lazy pattern, which would scan to the end once for each
 * `<!--` left open.
 */
const withoutCodeOrComments = (text: string): string => {
  const closes = Array.from(text.matchAll(/--!?>/gu), (match) => ({
    index: match.index,
    end: match.index + match[0].length,
  }));

  const mut_parts: string[] = [];

  let mut_scan = scanFrom(text, 0, closes, 0);

  mut_parts.push(mut_scan.shown);

  // Scanned again from past each comment taken out, since a match the scan
  // found within it may hide one that begins after it.
  while (mut_scan.isCut) {
    mut_scan = scanFrom(text, mut_scan.at, closes, mut_scan.closeAt);

    mut_parts.push(mut_scan.shown);
  }

  mut_parts.push(text.slice(mut_scan.at));

  return mut_parts.join('');
};

/** The text a character reference stands for, or the reference as written. */
const decoded = (reference: string): string => {
  const name = reference.slice(1, -1);

  if (!name.startsWith('#')) {
    const character = decodeNamedCharacterReference(name);

    return character === false ? reference : character;
  }

  // As the parser decodes one in Markdown text: U+FFFD for a number that is no
  // character, or a control.
  return /^#[Xx]/u.test(name)
    ? decodeNumericCharacterReference(name.slice(2), 16)
    : decodeNumericCharacterReference(name.slice(1), 10);
};

/** What {@link shownWritten} shows of each tag in `line`. */
const withoutTags = (line: string): string =>
  replacedEach(line, TAG, (tag, name, at) => {
    const folded = asciiLowerCase(name ?? '');

    return folded === 'img' ||
      folded === 'picture' ||
      BLOCK_TAG.test(`<${folded}>`) ||
      runsOn(line, at, at + tag.length)
      ? '\u{FFFC}'
      : folded === 'br'
        ? ' '
        : '';
  });

/**
 * A line of a body read without the parser, past its markers (`opening`), as
 * the parser would show it, near enough: an image, an `<img>` or `<picture>`
 * tag or a block's tag U+FFFC, a link, inline or by reference, its text, a
 * `<br>` tag a space, any other tag nothing, a character reference decoded, the
 * `*`, `~` and `_` of emphasis and strikethrough taken out, and a hard break's
 * `\` a space. A tag between a digit and a letter or a digit is U+FFFC, so that
 * a number ends where an element begins, as {@link joinedInline} ends it.
 */
const shownWritten = (rest: string): string =>
  withoutTags(
    withoutDelimiterRuns(rest)
      .replaceAll(AUTOLINK, '$1')
      .replaceAll(/!\[[^[\]\n]*\]\([^()\n]*\)/gu, '\u{FFFC}')
      .replaceAll(/\[([^[\]\n]*)\](?:\([^()\n]*\)|\[[^[\]\n]*\])/gu, '$1'),
  )
    .replaceAll(
      /&(?:#\d+|#[Xx][\dA-Fa-f]+|[A-Za-z][A-Za-z\d]*);/gu,
      (reference) => decoded(reference).replaceAll('\n', ' '),
    )
    .replace(/\\$/u, ' ');

/**
 * `source` read without the parser, on the side of reading: fenced code
 * blanked, a code span and a comment as {@link withoutCodeOrComments} reads
 * them, each line as {@link shownWritten} shows it, a block quote's markers
 * spaces and a list's kept, and each paragraph one block, its line breaks
 * spaces. A paragraph ends at a blank line, where a list item begins and where
 * a block quote begins. Indented code is read as text.
 */
const asWritten = (source: string): readonly ProseBlock[] => {
  const written = withoutCodeOrComments(outsideCodeFences(source)).split('\n');

  const openings = written.map((line) => LINE_OPENING.exec(line)?.[0] ?? '');

  const lines = written.map((line, i) => {
    const opening = openings[i] ?? '';

    return `${opening.replaceAll('>', ' ')}${shownWritten(line.slice(opening.length))}`;
  });

  const isBlank = lines.map((line) => line.trim() === '');

  const quoteDepths = openings.map((opening) => opening.split('>').length - 1);

  const isHeading = written.map((line) => HEADING.test(line));

  // A block ends at a blank line, where a list item begins, where a block quote
  // begins, and before and after a heading; a line leaving a block quote
  // continues its paragraph, as CommonMark reads it.
  const isBreak = lines.map(
    (_, i) =>
      isBlank[i] === true ||
      /[*+\-.)]/u.test(openings[i] ?? '') ||
      (quoteDepths[i] ?? 0) > (quoteDepths[i - 1] ?? 0) ||
      isHeading[i] === true ||
      isHeading[i - 1] === true,
  );

  // The first break after each line, -1 for none, in one pass from the end.
  const mut_nextBreaks: number[] = Array.from(
    { length: lines.length },
    () => -1,
  );

  for (let mut_i = lines.length - 2; mut_i >= 0; mut_i -= 1) {
    mut_nextBreaks[mut_i] =
      isBreak[mut_i + 1] === true
        ? mut_i + 1
        : (mut_nextBreaks[mut_i + 1] ?? -1);
  }

  return lines.flatMap((_, start) => {
    if (
      isBlank[start] === true ||
      (start > 0 && isBlank[start - 1] !== true && isBreak[start] !== true)
    ) {
      return [];
    }

    const end = mut_nextBreaks[start] ?? -1;

    const text = lines.slice(start, end === -1 ? undefined : end).join('\n');

    return [{ text: text.replaceAll('\n', ' '), lines: lineOf(text, start) }];
  });
};

/** What V8 throws when the stack runs out: a `RangeError`, from any realm. */
const isStackOverflow = (error: unknown): boolean => {
  if (!isNonNullObject(error)) {
    return false;
  }

  // `name` is the prototype's, which an own-key test would not find. Only the
  // stack's, by its message: any other `RangeError` is a fault.
  const message = Reflect.get(error, 'message');

  return (
    Reflect.get(error, 'name') === 'RangeError' &&
    typeof message === 'string' &&
    message.includes('call stack')
  );
};

/**
 * `source` as the parser is given it, each character on the line it is written
 * on: {@link ESCAPED_NUMBER_SIGN} and {@link LINE_FEED_REFERENCE} replaced.
 */
const forTheParser = (source: string): string =>
  source
    .replaceAll(ESCAPED_NUMBER_SIGN, '$1\\\u{FF03}')
    .replaceAll(LINE_FEED_REFERENCE, '&#32;');

const parse = (source: string): MarkdownNode =>
  fromMarkdown(source, PARSE_OPTIONS);

const joined = (parts: readonly ProseBlock[]): ProseBlock =>
  ({
    text: parts.map((part) => part.text).join(''),
    lines: parts.flatMap((part) => part.lines),
  }) as const;

/**
 * A code span or an image: U+FFFC OBJECT REPLACEMENT CHARACTER, which keeps the
 * words on either side apart as a space does, but which no separator of a
 * keyword takes, so that none is read across it (`Fixes \`x\` #12`).
 */
const objectAt = (line: number): ProseBlock =>
  ({ text: '\u{FFFC}', lines: [line] }) as const;

/**
 * Inline parts joined, U+FFFC ({@link objectAt}) between a digit and a letter or
 * a digit that two elements hold: GitHub reads a reference within one text, so
 * `#12**3**` names #12.
 */
const joinedInline = (parts: readonly ProseBlock[]): ProseBlock => {
  const mut_parts: ProseBlock[] = [];

  let mut_last: ProseBlock | undefined = undefined;

  for (const part of parts) {
    if (part.text !== '') {
      if (
        mut_last !== undefined &&
        /\d$/u.test(mut_last.text) &&
        /^[\p{L}\p{N}]/u.test(part.text)
      ) {
        mut_parts.push(objectAt(mut_last.lines.at(-1) ?? 0));
      }

      mut_last = part;
    }

    mut_parts.push(part);
  }

  return joined(mut_parts);
};

const spaceAt = (line: number): ProseBlock =>
  ({ text: ' ', lines: [line] }) as const;

/** A line break, which no separator of a keyword crosses. */
const breakAt = (line: number): ProseBlock =>
  ({ text: '\n', lines: [line] }) as const;

const firstLineOf = (node: MarkdownNode): number =>
  (node.position?.start.line ?? 1) - 1;

/** `text`, all on `line`. */
const onLine = (text: string, line: number): ProseBlock =>
  ({
    text,
    lines: Array.from({ length: text.length }, () => line),
  }) as const;

/** `text` from `line` on, each line break in it a space. */
const spaced = (text: string, line: number): ProseBlock =>
  ({
    text: text.replaceAll('\n', ' '),
    lines: lineOf(text, line),
  }) as const;

const lineBreaksIn = (text: string): number => text.split('\n').length - 1;

/**
 * What HTML shows, from `start`: its comments and tags as an inline one shows,
 * its character references decoded, and its own line breaks as spaces.
 */
const shownHtml = (source: string, start: number): ProseBlock => {
  const html = source.replaceAll('\\\u{FF03}', String.raw`\#`);

  // The text of each element, its references decoded within it, and what each
  // tag or comment between them shows.
  const mut_elements: ProseBlock[] = [];

  let mut_text: ProseBlock[] = [];

  let mut_at = 0;

  let mut_line = start;

  for (const match of html.matchAll(HTML_PART)) {
    const before = html.slice(mut_at, match.index);

    mut_text.push(spaced(before, mut_line));

    mut_line += lineBreaksIn(before);

    const [part] = match;

    if (part.startsWith('&')) {
      mut_text.push(onLine(decoded(part).replaceAll('\n', ' '), mut_line));
    } else {
      const tag = asciiLowerCase(part);

      mut_elements.push(
        joined(mut_text),
        BLOCK_TAG.test(tag)
          ? breakAt(mut_line)
          : SPACING_TAG.test(tag)
            ? spaceAt(mut_line)
            : IMAGE_TAG.test(tag)
              ? objectAt(mut_line)
              : EMPTY,
      );

      mut_text = [];
    }

    mut_line += lineBreaksIn(part);

    mut_at = match.index + part.length;
  }

  mut_text.push(spaced(html.slice(mut_at), mut_line));

  mut_elements.push(joined(mut_text));

  return joinedInline(mut_elements);
};

/** What an inline node shows. */
const shownInline = (node: MarkdownNode): ProseBlock => {
  switch (node.type) {
    case 'text': {
      // The backslash before an escaped `#`'s stand-in, which the parser shows
      // as it is, since the stand-in is no ASCII punctuation.
      const value = node.value.replaceAll('\\\u{FF03}', '\u{FF03}');

      const last = (node.position?.end.line ?? 1) - 1;

      // Counted back from the end, since a task list item's first text loses
      // the line break before it but keeps its start; a line still stays within
      // the node's.
      const first = Math.max(firstLineOf(node), last - lineBreaksIn(value));

      return {
        text: value.replaceAll('\n', ' '),
        lines: lineOf(value, first).map((line) => Math.min(line, last)),
      };
    }

    case 'inlineCode':
    case 'image':
    case 'imageReference':
      return objectAt(firstLineOf(node));

    case 'break':
      return spaceAt(firstLineOf(node));

    case 'html':
      // As HTML reads it, which may end a comment before CommonMark does.
      return shownHtml(node.value, firstLineOf(node));

    case 'emphasis':
    case 'strong':
    case 'delete':
    case 'link':
    case 'linkReference':
      return joinedInline(node.children.map(shownInline));

    case 'blockquote':
    case 'code':
    case 'definition':
    case 'footnoteDefinition':
    case 'footnoteReference':
    case 'heading':
    case 'list':
    case 'listItem':
    case 'paragraph':
    case 'root':
    case 'table':
    case 'tableCell':
    case 'tableRow':
    case 'thematicBreak':
    case 'yaml':
      return EMPTY;
  }
};

/** The blocks `node` is, or the children that hold them. */
const blocksIn = (
  node: MarkdownNode,
): readonly ProseBlock[] | Readonly<{ children: readonly MarkdownNode[] }> => {
  switch (node.type) {
    case 'paragraph':
    case 'heading':
    case 'tableCell':
      return [joinedInline(node.children.map(shownInline))];

    case 'html': {
      const block = shownHtml(node.value, firstLineOf(node));

      return block.text.trim() === '' ? [] : [block];
    }

    case 'root':
    case 'blockquote':
    case 'list':
    case 'listItem':
    case 'table':
    case 'tableRow':
    case 'footnoteDefinition':
      return { children: node.children };

    case 'break':
    case 'code':
    case 'definition':
    case 'delete':
    case 'emphasis':
    case 'footnoteReference':
    case 'image':
    case 'imageReference':
    case 'inlineCode':
    case 'link':
    case 'linkReference':
    case 'strong':
    case 'text':
    case 'thematicBreak':
    case 'yaml':
      return [];
  }
};

/**
 * The blocks under `root`, in order. A loop, not a recursion: a tree the parser
 * built may nest deeper than the stack allows a walk.
 */
const allBlocksIn = (root: MarkdownNode): readonly ProseBlock[] => {
  const mut_blocks: ProseBlock[] = [];

  const mut_pending: MarkdownNode[] = [root];

  for (
    let mut_node = mut_pending.pop();
    mut_node !== undefined;
    mut_node = mut_pending.pop()
  ) {
    const found = blocksIn(mut_node);

    if (Arr.isArray(found)) {
      mut_blocks.push(...found);
    } else {
      mut_pending.push(...found.children.toReversed());
    }
  }

  return mut_blocks;
};
