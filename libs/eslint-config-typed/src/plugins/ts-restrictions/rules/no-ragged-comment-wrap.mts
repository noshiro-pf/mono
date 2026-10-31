// cspell:ignore FFEF licen
import {
  AST_TOKEN_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly, FixedLengthTuple } from 'ts-type-forge';

type Options = readonly [
  Readonly<{
    printWidth?: number;
  }>?,
];

type MessageIds = 'raggedWrap';

/**
 * Report a comment paragraph wrapped unevenly: a line with room left for the
 * first word of the line after it. Prettier does not reflow comments, so a
 * paragraph edited after it was wrapped keeps whatever line breaks the edit
 * left behind.
 *
 * ## What is a paragraph
 *
 * A run of `//` comments, each alone on its line, on consecutive lines in the
 * same column; or the lines of a `/* ... *\/` or `/** ... *\/` block whose every line between
 * the delimiters starts with `*`. A blank comment line ends a paragraph, and so
 * does a line the rule leaves alone:
 *
 * - a line starting with more whitespace than the comment prefix (indented
 *   code, a list item's continuation), a list item (`-`, `*`, `+`, `1.`), a
 *   JSDoc tag (`@param`, and every line after the first tag of a block), a
 *   Markdown heading, quote or table row, a fence and every line inside it, a
 *   rule of `-`, `=` or `*`;
 * - a line with a URL in it, or with East Asian text or an emoji, which are
 *   two columns wide and, for East Asian text, wrap without spaces;
 * - a directive (`eslint-disable`, `cspell:`, `@ts-expect-error`,
 *   `prettier-ignore`, `#region`, a triple-slash reference, …), or a marker or
 *   label: one hyphenated word, a file path alone, a line with no letter or
 *   digit;
 * - what reads as code rather than prose: `//`, ` = `, `=>`, an arrow mapping
 *   (` -> `, ` → `), a line ending with `;`, `{`, `}` or a call `f(x)`, or one
 *   starting with a call or with `const`, `return` and the like (code spans
 *   aside);
 * - a comment before the first token of the file that mentions a copyright or
 *   a license, and any `/*!` block.
 *
 * Between two lines the rule also assumes the author broke on purpose, and
 * neither reports nor joins there, where the first ends a sentence (`.`, `?`,
 * `!` or `:` — one sentence per line, or a colon introducing what follows) or
 * with a Markdown hard line break (`\` or two spaces), where the first is one
 * word alone (a label: `// TODO`), where the second starts with a capital (a
 * note of its own, more often than a sentence going on with a proper noun), or
 * where both end with a comma (items of a list). A line that stops mid-sentence
 * with room to spare is never deliberate; these are the cases where it may be,
 * and a missed report costs less than a paragraph joined wrongly.
 *
 * A code span or an inline tag (`` `a b` ``, `{@link A b}`) counts as one word,
 * so the rule neither asks for one to be broken nor breaks it. A paragraph with
 * a line holding an odd number of backticks is left alone, since which of them
 * pair is a guess, and so is one indented with tabs, whose width is
 * Prettier's `tabWidth`.
 *
 * ## Print width
 *
 * The `printWidth` option; or else that of the nearest Prettier configuration
 * above the file, looked for as Prettier does — the `prettier` key of a
 * `package.json`, then `.prettierrc` and the other `.prettierrc.*` and
 * `prettier.config.*` files; or else 80, Prettier's default. Only JSON is read
 * (`package.json`, `.prettierrc`, `.prettierrc.json`): the nearest
 * configuration in another format, or one naming a shared configuration, gives
 * 80, and neither a `printWidth` set only in `overrides` nor an `.editorconfig`
 * `max_line_length` (which Prettier reads when its own configuration sets no
 * `printWidth`) is seen. Pass the option for any of these.
 *
 * ## Fix
 *
 * The fix refills the paragraph: its words, in order, as many on each line as
 * fit within the print width, every line keeping the first line's indentation
 * and comment prefix. A word longer than the width gets a line of its own. A
 * word that means something else at the start of a line (`@internal`, `-`, `>`,
 * `#`, `1.`) is never put there: the word before it goes down with it.
 * No fix is offered in a file with `\r\n` line endings.
 */
export const noRaggedCommentWrap: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Disallow a comment paragraph wrapped unevenly: a line with room for the first word of the line after it',
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          printWidth: {
            type: 'integer',
            minimum: 1,
            description:
              "The width to wrap comments at (default: the nearest JSON Prettier configuration's `printWidth`, else 80)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      raggedWrap:
        'This comment line has room for "{{word}}", the first word of the next line, within {{printWidth}} columns. Reflow the paragraph so that each line is filled.',
    },
    defaultOptions: [{}],
  },

  create: (context) => {
    let mut_printWidth: number | undefined = context.options[0]?.printWidth;

    // Looked up only for a file with a paragraph to judge.
    const printWidth = (): number => {
      mut_printWidth ??= printWidthOfPrettierConfig(
        path.resolve(path.dirname(context.physicalFilename)),
      );

      return mut_printWidth;
    };

    return {
      Program: (program) => {
        const { sourceCode } = context;

        const firstToken = sourceCode.getFirstToken(program);

        const fileContext: FileContext = {
          printWidth,
          hasCarriageReturn: sourceCode.text.includes('\r'),
        };

        for (const paragraph of paragraphsOf(sourceCode, firstToken)) {
          for (const segment of segmentsOf(paragraph)) {
            reportSegment(context, fileContext, segment);
          }
        }
      },
    };
  },
} as const;

/** What every report in a file reads. */
type FileContext = Readonly<{
  printWidth: () => number;
  /** The fix writes `\n`, so a file with `\r` in it is left alone. */
  hasCarriageReturn: boolean;
}>;

/** One line of a comment, split into its prefix and its text. */
type CommentLine = DeepReadonly<{
  /** 1-based. */
  line: number;
  /** The indentation and the comment marker: `  // `, `   * `. */
  prefix: string;
  /** The text after the prefix, without trailing whitespace. */
  text: string;
  /** Source offsets of `text`. */
  range: FixedLengthTuple<2, number>;
  kind: 'blank' | 'special' | 'text';
  /** A Markdown hard line break ends it: a `\` or two trailing spaces. */
  hardBreak: boolean;
}>;

const DEFAULT_PRINT_WIDTH = 80;

const LIST_ITEM = /^(?:[-*+]|\d+[.)])\s/u;

const FENCE = /^(?:`{3,}|~{3,})/u;

/** A Markdown link reference definition or footnote: `[label]: target`. */
const LINK_DEFINITION = /^\[[^\]]+\]:/u;

const DIRECTIVE =
  /^(?:eslint\b|eslint-|global |globals |exported |cspell[: ]|spell-checker:|@ts-|prettier-ignore|istanbul |c8 |v8 |biome-ignore|oxlint-|#region|#endregion|<reference |@jsx|@vitest-environment|transformer-ignore|embed-sample-code|noinspection )/u;

/**
 * A first word that may be some tool's directive, listed or not
 * (`deno-lint-ignore`, `tslint:disable`, `type-coverage:ignore-next-line`):
 * hyphenated, or with a colon inside.
 */
const DIRECTIVE_LIKE_FIRST_WORD = /^[\w@$]+[-:][\w-]/u;

/** A line holding one hyphenated word: a marker, or a label over code. */
const MARKER = /^[a-z0-9]+-[a-z0-9-]*[a-z0-9]$/u;

/**
 * Commented-out code, or a mapping written with arrows, rather than prose; read
 * outside its code spans.
 */
const CODE_LIKE =
  /\/\/|\s=\s|=>|\s(?:->|→)\s|[;{}]$|[\w$\]]\([^()]*\)$|^[\w$.]+\(|^(?:const|let|var|import|export|return|await|function|type \w+ =) /u;

/** A line holding only a file path: a label over what follows. */
// eslint-disable-next-line security/detect-unsafe-regex -- the segments cannot overlap: `/` separates them and is in neither
const PATH_ONLY = /^[\w@.-]+(?:\/[\w@.-]+)+$/u;

const DECORATION = /^[-=*_#~]{3,}/u;

const URL_LIKE = /\b(?:https?|file):\/\/|\bwww\./u;

const EAST_ASIAN =
  // eslint-disable-next-line security/detect-unsafe-regex -- one character class, nothing to backtrack
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u{3000}-\u{303F}\u{FF00}-\u{FFEF}\p{Extended_Pictographic}]/u;

const LICENSE = /copyright|licen[cs]e/iu;

/** A line ending this way may have been broken there on purpose. */
const DELIBERATE_END = /[.?!:]["'”’)\]*_`]*$/u;

/**
 * A word that means something else at the start of a line — a JSDoc tag, a list
 * marker, a quote, an HTML block, a heading or a setext underline, a table row,
 * a fence, a directive (`eslint-disable-next-line`, `#region`,
 * `cspell:disable`) — so the fix never puts one there.
 */
const LINE_START_SENSITIVE =
  /^(?:@\S|[-*+|]$|>|<(?:!--|\/?[A-Za-z])|#|\[[^\]]+\]:|=+$|-+$|\d+[.)]$|```|~~~|eslint\b|eslint-|oxlint-|biome-ignore|prettier-ignore|cspell:|spell-checker:|(?:istanbul|c8|v8)$|transformer-ignore|embed-sample-code)/u;

/** Prettier configuration files the rule cannot read: their presence is all. */
const UNREADABLE_CONFIG_FILES = [
  '.prettierrc.yaml',
  '.prettierrc.yml',
  '.prettierrc.json5',
  '.prettierrc.toml',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.mjs',
  '.prettierrc.ts',
  '.prettierrc.cts',
  '.prettierrc.mts',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  'prettier.config.ts',
  'prettier.config.cts',
  'prettier.config.mts',
] as const;

const width = (s: string): number => Array.from(s).length;

/**
 * The words of `text`: runs of characters other than an ASCII space (a no-break
 * space or a tab is part of a word, and stays as written), where a code span or an
 * inline tag (`` `a b` ``, `{@link A b}`) is part of a word however many spaces
 * it holds, since breaking one across lines garbles it.
 */
const wordsOf = (text: string): readonly string[] =>
  // eslint-disable-next-line security/detect-unsafe-regex -- unanchored and never made to fail, so nothing backtracks
  text.match(/(?:`[^`]*`|\{@[^}]*\}|[^ ])+/gu) ?? [];

const firstWord = (text: string): string => wordsOf(text)[0] ?? '';

const lineWidth = (words: readonly string[]): number =>
  words.reduce((total, word) => total + width(word), 0) +
  Math.max(0, words.length - 1);

const printWidthInJson = (json: unknown): number | undefined =>
  isRecord(json) &&
  typeof json['printWidth'] === 'number' &&
  Number.isInteger(json['printWidth']) &&
  json['printWidth'] > 0
    ? json['printWidth']
    : undefined;

const parseJson = (file: string): unknown => {
  try {
    // A Prettier configuration file the rule looks for by name.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
};

/**
 * The `printWidth` of the Prettier configuration in `dir`, searched for in the
 * order Prettier searches: a number, `null` when there is a configuration that
 * sets none or that the rule cannot read (a `.prettierrc.yaml`, a
 * `prettier.config.mjs`, a `"prettier": "@org/config"` reference), `undefined`
 * when there is none.
 */
const printWidthIn = (dir: string): number | null | undefined => {
  const packageJson = path.join(dir, 'package.json');

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the package.json in a directory above the file
  if (existsSync(packageJson)) {
    const manifest = parseJson(packageJson);

    if (isRecord(manifest) && hasKey(manifest, 'prettier')) {
      return printWidthInJson(manifest.prettier) ?? null;
    }
  }

  const packageYaml = path.join(dir, 'package.yaml');

  if (
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the package.yaml in a directory above the file
    existsSync(packageYaml) &&
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the same file
    /^prettier:/mu.test(readFileSync(packageYaml, 'utf8'))
  ) {
    return null;
  }

  for (const name of ['.prettierrc', '.prettierrc.json'] as const) {
    const file = path.join(dir, name);

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a Prettier configuration file looked for by name
    if (existsSync(file)) {
      return printWidthInJson(parseJson(file)) ?? null;
    }
  }

  return UNREADABLE_CONFIG_FILES.some((name) =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a Prettier configuration file looked for by name
    existsSync(path.join(dir, name)),
  )
    ? null
    : undefined;
};

/**
 * The `printWidth` of the Prettier configuration nearest to `dir`, or 80 when
 * it sets none, cannot be read, or there is none. Not cached, so that an editor
 * that keeps ESLint running sees a change to it.
 */
const printWidthOfPrettierConfig = (dir: string): number => {
  const found = printWidthIn(dir);

  const parent = path.dirname(dir);

  return found === undefined
    ? parent === dir
      ? DEFAULT_PRINT_WIDTH
      : printWidthOfPrettierConfig(parent)
    : (found ?? DEFAULT_PRINT_WIDTH);
};

/** How a line's text reads, before the context of its neighbors. */
const kindOf = (text: string): CommentLine['kind'] => {
  if (text === '') {
    return 'blank';
  }

  return /^\s/u.test(text) ||
    LIST_ITEM.test(text) ||
    FENCE.test(text) ||
    DIRECTIVE.test(text) ||
    DIRECTIVE_LIKE_FIRST_WORD.test(text) ||
    LINK_DEFINITION.test(text) ||
    DECORATION.test(text) ||
    MARKER.test(text) ||
    PATH_ONLY.test(text) ||
    URL_LIKE.test(text) ||
    EAST_ASIAN.test(text) ||
    CODE_LIKE.test(text.replaceAll(/`[^`]*`|\{@[^}]*\}/gu, '``')) ||
    !/[A-Za-z0-9]/u.test(text) ||
    // eslint-disable-next-line security/detect-unsafe-regex -- one character class, nothing to backtrack
    /^(?:[-=<>+~^|#@\u{2190}-\u{21FF}]|\.\.\.)/u.test(text)
    ? 'special'
    : 'text';
};

/**
 * Marks a fence and everything inside it, and in a JSDoc block everything from
 * the first tag on, as special.
 */
const withBlocks = (
  lines: readonly CommentLine[],
  isJsDoc: boolean,
  startsInTags: boolean,
): readonly CommentLine[] => {
  // The opening fence (`` ``` `` or `~~~`, three or more), which only the same
  // character repeated at least as often closes.
  let mut_fence: string | undefined = undefined;

  let mut_inTags = startsInTags;

  return lines.map((l) => {
    const marker = FENCE.exec(l.text)?.[0];

    if (isJsDoc && l.text.startsWith('@')) {
      mut_inTags = true;
    }

    const special =
      mut_fence !== undefined || marker !== undefined || mut_inTags;

    if (marker !== undefined) {
      if (mut_fence === undefined) {
        mut_fence = marker;
      } else if (
        marker[0] === mut_fence[0] &&
        marker.length >= mut_fence.length
      ) {
        mut_fence = undefined;
      }
    }

    return special && l.kind !== 'blank' ? { ...l, kind: 'special' } : l;
  });
};

const isHardBreak = (raw: string): boolean =>
  raw.endsWith('\\') || (raw.endsWith('  ') && raw.trim() !== '');

const lineCommentLine = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  comment: DeepReadonly<TSESTree.LineComment>,
): CommentLine => {
  const indent = (sourceCode.lines[comment.loc.start.line - 1] ?? '').slice(
    0,
    comment.loc.start.column,
  );

  // `///` is a triple-slash directive, and `//x` has no space to keep.
  const spaced = comment.value.startsWith(' ');

  const raw = spaced ? comment.value.slice(1) : comment.value;

  const text = raw.trimEnd();

  const start = comment.range[0] + 2 + (spaced ? 1 : 0);

  return {
    line: comment.loc.start.line,
    prefix: `${indent}//${spaced ? ' ' : ''}`,
    text,
    range: [start, start + text.length],
    kind: spaced || text === '' ? kindOf(text) : 'special',
    hardBreak: isHardBreak(raw),
  };
};

/**
 * The lines between the delimiters of a block comment written in the JSDoc
 * style, or `undefined` for any other block comment.
 */
const blockCommentLines = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  comment: DeepReadonly<TSESTree.BlockComment>,
): readonly CommentLine[] | undefined => {
  const { start, end } = comment.loc;

  if (start.line === end.line || comment.value.startsWith('!')) {
    return undefined;
  }

  // The lines between `/**` and `*/`, each `*` and what follows it.
  const matches = sourceCode.lines
    .slice(start.line, end.line - 1)
    .map((source) => /^(\s*\*)( ?)(.*)$/u.exec(source));

  if (matches.includes(null)) {
    return undefined;
  }

  const lines = matches.map((match, i): CommentLine => {
    const [, marker = '', space = '', rest = ''] = match ?? [];

    const line = start.line + 1 + i;

    const text = rest.trimEnd();

    const textStart =
      sourceCode.getIndexFromLoc({ line, column: 0 }) +
      marker.length +
      space.length;

    return {
      line,
      prefix: `${marker}${space === '' ? ' ' : space}`,
      text,
      range: [textStart, textStart + text.length],
      kind: text === '' || space !== '' ? kindOf(text) : 'special',
      hardBreak: isHardBreak(rest),
    };
  });

  // `/** @example` puts the first tag on the opening line.
  return withBlocks(
    lines,
    comment.value.startsWith('*'),
    /^\*\s*@/u.test(comment.value),
  );
};

const isLicenseHeader = (
  comment: DeepReadonly<TSESTree.Comment>,
  firstToken: DeepReadonly<TSESTree.Token> | null,
): boolean =>
  (firstToken === null || comment.range[1] <= firstToken.range[0]) &&
  LICENSE.test(comment.value);

/**
 * The comment paragraphs of the file: each run of `//` comments alone on
 * consecutive lines in one column, and each JSDoc-style block comment.
 */
const paragraphsOf = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  firstToken: DeepReadonly<TSESTree.Token> | null,
): readonly (readonly CommentLine[])[] => {
  const mut_paragraphs: (readonly CommentLine[])[] = [];

  let mut_run: DeepReadonly<TSESTree.LineComment>[] = [];

  const flushRun = (): void => {
    if (mut_run.every((c) => !isLicenseHeader(c, firstToken))) {
      mut_paragraphs.push(
        withBlocks(
          mut_run.map((c) => lineCommentLine(sourceCode, c)),
          false,
          false,
        ),
      );
    }

    mut_run = [];
  };

  for (const comment of sourceCode.getAllComments()) {
    const before = sourceCode.getTokenBefore(comment, {
      includeComments: true,
    });

    const alone =
      before === null || before.loc.end.line < comment.loc.start.line;

    if (!alone || comment.type !== AST_TOKEN_TYPES.Line) {
      flushRun();

      if (
        alone &&
        comment.type === AST_TOKEN_TYPES.Block &&
        !isLicenseHeader(comment, firstToken)
      ) {
        const lines = blockCommentLines(sourceCode, comment);

        if (lines !== undefined) {
          mut_paragraphs.push(lines);
        }
      }

      continue;
    }

    const previous = mut_run.at(-1);

    if (
      previous !== undefined &&
      (previous.loc.start.line + 1 !== comment.loc.start.line ||
        previous.loc.start.column !== comment.loc.start.column)
    ) {
      flushRun();
    }

    mut_run.push(comment);
  }

  flushRun();

  return mut_paragraphs;
};

/**
 * The runs of `text` lines in `lines` that a fix may refill as one: no blank or
 * special line inside, and no line but the last ending a sentence.
 */
const segmentsOf = (
  lines: readonly CommentLine[],
): readonly (readonly CommentLine[])[] => {
  const mut_segments: (readonly CommentLine[])[] = [];

  let mut_current: CommentLine[] = [];

  for (const l of lines) {
    const previous = mut_current.at(-1);

    if (
      previous !== undefined &&
      (l.kind !== 'text' ||
        l.prefix !== previous.prefix ||
        DELIBERATE_END.test(previous.text) ||
        previous.hardBreak ||
        // One word alone on a line is a label: `// TODO`, `// Elevations`.
        Arr.isFixedLengthArray(1, wordsOf(previous.text)) ||
        // A capital after a line with no full stop starts a note of its own
        // (`// Fetch the rows` / `// Render them`) more often than it continues
        // a sentence with a proper noun, which is then left alone.
        /^[A-Z]/u.test(l.text) ||
        // Two lines ending with commas are items of a list, or code.
        (previous.text.endsWith(',') && l.text.endsWith(',')))
    ) {
      mut_segments.push(mut_current);

      mut_current = [];
    }

    if (l.kind === 'text') {
      mut_current.push(l);
    }
  }

  mut_segments.push(mut_current);

  return mut_segments.filter((s) => s.length > 1);
};

/**
 * `words` filled greedily into lines of at most `room` columns. A line never
 * starts with a word {@link LINE_START_SENSITIVE} matches: the words before it
 * go down with it, or, where only one would be left, the line runs past the
 * width.
 */
const fill = (words: readonly string[], room: number): readonly string[] => {
  const mut_lines: (readonly string[])[] = [];

  let mut_line: string[] = [];

  for (const word of words) {
    if (
      !Arr.isNonEmpty(mut_line) ||
      lineWidth(mut_line) + 1 + width(word) <= room
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

const reportSegment = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, Options>>,
  { printWidth: printWidthOf, hasCarriageReturn }: FileContext,
  segment: readonly CommentLine[],
): void => {
  const printWidth = printWidthOf();

  const ragged = segment.findIndex((l, i) => {
    const next = segment[i + 1];

    return (
      next !== undefined &&
      width(l.prefix) + width(l.text) + 1 + width(firstWord(next.text)) <=
        printWidth
    );
  });

  const line = segment[ragged];

  const first = segment[0];

  const last = segment.at(-1);

  if (
    line === undefined ||
    first === undefined ||
    last === undefined ||
    // A tab is as wide as Prettier's `tabWidth`, which the rule does not read.
    first.prefix.includes('\t') ||
    // A lone backtick would pair with one on another line and swallow the text
    // between them as a code span.
    segment.some((l) => (l.text.match(/`/gu)?.length ?? 0) % 2 !== 0)
  ) {
    return;
  }

  const words = wordsOf(segment.map((l) => l.text).join(' '));

  // A word ending with `\` that the fill puts at a line end would become a
  // Markdown hard line break.
  if (Arr.butLast(words).some((word) => word.endsWith('\\'))) {
    return;
  }

  const filled = fill(words, printWidth - width(first.prefix));

  // A line with room for the next word whose refill changes nothing is left
  // alone.
  if (filled.join('\n') === segment.map((l) => l.text).join('\n')) {
    return;
  }

  const { sourceCode } = context;

  context.report({
    loc: {
      start: sourceCode.getLocFromIndex(line.range[0]),
      end: sourceCode.getLocFromIndex(line.range[1]),
    },
    messageId: 'raggedWrap',
    data: {
      word: firstWord(segment[ragged + 1]?.text ?? ''),
      printWidth,
    },
    fix: hasCarriageReturn
      ? null
      : (fixer) =>
          fixer.replaceTextRange(
            [first.range[0], last.range[1]],
            filled.join(`\n${first.prefix}`),
          ),
  });
};
